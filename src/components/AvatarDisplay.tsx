"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface AvatarDisplayProps {
    expression: string;
    childName: string;
}

const EXPRESSION_CONFIG: Record<
    string,
    { label: string; glow: string }
> = {
    happy: { label: "Happy", glow: "shadow-[0_0_40px_rgba(124,58,237,0.15)]" },
    thinking: { label: "Thinking...", glow: "shadow-[0_0_40px_rgba(135,206,235,0.2)]" },
    excited: { label: "Excited!", glow: "shadow-[0_0_40px_rgba(244,114,182,0.2)]" },
    concerned: { label: "Concerned", glow: "shadow-[0_0_40px_rgba(124,58,237,0.2)]" },
    sad: { label: "Sad", glow: "shadow-[0_0_40px_rgba(135,206,235,0.2)]" },
    celebrating: { label: "Celebrating!", glow: "shadow-[0_0_40px_rgba(252,211,77,0.2)]" },
};

export function AvatarDisplay({ expression, childName }: AvatarDisplayProps) {
    const config = EXPRESSION_CONFIG[expression] ?? EXPRESSION_CONFIG.happy;

    return (
        <div className="flex flex-col items-center gap-2">
            {/* Speech bubble */}
            <motion.div
                key={`bubble-${expression}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative mb-2 rounded-2xl bg-white/90 backdrop-blur px-4 py-3 shadow-md border border-gray-100 max-w-[240px]"
            >
                <p className="text-sm font-[600] text-sakhi-text text-center">
                    Tell me more about your adventure, {childName}!
                </p>
                {/* Bubble tail */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/90 rotate-45 border-r border-b border-gray-100" />
            </motion.div>

            {/* Penguin avatar */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={expression}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`rounded-full ${config.glow}`}
                >
                    <motion.div
                        animate={{
                            y: [0, -6, 0],
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 3,
                            ease: "easeInOut",
                        }}
                    >
                        <Image
                            src="/sakhi-penguin.png"
                            alt="Sakhi"
                            width={240}
                            height={240}
                            className="drop-shadow-xl"
                            priority
                        />
                    </motion.div>
                </motion.div>
            </AnimatePresence>

            {/* Expression label */}
            <motion.div
                key={`label-${expression}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-0.5"
            >
                <span className="text-sm font-[700] text-sakhi-purple">
                    {config.label}
                </span>
            </motion.div>
        </div>
    );
}
