"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { MobileShell } from "@/components/ui/MobileShell";

/**
 * Root page – acts as a smart redirector:
 * • Not logged in → /login
 * • Logged in + first signup → /setup
 * • Logged in → /profiles
 */
export default function RootPage() {
    const router = useRouter();
    const { ready, isLoggedIn, isNewSignup } = useAuth();

    useEffect(() => {
        if (!ready) return;

        if (!isLoggedIn) {
            router.replace("/login");
        } else if (isNewSignup) {
            router.replace("/setup");
        } else {
            router.replace("/profiles");
        }
    }, [ready, isLoggedIn, isNewSignup, router]);

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
