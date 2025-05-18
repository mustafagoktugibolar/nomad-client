import { create } from "zustand";

type SecurityLevel =
  | "Çok Güvenli"
  | "Genel Olarak Güvenli"
  | "Dikkatli Olunmalı"
  | "Riskli"
  | "Seyahat Edilmemeli";

interface FilterState {
  passport: string | null;
  reason: string;
  budget: string;
  security: SecurityLevel[];
  season: string;

  setPassport: (passport: string) => void;
  setReason: (reason: string) => void;
  setBudget: (budget: string) => void;
  setSecurity: (levels: SecurityLevel[]) => void;
  setSeason: (season: string) => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  passport: null,
  reason: "",
  budget: "",
  security: [],
  season: "",

  setPassport: (passport) => set({ passport }),
  setReason: (reason) => set({ reason }),
  setBudget: (budget) => set({ budget }),
  setSecurity: (levels) => set({ security: levels }),
  setSeason: (season) => set({ season }),
}));
