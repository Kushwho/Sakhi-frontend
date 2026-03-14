"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft } from "lucide-react";
import { useAuth, type Profile } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { MobileShell } from "@/components/ui/MobileShell";
import Image from "next/image";

function LoadingSpinner() {
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

function ChildEntryContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const profileId = searchParams.get("profileId");

    const { isLoggedIn, ready, profiles } = useAuth();
    const { enterProfile } = useProfile();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const childProfile: Profile | undefined = profiles.find(
        (p) => p.id === profileId && p.type === "child"
    );

    useEffect(() => {
        if (!ready) return;
        if (!isLoggedIn) {
            router.replace("/login");
            return;
        }
        if (ready && !profileId) {
            router.replace("/profiles");
        }
    }, [ready, isLoggedIn, profileId, router]);

    const handleStart = useCallback(async () => {
        if (!profileId || !childProfile) return;
        setIsLoading(true);
        setError("");

        try {
            const profileToken = await enterProfile(profileId);

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
            const tokenRes = await fetch(`${apiUrl}/api/token`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${profileToken}`,
                },
                body: JSON.stringify({}),
            });

            if (!tokenRes.ok) {
                throw new Error("Failed to start voice session");
            }

            const tokenData = await tokenRes.json();
            sessionStorage.setItem(
                "sakhi_session",
                JSON.stringify({
                    token: tokenData.token,
                    livekit_url: tokenData.livekit_url,
                    room_name: tokenData.room_name,
                    child_name: childProfile.display_name,
                })
            );
            router.push("/agent");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Something went wrong";
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    }, [profileId, childProfile, enterProfile, router]);

    if (!ready || !childProfile) {
        return <LoadingSpinner />;
    }

    return (
        <MobileShell bg="default" className="flex flex-col items-center justify-center px-6">
            {/* Sparkle decorations */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {Array.from({ length: 8 }).map((_, i) => (
                    <span
                        key={i}
                        className="sparkle"
                        style={{
                            left: `${20 + Math.random() * 60}%`,
                            top: `${10 + Math.random() * 40}%`,
                            animationDelay: `${Math.random() * 4}s`,
                            animationDuration: `${3 + Math.random() * 3}s`,
                            width: `${4 + Math.random() * 5}px`,
                            height: `${4 + Math.random() * 5}px`,
                            background: [
                                "var(--color-sakhi-purple-light)",
                                "var(--color-sakhi-pink)",
                                "var(--color-sakhi-sky)",
                            ][Math.floor(Math.random() * 3)],
                        }}
                    />
                ))}
            </div>

            {/* Back button */}
            <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => router.push("/profiles")}
                className="back-btn absolute top-6 left-6 z-20"
            >
                <ArrowLeft className="h-4 w-4" />
                Back
            </motion.button>

            {/* Penguin mascot */}
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
                <Image
                    src="/sakhi-penguin.png"
                    alt="Sakhi"
                    width={220}
                    height={220}
                    className="penguin-pop"
                    priority
                />
            </motion.div>

            {/* Greeting */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8 text-center"
            >
                <h1 className="text-pop text-3xl font-[900] text-sakhi-text">
                    Hi {childProfile.display_name}!
                </h1>
                <p className="mt-2 text-base font-[600] text-sakhi-muted">
                    Sakhi is waiting for you
                </p>
            </motion.div>

            {/* Error */}
            {error && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 rounded-2xl bg-red-50 px-5 py-3 text-center text-sm font-[600] text-red-500"
                >
                    {error}
                </motion.p>
            )}

            {/* Start button */}
            <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                onClick={handleStart}
                disabled={isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="sakhi-btn-primary btn-pop mt-10 flex w-full max-w-xs items-center justify-center gap-3 px-8 py-4 text-lg disabled:opacity-60"
            >
                {isLoading ? (
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="h-6 w-6 rounded-full border-3 border-white/30 border-t-white"
                    />
                ) : (
                    <>
                        Start talking to Sakhi
                        <Sparkles className="h-5 w-5" />
                    </>
                )}
            </motion.button>
        </MobileShell>
    );
}

export default function ChildEntryPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <ChildEntryContent />
        </Suspense>
    );
}
