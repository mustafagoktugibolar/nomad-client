import { create } from "zustand";

type SecurityLevel =
  | "Çok Güvenli"
  | "Genel Olarak Güvenli"
  | "Dikkatli Olunmalı"
  | "Riskli"
  | "Seyahat Edilmemeli";

type SeasonLevel = 
    | "İlkbahar"
    | "Yaz"
    | "Sonbahar"
    | "Kış";
interface FilterState {
  passport: string | null;
  reason: string | null;
  budget: number;
  security: SecurityLevel[];
  season: SeasonLevel[];

  setPassport: (passport: string) => void;
  setReason: (reason: string) => void;
  setBudget: (budget: number) => void;
  setSecurity: (levels: SecurityLevel[]) => void;
  setSeason: (season: SeasonLevel[]) => void;
}


export const useFilterStore = create<FilterState>((set) => ({
  passport: null,
  reason: null ,
  budget: 2000,
  security: [],
  season: [],

  setPassport: (passport) => set({ passport }),
  setReason: (reason) => set({ reason }),
  setBudget: (budget) => set({ budget }),
  setSecurity: (levels) => set({ security: levels }),
  setSeason: (seasons) => set({ season: seasons }),
}));
