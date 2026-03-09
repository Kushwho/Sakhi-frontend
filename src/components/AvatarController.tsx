"use client";

import { useEffect } from "react";
import { useLocalParticipant } from "@livekit/components-react";

interface AvatarControllerProps {
    onExpressionChange: (expression: string) => void;
}

/**
 * Invisible component that listens for the "setAvatarExpression" RPC
 * from the backend agent and notifies the parent of expression changes.
 */
export function AvatarController({ onExpressionChange }: AvatarControllerProps) {
    const { localParticipant } = useLocalParticipant();

    useEffect(() => {
        if (!localParticipant) return;
        localParticipant.registerRpcMethod(
            "setEmotionState",
            async (data: { payload: string }) => {
                try {
                    const parsed = JSON.parse(data.payload);
                    const expression = parsed.expression ?? "happy";

                    if (parsed.raw_emotion) {
                        console.log(`Emotion detected: ${parsed.raw_emotion} (${parsed.score}). Updating expression to: ${expression}`);
                    }

                    onExpressionChange(expression);
                    return "Expression updated";
                } catch (err) {
                    console.error("Failed to parse expression RPC:", err);
                    return "Error processing expression";
                }
            }
        );
    }, [localParticipant, onExpressionChange]);

    return null;
}
