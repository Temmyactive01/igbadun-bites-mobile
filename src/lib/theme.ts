import { Platform } from 'react-native';

// Brand tokens from the web app (igbadun-bites/style.md and app/globals.css)
export const colors = {
  oat: '#f2e9da',
  oatDeep: '#e8dbc5',
  offwhite: '#fbf7f0',
  cocoa: '#2b1a12',
  cocoaSoft: '#5e4536',
  terracotta: '#a84a24',
  plantain: '#d9a23e',
  leaf: '#4e6a48',
  hairline: 'rgba(43,26,18,0.12)',
};

// Category colours — same tints as the web shop chapters (lib/shop-content.ts)
const CATEGORY_TINTS: Record<string, string> = {
  Chips: '#ead7ae',
  'Crunchy snacks': '#e3d3ba',
  'Traditional treats and sweets': '#ebd2c2',
};
export const tintFor = (category: string) => CATEGORY_TINTS[category] ?? '#e8dbc5';

// Editorial serif for headings (the web uses Fraunces; system serifs until fonts are added)
export const serif = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });

export const MIN_TOUCH = 44; // pt — accessibility minimum for touch targets
