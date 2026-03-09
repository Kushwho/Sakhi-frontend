"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Mail, Lock, Eye, EyeOff, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type Mode = "login" | "signup";

function FloatingSparkles() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {Array.from({ length: 15 }).map((_, i) => (
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

export default function LoginPage() {
    const router = useRouter();
    const { login, signup } = useAuth();

    const [mode, setMode] = useState<Mode>("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [familyName, setFamilyName] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            if (mode === "signup") {
                await signup(email, password, familyName);
                // New signup → go to the setup page to add first child
                router.push("/setup");
            } else {
                await login(email, password);
                // Existing family → go to profile picker
                router.push("/profiles");
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Something went wrong";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setMode((m) => (m === "login" ? "signup" : "login"));
        setError("");
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
                    {mode === "login"
                        ? "Welcome back! Sign in to continue 🎉"
                        : "Create your family account ✨"}
                </p>
            </motion.div>

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="glass-card relative z-10 w-full max-w-md rounded-3xl p-8 shadow-2xl"
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Family Name – signup only */}
                    <AnimatePresence>
                        {mode === "signup" && (
                            <motion.div
                                key="family-name"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <label
                                    htmlFor="family-name"
                                    className="mb-2 block text-sm font-[700] text-sakhi-muted"
                                >
                                    Family Name
                                </label>
                                <div className="relative">
                                    <Users className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-sakhi-muted/60" />
                                    <input
                                        id="family-name"
                                        type="text"
                                        required={mode === "signup"}
                                        placeholder="e.g. The Sharma Family"
                                        value={familyName}
                                        onChange={(e) => setFamilyName(e.target.value)}
                                        className="auth-input py-4 pr-5 pl-12"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Email */}
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-[700] text-sakhi-muted"
                        >
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-sakhi-muted/60" />
                            <input
                                id="email"
                                type="email"
                                required
                                placeholder="hello@family.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="auth-input py-4 pr-5 pl-12"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label
                            htmlFor="password"
                            className="mb-2 block text-sm font-[700] text-sakhi-muted"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-sakhi-muted/60" />
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="rounded-xl bg-red-500/10 px-4 py-3 text-center text-sm font-[600] text-red-400"
                            >
                                {error}
                            </motion.p>
                        )}
                    </AnimatePresence>

                    {/* Submit */}
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
                        ) : mode === "login" ? (
                            "Sign In"
                        ) : (
                            "Create Account"
                        )}
                    </motion.button>
                </form>

                {/* Toggle */}
                <p className="mt-6 text-center text-sm font-[600] text-sakhi-muted">
                    {mode === "login" ? (
                        <>
                            Don&apos;t have an account?{" "}
                            <button
                                onClick={toggleMode}
                                className="font-[800] text-sakhi-purple transition-colors hover:text-sakhi-pink"
                            >
                                Sign Up
                            </button>
                        </>
                    ) : (
                        <>
                            Already have an account?{" "}
                            <button
                                onClick={toggleMode}
                                className="font-[800] text-sakhi-purple transition-colors hover:text-sakhi-pink"
                            >
                                Sign In
                            </button>
                        </>
                    )}
                </p>
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
