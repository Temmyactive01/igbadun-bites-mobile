import type { Session } from '@supabase/supabase-js';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { redirectTo, signInWithGoogle, signOut } from './src/lib/auth';
import { supabase } from './src/lib/supabase';

// Brand colours from the web app (style.md)
const colors = { oat: '#f2e9da', cocoa: '#2b1a12', cocoaSoft: '#5e4536', terracotta: '#a84a24' };

// Step 1 of the mobile app: Google sign-in only, then show who is signed in.
export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Restore a saved session on launch, then follow sign-in / sign-out / refreshes
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  async function onSignIn() {
    setBusy(true);
    setMessage(null);
    const result = await signInWithGoogle();
    if (!result.ok) {
      // A browser that lands on the website never returns to the app, so it looks like a
      // cancel. That happens when Supabase doesn't allow the redirect URL below.
      // Supabase never allows a redirect to a raw IP address (even if it's listed), so
      // Expo Go over Wi-Fi (exp://192.168…) can't work — start Expo in tunnel mode instead.
      const ipHost = /^exp:\/\/\d{1,3}(\.\d{1,3}){3}[:/]/.test(redirectTo);
      setMessage(
        !result.cancelled
          ? result.message
          : ipHost
            ? `Didn't come back to the app? Supabase doesn't allow redirects to an IP address (${redirectTo}). Restart with "npm run start:tunnel" and scan the new QR code.`
            : `Didn't come back to the app? If the browser showed the Igbadun Bites website, allow this URL in Supabase → Authentication → URL Configuration → Redirect URLs:\n${redirectTo}`
      );
    }
    setBusy(false);
  }

  async function onSignOut() {
    setBusy(true);
    await signOut();
    setBusy(false);
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <Text style={styles.wordmark}>
        Igbadun<Text style={{ color: colors.terracotta }}>.</Text>
        <Text style={styles.italic}>Bites</Text>
      </Text>

      {loading ? (
        <ActivityIndicator color={colors.cocoa} style={{ marginTop: 32 }} />
      ) : session ? (
        <View style={styles.block}>
          <Text style={styles.eyebrow}>SIGNED IN</Text>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value} selectable>
            {session.user.email ?? '—'}
          </Text>
          <Text style={styles.label}>User ID</Text>
          <Text style={[styles.value, styles.mono]} selectable>
            {session.user.id}
          </Text>
          <Pressable
            onPress={onSignOut}
            disabled={busy}
            accessibilityRole="button"
            style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
          >
            <Text style={styles.secondaryText}>{busy ? 'Signing out…' : 'Sign out'}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.block}>
          <Text style={styles.heading}>Sign in to continue</Text>
          <Text style={styles.body}>Use the same Google account as on the website.</Text>
          <Pressable
            onPress={onSignIn}
            disabled={busy}
            accessibilityRole="button"
            style={({ pressed }) => [styles.primary, (pressed || busy) && styles.pressed]}
          >
            <Text style={styles.primaryText}>{busy ? 'Opening Google…' : 'Continue with Google'}</Text>
          </Pressable>
          {message && (
            <Text style={styles.error} accessibilityLiveRegion="polite">
              {message}
            </Text>
          )}
          {/* Development aid: the deep link Supabase must be allowed to redirect to */}
          <Text style={styles.hint} selectable>
            Redirect: {redirectTo}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.oat, paddingHorizontal: 24, paddingTop: 96 },
  wordmark: { fontSize: 34, color: colors.cocoa, fontWeight: '300' },
  italic: { fontStyle: 'italic' },
  block: { marginTop: 48 },
  eyebrow: { fontSize: 12, letterSpacing: 2.5, fontWeight: '600', color: colors.cocoaSoft },
  heading: { fontSize: 26, color: colors.cocoa },
  body: { marginTop: 8, fontSize: 16, color: colors.cocoaSoft },
  label: { marginTop: 20, fontSize: 13, color: colors.cocoaSoft },
  value: { marginTop: 4, fontSize: 17, color: colors.cocoa },
  mono: { fontFamily: 'monospace', fontSize: 14 },
  primary: {
    marginTop: 28,
    minHeight: 52,
    borderRadius: 999,
    backgroundColor: colors.cocoa,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  primaryText: { color: colors.oat, fontSize: 16, fontWeight: '600' },
  secondary: {
    marginTop: 32,
    minHeight: 48,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(43,26,18,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  secondaryText: { color: colors.cocoa, fontSize: 15, fontWeight: '500' },
  pressed: { opacity: 0.8 },
  error: { marginTop: 16, color: colors.terracotta, fontSize: 15 },
  hint: { marginTop: 32, fontSize: 12, color: colors.cocoaSoft },
});
