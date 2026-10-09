import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { signInWithGoogle } from '../lib/auth';
import { cart, MAX_QUANTITY, useCart } from '../lib/cart';
import { isComingSoon, type Product } from '../lib/products';
import { useSession } from '../lib/session';
import { colors, fonts, MIN_TOUCH } from '../lib/theme';

type Size = 'md' | 'lg';

// − qty + for one basket line (≥ 44 pt targets, screen-reader labels)
export function QuantityStepper({ product, quantity, size = 'md' }: { product: Product; quantity: number; size?: Size }) {
  const h = size === 'lg' ? 56 : MIN_TOUCH;
  return (
    // Each button carries its own label; the container isn't one "adjustable" control so
    // VoiceOver/TalkBack can reach − and + separately
    <View style={[styles.stepper, { height: h }]}>
      <Pressable
        onPress={() => cart.setQuantity(product, quantity - 1)}
        accessibilityRole="button"
        accessibilityLabel={quantity === 1 ? `Remove ${product.name} from basket` : `One fewer ${product.name}`}
        style={({ pressed }) => [styles.stepButton, { width: h, height: h }, pressed && styles.pressed]}
      >
        <Text style={styles.stepText}>−</Text>
      </Pressable>
      <Text style={styles.qty} importantForAccessibility="no" accessibilityElementsHidden>
        {quantity}
      </Text>
      <Pressable
        onPress={() => cart.setQuantity(product, quantity + 1)}
        disabled={quantity >= MAX_QUANTITY}
        accessibilityRole="button"
        accessibilityState={{ disabled: quantity >= MAX_QUANTITY }}
        accessibilityLabel={quantity >= MAX_QUANTITY ? `Maximum of ${MAX_QUANTITY} ${product.name}` : `One more ${product.name}`}
        style={({ pressed }) => [styles.stepButton, { width: h, height: h }, pressed && styles.pressed, quantity >= MAX_QUANTITY && styles.disabled]}
      >
        <Text style={styles.stepText}>+</Text>
      </Pressable>
    </View>
  );
}

// Add → stepper once in the basket. Signed out: Add opens Google sign-in, then adds.
export function AddControl({ product, size = 'md' }: { product: Product; size?: Size }) {
  const { session } = useSession();
  const { items, loaded } = useCart();
  const [busy, setBusy] = useState(false);
  const quantity = items.find((i) => i.productId === product.id)?.quantity ?? 0;
  const h = size === 'lg' ? 56 : MIN_TOUCH; // the website's h-11 / h-14

  // Coming soon (announced, not yet for sale) or sold out: a label, never an Add button
  if (isComingSoon(product) || !product.available) {
    return (
      <View style={[styles.soldOut, { height: h }]}>
        <Text style={styles.soldOutText}>{isComingSoon(product) ? 'Coming soon' : 'Sold out'}</Text>
      </View>
    );
  }
  if (session && loaded && quantity > 0) return <QuantityStepper product={product} quantity={quantity} size={size} />;

  async function onAdd() {
    setBusy(true);
    if (!session) {
      const result = await signInWithGoogle();
      if (!result.ok) {
        setBusy(false);
        return;
      }
    }
    await cart.addOne(product);
    setBusy(false);
  }

  return (
    <Pressable
      onPress={onAdd}
      disabled={busy}
      accessibilityRole="button"
      accessibilityLabel={session ? `Add ${product.name} to basket` : `Sign in to add ${product.name} to basket`}
      style={({ pressed }) => [
        size === 'lg' ? styles.addLg : styles.add,
        { height: h },
        (pressed || busy) && styles.pressed,
      ]}
    >
      {busy ? (
        <ActivityIndicator color={size === 'lg' ? colors.oat : colors.cocoa} />
      ) : (
        <Text style={size === 'lg' ? styles.addLgText : styles.addText}>{size === 'lg' ? 'Add to basket  +' : 'Add  +'}</Text>
      )}
    </Pressable>
  );
}

// Header button: "Basket" + count
export function BasketButton() {
  const { count } = useCart();
  return (
    <Pressable
      onPress={() => router.navigate('/basket')}
      accessibilityRole="button"
      accessibilityLabel={`Open basket, ${count} ${count === 1 ? 'item' : 'items'}`}
      hitSlop={8}
      style={({ pressed }) => [styles.basketButton, pressed && styles.pressed]}
    >
      <Text style={styles.basketButtonText}>Basket</Text>
      <View style={[styles.badge, count > 0 && styles.badgeOn]}>
        <Text style={[styles.badgeText, count > 0 && styles.badgeTextOn]}>{count}</Text>
      </View>
    </Pressable>
  );
}

// Bar at the bottom of the Shop tab (above the tab bar) once the basket has items
export function BasketBar() {
  const { count, subtotal } = useCart();
  if (count === 0) return null;
  return (
    <View style={[styles.barWrap, { paddingBottom: 12 }]}>
      <Pressable
        onPress={() => router.navigate('/basket')}
        accessibilityRole="button"
        accessibilityLabel={`Open basket: ${count} ${count === 1 ? 'item' : 'items'}, ${subtotal}`}
        style={({ pressed }) => [styles.bar, pressed && styles.pressed]}
      >
        <View style={styles.barLeft}>
          <Text style={styles.barText}>Basket</Text>
          <View style={[styles.badge, styles.badgeOn]}>
            <Text style={[styles.badgeText, styles.badgeTextOn]}>{count}</Text>
          </View>
        </View>
        <View style={styles.barLeft}>
          <Text style={styles.barTotal}>{subtotal}</Text>
          <View style={styles.barView}>
            <Text style={styles.barViewText}>View</Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.35 },
  stepper: { flexDirection: 'row', alignItems: 'center', borderRadius: 999, backgroundColor: colors.cocoa },
  stepButton: { alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  stepText: { color: colors.oat, fontSize: 18, fontFamily: fonts.sans },
  qty: { minWidth: 28, textAlign: 'center', color: colors.oat, fontSize: 16, fontFamily: fonts.sansSemiBold, fontVariant: ['tabular-nums'] },
  add: {
    minWidth: 84,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(43,26,18,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: { color: colors.cocoa, fontSize: 14, fontFamily: fonts.sansMedium },
  addLg: { minWidth: 180, paddingHorizontal: 32, borderRadius: 999, backgroundColor: colors.cocoa, alignItems: 'center', justifyContent: 'center' },
  addLgText: { color: colors.oat, fontSize: 16, fontFamily: fonts.sansMedium },
  soldOut: { paddingHorizontal: 16, borderRadius: 999, borderWidth: 1, borderColor: colors.hairline, justifyContent: 'center' },
  soldOutText: { color: colors.cocoaSoft, fontSize: 14, fontFamily: fonts.sansMedium },
  basketButton: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: MIN_TOUCH, paddingLeft: 14, paddingRight: 6, borderRadius: 999, backgroundColor: colors.cocoa },
  basketButtonText: { color: colors.oat, fontSize: 14, fontFamily: fonts.sansMedium },
  badge: { minWidth: 24, height: 24, paddingHorizontal: 6, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(242,233,218,0.15)' },
  badgeOn: { backgroundColor: colors.plantain },
  badgeText: { color: colors.oat, fontSize: 12, fontFamily: fonts.sansSemiBold },
  badgeTextOn: { color: colors.cocoa },
  barWrap: { position: 'absolute', left: 12, right: 12, bottom: 0 },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingLeft: 20,
    paddingRight: 8,
    borderRadius: 999,
    backgroundColor: colors.cocoa,
    shadowColor: '#2b1a12',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  barLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barText: { color: colors.oat, fontSize: 15, fontFamily: fonts.sansSemiBold },
  barTotal: { color: colors.oat, fontSize: 17, fontFamily: fonts.sansSemiBold },
  barView: { height: 40, paddingHorizontal: 16, borderRadius: 999, backgroundColor: colors.oat, justifyContent: 'center' },
  barViewText: { color: colors.cocoa, fontSize: 14, fontFamily: fonts.sansBold },
});
