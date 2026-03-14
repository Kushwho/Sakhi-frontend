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
import { X, Moon, Sun } from "lucide-react";
import { MobileShell } from "@/components/ui/MobileShell";
import Image from "next/image";

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
    const [zenMode, setZenMode] = useState(false);

    useEffect(() => {
        const raw = sessionStorage.getItem("sakhi_session");
        if (!raw) {
            router.replace("/profiles");
            return;
        }
        try {
            setSession(JSON.parse(raw));
        } catch {
            router.replace("/profiles");
        }
    }, [router]);

    if (!session) {
        return (
            <MobileShell className="flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="h-12 w-12 rounded-full border-4 border-sakhi-purple/30 border-t-sakhi-purple"
                />
            </MobileShell>
        );
    }

    return (
        <LiveKitRoom
            serverUrl={session.livekit_url}
            token={session.token}
            connect={true}
            audio={true}
            className="h-full w-full"
        >
            {/* Invisible audio renderer */}
            <RoomAudioRenderer />

            {/* RPC listener */}
            <AvatarController onExpressionChange={setExpression} />

            <MobileShell bg="default" className={`flex flex-col relative overflow-hidden ${zenMode ? "zen-mode" : ""}`}>
                {/* ── Top bar ── */}
                <header className="relative z-20 flex items-center justify-between px-4 pt-4">
                    {/* Child name pill */}
                    <div className="flex items-center gap-2 rounded-full bg-white/80 backdrop-blur px-3 py-1.5 shadow-sm border border-gray-100">
                        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-sakhi-pink to-sakhi-purple flex items-center justify-center">
                            <Image
                                src="/sakhi-penguin.png"
                                alt=""
                                width={16}
                                height={16}
                            />
                        </div>
                        <span className="text-sm font-[700] text-sakhi-text">
                            {session.child_name}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Zen mode toggle */}
                        <motion.button
                            onClick={() => setZenMode(!zenMode)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`flex h-8 w-8 items-center justify-center rounded-full shadow-sm border transition-all ${
                                zenMode
                                    ? "bg-gray-700 border-gray-600 text-white"
                                    : "bg-white/80 backdrop-blur border-gray-100 text-sakhi-muted hover:text-sakhi-text"
                            }`}
                            aria-label={zenMode ? "Exit Zen Mode" : "Enter Zen Mode"}
                            title={zenMode ? "Exit Zen Mode" : "Zen Mode (No Distractions)"}
                        >
                            {zenMode ? (
                                <Sun className="h-4 w-4" />
                            ) : (
                                <Moon className="h-4 w-4" />
                            )}
                        </motion.button>

                        {/* Chat badge */}
                        <div className="rounded-full bg-sakhi-purple px-3 py-1 text-xs font-[800] text-white uppercase tracking-wide">
                            Chat
                        </div>
                        {/* Close */}
                        <button
                            onClick={() => {
                                sessionStorage.removeItem("sakhi_session");
                                router.replace("/profiles");
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur shadow-sm border border-gray-100 text-sakhi-muted hover:text-sakhi-text transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </header>

                {/* ── Main content ── */}
                <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-4 px-4 pb-4">
                    {/* Avatar */}
                    <AvatarDisplay expression={expression} childName={session.child_name} />

                    {/* Mic + controls at the bottom */}
                    <BigMic />
                </div>

                {/* Sparkle decorations */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <span
                            key={i}
                            className="sparkle"
                            style={{
                                left: `${20 + Math.random() * 60}%`,
                                top: `${15 + Math.random() * 50}%`,
                                animationDelay: `${Math.random() * 4}s`,
                                animationDuration: `${3 + Math.random() * 3}s`,
                                width: `${4 + Math.random() * 4}px`,
                                height: `${4 + Math.random() * 4}px`,
                                background: "var(--color-sakhi-purple-light)",
                            }}
                        />
                    ))}
                </div>
            </MobileShell>
        </LiveKitRoom>
    );
}

