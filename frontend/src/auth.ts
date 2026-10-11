import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "./supabase";

export interface AuthState {
  /** "guest" when Supabase isn't configured yet — app runs on localStorage. */
  mode: "guest" | "supabase";
  user: User | null;
  ready: boolean;
}

export function useAuth(): AuthState & {
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
} {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signInWithGoogle() {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  return {
    mode: isSupabaseConfigured ? "supabase" : "guest",
    user,
    ready,
    signInWithGoogle,
    signOut,
  };
}
