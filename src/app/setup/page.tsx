"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Rocket } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

function FloatingSparkles() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
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

export default function SetupPage() {
    const router = useRouter();
    const { isLoggedIn, ready, createChildProfile, clearNewSignup } = useAuth();
    const [childName, setChildName] = useState("");
    const [childAge, setChildAge] = useState(8);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Guard: redirect if not logged in
    if (ready && !isLoggedIn) {
        router.replace("/login");
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!childName.trim()) {
            setError("Please enter your child's name");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            await createChildProfile(childName.trim(), childAge);
            clearNewSignup();
            router.push("/profiles");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Something went wrong";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="sakhi-bg-gradient relative flex min-h-dvh flex-col items-center justify-center px-4 py-8">
            <FloatingSparkles />

            {/* Logo / Title */}
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 mb-8 text-center"
            >
                <div className="mb-3 flex items-center justify-center gap-2">
                    <Sparkles className="h-8 w-8 text-sakhi-yellow" />
                    <h1 className="text-5xl font-[900] tracking-tight sm:text-6xl">
                        <span className="bg-gradient-to-r from-sakhi-pink via-sakhi-purple to-sakhi-sky bg-clip-text text-transparent">
                            Sakhi
                        </span>
                    </h1>
                    <Sparkles className="h-8 w-8 text-sakhi-yellow" />
                </div>
                <p className="text-lg font-[600] text-sakhi-muted sm:text-xl">
                    Let&apos;s set up your child&apos;s profile! 🚀
                </p>
            </motion.div>

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="glass-card relative z-10 w-full max-w-md rounded-3xl p-8 shadow-2xl"
            >
                <h2 className="mb-6 text-center text-2xl font-[800] text-sakhi-text">
                    Tell us about your child! ✨
                </h2>

                <form onSubmit={handleSubmit}>
                    {/* Name field */}
                    <div className="mb-5">
                        <label
                            htmlFor="child-name"
                            className="mb-2 block text-sm font-[700] text-sakhi-muted"
                        >
                            Child&apos;s Name
                        </label>
                        <input
                            id="child-name"
                            type="text"
                            placeholder="Type your child's name here!"
                            value={childName}
                            onChange={(e) => setChildName(e.target.value)}
                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-lg font-[600] text-sakhi-text placeholder:text-sakhi-muted/50 outline-none transition-all focus:border-sakhi-purple focus:ring-2 focus:ring-sakhi-purple/30"
                        />
                    </div>

                    {/* Age field */}
                    <div className="mb-7">
                        <label
                            htmlFor="child-age"
                            className="mb-2 block text-sm font-[700] text-sakhi-muted"
                        >
                            Child&apos;s Age
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                id="child-age"
                                type="range"
                                min={3}
                                max={15}
                                value={childAge}
                                onChange={(e) => setChildAge(Number(e.target.value))}
                                className="h-3 flex-1 cursor-pointer appearance-none rounded-full bg-white/10 accent-sakhi-pink"
                            />
                            <motion.span
                                key={childAge}
                                initial={{ scale: 1.4 }}
                                animate={{ scale: 1 }}
                                className="min-w-[3rem] rounded-xl bg-sakhi-pink/20 px-3 py-1.5 text-center text-xl font-[800] text-sakhi-pink"
                            >
                                {childAge}
                            </motion.span>
                        </div>
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-center text-sm font-[600] text-red-400"
                            >
                                {error}
                            </motion.p>
                        )}
                    </AnimatePresence>

                    {/* Submit button */}
                    <motion.button
                        type="submit"
                        disabled={isLoading}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-sakhi-pink via-sakhi-purple to-sakhi-sky px-6 py-4 text-xl font-[800] text-white shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isLoading ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                className="h-6 w-6 rounded-full border-3 border-white/30 border-t-white"
                            />
                        ) : (
                            <>
                                <Rocket className="h-6 w-6 transition-transform group-hover:-rotate-12" />
                                Let&apos;s Go!
                            </>
                        )}
                    </motion.button>
                </form>
            </motion.div>

            {/* Footer */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="relative z-10 mt-6 text-center text-sm font-[600] text-sakhi-muted/60"
            >
                Made with 💖 for curious minds
            </motion.p>
        </main>
    );
}
