import { router, useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, MIN_TOUCH, serif } from '../../lib/theme';

// Home: the website's homepage story in text and colour (no photos yet, same as Shop).
// Copy comes from the website (igbadun-bites/docs/redesign/brand-copy.md) — no invented
// claims; the founder's story is still to come from the owner.
export default function Home() {
  const insets = useSafeAreaInsets();
  const shop = () => router.navigate('/shop');

  // Light status bar over the dark hero while Home is the focused tab; dark elsewhere
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('dark');
    }, [])
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Hero */}
      <View style={[styles.hero, { paddingTop: insets.top + 32 }]}>
        <Text style={styles.wordmark}>
          Igbadun<Text style={{ color: colors.plantain }}>.</Text>
          <Text style={styles.italic}>Bites</Text>
        </Text>
        <Text style={styles.heroEyebrow}>NIGERIAN SNACKS · MADE FOR SHARING</Text>
        <Text style={styles.heroTitle} accessibilityRole="header">
          Bringing back <Text style={styles.heroAccent}>memories,</Text> one bite at a time.
        </Text>
        <Text style={styles.heroBody}>
          Chin chin, plantain chips, coconut candy and the rest of the party tray — for pickup, or delivered across the UK.
        </Text>
        <Pressable
          onPress={shop}
          accessibilityRole="button"
          style={({ pressed }) => [styles.heroButton, pressed && styles.pressed]}
        >
          <Text style={styles.heroButtonText}>Shop the snacks  →</Text>
        </Pressable>
      </View>

      {/* Manifesto */}
      <View style={styles.section}>
        <Text style={styles.manifesto}>
          The taste of Saturday parties, school gates and an auntie’s kitchen — wrapped up and brought back to you.
        </Text>
      </View>

      {/* A taste of home */}
      <View style={styles.section}>
        <Text style={styles.eyebrow}>THE SHOP</Text>
        <Text style={styles.title} accessibilityRole="header">
          A taste of <Text style={styles.titleAccent}>home.</Text>
        </Text>
        <Text style={styles.body}>
          Chips, crunchy snacks and traditional sweets — the bowl passed round at every party, now a few taps away.
        </Text>
      </View>

      {/* Our story */}
      <View style={styles.story}>
        <Text style={[styles.eyebrow, { color: colors.plantain }]}>OUR STORY</Text>
        <Text style={[styles.title, { color: colors.oat }]} accessibilityRole="header">
          Made for <Text style={styles.italic}>sharing.</Text>
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

      <View style={styles.section}>
        <Pressable onPress={shop} accessibilityRole="button" style={({ pressed }) => [styles.primary, pressed && styles.pressed]}>
          <Text style={styles.primaryText}>Shop the snacks  →</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.oat },
  pressed: { opacity: 0.8 },
  italic: { fontStyle: 'italic' },
  hero: { backgroundColor: colors.cocoa, paddingHorizontal: 24, paddingBottom: 40 },
  wordmark: { fontSize: 26, fontFamily: serif, color: colors.oat },
  heroEyebrow: { marginTop: 40, fontSize: 11, letterSpacing: 2.5, fontWeight: '600', color: 'rgba(242,233,218,0.8)' },
  heroTitle: { marginTop: 16, fontSize: 44, lineHeight: 48, fontFamily: serif, color: colors.oat },
  heroAccent: { fontStyle: 'italic', color: colors.plantain },
  heroBody: { marginTop: 20, fontSize: 17, lineHeight: 25, color: 'rgba(242,233,218,0.85)' },
  heroButton: {
    marginTop: 28,
    alignSelf: 'flex-start',
    minHeight: 52,
    paddingHorizontal: 26,
    borderRadius: 999,
    backgroundColor: colors.plantain,
    justifyContent: 'center',
  },
  heroButtonText: { color: colors.cocoa, fontSize: 16, fontWeight: '600' },
  section: { paddingHorizontal: 24, paddingTop: 40 },
  manifesto: { fontSize: 26, lineHeight: 34, fontFamily: serif, fontStyle: 'italic', color: colors.cocoa },
  eyebrow: { fontSize: 12, letterSpacing: 2.5, fontWeight: '600', color: colors.cocoaSoft },
  title: { marginTop: 10, fontSize: 36, lineHeight: 40, fontFamily: serif, color: colors.cocoa },
  titleAccent: { fontStyle: 'italic', color: colors.terracotta },
  body: { marginTop: 12, fontSize: 17, lineHeight: 25, color: colors.cocoaSoft },
  story: { marginTop: 40, paddingHorizontal: 24, paddingVertical: 40, backgroundColor: colors.cocoa },
  quote: {
    marginTop: 24,
    paddingLeft: 16,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(217,162,62,0.6)',
    fontSize: 21,
    lineHeight: 29,
    fontFamily: serif,
    fontStyle: 'italic',
    color: 'rgba(242,233,218,0.95)',
  },
  storyBody: { marginTop: 18, fontSize: 16, lineHeight: 24, color: 'rgba(242,233,218,0.8)' },
  storyNote: { marginTop: 24, fontSize: 13, color: 'rgba(242,233,218,0.6)' },
  primary: { minHeight: MIN_TOUCH + 8, borderRadius: 999, backgroundColor: colors.cocoa, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: colors.oat, fontSize: 16, fontWeight: '600' },
});
