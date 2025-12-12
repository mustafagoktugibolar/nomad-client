import { create } from "zustand";

export type SecurityLevel =
  | "Very Safe"
  | "Generally Safe"
  | "Use Caution"
  | "Risky"
  | "Do Not Travel";

export type SeasonLevel =
  | "Spring"
  | "Summer"
  | "Autumn"
  | "Winter";
interface FilterState {
  passport: string | null;
  reason: string | null;
  budget: number;
  security: SecurityLevel[];
  season: SeasonLevel[];

  setPassport: (passport: string | null) => void;
  setReason: (reason: string | null) => void;
  setBudget: (budget: number) => void;
  setSecurity: (levels: SecurityLevel[]) => void;
  setSeason: (season: SeasonLevel[]) => void;
  resetFilters: () => void;
}


export const useFilterStore = create<FilterState>((set) => ({
  passport: localStorage.getItem("passport") || null,
  reason: null,
  budget: 1200,
  security: [],
  season: [],

  setPassport: (passport) => {
    if (passport) {
      localStorage.setItem("passport", passport);
    } else {
      localStorage.removeItem("passport");
    }
    set({ passport });
  },
  setReason: (reason) => set({ reason }),
  setBudget: (budget) => set({ budget }),
  setSecurity: (levels) => set({ security: levels }),
  setSeason: (seasons) => set({ season: seasons }),

  resetFilters: () => {
    localStorage.removeItem("passport");
    set({
      passport: null,
      reason: null,
      budget: 1200,
      security: [],
      season: []
    });
  },
}));
