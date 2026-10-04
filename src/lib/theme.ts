import type { TextStyle } from 'react-native';

// Design tokens from the website (igbadun-bites/app/globals.css + style.md). Keep the two
// in step: if a colour or type size changes on the web, change it here too.
export const colors = {
  oat: '#f2e9da',
  oatDeep: '#e8dbc5',
  offwhite: '#fbf7f0',
  cocoa: '#2b1a12',
  cocoaSoft: '#5e4536',
  terracotta: '#a84a24',
  plantain: '#d9a23e',
  plantainDeep: '#8c6418',
  leaf: '#4e6a48',
  hairline: 'rgba(43,26,18,0.12)',
};

// Category colours — same tints as the website's shop chapters (lib/shop-content.ts)
const CATEGORY_TINTS: Record<string, string> = {
  Chips: '#ead7ae',
  'Crunchy snacks': '#e3d3ba',
  'Traditional treats and sweets': '#ebd2c2',
};
export const FALLBACK_TINT = '#e8dbc5';
export const tintFor = (category: string) => CATEGORY_TINTS[category] ?? FALLBACK_TINT;

// Same typefaces as the website: Fraunces (headings) and Instrument Sans (UI/body), loaded
// in src/app/_layout.tsx. The website sets Fraunces' optical-size and "soft" axes, which
// React Native can't do, so assets/fonts holds Google Fonts' fixed copies at the website's
// exact settings (display: opsz 144, SOFT 100, WONK on — as the variable font renders at that
// size; text: opsz 18). Licence: assets/fonts/OFL.txt. Each weight/italic is its own family name: use these, not fontWeight/fontStyle.
export const fonts = {
  serif: 'FrauncesDisplay-Light', // .serif-editorial: wght 300 (headlines)
  serifItalic: 'FrauncesDisplay-LightItalic',
  wordmark: 'FrauncesDisplay-Regular', // the header logotype (serif-editorial + font-normal)
  wordmarkItalic: 'FrauncesDisplay-Italic',
  heading: 'FrauncesText-Regular', // plain font-heading at small sizes (prices, tile names)
  headingItalic: 'FrauncesText-Italic',
  sans: 'InstrumentSans_400Regular',
  sansItalic: 'InstrumentSans_400Regular_Italic',
  sansMedium: 'InstrumentSans_500Medium',
  sansSemiBold: 'InstrumentSans_600SemiBold',
  sansBold: 'InstrumentSans_700Bold',
};

// Kept for existing screens: the editorial serif
export const serif = fonts.serif;

// The website's type tokens at phone width (390 pt), from the clamp() values in
// globals.css. Line heights are the web ratios, nudged up slightly where React Native
// would otherwise clip glyphs.
export const type = {
  displayXl: { fontFamily: fonts.serif, fontSize: 49, lineHeight: 46, letterSpacing: -1.96 }, // text-display-xl (hero)
  displayL: { fontFamily: fonts.serif, fontSize: 44, lineHeight: 42, letterSpacing: -1.32 }, // text-display-l
  displayM: { fontFamily: fonts.serif, fontSize: 36, lineHeight: 37, letterSpacing: -0.72 }, // text-display-m
  title: { fontFamily: fonts.serif, fontSize: 24, lineHeight: 28, letterSpacing: -0.24 }, // text-title
  numeral: { fontFamily: fonts.serif, fontSize: 72, lineHeight: 66, letterSpacing: -3.6 }, // text-numeral
  bodyL: { fontFamily: fonts.sans, fontSize: 18, lineHeight: 28 }, // text-body-l
  body: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 24 },
  small: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 20 }, // text-sm
  xs: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 16 }, // text-xs
  eyebrow: { fontFamily: fonts.sansSemiBold, fontSize: 12, lineHeight: 15, letterSpacing: 2.64, textTransform: 'uppercase' }, // text-eyebrow
} satisfies Record<string, TextStyle>;

// Spacing tokens at phone width
export const space = {
  gutter: 16, // px-4
  sectionY: 96, // .section-y
};

export const MIN_TOUCH = 44; // pt — accessibility minimum for touch targets
