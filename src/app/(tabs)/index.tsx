import { useNavigation } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View, type LayoutChangeEvent, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BasketBar } from '../../components/cart-controls';
import { Chapter, ChapterIndex, FeaturedProduct, Footer, Hero, Manifesto, Occasions, Practical, ShopIntro, ShopNote, Story } from '../../components/home';
import { useCart } from '../../lib/cart';
import { groupByCategory, loadProducts, useProducts } from '../../lib/products';
import { FEATURED_PRODUCT_NAME } from '../../lib/site-content';
import { colors, fonts } from '../../lib/theme';

const HEADER = 64; // the website's header bar height (h-16)

// Shop tab = the website homepage (igbadun-bites/app/page.tsx + SiteFooter), section for
// section: hero → manifesto → shop (intro, chapter index, featured product, chapters) →
// our story → occasions → how ordering works → footer. Same copy, photos, type and colours;
// shared copy and image paths live in src/lib/site-content.ts.
export default function Shop() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { products, loading, error } = useProducts();
  const { count } = useCart();
  const groups = useMemo(() => groupByCategory(products), [products]);
  const featured = products.find((p) => p.name === FEATURED_PRODUCT_NAME && p.available) ?? products.find((p) => p.available);

  const scroll = useRef<ScrollView>(null);
  const [viewport, setViewport] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  // Where things sit on the page, worked out from the heights of the blocks above them.
  // (Heights, not positions: a block that only moves — e.g. when the products arrive — doesn't
  // report a new position everywhere, but a block whose size changes always reports it.)
  const [heights, setHeights] = useState<Record<string, number>>({});
  const measure = (key: string) => (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    setHeights((o) => (o[key] === h ? o : { ...o, [key]: h }));
  };
  const sum = (keys: string[]) => keys.reduce<number | undefined>((t, k) => (t === undefined || heights[k] === undefined ? undefined : t + heights[k]), 0);
  const showShopBody = !error && groups.length > 0;
  const shopTop = sum(['hero', 'manifesto']);
  const indexTop = sum(['hero', 'manifesto', 'intro']);
  const storyTop = sum(['hero', 'manifesto', 'intro', ...(showShopBody ? ['shopBody'] : [])]);
  const chapterKeys = groups.map((g) => `chapter:${g.category}`);
  const chapterTop = (category: string) => {
    const i = groups.findIndex((g) => g.category === category);
    return i < 0 ? undefined : sum(['hero', 'manifesto', 'intro', 'index', ...(featured ? ['featured'] : []), ...chapterKeys.slice(0, i)]);
  };

  const headerH = insets.top + HEADER;
  const scrolled = scrollY > 24; // the header turns solid once you scroll, like the website's
  const indexH = heights.index ?? 0;
  const jumpTo = (y: number | undefined, below = 0) => {
    if (y !== undefined) scroll.current?.scrollTo({ y: Math.max(0, y - headerH - below), animated: true });
  };
  const toShop = () => jumpTo(shopTop);
  const toStory = () => jumpTo(storyTop);
  const toChapter = (category: string) => jumpTo(chapterTop(category), indexH);
  const toOrders = () => navigation.navigate('orders' as never);

  // The chapter index sticks under the header while you browse the shop (ChapterIndex.tsx)
  const indexStuck = indexTop !== undefined && scrollY + headerH >= indexTop;
  const pastShop = storyTop !== undefined && scrollY + headerH + indexH >= storyTop;
  // The chapter crossing the upper-middle of the screen is "current" (website: rootMargin -35%)
  const probe = scrollY + viewport * 0.35;
  const active = [...groups].reverse().find((g) => (chapterTop(g.category) ?? Infinity) <= probe)?.category ?? null;
  const indexItems = groups.map((g) => ({ category: g.category, count: g.data.length }));

  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    setScrollY(e.nativeEvent.contentOffset.y);
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  }

  return (
    <View style={styles.screen} onLayout={(e) => setViewport(e.nativeEvent.layout.height)}>
      <StatusBar style={scrolled ? 'dark' : 'light'} />
      <ScrollView
        ref={scroll}
        onScroll={onScroll}
        scrollEventThrottle={32}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.oat} progressViewOffset={headerH} />}
        contentContainerStyle={{ paddingBottom: count > 0 ? 80 : 0 }}
      >
        <View onLayout={measure('hero')}>
          <Hero minHeight={viewport} topInset={insets.top} onShop={toShop} onStory={toStory} />
        </View>
        <View onLayout={measure('manifesto')}>
          <Manifesto />
        </View>

        <View onLayout={measure('intro')}>
          <ShopIntro productCount={products.length} chapterCount={groups.length} error={error} />
          {loading && products.length === 0 && <ActivityIndicator color={colors.cocoa} style={{ marginBottom: 48 }} />}
        </View>

        {showShopBody && (
          <View onLayout={measure('shopBody')}>
            <View onLayout={measure('index')} style={{ opacity: indexStuck ? 0 : 1 }}>
              <ChapterIndex items={indexItems} active={null} onPick={toChapter} />
            </View>
            {featured && (
              <View onLayout={measure('featured')}>
                <FeaturedProduct product={featured} onMore={() => toChapter(featured.category)} />
              </View>
            )}
            {groups.map((g, i) => (
              <Chapter
                key={g.category}
                number={i + 1}
                category={g.category}
                products={g.data}
                onLayout={measure(`chapter:${g.category}`)}
              />
            ))}
            <ShopNote />
          </View>
        )}

        <Story />
        <Occasions />
        <Practical onOrders={toOrders} />
        <Footer onShop={toShop} onStory={toStory} onOrders={toOrders} />
      </ScrollView>

      {/* Floating header: transparent over the hero, solid oat once scrolled (HeaderBar.tsx) */}
      <View style={[styles.header, { paddingTop: insets.top, height: headerH }, scrolled && styles.headerSolid]} pointerEvents="box-none">
        <Pressable onPress={() => scroll.current?.scrollTo({ y: 0, animated: true })} accessibilityRole="header" accessibilityLabel="Igbadun Bites — back to top" hitSlop={8}>
          <Text style={[styles.wordmark, { color: scrolled ? colors.cocoa : colors.oat }]}>
            Igbadun<Text style={{ color: scrolled ? colors.terracotta : colors.plantain }}>.</Text>
            <Text style={{ fontFamily: fonts.wordmarkItalic }}>Bites</Text>
          </Text>
        </Pressable>
        {/* The website's header basket pill (CartButton.tsx); opens the Basket tab */}
        <Pressable
          onPress={() => navigation.navigate('basket' as never)}
          accessibilityRole="button"
          accessibilityLabel={`Open basket, ${count} ${count === 1 ? 'item' : 'items'}`}
          style={({ pressed }) => [styles.basketPill, scrolled ? styles.basketPillSolid : styles.basketPillOverlay, pressed && { opacity: 0.8 }]}
        >
          <Text style={styles.basketPillText}>Basket</Text>
          <View style={[styles.basketCount, count > 0 && { backgroundColor: colors.plantain }]}>
            <Text style={[styles.basketCountText, count > 0 && { color: colors.cocoa }]}>{count}</Text>
          </View>
        </Pressable>
      </View>

      {/* Stuck copy of the chapter index while browsing the shop */}
      {indexStuck && !pastShop && (
        <View style={[styles.stuckIndex, { top: headerH }]}>
          <ChapterIndex items={indexItems} active={active} onPick={toChapter} />
        </View>
      )}

      <BasketBar />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.oat },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  headerSolid: { backgroundColor: 'rgba(242,233,218,0.97)', borderBottomColor: 'rgba(43,26,18,0.1)' },
  wordmark: { fontFamily: fonts.wordmark, fontSize: 25.6, lineHeight: 30, letterSpacing: -0.4 },
  basketPill: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 36, paddingLeft: 16, paddingRight: 6, borderRadius: 999 },
  basketPillOverlay: { backgroundColor: 'rgba(242,233,218,0.1)', borderWidth: 1, borderColor: 'rgba(242,233,218,0.4)' },
  basketPillSolid: { backgroundColor: colors.cocoa, borderWidth: 1, borderColor: colors.cocoa },
  basketPillText: { fontFamily: fonts.sansMedium, fontSize: 14, lineHeight: 20, color: colors.oat },
  basketCount: { minWidth: 24, height: 24, paddingHorizontal: 6, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(242,233,218,0.15)' },
  basketCountText: { fontFamily: fonts.sansSemiBold, fontSize: 12, color: 'rgba(242,233,218,0.8)', fontVariant: ['tabular-nums'] },
  stuckIndex: { position: 'absolute', left: 0, right: 0 },
});
