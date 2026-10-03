import { Stack, useLocalSearchParams } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddControl, BasketButton } from '../../components/cart-controls';
import { detailText, formatPence, isConfirmed, pricePence, useProducts } from '../../lib/products';
import { colors, MIN_TOUCH, serif, tintFor } from '../../lib/theme';

const WHATSAPP = 'https://wa.me/447709870134'; // same as the website (lib/contact.ts)

// Product detail: description, ingredients, allergens, storage, pack size + add control.
// Same honesty rules as the website's detail panel: researched information is labelled
// until the owner confirms it, and placeholder text is never shown as fact.
export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { products, loading } = useProducts();
  const insets = useSafeAreaInsets();
  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <View style={styles.center}>
        <Text style={styles.body}>{loading ? 'Loading…' : "We couldn't find that snack."}</Text>
      </View>
    );
  }

  const ingredients = detailText(product.ingredients);
  const allergens = detailText(product.allergens);
  const storage = detailText(product.storage_guidance);
  const researched = !isConfirmed(product) && !!(ingredients || allergens || storage);
  const pending = 'Not yet confirmed — we’re checking this with our supplier.';

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: '', headerRight: () => <BasketButton /> }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}>
        <View style={[styles.hero, { backgroundColor: tintFor(product.category) }]}>
          <Text style={styles.eyebrow}>{product.category.toUpperCase()}</Text>
          <Text style={styles.name} accessibilityRole="header">
            {product.name}
          </Text>
          <Text style={styles.price}>
            {formatPence(pricePence(product))} <Text style={styles.pack}>· {product.pack_size}</Text>
          </Text>
        </View>

        <View style={styles.content}>
          {!!product.description && <Text style={styles.description}>{product.description}</Text>}

          {researched && (
            <View style={styles.notice}>
              <Text style={styles.noticeText}>
                <Text style={styles.strong}>Typical recipe — not yet confirmed by our supplier. </Text>
                We researched how this snack is usually made. Recipes and frying oils vary, so our own product may differ, and
                traces of other allergens (especially peanuts) are possible. Please don’t rely on this if you have an allergy.
              </Text>
            </View>
          )}

          <Detail label="INGREDIENTS" value={ingredients ?? pending} italic={!ingredients} />
          <Detail label="ALLERGENS" value={allergens ?? pending} italic={!allergens} strong={!!allergens} accent />
          <Detail label="STORAGE" value={storage ?? pending} italic={!storage} />
          <Detail label="PACK SIZE" value={product.pack_size} />

          <View style={styles.allergyLine}>
            <Text style={styles.allergyText}>
              <Text style={styles.strong}>Allergies or dietary needs? </Text>
              Please message us on WhatsApp before ordering and we’ll check the details for you.
            </Text>
            <Pressable
              onPress={() => Linking.openURL(WHATSAPP)}
              accessibilityRole="link"
              accessibilityLabel="Message us on WhatsApp (opens WhatsApp)"
              style={({ pressed }) => [styles.whatsapp, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.whatsappText}>Message us on WhatsApp</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Add control within thumb reach */}
      <View style={[styles.footer, { paddingBottom: Math.max(16, insets.bottom) }]}>
        <AddControl product={product} size="lg" />
      </View>
    </View>
  );
}

function Detail({ label, value, italic, strong, accent }: { label: string; value: string; italic?: boolean; strong?: boolean; accent?: boolean }) {
  return (
    <View style={styles.detail}>
      <Text style={[styles.detailLabel, accent && { color: colors.terracotta }]}>{label}</Text>
      <Text style={[styles.detailValue, italic && styles.italic, strong && styles.strongValue]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.oat },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.oat },
  hero: { marginHorizontal: 16, marginTop: 4, padding: 20, borderRadius: 14 },
  eyebrow: { fontSize: 12, letterSpacing: 2, fontWeight: '600', color: colors.cocoaSoft },
  name: { marginTop: 10, fontSize: 36, lineHeight: 40, fontFamily: serif, color: colors.cocoa },
  price: { marginTop: 12, fontSize: 22, fontFamily: serif, color: colors.cocoa },
  pack: { fontSize: 15, color: colors.cocoaSoft },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  description: { fontSize: 18, lineHeight: 26, color: colors.cocoaSoft },
  body: { fontSize: 16, color: colors.cocoaSoft },
  notice: { marginTop: 20, padding: 14, borderRadius: 10, backgroundColor: colors.oatDeep },
  noticeText: { fontSize: 14, lineHeight: 20, color: colors.cocoa },
  strong: { fontWeight: '700' },
  detail: { paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.hairline },
  detailLabel: { fontSize: 12, letterSpacing: 2, fontWeight: '600', color: colors.cocoa },
  detailValue: { marginTop: 6, fontSize: 16, lineHeight: 23, color: colors.cocoaSoft },
  strongValue: { fontWeight: '700', color: colors.cocoa },
  italic: { fontStyle: 'italic' },
  allergyLine: { marginTop: 20, paddingLeft: 14, borderLeftWidth: 2, borderLeftColor: colors.terracotta },
  allergyText: { fontSize: 15, lineHeight: 22, color: colors.cocoa },
  whatsapp: { marginTop: 8, minHeight: MIN_TOUCH, justifyContent: 'center', alignSelf: 'flex-start' },
  whatsappText: { fontSize: 15, fontWeight: '600', color: colors.cocoa, textDecorationLine: 'underline' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 12,
    paddingHorizontal: 20,
    backgroundColor: colors.oatDeep,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
    alignItems: 'flex-start',
  },
});
