"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { apiFetch } from "@/lib/api";
import type { Profile } from "@/contexts/AuthContext";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

interface ProfileState {
  /** The currently-active profile (null = on picker screen). */
  activeProfile: Profile | null;
  /** Profile token kept in memory only (never localStorage). */
  profileToken: string | null;
}

interface ProfileActions {
  /**
   * Enter a profile. For child profiles no password is needed.
   * For parent profiles the family password must be supplied.
   */
  enterProfile: (profileId: string, password?: string) => Promise<string>;
  /** Leave the current profile → back to picker. */
  exitProfile: () => Promise<void>;
}

type ProfileContextValue = ProfileState & ProfileActions;

/* ------------------------------------------------------------------ */
/*  Context                                                           */
/* ------------------------------------------------------------------ */

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx)
    throw new Error("useProfile must be used within <ProfileProvider>");
  return ctx;
}

/* ------------------------------------------------------------------ */
/*  Provider                                                          */
/* ------------------------------------------------------------------ */

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [profileToken, setProfileToken] = useState<string | null>(null);

  /* ---- enterProfile ---------------------------------------------- */
  const enterProfile = useCallback(
    async (profileId: string, password?: string): Promise<string> => {
      const body: Record<string, string> = {};
      if (password) body.password = password;

      const res = await apiFetch(`/auth/profiles/${profileId}/enter`, {
        method: "POST",
        tokenSource: "account",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Failed to enter profile (${res.status})`);
      }

      const data = await res.json();
      setActiveProfile(data.profile);
      setProfileToken(data.profile_token);
      return data.profile_token;
    },
    []
  );

  /* ---- exitProfile ----------------------------------------------- */
  const exitProfile = useCallback(async () => {
    try {
      if (profileToken) {
        await apiFetch("/auth/profiles/exit", {
          method: "POST",
          tokenSource: "profile",
          profileToken,
        });
      }
    } catch {
      // best-effort
    }
    setActiveProfile(null);
    setProfileToken(null);
  }, [profileToken]);

  return (
    <ProfileContext.Provider
      value={{ activeProfile, profileToken, enterProfile, exitProfile }}
    >
      {children}
    </ProfileContext.Provider>
  );
}
