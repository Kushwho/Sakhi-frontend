"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { MobileShell } from "@/components/ui/MobileShell";
import Image from "next/image";

type Mode = "login" | "signup";

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
                router.push("/setup");
            } else {
                await login(email, password);
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
        <MobileShell bg="default" className="flex flex-col">
            {/* ── Top Section: Title + Penguin ── */}
            <div className="relative flex-shrink-0 px-6 pt-10 pb-4">
                {/* Decorative clouds */}
                <div className="pointer-events-none absolute top-8 right-6 opacity-30">
                    <div className="cloud-shape h-12 w-20" />
                </div>
                <div className="pointer-events-none absolute top-16 right-16 opacity-20">
                    <div className="cloud-shape h-8 w-14" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    <h1 className="text-pop text-3xl font-[900] text-sakhi-text leading-tight">
                        {mode === "signup" ? "Join the\nAdventure" : "Welcome\nBack!"}
                    </h1>
                    <p className="mt-2 text-base font-[600] text-sakhi-muted">
                        {mode === "signup"
                            ? "Create an account for your child"
                            : "Sign in to continue the fun"}
                    </p>
                </motion.div>

                {/* Penguin mascot */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex justify-center mt-4 -mb-8 relative z-10"
                >
                    <Image
                        src="/sakhi-penguin.png"
                        alt="Sakhi Penguin"
                        width={150}
                        height={150}
                        className="penguin-pop"
                        priority
                    />
                </motion.div>
            </div>

            {/* ── Bottom Section: White Card with Form ── */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex-1 bg-white/90 backdrop-blur-sm rounded-t-[2rem] px-6 pt-10 pb-8 shadow-[0_-4px_32px_rgba(0,0,0,0.06)]"
            >
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                                <div className="relative">
                                    <Users className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-sakhi-muted/50" />
                                    <input
                                        id="family-name"
                                        type="text"
                                        required={mode === "signup"}
                                        placeholder="Family Name"
                                        value={familyName}
                                        onChange={(e) => setFamilyName(e.target.value)}
                                        className="auth-input py-4 pr-5 pl-12"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Email */}
                    <div className="relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-sakhi-muted/50" />
                        <input
                            id="email"
                            type="email"
                            required
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="auth-input py-4 pr-5 pl-12"
                        />
                    </div>

                    {/* Password */}
                    <div className="relative">
                        <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-sakhi-muted/50" />
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="auth-input py-4 pl-12 pr-12"
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

                    {/* Error */}
                    <AnimatePresence>
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="rounded-2xl bg-red-50 px-4 py-3 text-center text-sm font-[600] text-red-500"
                            >
                                {error}
                            </motion.p>
                        )}
                    </AnimatePresence>

                    {/* Submit */}
                    <motion.button
                        type="submit"
                        disabled={isLoading}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        className="sakhi-btn-primary btn-pop flex w-full items-center justify-center gap-3 px-6 py-4 text-lg disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isLoading ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                className="h-6 w-6 rounded-full border-3 border-white/30 border-t-white"
                            />
                        ) : (
                            <>
                                {mode === "login" ? "Sign In" : "Create Account"}
                                <ArrowRight className="h-5 w-5" />
                            </>
                        )}
                    </motion.button>
                </form>

                {/* Divider */}
                <div className="my-5 flex items-center gap-3">
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="text-xs font-[700] text-sakhi-muted uppercase">or</span>
                    <div className="h-px flex-1 bg-gray-200" />
                </div>

                {/* Toggle */}
                <p className="text-center text-sm font-[600] text-sakhi-muted">
                    {mode === "login" ? (
                        <>
                            Don&apos;t have an account?{" "}
                            <button
                                onClick={toggleMode}
                                className="font-[800] text-sakhi-purple transition-colors hover:text-sakhi-purple-dark"
                            >
                                Sign Up
                            </button>
                        </>
                    ) : (
                        <>
                            Already have an account?{" "}
                            <button
                                onClick={toggleMode}
                                className="font-[800] text-sakhi-purple transition-colors hover:text-sakhi-purple-dark"
                            >
                                Sign In
                            </button>
                        </>
                    )}
                </p>
            </motion.div>
        </MobileShell>
    );
}
