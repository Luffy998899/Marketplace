import { create } from 'zustand';
import type { CharacterFilter } from '@acm/shared';

// Client-side filter state (Zustand). React Query owns server state; this store
// owns the user's current filter selection which drives the query key.

type SortValue = NonNullable<CharacterFilter['sort']>;

interface FilterState {
  q: string;
  gender: string[];
  ethnicity: string[];
  niche: string[];
  style: string[];
  licenseType: NonNullable<CharacterFilter['licenseType']>;
  maxPriceMinor?: number;
  minRating?: number;
  availableOnly: boolean;
  sort: SortValue;

  setQuery: (q: string) => void;
  toggle: (key: 'gender' | 'ethnicity' | 'niche' | 'style', value: string) => void;
  toggleLicense: (value: NonNullable<CharacterFilter['licenseType']>[number]) => void;
  setMaxPrice: (v?: number) => void;
  setMinRating: (v?: number) => void;
  setAvailableOnly: (v: boolean) => void;
  setSort: (v: SortValue) => void;
  reset: () => void;
  toFilter: (page: number, pageSize: number) => CharacterFilter;
  activeCount: () => number;
}

const initial = {
  q: '',
  gender: [] as string[],
  ethnicity: [] as string[],
  niche: [] as string[],
  style: [] as string[],
  licenseType: [] as NonNullable<CharacterFilter['licenseType']>,
  maxPriceMinor: undefined as number | undefined,
  minRating: undefined as number | undefined,
  availableOnly: false,
  sort: 'trending' as SortValue,
};

export const useFilterStore = create<FilterState>((set, get) => ({
  ...initial,

  setQuery: (q) => set({ q }),
  toggle: (key, value) =>
    set((s) => {
      const list = s[key];
      return {
        [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
      } as Partial<FilterState>;
    }),
  toggleLicense: (value) =>
    set((s) => ({
      licenseType: s.licenseType.includes(value)
        ? s.licenseType.filter((v) => v !== value)
        : [...s.licenseType, value],
    })),
  setMaxPrice: (v) => set({ maxPriceMinor: v }),
  setMinRating: (v) => set({ minRating: v }),
  setAvailableOnly: (v) => set({ availableOnly: v }),
  setSort: (v) => set({ sort: v }),
  reset: () => set({ ...initial }),

  toFilter: (page, pageSize) => {
    const s = get();
    return {
      q: s.q || undefined,
      gender: s.gender.length ? s.gender : undefined,
      ethnicity: s.ethnicity.length ? s.ethnicity : undefined,
      niche: s.niche.length ? s.niche : undefined,
      style: s.style.length ? s.style : undefined,
      licenseType: s.licenseType.length ? s.licenseType : undefined,
      maxPriceMinor: s.maxPriceMinor,
      minRating: s.minRating,
      availableOnly: s.availableOnly || undefined,
      sort: s.sort,
      page,
      pageSize,
    };
  },

  activeCount: () => {
    const s = get();
    return (
      s.gender.length +
      s.ethnicity.length +
      s.niche.length +
      s.style.length +
      s.licenseType.length +
      (s.maxPriceMinor ? 1 : 0) +
      (s.minRating ? 1 : 0) +
      (s.availableOnly ? 1 : 0) +
      (s.q ? 1 : 0)
    );
  },
}));
