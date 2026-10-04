import { useEffect, useState, useSyncExternalStore } from 'react';
import { productImageKey, SITE_URL, STAND_INS } from './site-content';

// Which products have a real photo on the website. The website's build lists
// public/images/products/ and publishes the list at /product-images.json, e.g.
// { "milky-chin-chin": "Milky-Chin-Chin.png" } — the exact same list its product cards use, so
// any format the website accepts (.jpg, .jpeg, .png, .webp) and any capitalisation works here too.
type PhotoList = { status: 'loading' } | { status: 'ready'; files: Record<string, string> } | { status: 'unavailable' };

let list: PhotoList = { status: 'loading' };
// Without the list (offline, or a website build from before it was published): what a
// direct check of the website found for each product — a file name, or null for none
const checked: Record<string, string | null> = {};
const checking = new Set<string>();
let version = 0; // bumps on every change, so subscribers re-render
const listeners = new Set<() => void>();
let started = false;

const notify = () => {
  version++;
  listeners.forEach((l) => l());
};

async function loadPhotoList() {
  try {
    const res = await fetch(`${SITE_URL}/product-images.json`, { headers: { Accept: 'application/json' } });
    const files = res.ok ? await res.json() : null;
    list = files && typeof files === 'object' && !Array.isArray(files) ? { status: 'ready', files } : { status: 'unavailable' };
  } catch {
    list = { status: 'unavailable' };
  }
  notify();
}

// The formats the website accepts, in the order its build picks them when there are two
// (sorted file names). All checked at once; lower-case names only, as the list isn't there.
const FORMATS = ['jpeg', 'jpg', 'png', 'webp'];
async function checkWebsite(key: string) {
  if (key in checked || checking.has(key)) return;
  checking.add(key);
  const found = await Promise.all(
    FORMATS.map(async (ext) => {
      try {
        const res = await fetch(`${SITE_URL}/images/products/${key}.${ext}`, { method: 'HEAD' });
        return res.ok ? `${key}.${ext}` : null;
      } catch {
        return null;
      }
    })
  );
  checked[key] = found.find(Boolean) ?? null;
  checking.delete(key);
  notify();
}

// Fetched once per app launch, when the first product image appears
function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!started) {
    started = true;
    void loadPhotoList();
  }
  return () => {
    listeners.delete(listener);
  };
}

export type ProductImage =
  | { kind: 'pending' }
  | { kind: 'photo' | 'stand-in'; path: string; onError: () => void }
  | { kind: 'label' };

// The image to show for a product, in the website's order: real photo → stand-in → label
export function useProductImage(name: string): ProductImage {
  useSyncExternalStore(subscribe, () => version);
  const key = productImageKey(name);
  const status = list.status;
  useEffect(() => {
    if (status === 'unavailable') void checkWebsite(key);
  }, [key, status]);

  // Images that failed to load (e.g. a broken file) are skipped — counted per product and
  // per list state, so it starts again from the top if either changes
  const id = `${key}|${status}`;
  const [failures, setFailures] = useState({ id, count: 0 });
  const failed = failures.id === id ? failures.count : 0;

  const file = status === 'ready' ? list.files[key] : status === 'unavailable' ? checked[key] : undefined;
  if (status === 'loading' || (status === 'unavailable' && !(key in checked))) return { kind: 'pending' };

  const candidates: { kind: 'photo' | 'stand-in'; path: string }[] = [];
  if (file) candidates.push({ kind: 'photo', path: `/images/products/${file}` });
  if (STAND_INS[key]) candidates.push({ kind: 'stand-in', path: `/images/stand-in/${key}.jpg` });
  const next = candidates[failed];
  if (!next) return { kind: 'label' };
  return { ...next, onError: () => setFailures((f) => ({ id, count: (f.id === id ? f.count : 0) + 1 })) };
}
