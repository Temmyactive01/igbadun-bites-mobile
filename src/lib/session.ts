import type { Session } from '@supabase/supabase-js';
import { useSyncExternalStore } from 'react';
import { supabase } from './supabase';

// The signed-in session, shared by every screen and by the basket sync.
type State = { session: Session | null; loading: boolean };
let state: State = { session: null, loading: true };
const listeners = new Set<(s: State) => void>();
let started = false;

function set(next: State) {
  // Ignore token refreshes for the same user — screens only care who is signed in
  const sameUser = state.session?.user.id === next.session?.user.id && state.loading === next.loading;
  state = next;
  if (!sameUser) listeners.forEach((l) => l(state));
}

export function startSession() {
  if (started) return;
  started = true;
  supabase.auth.getSession().then(({ data }) => set({ session: data.session, loading: false }));
  supabase.auth.onAuthStateChange((_event, session) => {
    // Don't call Supabase from inside this callback (it can deadlock) — defer
    setTimeout(() => set({ session, loading: false }), 0);
  });
}

export function onSessionChange(listener: (s: State) => void) {
  startSession();
  listeners.add(listener);
  listener(state);
  return () => listeners.delete(listener);
}

export function useSession() {
  startSession();
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state
  );
}
