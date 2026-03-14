"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Sparkles, MessageCircle } from "lucide-react";
import { sendChatMessage, endChatSession } from "@/lib/api";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ChatSessionData {
    child_name: string;
    profile_token: string;
}

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

/* ------------------------------------------------------------------ */
/*  Floating sparkles (shared pattern)                                 */
/* ------------------------------------------------------------------ */

function FloatingSparkles() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {Array.from({ length: 10 }).map((_, i) => (
                <span
                    key={i}
                    className="sparkle"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 4}s`,
                        animationDuration: `${3 + Math.random() * 3}s`,
                        width: `${4 + Math.random() * 5}px`,
                        height: `${4 + Math.random() * 5}px`,
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
/*  Typing indicator component                                         */
/* ------------------------------------------------------------------ */

function TypingIndicator() {
    return (
        <div className="chat-bubble-assistant flex items-center gap-1.5 py-3 px-4">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  SSE stream parser                                                  */
/* ------------------------------------------------------------------ */

async function* parseSSEStream(
    response: Response
): AsyncGenerator<{ type: string; value?: string }> {
    const reader = response.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    let buffer = "";

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || !trimmed.startsWith("data: ")) continue;
                const jsonStr = trimmed.slice(6);
                try {
                    yield JSON.parse(jsonStr);
                } catch {
                    // skip malformed JSON
                }
            }
        }

        // Process remaining buffer
        if (buffer.trim().startsWith("data: ")) {
            try {
                yield JSON.parse(buffer.trim().slice(6));
            } catch {
                // skip
            }
        }
    } finally {
        reader.releaseLock();
    }
}

/* ------------------------------------------------------------------ */
/*  Main Chat Page                                                     */
/* ------------------------------------------------------------------ */

export default function ChatPage() {
    const router = useRouter();
    const [session, setSession] = useState<ChatSessionData | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [threadId, setThreadId] = useState<string | null>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isEnding, setIsEnding] = useState(false);
    const [error, setError] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const msgIdCounter = useRef(0);

    // Generate unique message IDs
    const nextId = () => `msg-${++msgIdCounter.current}`;

    // Auto-scroll to bottom
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Load session from sessionStorage
    useEffect(() => {
        const raw = sessionStorage.getItem("sakhi_chat_session");
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

    /* ---- Send message ---- */
    const handleSend = useCallback(async () => {
        if (!input.trim() || isStreaming || !session) return;

        const userMsg = input.trim();
        setInput("");
        setError("");

        // Add user message
        const userMsgObj: Message = {
            id: nextId(),
            role: "user",
            content: userMsg,
        };
        setMessages((prev) => [...prev, userMsgObj]);

        // Add placeholder assistant message
        const assistantId = nextId();
        setMessages((prev) => [
            ...prev,
            { id: assistantId, role: "assistant", content: "" },
        ]);
        setIsStreaming(true);

        try {
            const response = await sendChatMessage(
                userMsg,
                threadId,
                session.profile_token
            );

            for await (const event of parseSSEStream(response)) {
                if (event.type === "thread_id" && event.value) {
                    setThreadId(event.value);
                } else if (event.type === "token" && event.value) {
                    setMessages((prev) =>
                        prev.map((m) =>
                            m.id === assistantId
                                ? { ...m, content: m.content + event.value }
                                : m
                        )
                    );
                } else if (event.type === "done") {
                    break;
                }
            }
        } catch (err) {
            const msg =
                err instanceof Error ? err.message : "Failed to send message";
            setError(msg);
            // Remove the empty assistant placeholder on error
            setMessages((prev) => prev.filter((m) => m.id !== assistantId));
        } finally {
            setIsStreaming(false);
            inputRef.current?.focus();
        }
    }, [input, isStreaming, session, threadId]);

    /* ---- End session & go back ---- */
    const handleBack = useCallback(async () => {
        if (isEnding) return;
        setIsEnding(true);

        try {
            if (threadId && session) {
                await endChatSession(threadId, session.profile_token);
            }
        } catch {
            // best-effort — still navigate back
        }

        sessionStorage.removeItem("sakhi_chat_session");
        router.replace("/profiles");
    }, [threadId, session, router, isEnding]);

    /* ---- Loading state ---- */
    if (!session) {
        return (
            <div className="sakhi-bg-gradient flex min-h-dvh items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                        repeat: Infinity,
                        duration: 1,
                        ease: "linear",
                    }}
                    className="h-12 w-12 rounded-full border-4 border-sakhi-purple/30 border-t-sakhi-purple"
                />
            </div>
        );
    }

    return (
        <div className="sakhi-bg-gradient relative flex min-h-dvh flex-col">
            <FloatingSparkles />

            {/* ---- Header ---- */}
            <header className="relative z-20 flex items-center justify-between px-5 pt-5 pb-3 sm:px-8 sm:pt-6">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleBack}
                    disabled={isEnding}
                    className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-[700] text-sakhi-muted backdrop-blur transition-colors hover:bg-white/10 hover:text-sakhi-text disabled:opacity-50"
                >
                    <ArrowLeft className="h-4 w-4" />
                    {isEnding ? "Saving…" : "Back"}
                </motion.button>

                <div className="flex items-center gap-2 text-sm font-[700] text-sakhi-muted">
                    <MessageCircle className="h-4 w-4 text-sakhi-yellow" />
                    <span>
                        Chatting with{" "}
                        <span className="text-sakhi-text">
                            {session.child_name}
                        </span>
                    </span>
                </div>
            </header>

            {/* ---- Messages ---- */}
            <div className="relative z-10 flex-1 overflow-y-auto px-4 py-4 sm:px-8">
                <div className="mx-auto max-w-2xl space-y-4">
                    {/* Welcome message when empty */}
                    {messages.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-16 text-center"
                        >
                            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-sakhi-yellow to-sakhi-pink shadow-lg">
                                <MessageCircle className="h-10 w-10 text-white" />
                            </div>
                            <h2 className="mb-2 text-2xl font-[900] text-sakhi-text">
                                Hi {session.child_name}! 👋
                            </h2>
                            <p className="max-w-sm text-sm font-[600] text-sakhi-muted">
                                I&apos;m Sakhi, your learning buddy! Type
                                anything below and let&apos;s start chatting.
                                Ask me questions, tell me about your day, or
                                learn something new!
                            </p>
                        </motion.div>
                    )}

                    {/* Message bubbles */}
                    <AnimatePresence initial={false}>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.25 }}
                                className={`flex ${
                                    msg.role === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                }`}
                            >
                                {msg.role === "assistant" && (
                                    <div className="mr-2 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sakhi-sky to-sakhi-purple">
                                        <Sparkles className="h-4 w-4 text-white" />
                                    </div>
                                )}

                                {msg.role === "assistant" &&
                                msg.content === "" &&
                                isStreaming ? (
                                    <TypingIndicator />
                                ) : (
                                    <div
                                        className={
                                            msg.role === "user"
                                                ? "chat-bubble-user"
                                                : "chat-bubble-assistant"
                                        }
                                    >
                                        {msg.content}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* ---- Error ---- */}
            <AnimatePresence>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="relative z-20 mx-auto max-w-2xl px-4 text-center text-sm font-[600] text-red-400"
                    >
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>

            {/* ---- Input bar ---- */}
            <div className="relative z-20 border-t border-white/5 bg-sakhi-bg/80 px-4 py-4 backdrop-blur-lg sm:px-8">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                    }}
                    className="mx-auto flex max-w-2xl gap-3"
                >
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message…"
                        disabled={isStreaming || isEnding}
                        autoFocus
                        className="chat-input flex-1 rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-[0.9375rem] font-[600] text-sakhi-text outline-none transition-all placeholder:text-sakhi-muted/50 disabled:opacity-50"
                    />

                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        disabled={!input.trim() || isStreaming || isEnding}
                        className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-sakhi-pink to-sakhi-purple text-white shadow-lg transition-opacity disabled:opacity-40"
                    >
                        <Send className="h-5 w-5" />
                    </motion.button>
                </form>
            </div>
        </div>
    );
}
