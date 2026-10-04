import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native';
import { AddControl, BasketBar } from '../../components/cart-controls';
import { useCart } from '../../lib/cart';
import { formatPence, groupByCategory, loadProducts, pricePence, useProducts, type Product } from '../../lib/products';
import { colors, MIN_TOUCH, serif, tintFor } from '../../lib/theme';

// Shop: one scrolling screen in the website homepage's order — hero and manifesto, then
// every product grouped by category, then Our story. Copy comes from the website
// (igbadun-bites/docs/redesign/brand-copy.md). Browsing works signed out; adding asks for
// sign-in (approved decision a). Tiles are type on a category colour — no photos yet.
export default function Shop() {
  const { products, loading, error } = useProducts();
  const { count } = useCart();
  const [refreshing, setRefreshing] = useState(false);
  const sections = useMemo(() => groupByCategory(products), [products]);
  const list = useRef<SectionList<Product>>(null);

  // "Shop the snacks" scrolls down to the first category
  function scrollToProducts() {
    if (sections.length === 0) return;
    list.current?.scrollToLocation({ sectionIndex: 0, itemIndex: 0, viewOffset: 64, animated: true });
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  }

  return (
    <View style={styles.screen}>
      <SectionList
        ref={list}
        sections={sections}
        onScrollToIndexFailed={() => list.current?.getScrollResponder()?.scrollTo({ y: 520, animated: true })}
        keyExtractor={(p) => p.id}
        stickySectionHeadersEnabled={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.cocoa} />}
        contentContainerStyle={{ paddingBottom: count > 0 ? 112 : 32 }}
        ListHeaderComponent={
          <>
            <Hero onShop={scrollToProducts} />
            <View style={styles.intro}>
              <Text style={styles.manifesto}>
                The taste of Saturday parties, school gates and an auntie’s kitchen — wrapped up and brought back to you.
              </Text>
              <Text style={[styles.eyebrow, { marginTop: 36 }]}>THE SHOP</Text>
              <Text style={styles.title} accessibilityRole="header">
                A taste of <Text style={styles.titleAccent}>home.</Text>
              </Text>
              {error && <Text style={styles.error}>{error}</Text>}
            </View>
          </>
        }
        ListEmptyComponent={loading ? <ActivityIndicator color={colors.cocoa} style={{ marginTop: 32 }} /> : null}
        ListFooterComponent={<Story />}
        renderSectionHeader={({ section }) => (
          <Text style={styles.section} accessibilityRole="header">
            {section.category}
          </Text>
        )}
        renderItem={({ item }) => <ProductRow product={item} />}
      />
      <BasketBar />
    </View>
  );
}

function Hero({ onShop }: { onShop: () => void }) {
  return (
    <View style={styles.hero}>
      <Text style={styles.heroEyebrow}>NIGERIAN SNACKS · MADE FOR SHARING</Text>
      <Text style={styles.heroTitle} accessibilityRole="header">
        Bringing back <Text style={styles.heroAccent}>memories,</Text> one bite at a time.
      </Text>
      <Text style={styles.heroBody}>
        Chin chin, plantain chips, coconut candy and the rest of the party tray — for pickup, or delivered across the UK.
      </Text>
      <Pressable
        onPress={onShop}
        accessibilityRole="button"
        accessibilityHint="Scrolls down to the products"
        style={({ pressed }) => [styles.heroButton, pressed && { opacity: 0.8 }]}
      >
        <Text style={styles.heroButtonText}>Shop the snacks  ↓</Text>
      </Pressable>
    </View>
  );
}

function Story() {
  return (
    <View style={styles.story}>
      <Text style={[styles.eyebrow, { color: colors.plantain }]}>OUR STORY</Text>
      <Text style={[styles.title, { color: colors.oat }]} accessibilityRole="header">
        Made for <Text style={{ fontStyle: 'italic' }}>sharing.</Text>
      </Text>
      <Text style={styles.quote}>“Every snack here comes with a memory attached — a party, a journey, a person.”</Text>
      <Text style={styles.storyBody}>
        For many of us, Nigerian snacks were never just snacks. They were the bowl passed around at a party, the paper bag
        bought on the way home, the treat an aunty pressed into your hand.
      </Text>
      <Text style={styles.storyBody}>
        Igbadun Bites brings those flavours together in one place — for the moments you want to share them again, wherever
        you are now.
      </Text>
      <Text style={styles.storyNote}>Our founder’s story is coming soon.</Text>
    </View>
  );
}

function ProductRow({ product }: { product: Product }) {
  return (
    <View style={[styles.row, { backgroundColor: tintFor(product.category) }]}>
      <Pressable
        onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })}
        accessibilityRole="button"
        accessibilityLabel={`${product.name}, ${formatPence(pricePence(product))}, ${product.pack_size}. Details and allergens`}
        style={({ pressed }) => [styles.rowMain, pressed && { opacity: 0.7 }]}
      >
        <Text style={[styles.name, !product.available && styles.muted]}>{product.name}</Text>
        <Text style={styles.meta}>
          {formatPence(pricePence(product))} · {product.pack_size}
        </Text>
        <Text style={styles.details}>Details & allergens</Text>
      </Pressable>
      <AddControl product={product} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.oat },
  intro: { paddingHorizontal: 20, paddingTop: 32, paddingBottom: 8 },
  hero: { marginHorizontal: 16, marginTop: 8, paddingHorizontal: 20, paddingTop: 28, paddingBottom: 28, borderRadius: 14, backgroundColor: colors.cocoa },
  heroEyebrow: { fontSize: 11, letterSpacing: 2.5, fontWeight: '600', color: 'rgba(242,233,218,0.8)' },
  heroTitle: { marginTop: 14, fontSize: 38, lineHeight: 42, fontFamily: serif, color: colors.oat },
  heroAccent: { fontStyle: 'italic', color: colors.plantain },
  heroBody: { marginTop: 16, fontSize: 16, lineHeight: 23, color: 'rgba(242,233,218,0.85)' },
  heroButton: { marginTop: 24, alignSelf: 'flex-start', minHeight: 50, paddingHorizontal: 24, borderRadius: 999, backgroundColor: colors.plantain, justifyContent: 'center' },
  heroButtonText: { color: colors.cocoa, fontSize: 16, fontWeight: '600' },
  manifesto: { fontSize: 24, lineHeight: 32, fontFamily: serif, fontStyle: 'italic', color: colors.cocoa },
  story: { marginTop: 36, paddingHorizontal: 24, paddingVertical: 36, backgroundColor: colors.cocoa },
  quote: { marginTop: 22, paddingLeft: 16, borderLeftWidth: 1, borderLeftColor: 'rgba(217,162,62,0.6)', fontSize: 20, lineHeight: 28, fontFamily: serif, fontStyle: 'italic', color: 'rgba(242,233,218,0.95)' },
  storyBody: { marginTop: 16, fontSize: 16, lineHeight: 24, color: 'rgba(242,233,218,0.8)' },
  storyNote: { marginTop: 22, fontSize: 13, color: 'rgba(242,233,218,0.6)' },
  eyebrow: { fontSize: 12, letterSpacing: 2.5, fontWeight: '600', color: colors.cocoaSoft },
  title: { marginTop: 10, fontSize: 40, lineHeight: 44, fontFamily: serif, color: colors.cocoa },
  titleAccent: { fontStyle: 'italic', color: colors.terracotta },
  error: { marginTop: 16, color: colors.terracotta, fontSize: 15 },
  section: { marginTop: 28, marginBottom: 10, paddingHorizontal: 20, fontSize: 24, fontFamily: serif, color: colors.cocoa },
  row: {
    marginHorizontal: 16,
    marginBottom: 10,
    paddingLeft: 18,
    paddingRight: 12,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowMain: { flex: 1, minHeight: MIN_TOUCH, justifyContent: 'center' },
  name: { fontSize: 20, fontFamily: serif, color: colors.cocoa },
  muted: { color: colors.cocoaSoft },
  meta: { marginTop: 4, fontSize: 14, color: colors.cocoaSoft },
  details: { marginTop: 6, fontSize: 13, color: colors.cocoaSoft, textDecorationLine: 'underline' },
});
