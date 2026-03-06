"use client";

import { useState, useCallback } from "react";
import { useLocalParticipant } from "@livekit/components-react";
import { Track } from "livekit-client";
import { motion } from "framer-motion";
import { Mic, MicOff } from "lucide-react";

/**
 * A big, kid-friendly microphone button.
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
        <div className="flex flex-col items-center gap-3">
            {/* Pulsing ring behind the button when active */}
            <div className="relative">
                {isActive && (
                    <>
                        <motion.div
                            animate={{ scale: [1, 1.5], opacity: [0.4, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                            className="absolute inset-0 rounded-full bg-sakhi-green/30"
                        />
                        <motion.div
                            animate={{ scale: [1, 1.3], opacity: [0.3, 0] }}
                            transition={{
                                repeat: Infinity,
                                duration: 1.5,
                                ease: "easeOut",
                                delay: 0.3,
                            }}
                            className="absolute inset-0 rounded-full bg-sakhi-green/20"
                        />
                    </>
                )}

                <motion.button
                    id="big-mic-button"
                    onClick={toggleMic}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    className={`relative z-10 flex h-24 w-24 items-center justify-center rounded-full text-white transition-all sm:h-28 sm:w-28 ${isActive
                            ? "bg-gradient-to-br from-sakhi-green to-emerald-600 mic-glow-active"
                            : "bg-gradient-to-br from-sakhi-pink to-rose-600 mic-glow"
                        }`}
                    aria-label={isActive ? "Mute microphone" : "Unmute microphone"}
                >
                    {isActive ? (
                        <Mic className="h-10 w-10 sm:h-12 sm:w-12" />
                    ) : (
                        <MicOff className="h-10 w-10 sm:h-12 sm:w-12" />
                    )}
                </motion.button>
            </div>

            {/* Label */}
            <motion.p
                key={isActive ? "listening" : "muted"}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm font-[700] text-sakhi-muted"
            >
                {isActive ? "Listening... 🎤" : "Tap to talk!"}
            </motion.p>
        </div>
    );
}
