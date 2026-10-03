import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from './supabase';

// Where Supabase sends the user after Google sign-in. A deep link back into the app:
//   Expo Go (tunnel):            exp://<id>-<user>-8081.exp.direct/--/auth/callback
//   development / store build:   igbadunbites://auth/callback   (scheme set in app.json)
// Allowed in Supabase → Authentication → URL Configuration → Redirect URLs by
// `exp://**` and `igbadunbites://auth/callback`.
//
// Use `npm run start:tunnel` with Expo Go. Over plain Wi-Fi Expo Go uses
// exp://<computer IP>:8081/…, and Supabase never allows redirects to an IP address
// (verified 3 Oct 2026, even with the exact URL listed) — sign-in then lands on the
// website instead of returning to the app.
export const redirectTo = makeRedirectUri({ scheme: 'igbadunbites', path: 'auth/callback' });

export type SignInResult = { ok: true } | { ok: false; cancelled?: boolean; message: string };

// Google sign-in through Supabase Auth, in the phone's own browser (iOS
// ASWebAuthenticationSession / Android Custom Tabs) — not an embedded WebView,
// which Google blocks for sign-in.
export async function signInWithGoogle(): Promise<SignInResult> {
  // 1. Ask Supabase for the Google sign-in URL, without opening it automatically
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error || !data?.url) return { ok: false, message: error?.message ?? 'Could not start Google sign-in.' };

  // 2. Open it in the system browser; this resolves when the browser hits `redirectTo`
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') {
    return { ok: false, cancelled: true, message: 'Sign-in was cancelled.' };
  }

  // 3. Supabase sends back ?code=… (PKCE) — or ?error=… if something went wrong.
  //    Read both the query string and the #fragment to be safe.
  const url = new URL(result.url);
  const params = new URLSearchParams(url.hash.replace(/^#/, ''));
  url.searchParams.forEach((value, key) => params.set(key, value));

  const authError = params.get('error_description') ?? params.get('error');
  if (authError) return { ok: false, message: authError };

  const code = params.get('code');
  if (!code) return { ok: false, message: 'Sign-in did not return a code.' };

  // 4. Swap the one-time code for a session (stored on the device by the client)
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) return { ok: false, message: exchangeError.message };
  return { ok: true };
}

export async function signOut() {
  await supabase.auth.signOut();
}
