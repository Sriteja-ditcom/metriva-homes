import { create } from 'zustand';
import type { PropertySearchFilters } from '@metriva/shared';

interface PropertyStore {
  filters: PropertySearchFilters;
  savedIds: Set<string>;
  recentlyViewed: string[];
  setFilters: (filters: Partial<PropertySearchFilters>) => void;
  resetFilters: () => void;
  toggleSaved: (id: string) => void;
  addRecentlyViewed: (id: string) => void;
}

const DEFAULT_FILTERS: PropertySearchFilters = {
  listingType: 'BUY',
  page: 1,
  limit: 20,
  sortBy: 'newest',
};

export const usePropertyStore = create<PropertyStore>((set, get) => ({
  filters: DEFAULT_FILTERS,
  savedIds: new Set(),
  recentlyViewed: [],

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters, page: 1 },
    })),

  resetFilters: () => set({ filters: DEFAULT_FILTERS }),

  toggleSaved: (id) =>
    set((state) => {
      const next = new Set(state.savedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { savedIds: next };
    }),

  addRecentlyViewed: (id) =>
    set((state) => {
      const viewed = [id, ...state.recentlyViewed.filter((v) => v !== id)].slice(0, 20);
      return { recentlyViewed: viewed };
    }),

  isSaved: (id: string) => get().savedIds.has(id),
}));
