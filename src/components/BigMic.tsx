"use client";

import { useState, useCallback } from "react";
import { useLocalParticipant } from "@livekit/components-react";
import { motion } from "framer-motion";
import { Mic, MicOff, LayoutGrid, LogOut } from "lucide-react";

/**
 * A big, kid-friendly microphone button with side controls.
 * Toggles the user's microphone track on/off.
 */
export function BigMic() {
    const { localParticipant } = useLocalParticipant();
    const [isMuted, setIsMuted] = useState(false);

    const toggleMic = useCallback(async () => {
        if (!localParticipant) return;

        const newMuted = !isMuted;
        await localParticipant.setMicrophoneEnabled(!newMuted);
        setIsMuted(newMuted);
    }, [localParticipant, isMuted]);

    const isActive = !isMuted;

    return (
        <div className="flex flex-col items-center gap-3 w-full">
            {/* Audio visualizer placeholder */}
            {isActive && (
                <div className="flex items-end gap-1 h-6">
                    {[0.4, 0.7, 1, 0.7, 0.4].map((scale, i) => (
                        <motion.div
                            key={i}
                            animate={{ scaleY: [scale * 0.3, scale, scale * 0.3] }}
                            transition={{
                                repeat: Infinity,
                                duration: 0.8,
                                delay: i * 0.1,
                                ease: "easeInOut",
                            }}
                            className="w-1 rounded-full bg-sakhi-purple origin-bottom"
                            style={{ height: "20px" }}
                        />
                    ))}
                </div>
            )}

            <p className="text-sm font-[700] text-sakhi-muted">
                {isActive ? "Listening..." : "Tap to talk!"}
            </p>

            {/* Bottom controls row */}
            <div className="flex items-center justify-center gap-8 w-full">
                {/* Grid button */}
                <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md border border-gray-100 text-sakhi-muted hover:text-sakhi-text transition-colors">
                    <LayoutGrid className="h-5 w-5" />
                </button>

                {/* Mic button */}
                <div className="relative">
                    {isActive && (
                        <>
                            <motion.div
                                animate={{ scale: [1, 1.4], opacity: [0.3, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                                className="absolute inset-0 rounded-full bg-sakhi-purple/20"
                            />
                            <motion.div
                                animate={{ scale: [1, 1.25], opacity: [0.2, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut", delay: 0.3 }}
                                className="absolute inset-0 rounded-full bg-sakhi-purple/15"
                            />
                        </>
                    )}

                    <motion.button
                        id="big-mic-button"
                        onClick={toggleMic}
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.94 }}
                        className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full text-white transition-all ${
                            isActive
                                ? "bg-gradient-to-br from-sakhi-purple to-sakhi-purple-dark mic-glow-active"
                                : "bg-gradient-to-br from-gray-300 to-gray-400 mic-glow"
                        }`}
                        aria-label={isActive ? "Mute microphone" : "Unmute microphone"}
                    >
                        {isActive ? (
                            <Mic className="h-7 w-7" />
                        ) : (
                            <MicOff className="h-7 w-7" />
                        )}
                    </motion.button>
                </div>

                {/* Exit button */}
                <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md border border-gray-100 text-sakhi-muted hover:text-red-500 transition-colors">
                    <LogOut className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}
