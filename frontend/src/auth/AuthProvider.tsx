import { createContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { fetchMyProfile, type Profile } from "../lib/profile";

type AuthState = {
  loading: boolean;
  authed: boolean;
  profile: Profile | null;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthState>({
  loading: true,
  authed: false,
  profile: null,
  refresh: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  const authed = !!profile;

  const refresh = async () => {
    console.log("[auth] refresh start");
    setLoading(true);
    try {
      const session = await supabase.auth.getSession();
      console.log("[auth] getSession", { hasSession: !!session.data.session, err: session.error?.message });

      if (!session.data.session) {
        setProfile(null);
        setLoading(false);
        console.log("[auth] refresh end (no session)");
        return;
      }

      const p = await fetchMyProfile();
      console.log("[auth] fetched profile", p);
      setProfile(p);
      setLoading(false);
      console.log("[auth] refresh end (ok)");
    } catch (e: any) {
      console.log("[auth] refresh error", e?.message);
      setProfile(null);
      setLoading(false);
    }
  };

  const logout = async () => {
    console.log("[auth] logout start");
    await supabase.auth.signOut();
    setProfile(null);
    console.log("[auth] logout end");
  };

  useEffect(() => {
    refresh();

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[auth] onAuthStateChange", { event, hasSession: !!session });
      refresh();
    });

    return () => {
      console.log("[auth] unsub");
      data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => ({ loading, authed, profile, refresh, logout }), [loading, authed, profile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
