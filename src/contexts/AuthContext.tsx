"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  apiFetch,
  setAccountToken,
  setRefreshToken,
  getAccountToken,
  getRefreshToken,
  clearAllTokens,
} from "@/lib/api";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export interface Account {
  id: string;
  email: string;
  family_name: string;
}

export interface Profile {
  id: string;
  type: "parent" | "child";
  display_name: string;
  age?: number;
  avatar?: string | null;
}

interface AuthState {
  /** Whether the initial hydration from localStorage is complete. */
  ready: boolean;
  /** True when an account token exists (family is logged-in on this device). */
  isLoggedIn: boolean;
  /** True if this is the first time signing up (show setup page). */
  isNewSignup: boolean;
  account: Account | null;
  profiles: Profile[];
}

interface AuthActions {
  signup: (email: string, password: string, familyName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfiles: () => Promise<Profile[]>;
  createChildProfile: (name: string, age: number) => Promise<Profile>;
  clearNewSignup: () => void;
}

type AuthContextValue = AuthState & AuthActions;

/* ------------------------------------------------------------------ */
/*  Context                                                           */
/* ------------------------------------------------------------------ */

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

/* ------------------------------------------------------------------ */
/*  Provider                                                          */
/* ------------------------------------------------------------------ */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isNewSignup, setIsNewSignup] = useState(false);
  const [account, setAccount] = useState<Account | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  // Hydrate on mount
  useEffect(() => {
    const token = getAccountToken();
    setIsLoggedIn(!!token);
    setReady(true);
  }, []);

  /* ---- signup ---------------------------------------------------- */
  const signup = useCallback(
    async (email: string, password: string, familyName: string) => {
      const res = await apiFetch("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email, password, family_name: familyName }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Signup failed (${res.status})`);
      }

      const data = await res.json();
      setAccountToken(data.account_token);
      setRefreshToken(data.refresh_token);
      setAccount(data.account);
      setIsLoggedIn(true);
      setIsNewSignup(true);

      // The parent profile comes back from signup
      if (data.parent_profile) {
        setProfiles([data.parent_profile]);
      }
    },
    []
  );

  /* ---- login ----------------------------------------------------- */
  const login = useCallback(async (email: string, password: string) => {
    const res = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Login failed (${res.status})`);
    }

    const data = await res.json();
    setAccountToken(data.account_token);
    setRefreshToken(data.refresh_token);
    setAccount(data.account);
    setProfiles(data.profiles || []);
    setIsLoggedIn(true);
    setIsNewSignup(false);
  }, []);

  /* ---- logout ---------------------------------------------------- */
  const logout = useCallback(async () => {
    try {
      await apiFetch("/auth/logout", {
        method: "POST",
        tokenSource: "account",
      });
    } catch {
      // Best-effort
    }
    clearAllTokens();
    setIsLoggedIn(false);
    setAccount(null);
    setProfiles([]);
    setIsNewSignup(false);
  }, []);

  /* ---- fetchProfiles --------------------------------------------- */
  const fetchProfiles = useCallback(async (): Promise<Profile[]> => {
    const res = await apiFetch("/auth/profiles", {
      tokenSource: "account",
    });

    if (!res.ok) {
      if (res.status === 401) {
        clearAllTokens();
        setIsLoggedIn(false);
        return [];
      }
      throw new Error("Failed to load profiles");
    }

    const data: Profile[] = await res.json();
    setProfiles(data);
    return data;
  }, []);

  /* ---- createChildProfile ---------------------------------------- */
  const createChildProfile = useCallback(
    async (name: string, age: number): Promise<Profile> => {
      const res = await apiFetch("/auth/profiles", {
        method: "POST",
        tokenSource: "account",
        body: JSON.stringify({ display_name: name, age, avatar: null }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to create profile");
      }

      const profile: Profile = await res.json();
      setProfiles((prev) => [...prev, profile]);
      return profile;
    },
    []
  );

  /* ---- clearNewSignup -------------------------------------------- */
  const clearNewSignup = useCallback(() => setIsNewSignup(false), []);

  return (
    <AuthContext.Provider
      value={{
        ready,
        isLoggedIn,
        isNewSignup,
        account,
        profiles,
        signup,
        login,
        logout,
        fetchProfiles,
        createChildProfile,
        clearNewSignup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
