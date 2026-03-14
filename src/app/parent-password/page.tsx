"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, ArrowLeft, Lock, Shield, Globe } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
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

function ParentPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const profileId = searchParams.get("profileId");

    const { isLoggedIn, ready, profiles } = useAuth();
    const { enterProfile } = useProfile();

    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const parentProfile = profiles.find(
        (p) => p.id === profileId && p.type === "parent"
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

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            if (!profileId || !password.trim()) {
                setError("Password is required");
                return;
            }

            setIsLoading(true);
            setError("");

            try {
                await enterProfile(profileId, password);
                router.push("/dashboard");
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : "Incorrect password";
                setError(msg);
            } finally {
                setIsLoading(false);
            }
        },
        [profileId, password, enterProfile, router]
    );

    if (!ready || !parentProfile) {
        return <LoadingSpinner />;
    }

    return (
        <MobileShell bg="blue" className="flex flex-col">
            {/* ── Top: Penguin ── */}
            <div className="flex flex-col items-center pt-12 pb-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                    <Image
                        src="/sakhi-penguin.png"
                        alt="Sakhi"
                        width={180}
                        height={180}
                        className="penguin-pop"
                        priority
                    />
                </motion.div>
            </div>

            {/* ── Bottom: White card ── */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex-1 bg-white rounded-t-[2rem] px-6 pt-8 pb-8 shadow-[0_-4px_32px_rgba(0,0,0,0.06)] flex flex-col"
            >
                {/* Title */}
                <div className="text-center mb-6">
                    <h1 className="text-pop text-2xl font-[900] text-sakhi-text">
                        Parent zone 🔒
                    </h1>
                    <p className="mt-2 text-sm font-[600] text-sakhi-muted">
                        Enter your password to continue
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Password */}
                    <div className="relative">
                        <input
                            autoFocus
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError("");
                            }}
                            className="auth-input py-4 px-5 pr-12 text-center text-lg tracking-widest"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-sakhi-muted/50 transition-colors hover:text-sakhi-text"
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>

                    {/* Forgot password */}
                    <button
                        type="button"
                        className="text-sm font-[600] text-sakhi-muted hover:text-sakhi-purple transition-colors"
                    >
                        Forgot password?
                    </button>

                    {/* Error */}
                    {error && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="rounded-2xl bg-red-50 px-4 py-3 text-center text-sm font-[600] text-red-500"
                        >
                            {error}
                        </motion.p>
                    )}

                    {/* Privacy badges */}
                    <div className="flex flex-col items-center gap-2 py-3 text-xs font-[600] text-sakhi-muted">
                        <span className="flex items-center gap-2">
                            <Lock className="h-3.5 w-3.5" /> Your data is encrypted
                        </span>
                        <span className="flex items-center gap-2">
                            <Shield className="h-3.5 w-3.5" /> Sakhi never shares your data
                        </span>
                        <span className="flex items-center gap-2">
                            <Globe className="h-3.5 w-3.5" /> 🇮🇳 DPDPA compliant
                        </span>
                    </div>

                    {/* Submit */}
                    <motion.button
                        type="submit"
                        disabled={isLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="sakhi-btn-primary btn-pop flex w-full items-center justify-center gap-3 px-6 py-4 text-lg disabled:opacity-60"
                    >
                        {isLoading ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                className="h-6 w-6 rounded-full border-3 border-white/30 border-t-white"
                            />
                        ) : (
                            <>
                                Enter Dashboard
                                <ArrowRight className="h-5 w-5" />
                            </>
                        )}
                    </motion.button>
                </form>

                {/* Back link */}
                <button
                    onClick={() => router.push("/profiles")}
                    className="mt-6 flex items-center justify-center gap-2 text-sm font-[700] text-sakhi-muted hover:text-sakhi-purple transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to profiles
                </button>
            </motion.div>
        </MobileShell>
    );
}

export default function ParentPasswordPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <ParentPasswordContent />
        </Suspense>
    );
}
