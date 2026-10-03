import { useSyncExternalStore } from 'react';
import { AppState } from 'react-native';
import { supabase } from './supabase';

// Products are public, read-only data (same table and Row Level Security as the website).
export type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
  pack_size: string;
  price_gbp: number;
  ingredients: string;
  allergens: string;
  storage_guidance: string;
  details_status?: 'researched' | 'confirmed';
  available: boolean;
};

// Same display order as the web shop (igbadun-bites/lib/products.ts)
export const CATEGORY_ORDER = ['Chips', 'Crunchy snacks', 'Traditional treats and sweets'];

export type ProductSection = { category: string; data: Product[] };

export function groupByCategory(products: Product[]): ProductSection[] {
  const rank = (c: string) => {
    const i = CATEGORY_ORDER.indexOf(c);
    return i === -1 ? CATEGORY_ORDER.length : i;
  };
  const groups = new Map<string, Product[]>();
  for (const p of products) groups.set(p.category, [...(groups.get(p.category) ?? []), p]);
  return [...groups.entries()]
    .map(([category, data]) => ({ category, data }))
    .sort((a, b) => rank(a.category) - rank(b.category) || a.category.localeCompare(b.category));
}

export const pricePence = (p: Pick<Product, 'price_gbp'>) => Math.round(Number(p.price_gbp) * 100);
export const formatPence = (pence: number) => `£${(pence / 100).toFixed(2)}`;

// Text for an ingredients / allergens / storage field, or null while it still holds the
// database placeholder ("… TBC with supplier") — same rule as the website.
export function detailText(value: string | null | undefined): string | null {
  const text = (value ?? '').trim();
  if (!text || /\bTBC\b/i.test(text)) return null;
  return text.replace(/^(ingredients|allergens?|allergen info|storage)\s*:\s*/i, '');
}

// Only an explicit owner sign-off counts as confirmed (missing column = not confirmed)
export const isConfirmed = (p: Product) => p.details_status === 'confirmed';

// ---- Small store so every screen shares one product list ----
type State = { products: Product[]; loading: boolean; error: string | null };
let state: State = { products: [], loading: true, error: null };
const listeners = new Set<() => void>();
let started = false;

function set(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

export async function loadProducts() {
  set({ loading: true });
  const { data, error } = await supabase.from('products').select('*').order('name');
  if (error) set({ loading: false, error: "We couldn't load the shop just now — pull down to try again." });
  else set({ loading: false, error: null, products: data as Product[] });
}

function start() {
  if (started) return;
  started = true;
  void loadProducts();
  // Prices or availability may have changed while the app was in the background
  AppState.addEventListener('change', (s) => {
    if (s === 'active') void loadProducts();
  });
}

export function useProducts() {
  start();
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state
  );
}
