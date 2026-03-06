"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    LiveKitRoom,
    RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { AvatarDisplay } from "@/components/AvatarDisplay";
import { BigMic } from "@/components/BigMic";
import { AvatarController } from "@/components/AvatarController";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";

interface SessionData {
    token: string;
    livekit_url: string;
    room_name: string;
    child_name: string;
}

export default function AgentPage() {
    const router = useRouter();
    const [session, setSession] = useState<SessionData | null>(null);
    const [expression, setExpression] = useState("happy");

    useEffect(() => {
        const raw = sessionStorage.getItem("sakhi_session");
        if (!raw) {
            router.replace("/");
            return;
        }
        try {
            setSession(JSON.parse(raw));
        } catch {
            router.replace("/");
        }
    }, [router]);

    if (!session) {
        return (
            <div className="sakhi-bg-gradient flex min-h-dvh items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="h-12 w-12 rounded-full border-4 border-sakhi-purple/30 border-t-sakhi-purple"
                />
            </div>
        );
    }

    return (
        <LiveKitRoom
            serverUrl={session.livekit_url}
            token={session.token}
            connect={true}
            audio={true}
            className="sakhi-bg-gradient relative flex min-h-dvh flex-col"
        >
            {/* Invisible audio renderer – plays the agent's voice */}
            <RoomAudioRenderer />

            {/* RPC listener – updates avatar expression state */}
            <AvatarController onExpressionChange={setExpression} />

            {/* Top bar */}
            <header className="relative z-20 flex items-center justify-between px-5 pt-5 sm:px-8 sm:pt-6">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                        sessionStorage.removeItem("sakhi_session");
                        router.replace("/");
                    }}
                    className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-[700] text-sakhi-muted backdrop-blur transition-colors hover:bg-white/10 hover:text-sakhi-text"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </motion.button>
                <div className="flex items-center gap-2 text-sm font-[700] text-sakhi-muted">
                    <Sparkles className="h-4 w-4 text-sakhi-yellow" />
                    <span>Talking to {session.child_name}</span>
                </div>
            </header>

            {/* Main content – Avatar + Mic */}
            <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-4 pb-8">
                {/* Avatar */}
                <AvatarDisplay expression={expression} childName={session.child_name} />

                {/* Big mic at the bottom */}
                <BigMic />
            </div>

            {/* Floating sparkles background */}
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
        </LiveKitRoom>
    );
}
