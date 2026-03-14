"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    BookOpen,
    RefreshCw,
    Play,
    Sparkles,
    TreePine,
    Swords,
    Crown,
    Cat,
    Heart,
    Flame,
} from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import { fetchRandomStory, fetchStoryToken, type Story } from "@/lib/api";

/* ------------------------------------------------------------------ */
/*  Genre data                                                        */
/* ------------------------------------------------------------------ */

const GENRES = [
    { id: "adventure",  label: "Adventure",  icon: Swords,   gradient: "from-sakhi-pink to-red-500" },
    { id: "fable",      label: "Fable",      icon: TreePine, gradient: "from-sakhi-green to-emerald-600" },
    { id: "animal",     label: "Animals",    icon: Cat,      gradient: "from-sakhi-yellow to-orange-500" },
    { id: "fantasy",    label: "Fantasy",    icon: Crown,    gradient: "from-sakhi-purple to-violet-600" },
    { id: "mythology",  label: "Mythology",  icon: Flame,    gradient: "from-sakhi-sky to-blue-600" },
    { id: "moral",      label: "Moral",      icon: Heart,    gradient: "from-sakhi-pink-light to-sakhi-pink" },
];

/* ------------------------------------------------------------------ */
/*  Floating sparkles (shared pattern)                                */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Phase 1: Genre Picker                                             */
/* ------------------------------------------------------------------ */

function GenrePicker({ onPick }: { onPick: (genre: string) => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative z-10 flex flex-col items-center"
        >
            <div className="mb-2 flex items-center justify-center gap-2">
                <BookOpen className="h-7 w-7 text-sakhi-yellow" />
                <h1 className="text-3xl font-[900] tracking-tight sm:text-4xl">
                    <span className="bg-gradient-to-r from-sakhi-pink via-sakhi-purple to-sakhi-sky bg-clip-text text-transparent">
                        Story Time!
                    </span>
                </h1>
                <BookOpen className="h-7 w-7 text-sakhi-yellow" />
            </div>
            <p className="mb-8 text-base font-[600] text-sakhi-muted sm:text-lg">
                What kind of story do you want to hear?
            </p>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
                {GENRES.map((g, i) => {
                    const Icon = g.icon;
                    return (
                        <motion.button
                            key={g.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.07 }}
                            whileHover={{ scale: 1.08, y: -4 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onPick(g.id)}
                            className={`group flex flex-col items-center gap-3 rounded-3xl bg-gradient-to-br ${g.gradient} p-6 shadow-lg transition-shadow hover:shadow-xl hover:shadow-sakhi-purple/20 sm:p-8`}
                        >
                            <Icon className="h-10 w-10 text-white drop-shadow-md sm:h-12 sm:w-12" />
                            <span className="text-base font-[800] text-white sm:text-lg">
                                {g.label}
                            </span>
                        </motion.button>
                    );
                })}
            </div>
        </motion.div>
    );
}

/* ------------------------------------------------------------------ */
/*  Phase 2: Story Preview                                            */
/* ------------------------------------------------------------------ */

function StoryPreview({
    story,
    genre,
    isLoading,
    isStarting,
    onTryAnother,
    onConfirm,
    onBack,
}: {
    story: Story;
    genre: string;
    isLoading: boolean;
    isStarting: boolean;
    onTryAnother: () => void;
    onConfirm: () => void;
    onBack: () => void;
}) {
    const genreData = GENRES.find((g) => g.id === genre);
    const GenreIcon = genreData?.icon || BookOpen;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative z-10 flex flex-col items-center"
        >
            {/* Back to genres */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className="mb-6 flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm font-[700] text-sakhi-muted backdrop-blur transition-colors hover:bg-white/10 hover:text-sakhi-text"
            >
                <ArrowLeft className="h-4 w-4" />
                Pick another genre
            </motion.button>

            {/* Book card */}
            <motion.div
                className="book-float glass-card story-glow relative w-full max-w-sm rounded-3xl p-8 text-center sm:max-w-md sm:p-10"
            >
                {/* Shimmer overlay */}
                <div className="page-shimmer pointer-events-none absolute inset-0 rounded-3xl" />

                <div className={`mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${genreData?.gradient || "from-sakhi-purple to-sakhi-pink"}`}>
                    <GenreIcon className="h-10 w-10 text-white" />
                </div>

                <p className="mb-2 text-sm font-[700] uppercase tracking-wider text-sakhi-muted">
                    {genreData?.label || genre} Story
                </p>

                <h2 className="mb-4 text-2xl font-[900] leading-tight text-sakhi-text sm:text-3xl">
                    {story.title}
                </h2>

                <p className="mb-6 text-sm font-[600] text-sakhi-muted">
                    {story.total_segments} parts · Ages {story.age_min}–{story.age_max}
                </p>

                {/* Actions */}
                <div className="flex flex-col gap-3 sm:flex-row">
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={onTryAnother}
                        disabled={isLoading || isStarting}
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 px-5 py-3.5 text-sm font-[700] text-sakhi-muted transition-colors hover:bg-white/5 hover:text-sakhi-text disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                        Try Another
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={onConfirm}
                        disabled={isLoading || isStarting}
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sakhi-pink via-sakhi-purple to-sakhi-sky px-5 py-3.5 text-sm font-[800] text-white shadow-lg disabled:opacity-50"
                    >
                        {isStarting ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
                            />
                        ) : (
                            <>
                                <Play className="h-4 w-4" />
                                Listen to This!
                            </>
                        )}
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                         */
/* ------------------------------------------------------------------ */

export default function StoryPage() {
    const router = useRouter();
    const { activeProfile, profileToken } = useProfile();

    const [phase, setPhase] = useState<"genre" | "preview">("genre");
    const [selectedGenre, setSelectedGenre] = useState("");
    const [story, setStory] = useState<Story | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [error, setError] = useState("");

    // Guard: must have an active child profile
    if (!activeProfile || !profileToken) {
        router.replace("/profiles");
        return null;
    }

    /* ---- Genre selected → fetch random story ---- */
    const handleGenrePick = useCallback(
        async (genre: string) => {
            setSelectedGenre(genre);
            setIsLoading(true);
            setError("");
            try {
                const s = await fetchRandomStory(genre, profileToken!);
                if (!s) {
                    setError("No stories found for this genre yet. Try another!");
                    return;
                }
                setStory(s);
                setPhase("preview");
            } catch (err) {
                const msg = err instanceof Error ? err.message : "Something went wrong";
                setError(msg);
            } finally {
                setIsLoading(false);
            }
        },
        [profileToken]
    );

    /* ---- Try another random story ---- */
    const handleTryAnother = useCallback(async () => {
        setIsLoading(true);
        setError("");
        try {
            const s = await fetchRandomStory(selectedGenre, profileToken!);
            if (!s) {
                setError("No more stories found for this genre.");
                return;
            }
            setStory(s);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Something went wrong";
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    }, [selectedGenre, profileToken]);

    /* ---- Confirm → get LiveKit token → go to session ---- */
    const handleConfirm = useCallback(async () => {
        if (!story) return;
        setIsStarting(true);
        setError("");
        try {
            const tokenData = await fetchStoryToken(story.id, profileToken!);
            sessionStorage.setItem(
                "sakhi_story_session",
                JSON.stringify({
                    token: tokenData.token,
                    livekit_url: tokenData.livekit_url,
                    room_name: tokenData.room_name,
                    story_title: story.title,
                    story_genre: story.genre,
                    child_name: activeProfile!.display_name,
                })
            );
            router.push("/story/session");
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Something went wrong";
            setError(msg);
            setIsStarting(false);
        }
    }, [story, profileToken, activeProfile, router]);

    /* ---- Reset to genre picker ---- */
    const handleBackToGenres = () => {
        setPhase("genre");
        setStory(null);
        setError("");
    };

    return (
        <main className="sakhi-bg-gradient relative flex min-h-dvh flex-col items-center justify-center px-4 py-12">
            <FloatingSparkles />

            {/* Back to profiles */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.replace("/profiles")}
                className="absolute left-5 top-5 z-20 flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-[700] text-sakhi-muted backdrop-blur transition-colors hover:bg-white/10 hover:text-sakhi-text sm:left-8 sm:top-6"
            >
                <ArrowLeft className="h-4 w-4" />
                Back
            </motion.button>

            {/* Loading overlay for genre pick */}
            {isLoading && phase === "genre" && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="h-12 w-12 rounded-full border-4 border-sakhi-purple/30 border-t-sakhi-purple"
                    />
                </div>
            )}

            {/* Phases */}
            <AnimatePresence mode="wait">
                {phase === "genre" && <GenrePicker key="genre" onPick={handleGenrePick} />}
                {phase === "preview" && story && (
                    <StoryPreview
                        key="preview"
                        story={story}
                        genre={selectedGenre}
                        isLoading={isLoading}
                        isStarting={isStarting}
                        onTryAnother={handleTryAnother}
                        onConfirm={handleConfirm}
                        onBack={handleBackToGenres}
                    />
                )}
            </AnimatePresence>

            {/* Error */}
            <AnimatePresence>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="relative z-10 mt-6 rounded-xl bg-red-500/10 px-5 py-3 text-center text-sm font-[600] text-red-400"
                    >
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>

            {/* Footer */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="relative z-10 mt-8 text-center text-sm font-[600] text-sakhi-muted/60"
            >
                <Sparkles className="mr-1 inline h-4 w-4 text-sakhi-yellow" />
                Sakhi Story Time
            </motion.p>
        </main>
    );
}
