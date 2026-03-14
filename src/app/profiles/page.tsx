"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Plus, LogOut, Lock, Eye, EyeOff, Mic, BookOpen, MessageCircle } from "lucide-react";
import { useAuth, type Profile } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { apiFetch } from "@/lib/api";

/* ------------------------------------------------------------------ */
/*  Palette of avatar colours (deterministic per profile index)       */
/* ------------------------------------------------------------------ */
const AVATAR_COLORS = [
    "from-sakhi-pink to-sakhi-purple",
    "from-sakhi-sky to-sakhi-purple",
    "from-sakhi-yellow to-sakhi-pink",
    "from-sakhi-green to-sakhi-sky",
    "from-sakhi-purple to-sakhi-pink",
];

/* ------------------------------------------------------------------ */
/*  Floating sparkles (reused style)                                  */
/* ------------------------------------------------------------------ */
function FloatingSparkles() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {Array.from({ length: 12 }).map((_, i) => (
                <span
                    key={i}
                    className="sparkle"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 4}s`,
                        animationDuration: `${3 + Math.random() * 3}s`,
                        width: `${4 + Math.random() * 6}px`,
                        height: `${4 + Math.random() * 6}px`,
                        background: [
                            "var(--color-sakhi-yellow)",
                            "var(--color-sakhi-pink)",
                            "var(--color-sakhi-purple)",
                            "var(--color-sakhi-sky)",
                        ][Math.floor(Math.random() * 4)],
                    }}
                />
            ))}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Profile card component                                            */
/* ------------------------------------------------------------------ */
function ProfileCard({
    profile,
    colorClass,
    onSelect,
}: {
    profile: Profile;
    colorClass: string;
    onSelect: (p: Profile) => void;
}) {
    const initials = profile.display_name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <motion.button
            onClick={() => onSelect(profile)}
            whileHover={{ scale: 1.08, y: -4 }}
            whileTap={{ scale: 0.95 }}
            className="group flex flex-col items-center gap-3"
        >
            <div
                className={`relative flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br ${colorClass} shadow-lg transition-shadow group-hover:shadow-xl group-hover:shadow-sakhi-purple/30 sm:h-32 sm:w-32`}
            >
                <span className="text-3xl font-[900] text-white sm:text-4xl">
                    {initials}
                </span>

                {/* Lock badge for parent */}
                {profile.type === "parent" && (
                    <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-sakhi-card shadow-md ring-2 ring-sakhi-bg">
                        <Lock className="h-4 w-4 text-sakhi-yellow" />
                    </div>
                )}
            </div>

            <span className="text-base font-[700] text-sakhi-text sm:text-lg">
                {profile.display_name}
            </span>
            <span className="text-xs font-[600] text-sakhi-muted capitalize">
                {profile.type}
                {profile.age ? ` · ${profile.age}y` : ""}
            </span>
        </motion.button>
    );
}

/* ------------------------------------------------------------------ */
/*  Password modal (for parent entry)                                 */
/* ------------------------------------------------------------------ */
function PasswordModal({
    profile,
    onConfirm,
    onCancel,
}: {
    profile: Profile;
    onConfirm: (pw: string) => void;
    onCancel: () => void;
}) {
    const [pw, setPw] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onCancel}
        >
            <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-card w-full max-w-sm rounded-3xl p-8 shadow-2xl"
            >
                <h3 className="mb-1 text-center text-xl font-[800] text-sakhi-text">
                    Enter Password
                </h3>
                <p className="mb-5 text-center text-sm font-[600] text-sakhi-muted">
                    Parent access for{" "}
                    <span className="text-sakhi-purple">{profile.display_name}</span>
                </p>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!pw.trim()) {
                            setError("Password is required");
                            return;
                        }
                        onConfirm(pw);
                    }}
                >
                    <div className="relative mb-4">
                        <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-sakhi-muted/60" />
                        <input
                            autoFocus
                            type={showPassword ? "text" : "password"}
                            placeholder="Family password"
                            value={pw}
                            onChange={(e) => {
                                setPw(e.target.value);
                                setError("");
                            }}
                            className="auth-input py-4 pl-12 pr-12"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-sakhi-muted/60 transition-colors hover:text-sakhi-text"
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>

                    {error && (
                        <p className="mb-3 text-center text-sm font-[600] text-red-400">
                            {error}
                        </p>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 rounded-2xl border border-white/10 px-4 py-3 text-sm font-[700] text-sakhi-muted transition-colors hover:bg-white/5"
                        >
                            Cancel
                        </button>
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="flex-1 rounded-2xl bg-gradient-to-r from-sakhi-pink to-sakhi-purple px-4 py-3 text-sm font-[800] text-white shadow-lg"
                        >
                            Enter
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}

/* ------------------------------------------------------------------ */
/*  Mode Picker Modal (child: Voice vs Story)                         */
/* ------------------------------------------------------------------ */
function ModePickerModal({
    childName,
    onVoice,
    onChat,
    onStory,
    onCancel,
    isLoading,
}: {
    childName: string;
    onVoice: () => void;
    onChat: () => void;
    onStory: () => void;
    onCancel: () => void;
    isLoading: boolean;
}) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onCancel}
        >
            <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-card w-full max-w-sm rounded-3xl p-8 shadow-2xl sm:max-w-lg"
            >
                <h3 className="mb-1 text-center text-xl font-[800] text-sakhi-text sm:text-2xl">
                    Hi {childName}! 👋
                </h3>
                <p className="mb-6 text-center text-sm font-[600] text-sakhi-muted">
                    What would you like to do today?
                </p>

                <div className="flex flex-col gap-3 sm:flex-row">
                    {/* Voice mode */}
                    <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={onVoice}
                        disabled={isLoading}
                        className="flex flex-1 flex-col items-center gap-3 rounded-2xl bg-gradient-to-br from-sakhi-pink to-sakhi-purple p-6 shadow-lg transition-shadow hover:shadow-xl disabled:opacity-50"
                    >
                        <Mic className="h-10 w-10 text-white" />
                        <span className="text-base font-[800] text-white">Voice Chat</span>
                        <span className="text-xs font-[600] text-white/70">Talk & learn</span>
                    </motion.button>

                    {/* Chat mode */}
                    <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={onChat}
                        disabled={isLoading}
                        className="flex flex-1 flex-col items-center gap-3 rounded-2xl bg-gradient-to-br from-sakhi-yellow to-sakhi-pink p-6 shadow-lg transition-shadow hover:shadow-xl disabled:opacity-50"
                    >
                        <MessageCircle className="h-10 w-10 text-white" />
                        <span className="text-base font-[800] text-white">Text Chat</span>
                        <span className="text-xs font-[600] text-white/70">Type & learn</span>
                    </motion.button>

                    {/* Story mode */}
                    <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={onStory}
                        disabled={isLoading}
                        className="flex flex-1 flex-col items-center gap-3 rounded-2xl bg-gradient-to-br from-sakhi-sky to-sakhi-purple p-6 shadow-lg transition-shadow hover:shadow-xl disabled:opacity-50"
                    >
                        <BookOpen className="h-10 w-10 text-white" />
                        <span className="text-base font-[800] text-white">Story Time</span>
                        <span className="text-xs font-[600] text-white/70">Listen to stories</span>
                    </motion.button>
                </div>

                <button
                    onClick={onCancel}
                    className="mt-4 w-full rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-[700] text-sakhi-muted transition-colors hover:bg-white/5"
                >
                    Cancel
                </button>
            </motion.div>
        </motion.div>
    );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                         */
/* ------------------------------------------------------------------ */
export default function ProfilesPage() {
    const router = useRouter();
    const { isLoggedIn, ready, profiles, fetchProfiles, logout } = useAuth();
    const { enterProfile } = useProfile();

    const [loading, setLoading] = useState(true);
    const [enteringId, setEnteringId] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [parentModal, setParentModal] = useState<Profile | null>(null);
    const [modePickerProfile, setModePickerProfile] = useState<Profile | null>(null);
    const [childProfileToken, setChildProfileToken] = useState<string | null>(null);

    /* Fetch profiles on mount */
    useEffect(() => {
        if (!ready) return;
        if (!isLoggedIn) {
            router.replace("/login");
            return;
        }
        fetchProfiles()
            .catch(() => setError("Couldn't load profiles"))
            .finally(() => setLoading(false));
    }, [ready, isLoggedIn, fetchProfiles, router]);

    /* ---- handlers ------------------------------------------------ */
    const handleSelect = useCallback(
        async (profile: Profile, password?: string) => {
            setEnteringId(profile.id);
            setError("");
            try {
                const profileToken = await enterProfile(profile.id, password);

                if (profile.type === "child") {
                    // Show mode picker instead of going straight to voice
                    setChildProfileToken(profileToken);
                    setModePickerProfile(profile);
                } else if (profile.type === "parent") {
                    router.push("/dashboard");
                }
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : "Something went wrong";
                setError(msg);
            } finally {
                setEnteringId(null);
                setParentModal(null);
            }
        },
        [enterProfile, router]
    );

    /* ---- Mode picker: Voice ---- */
    const handleVoiceMode = useCallback(async () => {
        if (!modePickerProfile || !childProfileToken) return;
        setEnteringId(modePickerProfile.id);
        setError("");
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
            const tokenRes = await fetch(`${apiUrl}/api/token`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${childProfileToken}`,
                },
                body: JSON.stringify({}),
            });
            if (!tokenRes.ok) throw new Error("Failed to start voice session");
            const tokenData = await tokenRes.json();
            sessionStorage.setItem(
                "sakhi_session",
                JSON.stringify({
                    token: tokenData.token,
                    livekit_url: tokenData.livekit_url,
                    room_name: tokenData.room_name,
                    child_name: modePickerProfile.display_name,
                })
            );
            router.push("/agent");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Something went wrong";
            setError(msg);
        } finally {
            setEnteringId(null);
            setModePickerProfile(null);
        }
    }, [modePickerProfile, childProfileToken, router]);

    /* ---- Mode picker: Chat ---- */
    const handleChatMode = useCallback(() => {
        if (!modePickerProfile || !childProfileToken) return;
        sessionStorage.setItem(
            "sakhi_chat_session",
            JSON.stringify({
                child_name: modePickerProfile.display_name,
                profile_token: childProfileToken,
            })
        );
        setModePickerProfile(null);
        router.push("/chat");
    }, [modePickerProfile, childProfileToken, router]);

    /* ---- Mode picker: Story ---- */
    const handleStoryMode = useCallback(() => {
        setModePickerProfile(null);
        router.push("/story");
    }, [router]);

    const handleCardClick = useCallback(
        (profile: Profile) => {
            if (profile.type === "parent") {
                setParentModal(profile);
            } else {
                handleSelect(profile);
            }
        },
        [handleSelect]
    );

    /* ---- render -------------------------------------------------- */
    if (!ready || loading) {
        return (
            <main className="sakhi-bg-gradient flex min-h-dvh items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="h-10 w-10 rounded-full border-4 border-sakhi-purple/30 border-t-sakhi-purple"
                />
            </main>
        );
    }

    return (
        <main className="sakhi-bg-gradient relative flex min-h-dvh flex-col items-center justify-center px-4 py-12">
            <FloatingSparkles />

            {/* Title */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 mb-10 text-center"
            >
                <div className="mb-2 flex items-center justify-center gap-2">
                    <Sparkles className="h-7 w-7 text-sakhi-yellow" />
                    <h1 className="text-4xl font-[900] tracking-tight sm:text-5xl">
                        <span className="bg-gradient-to-r from-sakhi-pink via-sakhi-purple to-sakhi-sky bg-clip-text text-transparent">
                            Who&apos;s Playing?
                        </span>
                    </h1>
                    <Sparkles className="h-7 w-7 text-sakhi-yellow" />
                </div>
                <p className="text-base font-[600] text-sakhi-muted sm:text-lg">
                    Pick your profile to start chatting with Sakhi!
                </p>
            </motion.div>

            {/* Profile grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative z-10 flex flex-wrap items-start justify-center gap-8 sm:gap-12"
            >
                {profiles.map((p, i) => (
                    <ProfileCard
                        key={p.id}
                        profile={p}
                        colorClass={AVATAR_COLORS[i % AVATAR_COLORS.length]}
                        onSelect={handleCardClick}
                    />
                ))}

                {/* Add profile button */}
                <motion.button
                    onClick={() => router.push("/setup")}
                    whileHover={{ scale: 1.08, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    className="group flex flex-col items-center gap-3"
                >
                    <div className="flex h-28 w-28 items-center justify-center rounded-3xl border-2 border-dashed border-white/15 bg-white/5 shadow-inner transition-colors group-hover:border-sakhi-purple/50 group-hover:bg-white/10 sm:h-32 sm:w-32">
                        <Plus className="h-10 w-10 text-sakhi-muted/50 transition-colors group-hover:text-sakhi-purple" />
                    </div>
                    <span className="text-base font-[700] text-sakhi-muted sm:text-lg">
                        Add Child
                    </span>
                </motion.button>
            </motion.div>

            {/* Loading overlay when entering a profile */}
            {enteringId && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="h-12 w-12 rounded-full border-4 border-sakhi-purple/30 border-t-sakhi-purple"
                    />
                </div>
            )}

            {/* Error */}
            {error && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative z-10 mt-6 rounded-xl bg-red-500/10 px-5 py-3 text-center text-sm font-[600] text-red-400"
                >
                    {error}
                </motion.p>
            )}

            {/* Parent password modal */}
            {parentModal && (
                <PasswordModal
                    profile={parentModal}
                    onCancel={() => setParentModal(null)}
                    onConfirm={(pw) => handleSelect(parentModal, pw)}
                />
            )}

            {/* Child mode picker modal */}
            {modePickerProfile && (
                <ModePickerModal
                    childName={modePickerProfile.display_name}
                    onVoice={handleVoiceMode}
                    onChat={handleChatMode}
                    onStory={handleStoryMode}
                    onCancel={() => setModePickerProfile(null)}
                    isLoading={!!enteringId}
                />
            )}

            {/* Logout button (bottom) */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={logout}
                className="relative z-10 mt-12 flex items-center gap-2 rounded-2xl border border-white/10 px-5 py-2.5 text-sm font-[700] text-sakhi-muted transition-colors hover:border-red-400/30 hover:text-red-400"
            >
                <LogOut className="h-4 w-4" />
                Sign Out
            </motion.button>
        </main>
    );
}
