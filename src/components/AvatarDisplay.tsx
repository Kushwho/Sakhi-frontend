"use client";

import { motion, AnimatePresence } from "framer-motion";

interface AvatarDisplayProps {
    expression: string;
    childName: string;
}

const EXPRESSION_CONFIG: Record<
    string,
    { emoji: string; color: string; label: string; bgGlow: string }
> = {
    happy: {
        emoji: "😊",
        color: "text-sakhi-yellow",
        label: "Happy",
        bgGlow: "shadow-[0_0_80px_rgba(255,217,61,0.3)]",
    },
    thinking: {
        emoji: "🤔",
        color: "text-sakhi-sky",
        label: "Thinking...",
        bgGlow: "shadow-[0_0_80px_rgba(135,206,235,0.3)]",
    },
    excited: {
        emoji: "🤩",
        color: "text-sakhi-pink",
        label: "Excited!",
        bgGlow: "shadow-[0_0_80px_rgba(255,143,171,0.3)]",
    },
    concerned: {
        emoji: "😟",
        color: "text-sakhi-purple",
        label: "Concerned",
        bgGlow: "shadow-[0_0_80px_rgba(192,132,252,0.3)]",
    },
    sad: {
        emoji: "😢",
        color: "text-sakhi-sky",
        label: "Sad",
        bgGlow: "shadow-[0_0_80px_rgba(135,206,235,0.3)]",
    },
    celebrating: {
        emoji: "🎉",
        color: "text-sakhi-yellow",
        label: "Celebrating!",
        bgGlow: "shadow-[0_0_80px_rgba(255,217,61,0.3)]",
    },
};

export function AvatarDisplay({ expression, childName }: AvatarDisplayProps) {
    const config = EXPRESSION_CONFIG[expression] ?? EXPRESSION_CONFIG.happy;

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Avatar circle */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={expression}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`glass-card flex h-40 w-40 items-center justify-center rounded-full sm:h-52 sm:w-52 md:h-64 md:w-64 ${config.bgGlow}`}
                >
                    <motion.span
                        animate={{
                            scale: [1, 1.1, 1],
                            rotate: expression === "celebrating" ? [0, -10, 10, -5, 0] : 0,
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: expression === "celebrating" ? 0.6 : 2,
                            ease: "easeInOut",
                        }}
                        className="text-7xl sm:text-8xl md:text-9xl select-none"
                    >
                        {config.emoji}
                    </motion.span>
                </motion.div>
            </AnimatePresence>

            {/* Expression label */}
            <motion.div
                key={`label-${expression}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-1"
            >
                <span className={`text-lg font-[800] ${config.color}`}>
                    {config.label}
                </span>
                <span className="text-sm font-[600] text-sakhi-muted">
                    Hi {childName}! I&apos;m Sakhi ✨
                </span>
            </motion.div>
        </div>
    );
}
