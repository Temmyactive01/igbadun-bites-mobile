import { router, Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native';
import { AddControl, BasketBar, BasketButton } from '../components/cart-controls';
import { useCart } from '../lib/cart';
import { formatPence, groupByCategory, loadProducts, pricePence, useProducts, type Product } from '../lib/products';
import { colors, MIN_TOUCH, serif, tintFor } from '../lib/theme';

// Shop: every product, grouped by category in the web's order. Browsing works signed
// out; adding asks for sign-in (approved decision a). Tiles are type on a category
// colour — no photos yet (decision b).
export default function Shop() {
  const { products, loading, error } = useProducts();
  const { count } = useCart();
  const [refreshing, setRefreshing] = useState(false);
  const sections = useMemo(() => groupByCategory(products), [products]);

  async function onRefresh() {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  }

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Pressable onPress={() => router.push('/account')} accessibilityRole="button" accessibilityLabel="Account" hitSlop={8} style={styles.headerLink}>
              <Text style={styles.headerLinkText}>Account</Text>
            </Pressable>
          ),
          headerRight: () => <BasketButton />,
        }}
      />
      {loading && products.length === 0 ? (
        <ActivityIndicator color={colors.cocoa} style={{ marginTop: 48 }} />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(p) => p.id}
          stickySectionHeadersEnabled={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.cocoa} />}
          contentContainerStyle={{ paddingBottom: count > 0 ? 112 : 32 }}
          ListHeaderComponent={
            <View style={styles.intro}>
              <Text style={styles.eyebrow}>THE SHOP</Text>
              <Text style={styles.title}>
                A taste of <Text style={styles.titleAccent}>home.</Text>
              </Text>
              {error && <Text style={styles.error}>{error}</Text>}
            </View>
          }
          renderSectionHeader={({ section }) => (
            <Text style={styles.section} accessibilityRole="header">
              {section.category}
            </Text>
          )}
          renderItem={({ item }) => <ProductRow product={item} />}
        />
      )}
      <BasketBar />
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
  headerLink: { minHeight: MIN_TOUCH, justifyContent: 'center', paddingRight: 8 },
  headerLinkText: { color: colors.cocoa, fontSize: 15, fontWeight: '500' },
  intro: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
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
