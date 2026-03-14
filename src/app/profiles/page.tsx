"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, LogOut, Lock } from "lucide-react";
import { useAuth, type Profile } from "@/contexts/AuthContext";
import { MobileShell } from "@/components/ui/MobileShell";
import Image from "next/image";

/* ── Avatar color palette ── */
const AVATAR_COLORS = [
    "from-sakhi-purple to-sakhi-pink",
    "from-sakhi-sky to-sakhi-purple",
    "from-sakhi-yellow to-sakhi-orange",
    "from-sakhi-green to-sakhi-sky",
    "from-sakhi-pink to-sakhi-purple",
];

/* ── Profile card ── */
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
                className={`relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br ${colorClass} shadow-lg transition-shadow group-hover:shadow-xl group-hover:shadow-sakhi-purple/20`}
            >
                <span className="text-2xl font-[900] text-white">
                    {initials}
                </span>

                {/* Lock badge for parent */}
                {profile.type === "parent" && (
                    <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md ring-2 ring-white">
                        <Lock className="h-3.5 w-3.5 text-sakhi-purple" />
                    </div>
                )}
            </div>

            <span className="text-sm font-[700] text-sakhi-text">
                {profile.display_name}
            </span>
            <span className="text-xs font-[600] text-sakhi-muted capitalize">
                {profile.type}
                {profile.age ? ` · ${profile.age}y` : ""}
            </span>
        </motion.button>
    );
}

/* ── Main Page ── */
export default function ProfilesPage() {
    const router = useRouter();
    const { isLoggedIn, ready, profiles, fetchProfiles, logout } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

    /* ── handlers ── */
    const handleCardClick = useCallback(
        (profile: Profile) => {
            if (profile.type === "parent") {
                // Navigate to dedicated parent-password page
                router.push(`/parent-password?profileId=${profile.id}`);
            } else {
                // Navigate to child-entry page
                router.push(`/child-entry?profileId=${profile.id}`);
            }
        },
        [router]
    );

    /* ── render ── */
    if (!ready || loading) {
        return (
            <MobileShell className="flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="h-10 w-10 rounded-full border-4 border-sakhi-purple/30 border-t-sakhi-purple"
                />
            </MobileShell>
        );
    }

    return (
        <MobileShell className="flex flex-col items-center px-6 pt-10 pb-8">
            {/* Penguin */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <Image
                    src="/sakhi-penguin.png"
                    alt="Sakhi"
                    width={120}
                    height={120}
                    className="penguin-pop"
                    priority
                />
            </motion.div>

            {/* Title */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8 text-center"
            >
                <h1 className="text-pop text-3xl font-[900] text-sakhi-text">
                    Who&apos;s Playing?
                </h1>
                <p className="mt-2 text-sm font-[600] text-sakhi-muted">
                    Pick your profile to start chatting with Sakhi!
                </p>
            </motion.div>

            {/* Profile grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap items-start justify-center gap-8"
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
                    <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 bg-white/50 shadow-inner transition-colors group-hover:border-sakhi-purple/50 group-hover:bg-sakhi-purple/5">
                        <Plus className="h-8 w-8 text-sakhi-muted/50 transition-colors group-hover:text-sakhi-purple" />
                    </div>
                    <span className="text-sm font-[700] text-sakhi-muted">
                        Add Child
                    </span>
                </motion.button>
            </motion.div>

            {/* Error */}
            {error && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 rounded-2xl bg-red-50 px-5 py-3 text-center text-sm font-[600] text-red-500"
                >
                    {error}
                </motion.p>
            )}

            {/* Logout button */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={logout}
                className="mt-10 flex items-center gap-2 rounded-full border border-gray-200 px-5 py-2.5 text-sm font-[700] text-sakhi-muted transition-colors hover:border-red-300 hover:text-red-500"
            >
                <LogOut className="h-4 w-4" />
                Sign Out
            </motion.button>
        </MobileShell>
    );
}
