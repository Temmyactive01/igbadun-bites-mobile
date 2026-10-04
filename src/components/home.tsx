import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Linking, Pressable, StyleSheet, Text, useWindowDimensions, View, type LayoutChangeEvent, type TextStyle } from 'react-native';
import type { Product } from '../lib/products';
import { useProductImage } from '../lib/product-photos';
import { formatPence, pricePence } from '../lib/products';
import { CHAPTERS, CONTACT, HERO, MANIFESTO, OCCASIONS, PRACTICAL, productImageKey, siteImage, SITE_URL, STAND_INS, STORY, countWords } from '../lib/site-content';
import { colors, FALLBACK_TINT, fonts, space, tintFor, type } from '../lib/theme';
import { AddControl } from './cart-controls';
import { ProductVisual } from './product-visual';

// The website homepage's sections (igbadun-bites/components/home + components/shop), one
// component each, in the same order and with the same copy, type and colours. Laid out as
// the website lays them out at phone width. See src/lib/site-content.ts for the shared copy.

const oat = (a: number) => `rgba(242,233,218,${a})`;
const cocoaA = (a: number) => `rgba(43,26,18,${a})`;
const openSite = (path: string) => Linking.openURL(SITE_URL + path);
const openProduct = (product: Product) => router.push({ pathname: '/product/[id]', params: { id: product.id } });

// Inline underlined link inside a paragraph (the website's "underline decoration-terracotta/50")
function InlineLink({ onPress, children, style }: { onPress: () => void; children: ReactNode; style?: TextStyle }) {
  return (
    <Text onPress={onPress} accessibilityRole="link" style={[styles.inlineLink, style]}>
      {children}
    </Text>
  );
}

function Eyebrow({ children, color = colors.cocoaSoft, style }: { children: ReactNode; color?: string; style?: TextStyle }) {
  return <Text style={[type.eyebrow, { color }, style]}>{children}</Text>;
}

// ---- Hero (components/home/Hero.tsx) ----
export function Hero({ minHeight, topInset, onShop, onStory }: { minHeight: number; topInset: number; onShop: () => void; onStory: () => void }) {
  return (
    <View style={[styles.hero, { minHeight }]}>
      <Image
        source={{ uri: siteImage(HERO.image, 828) }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition={HERO.position}
        transition={600}
        accessible={false}
      />
      {/* Scrims keep the type at full contrast over the photo — same stops as the website */}
      <LinearGradient
        colors={[cocoaA(0.78), cocoaA(0.35), cocoaA(0.3), cocoaA(0.78), cocoaA(0.92)]}
        locations={[0, 0.42, 0.58, 0.76, 1]}
        style={StyleSheet.absoluteFill}
      />
      {/* pt-28 on the website = 112 from the top of the screen, under the floating header */}
      <View style={[styles.heroInner, { paddingTop: topInset + 112 }]}>
        <View>
          <Text style={[type.eyebrow, { color: oat(0.8) }]}>
            {HERO.eyebrow[0]}
            <Text style={{ color: colors.plantain }}>{'  ·  '}</Text>
            {HERO.eyebrow[1]}
          </Text>
          <Text style={[type.displayXl, styles.heroTitle]} accessibilityRole="header">
            {HERO.lines.map((line, i) => (
              <Text key={line.text} style={line.italic ? { fontFamily: fonts.serifItalic, color: colors.plantain } : undefined}>
                {line.text}
                {i < HERO.lines.length - 1 ? '\n' : ''}
              </Text>
            ))}
          </Text>
        </View>
        <View style={{ marginTop: 48 }}>
          <Text style={[type.bodyL, { color: oat(0.85), maxWidth: 448 }]}>{HERO.body}</Text>
          <View style={styles.heroActions}>
            <Pressable onPress={onShop} accessibilityRole="button" accessibilityHint="Scrolls down to the shop" style={({ pressed }) => [styles.heroButton, pressed && styles.pressed]}>
              <Text style={styles.heroButtonText}>Shop the snacks</Text>
              <Text style={styles.heroButtonText} importantForAccessibility="no">
                ↓
              </Text>
            </Pressable>
            <Pressable onPress={onStory} accessibilityRole="link" hitSlop={12}>
              <Text style={styles.heroStory}>Our story</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

// ---- Manifesto (components/home/Manifesto.tsx) ----
export function Manifesto() {
  return (
    <View style={styles.sectionY}>
      <View style={styles.row}>
        <View style={styles.rule} />
        <Eyebrow>{MANIFESTO.eyebrow}</Eyebrow>
      </View>
      <Text style={[type.displayM, { color: colors.cocoa, marginTop: 32 }]}>
        {MANIFESTO.lead}
        <Text style={{ fontFamily: fonts.serifItalic, color: colors.terracotta }}>{MANIFESTO.accent}</Text>
      </Text>
    </View>
  );
}

// ---- Shop intro (components/shop/ShopSection.tsx) ----
export function ShopIntro({ productCount, chapterCount, error }: { productCount: number; chapterCount: number; error: string | null }) {
  return (
    <View style={styles.shopIntro}>
      <View>
        <Eyebrow>The shop</Eyebrow>
        <Text style={[type.displayL, styles.ink, { marginTop: 24 }]} accessibilityRole="header">
          A taste of <Text style={{ fontFamily: fonts.serifItalic, color: colors.terracotta }}>home.</Text>
        </Text>
      </View>
      {error ? (
        <View style={styles.shopError}>
          <Text style={[type.title, styles.ink, { textAlign: 'center' }]}>The shop is taking a short break.</Text>
          <Text style={[type.body, styles.soft, { marginTop: 12, textAlign: 'center' }]}>{error}</Text>
        </View>
      ) : productCount > 0 ? (
        <View>
          <Text style={[type.bodyL, styles.soft]}>
            {countWords(productCount)} snacks in {chapterCount} chapters — from the crunch of the party tray to the sweets you saved for later.
          </Text>
          <Text style={[type.small, styles.soft, { marginTop: 16 }]}>
            Photos are stand-ins showing typical versions of each snack, not our own products — our product photography is coming soon.{' '}
            <InlineLink onPress={() => openSite('/credits')}>Photo credits</InlineLink>
          </Text>
        </View>
      ) : null}
    </View>
  );
}

// ---- Chapter index (components/shop/ChapterIndex.tsx) ----
export type ChapterItem = { category: string; count: number };
export function ChapterIndex({ items, active, onPick }: { items: ChapterItem[]; active: string | null; onPick: (category: string) => void }) {
  return (
    <View style={styles.chapterIndex} accessibilityLabel="Shop chapters">
      {items.map((item, i) => {
        const isActive = active === item.category;
        return (
          <Pressable
            key={item.category}
            onPress={() => onPick(item.category)}
            accessibilityRole="link"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`Chapter ${i + 1}: ${CHAPTERS[item.category]?.title ?? item.category}, ${item.count} snacks`}
            style={styles.chapterLink}
          >
            <Text style={[styles.chapterNum, { color: isActive ? colors.cocoa : colors.cocoaSoft }]}>{String(i + 1).padStart(2, '0')}</Text>
            <Text style={[styles.chapterName, { color: isActive ? colors.cocoa : colors.cocoaSoft }]}>{CHAPTERS[item.category]?.shortTitle ?? item.category}</Text>
            <Text style={[type.xs, styles.soft]}>{item.count}</Text>
            <View style={[styles.chapterBar, { opacity: isActive ? 1 : 0 }]} />
          </Pressable>
        );
      })}
    </View>
  );
}

// ---- Featured product (components/shop/FeaturedProduct.tsx) ----
export function FeaturedProduct({ product, onMore }: { product: Product; onMore: () => void }) {
  const chapter = CHAPTERS[product.category];
  const image = useProductImage(product.name);
  // Large image, so say plainly when it's a stand-in rather than our own product photo
  const standIn = image.kind === 'stand-in' ? STAND_INS[productImageKey(product.name)] : undefined;
  return (
    <View style={styles.featured}>
      <View>
        <ProductVisual product={product} tint={tintFor(product.category)} width={828} large image={image} />
        {standIn && (
          <Text style={[type.small, styles.soft, { marginTop: 12 }]}>
            <Text style={styles.pictured}>Pictured:</Text>{' '}
            {standIn.kind === 'snack' ? `typical ${standIn.shows} — a stand-in photo, not our own product.` : `${standIn.shows} — an ingredient, not the finished snack.`}
          </Text>
        )}
      </View>
      <View style={{ marginTop: 40 }}>
        <Eyebrow color={colors.terracotta}>Start here</Eyebrow>
        <Text style={[type.displayM, styles.ink, { marginTop: 20 }]} accessibilityRole="header">
          {product.name}
        </Text>
        <Text style={[type.bodyL, styles.soft, { marginTop: 24 }]}>{product.description}</Text>
        <View style={[styles.row, { alignItems: 'baseline', gap: 16, marginTop: 32 }]}>
          <Text style={styles.featuredPrice}>{formatPence(pricePence(product))}</Text>
          <Text style={[type.small, styles.soft]}>{product.pack_size}</Text>
        </View>
        <View style={styles.featuredActions}>
          <AddControl product={product} size="lg" />
          <Pressable onPress={() => openProduct(product)} accessibilityRole="link" hitSlop={12}>
            <Text style={styles.actionLink}>Details & allergens</Text>
          </Pressable>
          <Pressable onPress={onMore} accessibilityRole="link" hitSlop={12}>
            <Text style={styles.actionLink}>More {(chapter?.title ?? product.category).toLowerCase()}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ---- Chapter (components/shop/Chapter.tsx) ----
export function Chapter({ number, category, products, onLayout }: { number: number; category: string; products: Product[]; onLayout: (e: LayoutChangeEvent) => void }) {
  const content = CHAPTERS[category];
  const num = String(number).padStart(2, '0');
  // Two columns, 16 apart, inside the 16 page gutters — the website's grid-cols-2 gap-x-4
  const cellWidth = (useWindowDimensions().width - space.gutter * 2 - 16) / 2;
  return (
    <View style={styles.sectionY} onLayout={onLayout}>
      <View style={[styles.row, { alignItems: 'flex-start', gap: 16 }]}>
        <Text style={[type.numeral, styles.numeral]} importantForAccessibility="no" accessibilityElementsHidden>
          {num}
        </Text>
        <View style={{ flex: 1, paddingTop: 4 }}>
          <Eyebrow>
            Chapter {num} · {products.length} {products.length === 1 ? 'snack' : 'snacks'}
          </Eyebrow>
          <Text style={[type.displayL, styles.ink, { marginTop: 16 }]} accessibilityRole="header">
            {content?.title ?? category}
          </Text>
        </View>
      </View>
      {content && (
        <View style={{ marginTop: 32 }}>
          <Text style={[type.title, styles.ink, { fontFamily: fonts.serifItalic }]}>{content.kicker}</Text>
          <Text style={[type.bodyL, styles.soft, { marginTop: 16 }]}>{content.body}</Text>
        </View>
      )}
      {content?.image && (
        <View style={{ marginTop: 40 }}>
          <View style={styles.chapterImage}>
            <Image source={{ uri: siteImage(content.image.path, 828) }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} accessible accessibilityLabel={content.image.alt} />
          </View>
          <Text style={[type.small, styles.soft, { marginTop: 12 }]}>
            <Text style={styles.pictured}>Pictured:</Text> {content.image.caption.toLowerCase()}
          </Text>
        </View>
      )}
      {/* Rows of two, so paired tiles share a height and their Add buttons line up (as in CSS grid) */}
      <View style={styles.grid}>
        {rowsOfTwo(products).map((row) => (
          <View key={row[0].id} style={styles.gridRow}>
            {row.map((p) => (
              <View key={p.id} style={{ width: cellWidth }}>
                <ProductTile product={p} tint={content ? tintFor(category) : FALLBACK_TINT} />
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const rowsOfTwo = <T,>(items: T[]) => items.reduce<T[][]>((rows, item, i) => (i % 2 ? rows[rows.length - 1].push(item) : rows.push([item]), rows), []);

// ---- Product tile (components/shop/ProductTile.tsx) ----
function ProductTile({ product, tint }: { product: Product; tint: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Pressable onPress={() => openProduct(product)} accessibilityRole="button" accessibilityLabel={`${product.name}: details and allergens`}>
        <ProductVisual product={product} tint={tint} />
      </Pressable>
      <View style={{ marginTop: 12, flex: 1 }}>
        <Text style={styles.tileName} onPress={() => openProduct(product)}>
          {product.name}
        </Text>
        <Text style={styles.tilePrice}>{formatPence(pricePence(product))}</Text>
        <Text onPress={() => openProduct(product)} accessibilityRole="link" style={[type.xs, styles.tileDetails]}>
          Details & allergens
        </Text>
        <View style={styles.tileFoot}>
          <Text style={[type.xs, styles.soft]}>{product.pack_size}</Text>
          <AddControl product={product} />
        </View>
      </View>
    </View>
  );
}

// ---- Closing note under the shop ----
export function ShopNote() {
  return (
    <View style={styles.shopNote}>
      <Text style={[type.bodyL, styles.soft]}>
        Don’t see what you’re after?{' '}
        <InlineLink onPress={() => Linking.openURL(CONTACT.whatsappHref)} style={{ fontFamily: fonts.sansMedium, color: colors.cocoa }}>
          Message us on WhatsApp
        </InlineLink>{' '}
        — we’re happy to help.
      </Text>
    </View>
  );
}

// ---- Our story (components/home/Story.tsx) ----
export function Story() {
  return (
    <View style={[styles.sectionY, { backgroundColor: colors.cocoa }]}>
      <View style={styles.tallImage}>
        <Image source={{ uri: siteImage(STORY.image, 828) }} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition={STORY.position} transition={200} accessible accessibilityLabel={STORY.alt} />
      </View>
      <View style={{ marginTop: 48 }}>
        <Eyebrow color={colors.plantain}>Our story</Eyebrow>
        <Text style={[type.displayL, { color: colors.oat, marginTop: 24 }]} accessibilityRole="header">
          Made for <Text style={{ fontFamily: fonts.serifItalic }}>sharing.</Text>
        </Text>
        <View style={styles.quote}>
          <Text style={[type.title, { fontFamily: fonts.serifItalic, color: oat(0.95) }]}>{STORY.quote}</Text>
        </View>
        <View style={{ marginTop: 40, gap: 20 }}>
          {STORY.paragraphs.map((p) => (
            <Text key={p} style={[type.bodyL, { color: oat(0.8) }]}>
              {p}
            </Text>
          ))}
        </View>
        <View style={[styles.row, { gap: 12, marginTop: 40 }]}>
          <View style={styles.dot} />
          <Text style={[type.small, { color: oat(0.6) }]}>{STORY.note}</Text>
        </View>
      </View>
    </View>
  );
}

// ---- Occasions (components/home/Occasions.tsx) ----
export function Occasions() {
  return (
    <View style={styles.sectionY}>
      <Eyebrow>{OCCASIONS.eyebrow}</Eyebrow>
      <Text style={[type.displayL, styles.ink, { marginTop: 24 }]} accessibilityRole="header">
        {OCCASIONS.lead}
        <Text style={{ fontFamily: fonts.serifItalic, color: colors.terracotta }}>{OCCASIONS.accent}</Text>
      </Text>
      <Text style={[type.bodyL, styles.soft, { marginTop: 32 }]}>{OCCASIONS.body}</Text>
      <Pressable
        onPress={() => Linking.openURL(CONTACT.whatsappHref)}
        accessibilityRole="link"
        accessibilityHint="Opens WhatsApp"
        style={({ pressed }) => [styles.cocoaButton, pressed && styles.pressed]}
      >
        <Text style={styles.cocoaButtonText}>Plan a pack on WhatsApp</Text>
        <Text style={styles.cocoaButtonText} importantForAccessibility="no">
          ↗
        </Text>
      </Pressable>
      <View style={[styles.tallImage, { marginTop: 48 }]}>
        <Image source={{ uri: siteImage(OCCASIONS.image, 828) }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} accessible accessibilityLabel={OCCASIONS.alt} />
      </View>
    </View>
  );
}

// ---- How ordering works (components/home/Practical.tsx) ----
export function Practical({ onOrders }: { onOrders: () => void }) {
  return (
    <View style={styles.practical} accessibilityLabel="How ordering works">
      {PRACTICAL.map((point, i) => (
        <View key={point.title} style={[styles.practicalItem, i > 0 && styles.practicalDivider]}>
          <Eyebrow color={colors.terracotta}>0{i + 1}</Eyebrow>
          <Text style={[type.title, styles.ink, { marginTop: 12 }]}>{point.title}</Text>
          {i === 2 ? (
            <Text style={[type.body, styles.soft, { marginTop: 12 }]}>
              Sign in with Google to see your{' '}
              <InlineLink onPress={onOrders} style={{ color: colors.cocoa }}>
                order history
              </InlineLink>{' '}
              any time.
            </Text>
          ) : (
            <Text style={[type.body, styles.soft, { marginTop: 12 }]}>{point.body}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

// ---- Footer (components/SiteFooter.tsx) ----
export function Footer({ onShop, onStory, onOrders }: { onShop: () => void; onStory: () => void; onOrders: () => void }) {
  return (
    <View style={styles.footer}>
      <View style={{ paddingHorizontal: space.gutter, paddingTop: 80, paddingBottom: 64 }}>
        <Text style={[type.displayL, { color: colors.oat }]}>
          Bring back a <Text style={{ fontFamily: fonts.serifItalic, color: colors.plantain }}>memory.</Text>
        </Text>
        <Pressable onPress={onShop} accessibilityRole="button" style={({ pressed }) => [styles.footerButton, pressed && styles.pressed]}>
          <Text style={styles.heroButtonText}>Shop the snacks</Text>
          <Text style={styles.heroButtonText} importantForAccessibility="no">
            →
          </Text>
        </Pressable>
      </View>
      <AdireBand />
      <View style={{ paddingHorizontal: space.gutter, paddingVertical: 64, gap: 48 }}>
        <FooterGroup title="Get in touch">
          <Text style={styles.footerText}>
            Call <FooterLink onPress={() => Linking.openURL(CONTACT.phoneHref)}>{CONTACT.phoneDisplay}</FooterLink>
          </Text>
          <FooterLink onPress={() => Linking.openURL(CONTACT.whatsappHref)}>Message us on WhatsApp</FooterLink>
          <FooterLink onPress={() => Linking.openURL(CONTACT.emailHref)}>{CONTACT.email}</FooterLink>
        </FooterGroup>
        <FooterGroup title="How we serve">
          <Text style={styles.footerText}>Pickup, or delivery across the UK</Text>
          <Text style={styles.footerText}>
            Custom snack packs for events, parties & gifts — <FooterLink onPress={() => Linking.openURL(CONTACT.whatsappHref)}>ask us</FooterLink>
          </Text>
        </FooterGroup>
        <FooterGroup title="Explore">
          <FooterLink onPress={onShop}>Shop</FooterLink>
          <FooterLink onPress={onStory}>Our story</FooterLink>
          <FooterLink onPress={onOrders}>My orders</FooterLink>
        </FooterGroup>
      </View>
      <View style={styles.smallPrint}>
        <Text style={[type.small, { color: oat(0.7) }]}>More coming soon: About us · Party catering · Gifts & event packs · FAQs · Policies</Text>
        <Text style={[type.small, { color: oat(0.7) }]}>
          Instagram · TikTok · Facebook — coming soon{'     '}
          <FooterLink onPress={() => openSite('/privacy')} small>
            Privacy
          </FooterLink>
          {'     '}
          <FooterLink onPress={() => openSite('/credits')} small>
            Photo credits
          </FooterLink>
        </Text>
      </View>
      {/* Oversized faint wordmark, cropped by the screen edge — decorative */}
      <Text style={styles.wordmark} numberOfLines={1} importantForAccessibility="no" accessibilityElementsHidden>
        Igbadun<Text style={{ color: 'rgba(217,162,62,0.4)' }}>.</Text>
        <Text style={{ fontFamily: fonts.serifItalic }}>Bites</Text>
      </Text>
    </View>
  );
}

// The footer's single adire band (components/Textures.tsx → AdireTexture): the top 40 pt of
// the website's 96-pt pattern tile — concentric "eleko" circles and crossed lines — at 12%.
function AdireBand() {
  const tiles = Math.ceil(useWindowDimensions().width / 96);
  const line = { position: 'absolute', left: 72 - 22.6, top: 24 - 0.625, width: 45.25, height: 1.25, backgroundColor: colors.oat } as const;
  const ring = (r: number) => ({ position: 'absolute', left: 24 - r, top: 24 - r, width: r * 2, height: r * 2, borderRadius: r, borderWidth: 1.25, borderColor: colors.oat }) as const;
  const dot = (cx: number, r: number) => ({ position: 'absolute', left: cx - r, top: 24 - r, width: r * 2, height: r * 2, borderRadius: r, backgroundColor: colors.oat }) as const;
  return (
    <View style={styles.adireBand} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      {Array.from({ length: tiles }, (_, i) => (
        <View key={i} style={{ position: 'absolute', left: i * 96, top: 0, width: 96, height: 40 }}>
          <View style={ring(15)} />
          <View style={ring(9)} />
          <View style={dot(24, 2.5)} />
          <View style={[line, { transform: [{ rotate: '45deg' }] }]} />
          <View style={[line, { transform: [{ rotate: '-45deg' }] }]} />
          <View style={dot(72, 2)} />
        </View>
      ))}
    </View>
  );
}

function FooterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View>
      <Eyebrow color={colors.plantain}>{title}</Eyebrow>
      <View style={{ marginTop: 20, gap: 12 }}>{children}</View>
    </View>
  );
}

function FooterLink({ onPress, children, small = false }: { onPress: () => void; children: ReactNode; small?: boolean }) {
  return (
    <Text onPress={onPress} accessibilityRole="link" style={[styles.footerText, styles.footerLink, small && [type.small, { color: oat(0.7) }]]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.8 },
  row: { flexDirection: 'row', alignItems: 'center' },
  ink: { color: colors.cocoa },
  soft: { color: colors.cocoaSoft },
  sectionY: { paddingHorizontal: space.gutter, paddingVertical: space.sectionY },
  inlineLink: { textDecorationLine: 'underline', textDecorationColor: 'rgba(168,74,36,0.5)' },
  pictured: { fontFamily: fonts.headingItalic },

  hero: { backgroundColor: colors.cocoa, overflow: 'hidden' },
  heroInner: { flex: 1, justifyContent: 'space-between', paddingHorizontal: space.gutter, paddingBottom: 32 },
  heroTitle: { color: colors.oat, marginTop: 24 },
  heroActions: { marginTop: 28, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 24, rowGap: 16 },
  heroButton: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 28, paddingVertical: 16, borderRadius: 999, backgroundColor: colors.plantain },
  heroButtonText: { fontFamily: fonts.sansSemiBold, fontSize: 16, lineHeight: 24, color: colors.cocoa },
  heroStory: { fontFamily: fonts.sansMedium, fontSize: 14, lineHeight: 20, color: colors.oat, textDecorationLine: 'underline', textDecorationColor: oat(0.4) },

  rule: { width: 40, height: 1, marginRight: 12, backgroundColor: colors.terracotta },

  shopIntro: { paddingHorizontal: space.gutter, paddingTop: 64, paddingBottom: 56, gap: 32 },
  shopError: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: cocoaA(0.15), paddingVertical: 64 },

  chapterIndex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: space.gutter,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: cocoaA(0.1),
    backgroundColor: 'rgba(242,233,218,0.97)',
  },
  chapterLink: { flexDirection: 'row', alignItems: 'baseline', gap: 8, paddingVertical: 16 },
  chapterNum: { fontFamily: fonts.headingItalic, fontSize: 14, lineHeight: 20 },
  chapterName: { fontFamily: fonts.sansMedium, fontSize: 14, lineHeight: 20 },
  chapterBar: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, backgroundColor: colors.terracotta },

  featured: {
    paddingHorizontal: space.gutter,
    paddingVertical: 64,
    backgroundColor: colors.offwhite,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: cocoaA(0.1),
  },
  featuredPrice: { fontFamily: fonts.heading, fontSize: 30, lineHeight: 36, color: colors.cocoa, fontVariant: ['tabular-nums'] },
  featuredActions: { marginTop: 32, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 24, rowGap: 16 },
  actionLink: { fontFamily: fonts.sansMedium, fontSize: 14, lineHeight: 20, color: colors.cocoa, textDecorationLine: 'underline', textDecorationColor: 'rgba(168,74,36,0.5)' },

  numeral: { color: 'rgba(168,74,36,0.9)', marginTop: -8 },
  chapterImage: { aspectRatio: 4 / 3, borderRadius: 4, overflow: 'hidden', backgroundColor: colors.oatDeep },
  grid: { marginTop: 64, gap: 40 },
  gridRow: { flexDirection: 'row', alignItems: 'stretch', gap: 16 },
  tileName: { fontFamily: fonts.heading, fontSize: 18, lineHeight: 25, color: colors.cocoa },
  tilePrice: { marginTop: 2, fontFamily: fonts.sansMedium, fontSize: 16, lineHeight: 24, color: colors.cocoa, fontVariant: ['tabular-nums'] },
  tileDetails: { marginTop: 4, alignSelf: 'flex-start', color: colors.cocoaSoft, textDecorationLine: 'underline', textDecorationColor: cocoaA(0.25) },
  tileFoot: { marginTop: 12, flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', alignContent: 'flex-end', justifyContent: 'space-between', gap: 8 },

  shopNote: { marginHorizontal: space.gutter, marginBottom: 64, paddingTop: 32, borderTopWidth: 1, borderColor: cocoaA(0.15) },

  tallImage: { aspectRatio: 4 / 5, borderRadius: 4, overflow: 'hidden', backgroundColor: colors.cocoaSoft },
  quote: { marginTop: 40, paddingLeft: 24, borderLeftWidth: 1, borderLeftColor: 'rgba(217,162,62,0.6)' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.plantain },

  cocoaButton: { marginTop: 40, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 28, paddingVertical: 16, borderRadius: 999, backgroundColor: colors.cocoa },
  cocoaButtonText: { fontFamily: fonts.sansSemiBold, fontSize: 16, lineHeight: 24, color: colors.oat },

  practical: { paddingHorizontal: space.gutter, backgroundColor: colors.offwhite, borderTopWidth: 1, borderBottomWidth: 1, borderColor: cocoaA(0.1) },
  practicalItem: { paddingVertical: 40 },
  practicalDivider: { borderTopWidth: 1, borderColor: cocoaA(0.1) },

  footer: { backgroundColor: colors.cocoa, overflow: 'hidden' },
  footerButton: { marginTop: 40, alignSelf: 'flex-start', height: 56, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 32, borderRadius: 999, backgroundColor: colors.plantain },
  adireBand: { height: 40, overflow: 'hidden', opacity: 0.12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: oat(0.1) },
  footerText: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 24, color: oat(0.85) },
  footerLink: { textDecorationLine: 'underline', textDecorationColor: oat(0.3) },
  smallPrint: { marginHorizontal: space.gutter, paddingVertical: 24, gap: 12, borderTopWidth: 1, borderColor: oat(0.15) },
  wordmark: { paddingHorizontal: 8, marginBottom: -15, fontFamily: fonts.serif, fontSize: 82, lineHeight: 74, letterSpacing: -3.3, color: oat(0.07) },
});
