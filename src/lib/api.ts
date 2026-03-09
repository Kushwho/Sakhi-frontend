/**
 * Sakhi API helper – wraps native fetch with the 3-token auth system.
 *
 * • Account routes  → sends Account Token
 * • Profile routes  → sends Profile Token
 * • Public routes   → no token
 *
 * Automatically attempts `/auth/refresh` on a 401 for account-level requests.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

/* ------------------------------------------------------------------ */
/*  Token helpers (localStorage for persistent, memory for profile)   */
/* ------------------------------------------------------------------ */

const TOKEN_KEYS = {
  account: "sakhi_account_token",
  refresh: "sakhi_refresh_token",
} as const;

export function getAccountToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEYS.account);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEYS.refresh);
}

export function setAccountToken(token: string) {
  localStorage.setItem(TOKEN_KEYS.account, token);
}

export function setRefreshToken(token: string) {
  localStorage.setItem(TOKEN_KEYS.refresh, token);
}

export function clearAllTokens() {
  localStorage.removeItem(TOKEN_KEYS.account);
  localStorage.removeItem(TOKEN_KEYS.refresh);
}

/* ------------------------------------------------------------------ */
/*  Core fetch wrapper                                                */
/* ------------------------------------------------------------------ */

type TokenSource = "account" | "profile" | "refresh" | "none";

interface ApiOptions extends Omit<RequestInit, "headers"> {
  /** Which token to attach (default: "none"). */
  tokenSource?: TokenSource;
  /** Profile token (kept in memory, not localStorage). */
  profileToken?: string | null;
  /** Extra headers — merged on top of defaults. */
  headers?: Record<string, string>;
}

/**
 * Thin wrapper around `fetch` that adds auth headers + auto-refresh.
 * Returns the raw `Response` so callers can read status codes.
 */
export async function apiFetch(
  path: string,
  options: ApiOptions = {}
): Promise<Response> {
  const {
    tokenSource = "none",
    profileToken,
    headers: extraHeaders = {},
    ...fetchOptions
  } = options;

  const url = `${API_BASE}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...extraHeaders,
  };

  // Attach the correct token
  if (tokenSource === "account") {
    const t = getAccountToken();
    if (t) headers["Authorization"] = `Bearer ${t}`;
  } else if (tokenSource === "profile" && profileToken) {
    headers["Authorization"] = `Bearer ${profileToken}`;
  } else if (tokenSource === "refresh") {
    const t = getRefreshToken();
    if (t) headers["Authorization"] = `Bearer ${t}`;
  }

  let res = await fetch(url, { ...fetchOptions, headers });

  // Auto-refresh on 401 for account-level requests
  if (res.status === 401 && tokenSource === "account") {
    const refreshed = await tryRefresh();
    if (refreshed) {
      // Retry original request with new token
      const newToken = getAccountToken();
      if (newToken) headers["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(url, { ...fetchOptions, headers });
    }
  }

  return res;
}

/* ------------------------------------------------------------------ */
/*  Refresh helper                                                    */
/* ------------------------------------------------------------------ */

async function tryRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    if (!res.ok) return false;

    const data = await res.json();
    if (data.account_token) {
      setAccountToken(data.account_token);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/*  Dashboard API Helpers                                             */
/* ------------------------------------------------------------------ */

export type TimeSpentData = {
    total_minutes: number;
    daily: { date: string; minutes: number; sessions: number }[];
};

export type MoodData = {
    summaries: { date: string; mood: string }[];
    emotion_distribution: { emotion: string; count: number }[];
};

export type TopicsData = {
    topics: { name: string; count: number }[];
    total_unique: number;
};

export type StreakData = {
    current_streak: number;
    longest_streak: number;
};

export type AlertsData = {
    alerts: {
        id: string;
        type: string;
        severity: "info" | "warning" | "critical";
        title: string;
        description: string;
        recorded_at: string;
        dismissed: boolean;
    }[];
};

export async function fetchDashboardData(profileId: string, profileToken: string) {
    const opts = { tokenSource: "profile" as const, profileToken };
    const [timeRes, moodRes, topicsRes, streakRes, alertsRes] = await Promise.all([
        apiFetch(`/api/dashboard/time-spent?profile_id=${profileId}&days=7`, opts),
        apiFetch(`/api/dashboard/mood?profile_id=${profileId}&days=7`, opts),
        apiFetch(`/api/dashboard/topics?profile_id=${profileId}&days=7`, opts),
        apiFetch(`/api/dashboard/streak?profile_id=${profileId}`, opts),
        apiFetch(`/api/dashboard/alerts?profile_id=${profileId}&limit=20`, opts),
    ]);

    if (!timeRes.ok) throw new Error("Failed to load time data");
    if (!moodRes.ok) throw new Error("Failed to load mood data");
    if (!topicsRes.ok) throw new Error("Failed to load topics data");
    if (!streakRes.ok) throw new Error("Failed to load streak data");
    if (!alertsRes.ok) throw new Error("Failed to load alerts data");

    const [timeData, moodData, topicsData, streakData, alertsData] = await Promise.all([
        timeRes.json(),
        moodRes.json(),
        topicsRes.json(),
        streakRes.json(),
        alertsRes.json(),
    ]);

    return {
        timeSpent: timeData as TimeSpentData,
        mood: moodData as MoodData,
        topics: topicsData as TopicsData,
        streak: streakData as StreakData,
        alerts: alertsData as AlertsData,
    };
}
