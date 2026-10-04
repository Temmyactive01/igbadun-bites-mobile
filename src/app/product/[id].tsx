import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Linking, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddControl } from '../../components/cart-controls';
import { ProductVisual } from '../../components/product-visual';
import { detailText, formatPence, isConfirmed, pricePence, useProducts, type Product } from '../../lib/products';
import { CONTACT, productImageKey, SITE_URL } from '../../lib/site-content';
import { colors, fonts, tintFor, type } from '../../lib/theme';

const cocoaA = (a: number) => `rgba(43,26,18,${a})`;

// Product details, as the website's detail panel (components/shop/ProductSheet.tsx): a bottom
// sheet over the shop with the category, "Copy link" and close; picture, name and price;
// description; the researched-recipe notice; ingredients, allergens, storage and pack size;
// the allergy line; and the add control in a bar at the bottom.
// Same honesty rules as the website: researched information is labelled until the owner
// confirms it, and placeholder text is never shown as fact.
export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { products, loading } = useProducts();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const product = products.find((p) => p.id === id);

  // Slides up from the bottom like the website's sheet (instantly with Reduce Motion on)
  const [slide] = useState(() => new Animated.Value(height));
  const [fade] = useState(() => new Animated.Value(0));
  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) return;
      if (reduce) {
        slide.setValue(0);
        fade.setValue(1);
        return;
      }
      Animated.parallel([
        Animated.timing(slide, { toValue: 0, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    });
    return () => {
      cancelled = true;
    };
  }, [slide, fade]);

  function close() {
    Animated.parallel([
      Animated.timing(slide, { toValue: height, duration: 220, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      Animated.timing(fade, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => (router.canGoBack() ? router.back() : navigation.navigate('(tabs)' as never)));
  }

  return (
    <View style={styles.root}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: fade }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityRole="button" accessibilityLabel="Close product details" />
      </Animated.View>

      <Animated.View style={[styles.sheet, { maxHeight: height * 0.9, transform: [{ translateY: slide }] }]} accessibilityViewIsModal>
        {product ? (
          <Sheet product={product} bottomInset={insets.bottom} onClose={close} />
        ) : (
          <View style={[styles.empty, { paddingBottom: Math.max(24, insets.bottom) }]}>
            <Text style={[type.body, styles.soft]}>{loading ? 'Loading…' : 'We couldn’t find that snack.'}</Text>
            <CloseButton onPress={close} />
          </View>
        )}
      </Animated.View>
    </View>
  );
}

function Sheet({ product, bottomInset, onClose }: { product: Product; bottomInset: number; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const ingredients = detailText(product.ingredients);
  const allergens = detailText(product.allergens);
  const storage = detailText(product.storage_guidance);
  const researched = !isConfirmed(product) && !!(ingredients || allergens || storage);

  // The same link the website copies: it opens this product's panel on the website
  async function copyLink() {
    await Clipboard.setStringAsync(`${SITE_URL}/#product/${productImageKey(product.name)}`);
    setCopied(true);
    AccessibilityInfo.announceForAccessibility(`Link to ${product.name} copied`);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <View style={styles.header}>
        <Text style={[type.eyebrow, styles.soft, styles.headerTitle]} numberOfLines={1}>
          {product.category}
        </Text>
        <View style={styles.headerActions}>
          <Pressable onPress={copyLink} accessibilityRole="button" style={({ pressed }) => [styles.copy, pressed && styles.pressed]}>
            <Text style={styles.copyText}>{copied ? 'Link copied ✓' : 'Copy link'}</Text>
          </Pressable>
          <CloseButton onPress={onClose} />
        </View>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <View style={styles.top}>
          <View style={styles.thumb}>
            <ProductVisual product={product} tint={tintFor(product.category)} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name} accessibilityRole="header">
              {product.name}
            </Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>{formatPence(pricePence(product))}</Text>
              <Text style={[type.small, styles.soft]}>{product.pack_size}</Text>
            </View>
          </View>
        </View>

        {!!product.description && <Text style={[type.bodyL, styles.soft, { marginTop: 24 }]}>{product.description}</Text>}

        {researched && (
          <View style={styles.notice}>
            <Text style={[type.small, styles.ink]}>
              <Text style={styles.strong}>Typical recipe — not yet confirmed by our supplier.</Text> We researched how this snack is usually
              made. Recipes and frying oils vary, so our own product may differ, and traces of other allergens (especially peanuts) are
              possible. Please don’t rely on this if you have an allergy.
            </Text>
          </View>
        )}

        <View style={[styles.details, { marginTop: researched ? 24 : 32 }]}>
          <Detail label="Ingredients" value={ingredients} />
          <Detail label="Allergens" value={allergens} accent />
          <Detail label="Storage" value={storage} />
          <Detail label="Pack size" value={product.pack_size} last />
        </View>

        <View style={styles.allergy}>
          <Text style={[type.small, styles.ink]}>
            <Text style={styles.strong}>Allergies or dietary needs?</Text> Please{' '}
            <Text onPress={() => Linking.openURL(CONTACT.whatsappHref)} accessibilityRole="link" style={styles.link}>
              message us on WhatsApp
            </Text>{' '}
            before ordering and we’ll check the details for you.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(16, bottomInset) }]}>
        <AddControl product={product} size="lg" />
      </View>
    </>
  );
}

// Ingredients / allergens / storage / pack size row. A missing value says so plainly.
function Detail({ label, value, accent = false, last = false }: { label: string; value: string | null; accent?: boolean; last?: boolean }) {
  return (
    <View style={[styles.detail, !last && styles.detailDivider]}>
      <Text style={[type.eyebrow, { color: accent ? colors.terracotta : colors.cocoa }]}>{label}</Text>
      {value ? (
        <Text style={[type.body, accent ? styles.allergens : styles.soft, styles.detailValue]}>{value}</Text>
      ) : (
        <Text style={[type.body, styles.soft, styles.pending, styles.detailValue]}>Not yet confirmed — we’re checking this with our supplier.</Text>
      )}
    </View>
  );
}

function CloseButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Close product details" style={({ pressed }) => [styles.close, pressed && styles.closePressed]}>
      {({ pressed }) => <Text style={[styles.closeText, pressed && { color: colors.oat }]}>✕</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { backgroundColor: cocoaA(0.4) },
  sheet: { backgroundColor: colors.oat, borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: 'hidden' },
  empty: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16 },
  pressed: { opacity: 0.7 },
  ink: { color: colors.cocoa },
  soft: { color: colors.cocoaSoft },
  strong: { fontFamily: fonts.sansSemiBold },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: cocoaA(0.1) },
  headerTitle: { flexShrink: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  copy: { height: 44, paddingHorizontal: 12, justifyContent: 'center', borderRadius: 999 },
  copyText: { fontFamily: fonts.sansMedium, fontSize: 14, lineHeight: 20, color: colors.cocoaSoft, textDecorationLine: 'underline', textDecorationColor: cocoaA(0.25) },
  close: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: cocoaA(0.2), alignItems: 'center', justifyContent: 'center' },
  closePressed: { backgroundColor: colors.cocoa, borderColor: colors.cocoa },
  closeText: { fontSize: 18, lineHeight: 22, color: colors.cocoa },

  body: { flexGrow: 0, flexShrink: 1 },
  bodyContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32 },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: 20 },
  thumb: { width: 112 }, // the website's grid-cols-[7rem_1fr]
  name: { fontFamily: fonts.serif, fontSize: 28, lineHeight: 30, letterSpacing: -0.56, color: colors.cocoa },
  priceRow: { marginTop: 12, flexDirection: 'row', alignItems: 'baseline', gap: 12 },
  price: { fontFamily: fonts.heading, fontSize: 24, lineHeight: 32, color: colors.cocoa, fontVariant: ['tabular-nums'] },

  notice: { marginTop: 32, borderRadius: 8, backgroundColor: colors.oatDeep, paddingHorizontal: 16, paddingVertical: 12 },
  details: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: cocoaA(0.1) },
  detail: { paddingVertical: 16 },
  detailDivider: { borderBottomWidth: 1, borderBottomColor: cocoaA(0.1) },
  detailValue: { marginTop: 8 },
  allergens: { fontFamily: fonts.sansSemiBold, color: colors.cocoa },
  pending: { fontFamily: fonts.sansItalic },
  allergy: { marginTop: 24, borderLeftWidth: 2, borderLeftColor: colors.terracotta, paddingLeft: 16 },
  link: { fontFamily: fonts.sansMedium, textDecorationLine: 'underline', textDecorationColor: 'rgba(168,74,36,0.6)' },

  footer: { paddingHorizontal: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: cocoaA(0.1), backgroundColor: 'rgba(232,219,197,0.6)', alignItems: 'flex-start' },
});
