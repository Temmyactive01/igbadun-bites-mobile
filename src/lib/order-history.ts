import { supabase } from './supabase';

// The signed-in customer's past orders — read-only, mirroring the website's /orders page
// (igbadun-bites/app/orders/page.tsx): same columns, same join, paid orders only, newest
// first. Row Level Security limits customers to their own orders; the user_id filter is
// the website's second safeguard. Abandoned or failed checkouts aren't real orders.
export type OrderLine = {
  quantity: number;
  unit_price_gbp: number;
  products: { name: string; pack_size: string } | null;
};

export type Order = {
  id: string;
  status: 'pending' | 'paid' | 'failed';
  created_at: string;
  paid_at: string | null;
  total_gbp: number;
  fulfilment: 'pickup' | 'delivery';
  postcode: string | null;
  order_items: OrderLine[];
};

export async function fetchMyOrders(userId: string): Promise<{ orders: Order[]; error: string | null }> {
  const { data, error } = await supabase
    .from('orders')
    .select('id, status, created_at, paid_at, total_gbp, fulfilment, postcode, order_items(quantity, unit_price_gbp, products(name, pack_size))')
    .eq('user_id', userId)
    .eq('status', 'paid')
    .order('created_at', { ascending: false });
  if (error) return { orders: [], error: error.message };
  return { orders: (data ?? []) as unknown as Order[], error: null };
}

export const pence = (gbp: number) => Math.round(Number(gbp) * 100);

// Short order reference, as on the website: first 8 characters of the id, upper case
export const orderRef = (id: string) => id.slice(0, 8).toUpperCase();

// "3 October 2026 at 14:05" in UK time — same format as the website
export function orderDate(order: Order): string {
  const when = new Date(order.paid_at ?? order.created_at);
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
  try {
    return new Intl.DateTimeFormat('en-GB', { ...options, timeZone: 'Europe/London' }).format(when);
  } catch {
    // Older JS engines without time-zone data: fall back to the phone's own time zone
    return new Intl.DateTimeFormat('en-GB', options).format(when);
  }
}
