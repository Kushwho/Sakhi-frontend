"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    LiveKitRoom,
    RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { BigMic } from "@/components/BigMic";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Sparkles } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

interface StorySessionData {
    token: string;
    livekit_url: string;
    room_name: string;
    story_title: string;
    story_genre: string;
    child_name: string;
}

/* ------------------------------------------------------------------ */
/*  Story Book Display — replaces AvatarDisplay from voice mode       */
/* ------------------------------------------------------------------ */

function StoryBookDisplay({
    storyTitle,
    storyGenre,
}: {
    storyTitle: string;
    storyGenre: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col items-center"
        >
            {/* Floating book */}
            <div className="book-float story-glow relative flex h-48 w-40 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-sakhi-purple/80 to-sakhi-sky/60 p-6 shadow-2xl sm:h-56 sm:w-48">
                {/* Spine line */}
                <div className="absolute left-3 top-4 bottom-4 w-0.5 rounded bg-white/20" />

                {/* Book icon */}
                <BookOpen className="mb-3 h-12 w-12 text-white/90 drop-shadow-lg sm:h-14 sm:w-14" />

                {/* Genre badge */}
                <span className="mb-1 rounded-full bg-white/15 px-3 py-0.5 text-xs font-[700] uppercase tracking-wider text-white/80 backdrop-blur">
                    {storyGenre}
                </span>

                {/* Page shimmer */}
                <div className="page-shimmer pointer-events-none absolute inset-0 rounded-2xl" />
            </div>

            {/* Title below the book */}
            <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-5 max-w-xs text-center text-xl font-[800] leading-snug text-sakhi-text sm:text-2xl"
            >
                {storyTitle}
            </motion.h2>

            {/* Listening indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-3 flex items-center gap-2 text-sm font-[600] text-sakhi-muted"
            >
                <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sakhi-green opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sakhi-green" />
                </span>
                Sakhi is narrating...
            </motion.div>
        </motion.div>
    );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                         */
/* ------------------------------------------------------------------ */

export default function StorySessionPage() {
    const router = useRouter();
    const [session, setSession] = useState<StorySessionData | null>(null);

    useEffect(() => {
        const raw = sessionStorage.getItem("sakhi_story_session");
        if (!raw) {
            router.replace("/story");
            return;
        }
        try {
            setSession(JSON.parse(raw));
        } catch {
            router.replace("/story");
        }
    }, [router]);

    const handleEnd = () => {
        sessionStorage.removeItem("sakhi_story_session");
        router.replace("/story");
    };

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

            {/* Top bar */}
            <header className="relative z-20 flex items-center justify-between px-5 pt-5 sm:px-8 sm:pt-6">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleEnd}
                    className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-[700] text-sakhi-muted backdrop-blur transition-colors hover:bg-white/10 hover:text-sakhi-text"
                >
                    <ArrowLeft className="h-4 w-4" />
                    End Story
                </motion.button>

                <div className="hidden items-center gap-2 text-sm font-[700] text-sakhi-muted sm:flex">
                    <Sparkles className="h-4 w-4 text-sakhi-yellow" />
                    <span>Reading to {session.child_name}</span>
                </div>
            </header>

            {/* Main content – Book Display + Mic */}
            <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-4 pb-8">
                {/* Story book visual */}
                <StoryBookDisplay
                    storyTitle={session.story_title}
                    storyGenre={session.story_genre}
                />

                {/* Mic for child interaction */}
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
