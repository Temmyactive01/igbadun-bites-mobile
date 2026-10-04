import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { redirectTo, signInWithGoogle, signOut } from '../../lib/auth';
import { useSession } from '../../lib/session';
import { colors, MIN_TOUCH, serif } from '../../lib/theme';

// Account: the Workflow 1 sign-in screen, moved here. Signing out also empties the
// basket on this device (lib/cart.ts follows the session).
export default function Account() {
  const { session, loading } = useSession();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSignIn() {
    setBusy(true);
    setMessage(null);
    const result = await signInWithGoogle();
    if (!result.ok) {
      // Supabase never allows a redirect to a raw IP address, so Expo Go over Wi-Fi
      // (exp://192.168…) can't work — start Expo in tunnel mode instead.
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

  if (loading) return <ActivityIndicator color={colors.cocoa} style={{ marginTop: 48 }} />;

  return (
    <View style={styles.screen}>
      {session ? (
        <>
          <Text style={styles.eyebrow}>SIGNED IN</Text>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value} selectable>
            {session.user.email ?? '—'}
          </Text>
          <Text style={styles.label}>User ID</Text>
          <Text style={[styles.value, styles.mono]} selectable>
            {session.user.id}
          </Text>
          <Text style={styles.body}>Your basket is shared with the website when you sign in there with the same Google account.</Text>
          <Pressable onPress={onSignOut} disabled={busy} accessibilityRole="button" style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}>
            <Text style={styles.secondaryText}>{busy ? 'Signing out…' : 'Sign out'}</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text style={styles.heading}>Sign in to continue</Text>
          <Text style={styles.body}>Use the same Google account as on the website — your basket is shared between them.</Text>
          <Pressable onPress={onSignIn} disabled={busy} accessibilityRole="button" style={({ pressed }) => [styles.primary, (pressed || busy) && styles.pressed]}>
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
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.oat, paddingHorizontal: 24, paddingTop: 24 },
  pressed: { opacity: 0.8 },
  eyebrow: { fontSize: 12, letterSpacing: 2.5, fontWeight: '600', color: colors.cocoaSoft },
  heading: { fontSize: 28, fontFamily: serif, color: colors.cocoa },
  body: { marginTop: 16, fontSize: 16, lineHeight: 22, color: colors.cocoaSoft },
  label: { marginTop: 20, fontSize: 13, color: colors.cocoaSoft },
  value: { marginTop: 4, fontSize: 17, color: colors.cocoa },
  mono: { fontFamily: 'monospace', fontSize: 14 },
  primary: { marginTop: 28, minHeight: 52, borderRadius: 999, backgroundColor: colors.cocoa, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  primaryText: { color: colors.oat, fontSize: 16, fontWeight: '600' },
  secondary: { marginTop: 32, minHeight: MIN_TOUCH + 4, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(43,26,18,0.3)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  secondaryText: { color: colors.cocoa, fontSize: 15, fontWeight: '500' },
  error: { marginTop: 16, color: colors.terracotta, fontSize: 15 },
  hint: { marginTop: 32, fontSize: 12, color: colors.cocoaSoft },
});
