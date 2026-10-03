import 'expo-sqlite/localStorage/install';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

// Same Supabase project as the web app (igbadun-bites): same users, same data,
// same Row Level Security. Values come from .env.local (see .env.example).
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY — copy .env.example to .env.local.');
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    // The session is saved on the device (expo-sqlite's localStorage), so the
    // user stays signed in between app launches.
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Phones have no address bar for Supabase to read a session from.
    detectSessionInUrl: false,
    // PKCE: Google sign-in returns a one-time code that the app swaps for a
    // session, so tokens never travel in a URL. Same flow as the web app.
    flowType: 'pkce',
  },
});

// Only refresh the session while the app is in the foreground (Supabase's
// recommended setup for mobile).
AppState.addEventListener('change', (state) => {
  if (state === 'active') supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});
