import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Tx = { id: string; at: number; type: "binis" | "yukleme" | "aktarma"; label: string; amount: number };
export type Recent = { from: string; to: string; at: number };
type State = {
  favorites: string[]; recent: Recent[]; lowData: boolean; largeText: boolean; onboarded: boolean;
  card: { number: string; balance: number; tx: Tx[] };
  toggleFavorite: (id: string) => void; addRecent: (r: Omit<Recent, "at">) => void; setLowData: (v: boolean) => void; setLargeText: (v: boolean) => void; setOnboarded: () => void;
  topUp: (amount: number) => void; pay: (label: string, amount: number, type?: Tx["type"]) => boolean; reset: () => void;
};
const uid = () => Math.random().toString(36).slice(2, 9);
const initialCard = { number: "5062 •••• •••• 4471", balance: 84.5, tx: [
  { id: "t1", at: Date.now() - 86400e3 * 1, type: "binis" as const, label: "T1 Tramvay · Vapur İskelesi", amount: -15 },
  { id: "t2", at: Date.now() - 86400e3 * 1 - 1500e3, type: "aktarma" as const, label: "101 · Organize Sanayi (aktarma)", amount: -5 },
  { id: "t3", at: Date.now() - 86400e3 * 3, type: "yukleme" as const, label: "Bakiye yükleme (kart)", amount: 100 },
  { id: "t4", at: Date.now() - 86400e3 * 4, type: "binis" as const, label: "7 · Adliye", amount: -15 },
] };
export const useStore = create<State>()(persist((set, get) => ({
  favorites: ["merkez-meydan", "universite"], recent: [], lowData: false, largeText: false, onboarded: false, card: initialCard,
  toggleFavorite: (id) => set((s) => ({ favorites: s.favorites.includes(id) ? s.favorites.filter((x) => x !== id) : [...s.favorites, id] })),
  addRecent: (r) => set((s) => ({ recent: [{ ...r, at: Date.now() }, ...s.recent.filter((x) => !(x.from === r.from && x.to === r.to))].slice(0, 6) })),
  setLowData: (lowData) => set({ lowData }), setLargeText: (largeText) => set({ largeText }), setOnboarded: () => set({ onboarded: true }),
  topUp: (amount) => set((s) => ({ card: { ...s.card, balance: Math.round((s.card.balance + amount) * 100) / 100, tx: [{ id: uid(), at: Date.now(), type: "yukleme", label: "Bakiye yükleme (uygulama)", amount }, ...s.card.tx] } })),
  pay: (label, amount, type = "binis") => { const s = get(); if (s.card.balance < amount) return false; set({ card: { ...s.card, balance: Math.round((s.card.balance - amount) * 100) / 100, tx: [{ id: uid(), at: Date.now(), type, label, amount: -amount }, ...s.card.tx] } }); return true; },
  reset: () => set({ favorites: [], recent: [], lowData: false, largeText: false, card: initialCard }),
}), { name: "rota-v1", storage: createJSONStorage(() => AsyncStorage) }));
