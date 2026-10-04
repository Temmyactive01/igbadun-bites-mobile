import { useNavigation } from 'expo-router';
import { FlatList, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { QuantityStepper } from '../../components/cart-controls';
import { cart, useCart, type CartItem } from '../../lib/cart';
import { formatPence, useProducts, type Product } from '../../lib/products';
import { useSession } from '../../lib/session';
import { colors, MIN_TOUCH, serif, tintFor } from '../../lib/theme';

// No mobile checkout yet (approved decision c): hand over to the website, where the same
// account already has the same basket.
const WEB_CHECKOUT = 'https://igbadun-bites.netlify.app/checkout';

export default function Basket() {
  const navigation = useNavigation();
  const { session } = useSession();
  const { items, loaded, subtotal } = useCart();
  const { products } = useProducts();

  // Basket lines carry name/price; the stepper needs the full product
  const productFor = (item: CartItem): Product =>
    products.find((p) => p.id === item.productId) ?? {
      id: item.productId,
      name: item.name,
      category: item.category,
      description: '',
      pack_size: item.packSize,
      price_gbp: item.pricePence / 100,
      ingredients: '',
      allergens: '',
      storage_guidance: '',
      available: true,
    };

  if (!session || (loaded && items.length === 0)) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Your basket is empty.</Text>
        <Text style={styles.emptyBody}>
          {session ? 'The chin chin won’t eat itself — pick a few favourites from the shop.' : 'Sign in when you add your first snack — your basket is shared with the website.'}
        </Text>
        <Pressable onPress={() => navigation.navigate('index' as never)} accessibilityRole="button" style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}>
          <Text style={styles.secondaryText}>Browse the snacks</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={items}
        keyExtractor={(i) => i.productId}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 220 }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => {
          const product = productFor(item);
          return (
            <View style={styles.line}>
              <View style={[styles.thumb, { backgroundColor: tintFor(item.category) }]} />
              <View style={{ flex: 1 }}>
                <View style={styles.lineTop}>
                  <Text style={styles.lineName}>{item.name}</Text>
                  <Text style={styles.lineTotal}>{formatPence(item.pricePence * item.quantity)}</Text>
                </View>
                <Text style={styles.lineMeta}>
                  {item.packSize} · {formatPence(item.pricePence)} each
                </Text>
                <View style={styles.lineActions}>
                  <QuantityStepper product={product} quantity={item.quantity} />
                  <Pressable
                    onPress={() => cart.setQuantity(product, 0)}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${item.name}`}
                    hitSlop={8}
                    style={styles.remove}
                  >
                    <Text style={styles.removeText}>Remove</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          );
        }}
      />

      <View style={[styles.footer, { paddingBottom: 16 }]}>
        <View style={styles.subtotalRow}>
          <Text style={styles.subtotalLabel}>SUBTOTAL</Text>
          <Text style={styles.subtotal}>{subtotal}</Text>
        </View>
        <Text style={styles.note}>
          Checkout opens on the website. Sign in there with the same Google account — your basket is already waiting.
        </Text>
        <Pressable
          onPress={() => Linking.openURL(WEB_CHECKOUT)}
          accessibilityRole="link"
          accessibilityLabel="Check out on the website (opens your browser)"
          style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
        >
          <Text style={styles.primaryText}>Check out on the website →</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.oat },
  pressed: { opacity: 0.75 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, backgroundColor: colors.oat },
  emptyTitle: { fontSize: 24, fontFamily: serif, color: colors.cocoa },
  emptyBody: { marginTop: 10, fontSize: 16, lineHeight: 22, textAlign: 'center', color: colors.cocoaSoft },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: colors.hairline },
  line: { flexDirection: 'row', gap: 14, paddingVertical: 16 },
  thumb: { width: 64, height: 64, borderRadius: 8 },
  lineTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  lineName: { flex: 1, fontSize: 18, fontFamily: serif, color: colors.cocoa },
  lineTotal: { fontSize: 16, fontWeight: '600', color: colors.cocoa },
  lineMeta: { marginTop: 2, fontSize: 14, color: colors.cocoaSoft },
  lineActions: { marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  remove: { minHeight: MIN_TOUCH, justifyContent: 'center' },
  removeText: { fontSize: 14, color: colors.cocoaSoft, textDecorationLine: 'underline' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.oatDeep,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
  },
  subtotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  subtotalLabel: { fontSize: 12, letterSpacing: 2, fontWeight: '600', color: colors.cocoa },
  subtotal: { fontSize: 24, fontFamily: serif, color: colors.cocoa },
  note: { marginTop: 6, fontSize: 13, lineHeight: 18, color: colors.cocoaSoft },
  primary: { marginTop: 14, height: 54, borderRadius: 999, backgroundColor: colors.cocoa, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: colors.oat, fontSize: 16, fontWeight: '600' },
  secondary: { marginTop: 24, minHeight: 48, paddingHorizontal: 24, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(43,26,18,0.3)', justifyContent: 'center' },
  secondaryText: { color: colors.cocoa, fontSize: 15, fontWeight: '500' },
});
