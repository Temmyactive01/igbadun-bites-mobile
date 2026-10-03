import type { RealtimeChannel } from '@supabase/supabase-js';
import { useSyncExternalStore } from 'react';
import { AccessibilityInfo, AppState } from 'react-native';
import { formatPence, pricePence, type Product } from './products';
import { onSessionChange } from './session';
import { supabase } from './supabase';

// The signed-in customer's basket — the SAME basket as on the website, stored in
// Supabase `cart_items` and kept in sync live (Realtime). Mirrors the web rules in
// igbadun-bites/lib/cart-sync.ts:
// - cart_items is the source of truth; names/prices are joined from products, never stored.
// - Changes show immediately, then save in order with ABSOLUTE quantities (upsert on
//   user_id+product_id, delete at 0). A failed save reloads the server basket.
// - Any Realtime event, reconnect or return to the foreground reloads the basket, held back
//   while this device's own saves are in flight.
// - Signed out: no basket on the device (adding requires sign-in — approved decision).

export const MAX_QUANTITY = 20;

export type CartItem = {
  productId: string;
  name: string;
  packSize: string;
  category: string;
  pricePence: number;
  quantity: number;
};

type State = { items: CartItem[]; userId: string | null; loaded: boolean };
let state: State = { items: [], userId: null, loaded: false };
const listeners = new Set<() => void>();

function set(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

type Row = {
  product_id: string;
  quantity: number;
  products: { name: string; pack_size: string; category: string; price_gbp: number } | null;
};

let channel: RealtimeChannel | null = null;
let writes: Promise<void> = Promise.resolve();
let pendingWrites = 0;
let refreshTimer: ReturnType<typeof setTimeout> | undefined;
let readyWaiters: (() => void)[] = [];

// ---------- Session: start / stop syncing ----------
let started = false;
// Called once by the root layout so the basket follows sign-in/out app-wide
export function startCartSync() {
  start();
}
function start() {
  if (started) return;
  started = true;
  onSessionChange(({ session, loading }) => {
    if (loading) return;
    const next = session?.user.id ?? null;
    if (next === state.userId) return;
    stopSync();
    // Sign-out (or account switch): nothing of the previous basket stays on the device
    set({ items: [], userId: next, loaded: false });
    if (next) void startSync(next);
  });
  AppState.addEventListener('change', (s) => {
    if (s === 'active' && state.userId) scheduleRefresh();
  });
}

async function startSync(user: string) {
  await refresh(user, true);
  if (state.userId !== user) return;
  channel = supabase
    .channel(`cart:${user}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'cart_items', filter: `user_id=eq.${user}` }, () =>
      scheduleRefresh()
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') scheduleRefresh(); // (re)connected — catch up
    });
}

function stopSync() {
  clearTimeout(refreshTimer);
  if (channel) void supabase.removeChannel(channel);
  channel = null;
}

// ---------- Reading ----------
async function refresh(user: string, first = false) {
  const { data, error } = await supabase
    .from('cart_items')
    .select('product_id, quantity, products(name, pack_size, category, price_gbp)')
    .eq('user_id', user)
    .order('updated_at', { ascending: true });
  if (state.userId !== user) return; // signed out / switched meanwhile
  if (error) {
    console.error('Basket: could not load:', error.message);
    if (first) markLoaded();
    return;
  }
  if (pendingWrites > 0 && !first) return; // a newer local state is still being saved

  const fresh: CartItem[] = (data as unknown as Row[])
    .filter((r) => r.products)
    .map((r) => ({
      productId: r.product_id,
      name: r.products!.name,
      packSize: r.products!.pack_size,
      category: r.products!.category,
      pricePence: Math.round(Number(r.products!.price_gbp) * 100),
      quantity: r.quantity,
    }));
  // Keep lines where they already are on screen; new ones go at the end
  const order = new Map(state.items.map((item, i) => [item.productId, i]));
  fresh.sort((a, b) => (order.get(a.productId) ?? Infinity) - (order.get(b.productId) ?? Infinity));
  set({ items: fresh });
  markLoaded();
}

function markLoaded() {
  if (!state.loaded) set({ loaded: true });
  const waiters = readyWaiters;
  readyWaiters = [];
  waiters.forEach((w) => w());
}

function scheduleRefresh() {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => {
    if (pendingWrites > 0 || !state.userId) return; // the write queue refreshes when it drains
    void refresh(state.userId);
  }, 150);
}

// Resolves once the signed-in basket has loaded from the server (needed before the first
// change, or an Add could overwrite a quantity added on the website).
function whenLoaded(timeoutMs = 10000) {
  if (state.userId && state.loaded) return Promise.resolve(true);
  return new Promise<boolean>((resolve) => {
    const t = setTimeout(() => resolve(false), timeoutMs);
    readyWaiters.push(() => {
      clearTimeout(t);
      resolve(!!state.userId);
    });
  });
}

// ---------- Writing ----------
function enqueue(user: string, productId: string, quantity: number) {
  pendingWrites++;
  writes = writes
    .then(async () => {
      if (quantity <= 0) {
        const { error } = await supabase.from('cart_items').delete().eq('user_id', user).eq('product_id', productId);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase
          .from('cart_items')
          .upsert({ user_id: user, product_id: productId, quantity }, { onConflict: 'user_id,product_id' });
        if (error) throw new Error(error.message);
      }
    })
    // On failure the refresh below puts the screen back in line with the database
    .catch((err) => console.error('Basket: could not save change:', err))
    .finally(() => {
      pendingWrites--;
      if (pendingWrites === 0 && state.userId === user) scheduleRefresh();
    });
}

const clamp = (q: number) => Math.max(0, Math.min(MAX_QUANTITY, Math.floor(q)));

function setLine(product: Pick<Product, 'id' | 'name' | 'pack_size' | 'category' | 'price_gbp'>, quantity: number) {
  const user = state.userId;
  if (!user) return;
  const q = clamp(quantity);
  const exists = state.items.some((i) => i.productId === product.id);
  const items =
    q === 0
      ? state.items.filter((i) => i.productId !== product.id)
      : exists
        ? state.items.map((i) => (i.productId === product.id ? { ...i, quantity: q } : i))
        : [
            ...state.items,
            {
              productId: product.id,
              name: product.name,
              packSize: product.pack_size,
              category: product.category,
              pricePence: pricePence(product),
              quantity: q,
            },
          ];
  set({ items });
  enqueue(user, product.id, q);
  AccessibilityInfo.announceForAccessibility(q === 0 ? `${product.name} removed from basket` : `${q} ${product.name} in basket`);
}

export const cart = {
  quantityOf: (productId: string) => state.items.find((i) => i.productId === productId)?.quantity ?? 0,
  setQuantity: setLine,
  // Add one, waiting for the basket to load first (e.g. straight after signing in)
  async addOne(product: Product) {
    if (!(await whenLoaded())) return false;
    setLine(product, cart.quantityOf(product.id) + 1);
    return true;
  },
};

export function useCart() {
  start();
  const snapshot = useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state
  );
  const count = snapshot.items.reduce((n, i) => n + i.quantity, 0);
  const subtotalPence = snapshot.items.reduce((n, i) => n + i.pricePence * i.quantity, 0);
  return { ...snapshot, count, subtotalPence, subtotal: formatPence(subtotalPence) };
}
