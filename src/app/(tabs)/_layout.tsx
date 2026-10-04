import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';
import { useCart } from '../../lib/cart';
import { colors, fonts, serif } from '../../lib/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

type TabIconProps = { filled: IconName; outline: IconName; color: ColorValue; focused: boolean; size: number };

// Filled icon for the selected tab, outline for the rest
function TabIcon({ filled, outline, color, focused, size }: TabIconProps) {
  return <Ionicons name={focused ? filled : outline} size={size} color={color} />;
}

// Bottom tab bar: Shop, Orders, Basket (with item count), Account — the same structure
// as the website's nav (Shop, Our story, My orders, Sign in/out).
export default function TabsLayout() {
  // Same count as everywhere else in the app (lib/cart.ts) — updates live with the basket
  const { count } = useCart();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.terracotta,
        tabBarInactiveTintColor: colors.cocoaSoft,
        tabBarStyle: { backgroundColor: colors.oat, borderTopColor: colors.hairline },
        tabBarLabelStyle: { fontFamily: fonts.sansSemiBold, fontSize: 12 },
        headerStyle: { backgroundColor: colors.oat },
        headerTintColor: colors.cocoa,
        headerTitleStyle: { fontFamily: serif, fontWeight: '400', color: colors.cocoa },
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: colors.oat },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Shop', headerShown: false, tabBarIcon: (p) => <TabIcon filled="storefront" outline="storefront-outline" {...p} /> }} />
      <Tabs.Screen name="orders" options={{ title: 'Orders', headerTitle: 'My orders', tabBarIcon: (p) => <TabIcon filled="receipt" outline="receipt-outline" {...p} /> }} />
      <Tabs.Screen
        name="basket"
        options={{
          title: 'Basket',
          headerTitle: 'Your basket',
          tabBarIcon: (p) => <TabIcon filled="basket" outline="basket-outline" {...p} />,
          tabBarBadge: count > 0 ? count : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.plantain, color: colors.cocoa, fontWeight: '700' },
          tabBarAccessibilityLabel: `Basket, ${count} ${count === 1 ? 'item' : 'items'}`,
        }}
      />
      <Tabs.Screen name="account" options={{ title: 'Account', tabBarIcon: (p) => <TabIcon filled="person-circle" outline="person-circle-outline" {...p} /> }} />
    </Tabs>
  );
}
