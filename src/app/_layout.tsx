import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { startCartSync } from '../lib/cart';
import { colors, serif } from '../lib/theme';

// App navigation: bottom tabs (Shop, Orders, Basket, Account — see (tabs)/_layout.tsx),
// with Product detail opening on top of them.
export default function RootLayout() {
  // The shared basket follows sign-in / sign-out for the whole app
  useEffect(() => startCartSync(), []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.oat },
          headerTintColor: colors.cocoa,
          headerTitleStyle: { fontFamily: serif, fontWeight: '400', color: colors.cocoa },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.oat },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Shop' }} />
        <Stack.Screen name="product/[id]" options={{ title: '' }} />
      </Stack>
    </>
  );
}
