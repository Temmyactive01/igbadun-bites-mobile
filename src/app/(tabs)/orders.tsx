import { useFocusEffect, useNavigation } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Linking, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { signInWithGoogle } from '../../lib/auth';
import { fetchMyOrders, orderDate, orderRef, pence, type Order } from '../../lib/order-history';
import { formatPence } from '../../lib/products';
import { useSession } from '../../lib/session';
import { colors, MIN_TOUCH, serif } from '../../lib/theme';

const WHATSAPP = 'https://wa.me/447709870134'; // same as the website (lib/contact.ts)

// My orders — read-only, mirroring the website's /orders page: paid orders, newest first,
// each with its reference, date, Paid + pickup/delivery badges, items and total.
export default function Orders() {
  const { session, loading: sessionLoading } = useSession();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const userId = session?.user.id ?? null;
  // Results are tagged with whose orders they are, so after an account switch the
  // previous person's orders are never shown — not even for a moment
  const [result, setResult] = useState<{ userId: string; orders: Order[]; error: string | null } | null>(null);
  const loaded = !!userId && result?.userId === userId;
  const orders = loaded ? result!.orders : [];
  const error = loaded ? result!.error : null;

  const load = useCallback(async () => {
    if (!userId) return;
    const fetched = await fetchMyOrders(userId);
    setResult({ userId, ...fetched });
  }, [userId]);

  // Fresh every time the tab is opened (e.g. after paying on the website) and after sign-in
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  if (sessionLoading) return <ActivityIndicator color={colors.cocoa} style={{ marginTop: 48 }} />;

  if (!session) {
    return (
      <View style={styles.screen}>
        <Intro />
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Sign in to see your orders</Text>
          <Text style={styles.body}>Use the same Google account you ordered with.</Text>
          <Pressable
            onPress={async () => {
              setSigningIn(true);
              await signInWithGoogle();
              setSigningIn(false);
            }}
            disabled={signingIn}
            accessibilityRole="button"
            style={({ pressed }) => [styles.primary, (pressed || signingIn) && styles.pressed]}
          >
            <Text style={styles.primaryText}>{signingIn ? 'Opening Google…' : 'Continue with Google'}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (!loaded) return <ActivityIndicator color={colors.cocoa} style={{ marginTop: 48 }} />;

  return (
    <FlatList
      style={styles.screen}
      data={error ? [] : orders}
      keyExtractor={(o) => o.id}
      contentContainerStyle={{ paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.cocoa} />}
      ListHeaderComponent={
        <>
          <Intro />
          {!error && orders.length > 0 && (
            <Text style={styles.countLine}>
              {orders.length} {orders.length === 1 ? 'order' : 'orders'} · newest first
            </Text>
          )}
        </>
      }
      ListEmptyComponent={
        error ? (
          <View style={styles.notice} accessibilityRole="alert">
            <Text style={styles.noticeText}>We couldn’t load your orders just now — pull down to try again.</Text>
          </View>
        ) : (
          <View style={styles.block}>
            <Text style={styles.blockTitle}>No orders yet.</Text>
            <Text style={styles.body}>When you place an order, it’ll appear here.</Text>
            <Pressable
              onPress={() => navigation.navigate('index' as never)}
              accessibilityRole="button"
              style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
            >
              <Text style={styles.primaryText}>Browse the snacks</Text>
            </Pressable>
          </View>
        )
      }
      renderItem={({ item }) => <OrderCard order={item} />}
      ListFooterComponent={
        <View style={styles.footer}>
          <Text style={styles.body}>Question about an order?</Text>
          <Pressable onPress={() => Linking.openURL(WHATSAPP)} accessibilityRole="link" accessibilityLabel="Message us on WhatsApp (opens WhatsApp)" style={styles.link}>
            <Text style={styles.linkText}>Message us on WhatsApp</Text>
          </Pressable>
        </View>
      }
    />
  );
}

function Intro() {
  return (
    <View style={styles.intro}>
      <Text style={styles.eyebrow}>MY ORDERS</Text>
      <Text style={styles.title} accessibilityRole="header">
        Your snack <Text style={styles.titleAccent}>history.</Text>
      </Text>
    </View>
  );
}

function OrderCard({ order }: { order: Order }) {
  const delivery = order.fulfilment === 'delivery';
  return (
    <View style={styles.card} accessible={false}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle} accessibilityRole="header">
            Order {orderRef(order.id)}
          </Text>
          <Text style={styles.date}>{orderDate(order)}</Text>
        </View>
        <View style={styles.badges}>
          <View style={styles.paid}>
            <View style={styles.paidDot} />
            <Text style={styles.paidText}>PAID</Text>
          </View>
          <Text style={styles.fulfilment}>{delivery ? 'DELIVERY' : 'PICKUP'}</Text>
        </View>
      </View>

      {order.order_items.map((item, i) => (
        <View key={i} style={styles.line}>
          <View style={{ flex: 1 }}>
            <Text style={styles.lineName}>{item.products?.name ?? 'Snack'}</Text>
            <Text style={styles.lineMeta}>
              {item.quantity} × {formatPence(pence(item.unit_price_gbp))}
              {item.products?.pack_size ? ` · ${item.products.pack_size}` : ''}
            </Text>
          </View>
          <Text style={styles.lineTotal}>{formatPence(pence(item.unit_price_gbp) * item.quantity)}</Text>
        </View>
      ))}

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>{delivery && order.postcode ? `Delivery to ${order.postcode}` : 'Total'}</Text>
        <Text style={styles.total}>{formatPence(pence(order.total_gbp))}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.oat },
  pressed: { opacity: 0.8 },
  intro: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  eyebrow: { fontSize: 12, letterSpacing: 2.5, fontWeight: '600', color: colors.cocoaSoft },
  title: { marginTop: 10, fontSize: 38, lineHeight: 42, fontFamily: serif, color: colors.cocoa },
  titleAccent: { fontStyle: 'italic', color: colors.terracotta },
  countLine: { marginTop: 10, marginBottom: 6, paddingHorizontal: 20, fontSize: 16, color: colors.cocoaSoft },
  block: { marginTop: 24, marginHorizontal: 20, paddingTop: 20, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.hairline },
  blockTitle: { fontSize: 24, fontFamily: serif, color: colors.cocoa },
  body: { marginTop: 8, fontSize: 16, lineHeight: 22, color: colors.cocoaSoft },
  primary: { marginTop: 22, alignSelf: 'flex-start', minHeight: MIN_TOUCH + 4, paddingHorizontal: 24, borderRadius: 999, backgroundColor: colors.cocoa, justifyContent: 'center' },
  primaryText: { color: colors.oat, fontSize: 15, fontWeight: '600' },
  notice: { marginTop: 24, marginHorizontal: 20, paddingVertical: 12, paddingHorizontal: 14, borderLeftWidth: 2, borderLeftColor: colors.terracotta, backgroundColor: 'rgba(168,74,36,0.06)' },
  noticeText: { fontSize: 15, color: colors.cocoa },
  card: { marginTop: 16, marginHorizontal: 16, padding: 18, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.hairline, backgroundColor: colors.offwhite },
  cardTop: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.hairline },
  cardTitle: { fontSize: 22, fontFamily: serif, color: colors.cocoa },
  date: { marginTop: 4, fontSize: 14, color: colors.cocoaSoft },
  badges: { alignItems: 'flex-end', gap: 6 },
  paid: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  paidDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.leaf },
  paidText: { fontSize: 12, letterSpacing: 2, fontWeight: '600', color: colors.leaf },
  fulfilment: { fontSize: 12, letterSpacing: 2, fontWeight: '600', color: colors.cocoaSoft },
  line: { flexDirection: 'row', gap: 12, alignItems: 'center', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.hairline },
  lineName: { fontSize: 17, fontFamily: serif, color: colors.cocoa },
  lineMeta: { marginTop: 2, fontSize: 14, color: colors.cocoaSoft },
  lineTotal: { fontSize: 15, fontWeight: '600', color: colors.cocoa },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 12 },
  totalLabel: { fontSize: 14, color: colors.cocoaSoft },
  total: { fontSize: 22, fontFamily: serif, color: colors.cocoa },
  footer: { marginTop: 28, paddingHorizontal: 20 },
  link: { minHeight: MIN_TOUCH, justifyContent: 'center', alignSelf: 'flex-start' },
  linkText: { fontSize: 15, fontWeight: '600', color: colors.cocoa, textDecorationLine: 'underline' },
});
