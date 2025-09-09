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
    
    try {
      // API endpoint'i doğru
      const response = await fetch('/api/nomad/api/v1/getMapDetail');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Map data fetched successfully:', data.length, 'countries');
      
      // Log first country to see all available fields
      if (data.length > 0) {
        console.log('📊 First country data fields:', Object.keys(data[0]));
        console.log('📊 First country sample:', data[0]);
      }
      
      set({ 
        mapData: data, 
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

    console.log('🔍 Filter Debug: Starting with', filters);

    // Log all unique security levels to understand the data
    const uniqueSecurityLevels = [...new Set(mapData.map(country => country.security_level_name).filter(Boolean))];
    console.log('🛡️ Available Security Levels:', uniqueSecurityLevels);
    
    // Log all unique season levels to understand the data
    const uniqueSeasons = [...new Set(mapData.map(country => country.season_name).filter(Boolean))];
    console.log('🌸 Available Seasons:', uniqueSeasons);
    
    // Log sample budget data
    const budgetSamples = mapData.slice(0, 5).map(c => ({
      country: c.target_country_name,
      dailyBudget: c.spent_amount_daily_avg,
      weeklyBudget: c.spent_amount_avg,
      type: typeof c.spent_amount_avg
    }));
    console.log('💰 Budget Data Samples:', budgetSamples);

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
      if (filters.budget && country.spent_amount_avg !== null) {
        const avgAmount = typeof country.spent_amount_avg === 'string' 
          ? parseFloat(country.spent_amount_avg) 
          : country.spent_amount_avg;
          
        if (avgAmount > filters.budget) {
          matches = false;
        }
      }

      // Season filter - use season_name
      if (filters.season && filters.season.length > 0) {
        const seasonMatches = filters.season.some(selectedSeason => {
          const countrySeasonName = country.season_name?.toLowerCase() || '';
          const selectedSeasonLower = selectedSeason.toLowerCase();
          
          // Map season levels to real data
          if (selectedSeasonLower === 'spring') {
            return countrySeasonName.includes('spring') || countrySeasonName.includes('ilkbahar');
          } else if (selectedSeasonLower === 'summer') {
            return countrySeasonName.includes('summer') || countrySeasonName.includes('yaz');
          } else if (selectedSeasonLower === 'autumn') {
            return countrySeasonName.includes('autumn') || countrySeasonName.includes('sonbahar') || countrySeasonName.includes('fall');
          } else if (selectedSeasonLower === 'winter') {
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

    console.log('🎯 Filter Result:', filtered.size, 'countries match filters');
    console.log('🗺️ Matching countries:', Array.from(filtered));

    set({ filteredCountries: filtered });
  },

  clearFilters: () => {
    set({ filteredCountries: new Set() });
  },
}));
