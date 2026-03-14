"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User, Calendar, ArrowRight, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { MobileShell } from "@/components/ui/MobileShell";
import Image from "next/image";

export default function SetupPage() {
    const router = useRouter();
    const { createChildProfile } = useAuth();

    const [childName, setChildName] = useState("");
    const [childAge, setChildAge] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!childName.trim()) {
            setError("Please enter your child's name");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            await createChildProfile(childName.trim(), parseInt(childAge) || 5);
            router.push("/profiles");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Something went wrong";
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <MobileShell bg="default" className="flex flex-col">
            {/* ── Top section ── */}
            <div className="flex-shrink-0 px-6 pt-6 pb-4">
                {/* Back button */}
                <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => router.back()}
                    className="back-btn mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </motion.button>

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-pop text-3xl font-[900] text-sakhi-text leading-tight">
                        Add a Child
                    </h1>
                    <p className="mt-2 text-sm font-[600] text-sakhi-muted">
                        Tell us about your little one so Sakhi can be a great friend!
                    </p>
                </motion.div>

                {/* Penguin */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex justify-end mt-2 -mb-8 relative z-10"
                >
                    <Image
                        src="/sakhi-penguin.png"
                        alt="Sakhi"
                        width={140}
                        height={140}
                        className="penguin-pop"
                        priority
                    />
                </motion.div>
            </div>

            {/* ── White card ── */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex-1 bg-white/90 backdrop-blur-sm rounded-t-[2rem] px-6 pt-10 pb-8 shadow-[0_-4px_32px_rgba(0,0,0,0.06)]"
            >
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Child name */}
                    <div className="relative">
                        <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-sakhi-muted/50" />
                        <input
                            type="text"
                            placeholder="Child's Name"
                            value={childName}
                            onChange={(e) => setChildName(e.target.value)}
                            className="auth-input py-4 pr-5 pl-12"
                            required
                        />
                    </div>

                    {/* Child age */}
                    <div className="relative">
                        <Calendar className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-sakhi-muted/50" />
                        <input
                            type="number"
                            placeholder="Age (optional)"
                            min="1"
                            max="18"
                            value={childAge}
                            onChange={(e) => setChildAge(e.target.value)}
                            className="auth-input py-4 pr-5 pl-12"
                        />
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
                        className="sakhi-btn-primary btn-pop flex w-full items-center justify-center gap-3 px-6 py-4 text-lg disabled:opacity-60 mt-2"
                    >
                        {isLoading ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                className="h-6 w-6 rounded-full border-3 border-white/30 border-t-white"
                            />
                        ) : (
                            <>
                                Continue
                                <ArrowRight className="h-5 w-5" />
                            </>
                        )}
                    </motion.button>
                </form>

                {/* Skip note */}
                <p className="mt-6 text-center text-xs font-[600] text-sakhi-muted">
                    You can always add more children later from the profiles page
                </p>
            </motion.div>
        </MobileShell>
    );
}
