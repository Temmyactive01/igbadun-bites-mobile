import type { ImageContentPosition } from 'expo-image';

// Homepage content shared with the website. Images are NOT copied into the app: they load
// from the website itself, so replacing a file on the website (same name) updates both.
// Copy mirrors the website's source files named below — change them together.

export const SITE_URL = 'https://igbadun-bites.netlify.app';

// Website image, resized by the website's own image service (Next.js /_next/image) so the
// phone downloads a phone-sized file. `width` must be one of Next's sizes.
export type ImageWidth = 384 | 640 | 828 | 1080;
export const siteImage = (path: string, width: ImageWidth = 828) =>
  `${SITE_URL}/_next/image?url=${encodeURIComponent(path)}&w=${width}&q=75`;

// CSS object-position "x% y%" → expo-image contentPosition
export const position = (css = '50% 50%'): ImageContentPosition => {
  const [left, top] = css.split(' ') as [`${number}%`, `${number}%`];
  return { left, top };
};

export const CONTACT = {
  phoneDisplay: '+44 7709 870134',
  phoneHref: 'tel:+447709870134',
  whatsappHref: 'https://wa.me/447709870134',
  email: 'igbadun_bites@yahoo.com',
  emailHref: 'mailto:igbadun_bites@yahoo.com',
}; // igbadun-bites/lib/contact.ts

// components/home/Hero.tsx
export const HERO = {
  image: '/images/editorial/hero-peanuts-warm.jpg',
  position: position('78% 75%'), // object-[78%_75%] on phones
  eyebrow: ['Nigerian snacks', 'Made for sharing'],
  lines: [
    { text: 'Bringing back', italic: false },
    { text: 'memories,', italic: true },
    { text: 'one bite', italic: false },
    { text: 'at a time.', italic: false },
  ],
  body: 'Chin chin, plantain chips, coconut candy and the rest of the party tray — for pickup, or delivered across the UK.',
};

// components/home/Manifesto.tsx
export const MANIFESTO = {
  eyebrow: 'Igbadun Bites',
  lead: 'The taste of Saturday parties, school gates and an auntie’s kitchen — ',
  accent: 'wrapped up and brought back to you.',
};

// lib/shop-content.ts
export type Chapter = {
  title: string;
  shortTitle: string;
  kicker: string;
  body: string;
  image: { path: string; alt: string; caption: string };
};
export const CHAPTERS: Record<string, Chapter> = {
  Chips: {
    title: 'Chips',
    shortTitle: 'Chips',
    kicker: 'Golden, thin and loud.',
    body: 'Plantain and cocoyam chips with that unmistakable snap — the bag that never makes it home unopened.',
    image: { path: '/images/editorial/plantain-chips-tray.jpg', alt: 'Plantain chips in small clear bags, fanned out on a hawker’s tray', caption: 'Plantain chips, bagged up on a hawker’s tray' },
  },
  'Crunchy snacks': {
    title: 'Crunchy snacks',
    shortTitle: 'Crunchy',
    kicker: 'The sound of every party tray.',
    body: 'Chin chin, kokoro, akara, gurundi and groundnuts — for long journeys, late conversations and “just one more handful”.',
    image: { path: '/images/editorial/groundnut-roasting.jpg', alt: 'A woman roasting groundnuts in a pan over a coal pot', caption: 'Groundnuts roasting over a coal pot' },
  },
  'Traditional treats and sweets': {
    title: 'Traditional treats & sweets',
    shortTitle: 'Treats',
    kicker: 'The sweets you saved for later.',
    body: 'Coconut candy, baba dudu, condensed milk sweets and more — the ones you counted out in your palm and made last all afternoon.',
    image: { path: '/images/editorial/coconuts-market.jpg', alt: 'Coconuts piled on a wooden market stall', caption: 'Coconuts at Bakin Dogo Market, Kaduna' },
  },
};
// Matched by key (see productImageKey), so it also finds the product under its old name
export const FEATURED_PRODUCT_NAME = 'Chin Chin';

// lib/stand-in-images.ts — licensed stand-in photos (credited on the website's /credits).
// The files themselves are loaded from the website (public/images/stand-in/<key>.jpg).
// Entries the owner's own photos replaced are removed, as on the website (Oct 2026: Cocoyam
// Chips, Kokoro Egba, Chin Chin, Sisi Pelebe, Babadudu, Donkwa) — their files are gone too.
export type StandIn = { kind: 'snack' | 'ingredient'; shows: string; position?: string };
export const STAND_INS: Record<string, StandIn> = {
  'plantain-chips': { kind: 'snack', shows: 'plantain chips (ipekere) in a market basin', position: '50% 60%' },
  'akara-ogbomosho': { kind: 'snack', shows: 'crunchy akara' },
  'flakes-chin-chin': { kind: 'snack', shows: 'chin chin crunch (flaked style)', position: '50% 55%' },
  gurundi: { kind: 'snack', shows: 'coconut biscuits' },
  peanuts: { kind: 'snack', shows: 'dry-fried groundnuts in a market sack' },
  'coconut-candy': { kind: 'snack', shows: 'coconut candy balls' },
  'condensed-milk-sweet': { kind: 'snack', shows: 'a hawker’s tray of local milk sweets', position: '50% 20%' },
};

// Products renamed to the owner's spelling (Oct 2026): old key → new key, as on the website
// (lib/product-images.ts). Photos, links and "Start here" work under either name, and an old
// shared link still opens the product.
export const RENAMED_PRODUCT_KEYS: Record<string, string> = {
  'baba-dudu': 'babadudu', // Baba Dudu → Babadudu
  'milky-chin-chin': 'chin-chin', // Milky Chin Chin → Chin Chin
  dankwa: 'donkwa', // Dankwa → Donkwa
};
export const currentProductKey = (key: string) => RENAMED_PRODUCT_KEYS[key] ?? key;

// Same rule as the website (lib/product-images.ts): "Chin Chin" → "chin-chin"
export function productImageKey(name: string) {
  return currentProductKey(slug(name));
}
function slug(name: string) {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // drop accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
// Which product photos exist is read from the website itself: see lib/product-photos.ts

// components/home/Story.tsx
export const STORY = {
  image: '/images/editorial/buffet-plate.jpg',
  position: position('45% 50%'),
  alt: 'A guest’s plate being filled at a Nigerian party buffet: fried rice, samosa, meat and coleslaw',
  quote: '“Every snack here comes with a memory attached — a party, a journey, a person.”',
  paragraphs: [
    'For many of us, Nigerian snacks were never just snacks. They were the bowl passed around at a party, the paper bag bought on the way home, the treat an aunty pressed into your hand.',
    'Igbadun Bites brings those flavours together in one place — for the moments you want to share them again, wherever you are now.',
  ],
  note: 'Our founder’s story is coming soon.',
};

// components/home/Occasions.tsx
export const OCCASIONS = {
  image: '/images/editorial/small-chops.jpg',
  alt: 'A party tray of small chops — puff puff, samosas and spring rolls',
  eyebrow: 'Parties, gifts & celebrations',
  lead: 'Snack packs for the moments that ',
  accent: 'matter.',
  body: 'Birthdays, weddings, naming ceremonies, office treats or a gift for someone far from home — tell us what you’re celebrating and we’ll put together a custom snack pack.',
};

// components/home/Practical.tsx
export const PRACTICAL = [
  { title: 'Pickup & UK-wide delivery', body: 'Collect from us or have it delivered anywhere in the UK — we’ll confirm the details after you order.' },
  { title: 'Secure payment', body: 'Paid through Paystack. We never see your card details.' },
  { title: 'Your orders, saved', body: 'Sign in with Google to see your order history any time.' },
];

// components/shop/ShopSection.tsx — "Thirteen snacks in 3 chapters …"
const NUMBER_WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty'];
export const countWords = (n: number) => NUMBER_WORDS[n] ?? String(n);
