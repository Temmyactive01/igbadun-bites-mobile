// One import per weight, so only these four font files are bundled
import { InstrumentSans_400Regular } from '@expo-google-fonts/instrument-sans/400Regular';
import { InstrumentSans_500Medium } from '@expo-google-fonts/instrument-sans/500Medium';
import { InstrumentSans_600SemiBold } from '@expo-google-fonts/instrument-sans/600SemiBold';
import { InstrumentSans_700Bold } from '@expo-google-fonts/instrument-sans/700Bold';
import { useFonts } from 'expo-font';
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

  // The website's typefaces (see lib/theme.ts → fonts). Render once they're ready — or
  // straight away with system fonts if loading fails, so the app never sticks on a blank screen.
  const [fontsLoaded, fontError] = useFonts({
    'FrauncesDisplay-Light': require('../../assets/fonts/Fraunces-Display-Light.ttf'),
    'FrauncesDisplay-LightItalic': require('../../assets/fonts/Fraunces-Display-LightItalic.ttf'),
    'FrauncesDisplay-Regular': require('../../assets/fonts/Fraunces-Display-Regular.ttf'),
    'FrauncesDisplay-Italic': require('../../assets/fonts/Fraunces-Display-Italic.ttf'),
    'FrauncesText-Regular': require('../../assets/fonts/Fraunces-Text-Regular.ttf'),
    'FrauncesText-Italic': require('../../assets/fonts/Fraunces-Text-Italic.ttf'),
    InstrumentSans_400Regular,
    InstrumentSans_500Medium,
    InstrumentSans_600SemiBold,
    InstrumentSans_700Bold,
  });
  if (!fontsLoaded && !fontError) return null;

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
