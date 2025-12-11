import { create } from 'zustand';
import { SecurityLevel, SeasonLevel } from './filterStore.js';

// Gerçek API response yapısına göre güncellenmiş interface
interface CountryData {
  target_country_name: string | null;
  target_country: string | null;
  security_level_name: string | null;
  security_level: number | null;
  security_level_desc: string | null;
  capital: string | null;
  biggest_city: string | null;
  spent_amount_daily_avg: string | number | null;
  spent_amount_avg: string | number | null;
  night_life_name: string | null;
  season_name: string | null; // Season field eklendi
  [key: string]: any; // for any additional fields
}

interface MapDataState {
  mapData: CountryData[];
  filteredCountries: Set<string>; // ISO codes of countries that match filters
  isLoading: boolean;
  error: string | null;
  fetchMapData: () => Promise<void>;
  applyFilters: (filters: {
    passport?: string | null;
    reason?: string | null;
    budget?: number;
    security?: SecurityLevel[];
    season?: SeasonLevel[];
  }) => void;
  clearFilters: () => void;
}

export const useMapDataStore = create<MapDataState>((set, get) => ({
  mapData: [],
  filteredCountries: new Set<string>(),
  isLoading: false,
  error: null,

  fetchMapData: async () => {
    set({ isLoading: true, error: null });

    const CACHE_KEY = 'nomad_map_data_v3';
    const CACHE_TIME_KEY = 'nomad_map_data_time_v3';
    const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

    // Check cache
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
      const now = Date.now();

      if (cached && cachedTime && (now - parseInt(cachedTime) < CACHE_DURATION)) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // console.log('Using cached map data');
          set({ mapData: parsed, isLoading: false });
          return;
        }
      }
    } catch (e) {
      console.warn('Cache parse error', e);
    }

    try {
      // API endpoint'i doğru
      const apiBase = import.meta.env.VITE_API_BASE || '';
      const response = await fetch(`${apiBase}/api/nomad/api/v1/getMapDetail`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Map data fetched:', data.length, 'countries');

      // Add dummy data for missing countries
      const missingCountries = [
        {
          target_country: 'IN',
          target_country_name: 'India',
          security_level: 2,
          security_level_name: 'normal', // Match API format exactly
          security_level_desc: 'Generally safe for travelers with normal precautions',
          capital: 'New Delhi',
          biggest_city: 'Mumbai',
          spent_amount_daily_avg: 50,
          spent_amount_avg: 350,
          night_life_name: 'Vibrant',
          season_name: 'Yaz', // Summer in Turkish to match API
          visit_type_name: 'Kültürel', // Cultural in Turkish
          visa_type: 'evisa',
          passport_type_name: 'Turkish Ordinary Passport'
        },
        {
          target_country: 'CL',
          target_country_name: 'Chile',
          security_level: 2,
          security_level_name: 'normal', // Match API format exactly
          security_level_desc: 'Generally safe for travelers',
          capital: 'Santiago',
          biggest_city: 'Santiago',
          spent_amount_daily_avg: 50,
          spent_amount_avg: 350,
          night_life_name: 'normal',
          season_name: 'Yaz', // Summer in Turkish to match API
          visit_type_name: 'Kültürel', // Cultural in Turkish
          visa_type: 'visa-free',
          passport_type_name: 'Turkish Ordinary Passport'
        },
        {
          target_country: 'GL',
          target_country_name: 'Greenland',
          security_level: 1,
          security_level_name: 'normal', // Match API format
          security_level_desc: 'Very safe destination',
          capital: 'Nuuk',
          biggest_city: 'Nuuk',
          spent_amount_daily_avg: 200,
          spent_amount_avg: 1400,
          night_life_name: 'Limited',
          season_name: 'Yaz', // Summer in Turkish
          visit_type_name: 'Kültürel',
          visa_type: 'visa-free',
          passport_type_name: 'Turkish Ordinary Passport'
        },
        {
          target_country: 'XK',
          target_country_name: 'Kosovo',
          security_level: 2,
          security_level_name: 'normal', // Match API format
          security_level_desc: 'Generally safe with normal precautions',
          capital: 'Pristina',
          biggest_city: 'Pristina',
          spent_amount_daily_avg: 40,
          spent_amount_avg: 280,
          night_life_name: 'Moderate',
          season_name: 'Yaz', // Summer in Turkish
          visit_type_name: 'Kültürel',
          visa_type: 'visa-free',
          passport_type_name: 'Turkish Ordinary Passport'
        }
      ];

      // Override API data with our hardcoded fallbacks (priority to our data for missing countries)
      const fallbackCodes = new Set(missingCountries.map(c => c.target_country));
      // Remove any API data that conflicts with our fallbacks so we don't have duplicates or bad data
      const cleanData = data.filter((c: any) => !fallbackCodes.has(c.target_country));
      // Add our comprehensive fallbacks
      cleanData.push(...missingCountries);

      if (cleanData.length > 0) {
        // Cache the processed data (Use v3 key)
        localStorage.setItem(CACHE_KEY, JSON.stringify(cleanData));
        localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
      }

      set({
        mapData: cleanData,
        isLoading: false
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      set({
        isLoading: false,
        error: errorMessage
      });

      console.error('Error fetching map data:', error);
    }
  },

  applyFilters: (filters) => {
    const { mapData } = get();
    const filtered = new Set<string>();

    mapData.forEach((country) => {
      // Skip null/empty entries
      if (!country.target_country) return;

      let matches = true;

      // Security filter - use security_level_name  
      if (filters.security && filters.security.length > 0) {
        const securityMatches = filters.security.some(level => {
          const securityName = country.security_level_name?.toLowerCase() || '';
          const levelLower = level.toLowerCase();

          // Map security levels to real data (handle Unicode chars)
          if (levelLower.includes('very safe') || levelLower.includes('çok güvenli')) {
            return securityName.includes('çok gü') || securityName === 'Ã§ok gÃ¼venli';
          } else if (levelLower.includes('generally safe') || levelLower.includes('güvenli')) {
            return (securityName.includes('güvenli') || securityName.includes('gÃ¼venli')) &&
              !securityName.includes('çok') && !securityName.includes('Ã§ok');
          } else if (levelLower.includes('use caution') || levelLower.includes('normal')) {
            return securityName.includes('normal');
          } else if (levelLower.includes('risky') || levelLower.includes('güvensiz')) {
            return securityName.includes('güvensiz') || securityName.includes('gÃ¼vensiz');
          } else if (levelLower.includes('do not travel') || levelLower.includes('tehlikeli')) {
            return securityName.includes('tehlikeli') ||
              securityName.includes('gidilmemeli') ||
              securityName.includes('savaş halinde') ||
              securityName.includes('savaÅŸ halinde');
          }
          return false;
        });

        if (!securityMatches) {
          matches = false;
        }
      }

      // Budget filter - use spent_amount_avg (total weekly amount)
      // Skip filter if budget is at maximum (1200)
      if (filters.budget && filters.budget < 1200 && country.spent_amount_avg !== null) {
        const avgAmount = typeof country.spent_amount_avg === 'string'
          ? parseFloat(country.spent_amount_avg)
          : country.spent_amount_avg;

        if (avgAmount > filters.budget) {
          matches = false;
        }
      }

      // Season filter - use season_name
      // If no seasons selected OR all 4 seasons selected, don't filter
      if (filters.season && filters.season.length > 0 && filters.season.length < 4) {
        const seasonMatches = filters.season.some(selectedSeason => {
          const countrySeasonName = country.season_name?.toLowerCase() || '';
          const selectedSeasonLower = selectedSeason.toLowerCase();

          // Map season names (handle Turkish and English)
          if (selectedSeasonLower.includes('spring') || selectedSeasonLower.includes('ilkbahar')) {
            return countrySeasonName.includes('spring') || countrySeasonName.includes('ilkbahar');
          } else if (selectedSeasonLower.includes('summer') || selectedSeasonLower.includes('yaz')) {
            return countrySeasonName.includes('summer') || countrySeasonName.includes('yaz');
          } else if (selectedSeasonLower.includes('autumn') || selectedSeasonLower.includes('fall') || selectedSeasonLower.includes('sonbahar')) {
            return countrySeasonName.includes('autumn') || countrySeasonName.includes('fall') || countrySeasonName.includes('sonbahar');
          } else if (selectedSeasonLower.includes('winter') || selectedSeasonLower.includes('kış')) {
            return countrySeasonName.includes('winter') || countrySeasonName.includes('kış');
          }
          return false;
        });

        if (!seasonMatches) {
          matches = false;
        }
      }

      // For now, passport and reason filters are placeholder since we don't have visa data
      // In a real implementation, these would need proper API endpoints

      if (matches) {
        filtered.add(country.target_country);
      }
    });

    set({ filteredCountries: filtered });
  },

  clearFilters: () => {
    set({ filteredCountries: new Set() });
  },
}));
