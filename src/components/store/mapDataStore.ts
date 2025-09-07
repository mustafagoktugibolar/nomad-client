import { create } from 'zustand';

interface CountryData {
  target_country: string;
  target_country_name: string;
  name_en: string;
  capital: string;
  biggest_city: string;
  security_level_name: string;
  security_level_desc: string;
  night_life_name: string;
  visit_type_name: string;
  spent_amount_daily_avg: string;
  season_name: string;
  [key: string]: any; // for any additional fields
}

interface MapDataState {
  mapData: CountryData[];
  isLoading: boolean;
  error: string | null;
  fetchMapData: () => Promise<void>;
}

export const useMapDataStore = create<MapDataState>((set) => ({
  mapData: [],
  isLoading: false,
  error: null,
  
  fetchMapData: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch('/api/nomad/api/v1/getMapDetail?');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      set({ 
        mapData: data, 
        isLoading: false,
        error: null 
      });
      
      console.log('Map data fetched successfully:', data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch map data';
      
      set({ 
        mapData: [], 
        isLoading: false, 
        error: errorMessage 
      });
      
      console.error('Error fetching map data:', error);
    }
  },
}));
