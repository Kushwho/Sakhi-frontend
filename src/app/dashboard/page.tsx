"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Flame, Smile, Clock, Bell, Home, BarChart3, Settings, HelpCircle, Plus } from "lucide-react";
import { useAuth, type Profile } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { fetchDashboardData, type TimeSpentData, type MoodData, type TopicsData, type StreakData, type AlertsData } from "@/lib/api";
import { MobileShell } from "@/components/ui/MobileShell";
import Image from "next/image";

/* ── Topic emoji mapping ── */
const TOPIC_EMOJIS: Record<string, string> = {
    animals: "🦁", numbers: "🔢", colors: "🎨", space: "🚀",
    science: "🔬", math: "➕", reading: "📚", music: "🎵",
    nature: "🌿", history: "📜", art: "🖼️", sports: "⚽",
    food: "🍕", geography: "🌍", language: "💬", coding: "💻",
};

function getTopicEmoji(topic: string): string {
    const lower = topic.toLowerCase();
    return TOPIC_EMOJIS[lower] || "✨";
}

export default function DashboardPage() {
    const router = useRouter();
    const { isLoggedIn, profiles, ready } = useAuth();
    const { profileToken } = useProfile();

    const childProfiles = profiles.filter(p => p.type === "child");
    const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

    useEffect(() => {
        if (!ready) return;
        if (!isLoggedIn) { router.push("/login"); return; }
        if (!profileToken) { router.push("/profiles"); return; }
        if (childProfiles.length > 0 && !selectedChildId) {
            setSelectedChildId(childProfiles[0].id);
        }
    }, [ready, isLoggedIn, profileToken, childProfiles, selectedChildId, router]);

    const activeChild = childProfiles.find(p => p.id === selectedChildId);

    // Dashboard data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [timeSpent, setTimeSpent] = useState<TimeSpentData | null>(null);
    const [mood, setMood] = useState<MoodData | null>(null);
    const [topics, setTopics] = useState<TopicsData | null>(null);
    const [streak, setStreak] = useState<StreakData | null>(null);
    const [alerts, setAlerts] = useState<AlertsData | null>(null);

    useEffect(() => {
        if (!selectedChildId || !profileToken) return;
        let isMounted = true;
        setLoading(true);
        setError("");

        async function fetchAll() {
            try {
                const data = await fetchDashboardData(selectedChildId!, profileToken!);
                if (isMounted) {
                    setTimeSpent(data.timeSpent);
                    setMood(data.mood);
                    setTopics(data.topics);
                    setStreak(data.streak);
                    setAlerts(data.alerts);
                }
            } catch (err: unknown) {
                if (isMounted) setError(err instanceof Error ? err.message : "Failed to load data");
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        fetchAll();
        return () => { isMounted = false; };
    }, [selectedChildId, profileToken]);

    // Recent mood
    const recentMood = useMemo(() => {
        if (!mood?.summaries?.length) return "Happy";
        return mood.summaries[0].mood || "Happy";
    }, [mood]);

    const alertCount = useMemo(() => {
        return alerts?.alerts?.filter(a => !a.dismissed).length || 0;
    }, [alerts]);

    const topTopics = useMemo(() => {
        if (!topics?.topics) return [];
        return [...topics.topics].sort((a, b) => b.count - a.count).slice(0, 6);
    }, [topics]);

    // Summary text
    const summaryText = useMemo(() => {
        if (!activeChild) return "";
        const childName = activeChild.display_name;
        if (!mood?.summaries?.length) return `${childName} is ready for a new adventure! 🌟`;
        return `${childName} had a great chat session today 💛`;
    }, [activeChild, mood]);

    const summaryDetail = useMemo(() => {
        if (!topics?.topics?.length) return "Start a conversation to see insights here!";
        const topNames = topTopics.slice(0, 2).map(t => t.name).join(" and ");
        return `Exploring more complex sentences and showing great curiosity about ${topNames}!`;
    }, [topics, topTopics]);

    const [activeNav, setActiveNav] = useState("home");

    if (!ready || (loading && !timeSpent)) {
        return (
            <MobileShell className="flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="h-10 w-10 rounded-full border-4 border-sakhi-purple/30 border-t-sakhi-purple"
                />
            </MobileShell>
        );
    }

    if (childProfiles.length === 0) {
        return (
            <MobileShell className="flex flex-col items-center justify-center px-6">
                <h2 className="text-xl font-[800] text-sakhi-text mb-4">No child profiles found.</h2>
                <button
                    onClick={() => router.push("/setup")}
                    className="sakhi-btn-primary px-6 py-3 text-base"
                >
                    Add a Child Profile
                </button>
            </MobileShell>
        );
    }

    return (
        <MobileShell bg="none" className="flex flex-col bg-[#F0F4F8] pb-20">
            {/* ── Header ── */}
            <header className="flex items-center justify-between px-5 pt-5 pb-3">
                <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center h-9 w-9 rounded-full bg-sakhi-purple">
                        <div className="h-2 w-2 rounded-full bg-white" />
                        <div className="h-2 w-2 rounded-full bg-white ml-0.5" />
                    </div>
                    <span className="text-lg font-[800] text-sakhi-text">Sakhi</span>
                </div>
                <div className="flex items-center gap-2">
                    <Image
                        src="/sakhi-penguin.png"
                        alt="Sakhi"
                        width={36}
                        height={36}
                        className="rounded-full"
                    />
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-sakhi-orange to-sakhi-yellow flex items-center justify-center text-xs font-[800] text-white">
                        👤
                    </div>
                </div>
            </header>

            {/* ── Child Selector ── */}
            <div className="px-5 pb-4">
                <p className="text-xs font-[800] tracking-wider text-sakhi-muted uppercase mb-2">
                    Viewing Activity For
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                    {childProfiles.map(child => (
                        <button
                            key={child.id}
                            onClick={() => setSelectedChildId(child.id)}
                            className={`rounded-full px-4 py-1.5 text-sm font-[700] transition-all ${
                                selectedChildId === child.id
                                    ? "bg-sakhi-purple text-white shadow-md"
                                    : "bg-white text-sakhi-text border border-gray-200"
                            }`}
                        >
                            {selectedChildId === child.id && (
                                <span className="inline-block h-2 w-2 rounded-full bg-white mr-1.5" />
                            )}
                            {child.display_name}
                        </button>
                    ))}
                    <button
                        onClick={() => router.push("/setup")}
                        className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-gray-300 text-sakhi-muted hover:border-sakhi-purple hover:text-sakhi-purple transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {error && (
                <div className="mx-5 mb-3 rounded-2xl bg-red-50 px-4 py-3 text-sm font-[600] text-red-500">
                    {error}
                </div>
            )}

            {/* ── Hero Card ── */}
            <div className="px-5 mb-5">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sakhi-purple to-sakhi-purple-dark p-5 text-white"
                >
                    <div className="pr-20">
                        <h2 className="text-lg font-[800] leading-snug mb-2">
                            {summaryText}
                        </h2>
                        <p className="text-sm font-[600] text-white/80 leading-relaxed">
                            {summaryDetail}
                        </p>
                    </div>
                    <div className="absolute right-3 bottom-0">
                        <Image
                            src="/sakhi-penguin.png"
                            alt=""
                            width={80}
                            height={80}
                            className="opacity-90"
                        />
                    </div>
                </motion.div>
            </div>

            {/* ── Metric Grid (2x2) ── */}
            <div className="px-5 mb-5">
                <div className="grid grid-cols-2 gap-3">
                    {/* Streak */}
                    <div className="metric-card">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                                <Flame className="h-4 w-4 text-sakhi-orange" />
                            </div>
                            <span className="text-xs font-[800] text-sakhi-muted uppercase">Streak</span>
                        </div>
                        <p className="text-2xl font-[900] text-sakhi-text">
                            {streak?.current_streak || 0} Days
                        </p>
                    </div>

                    {/* Mood */}
                    <div className="metric-card">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100">
                                <Smile className="h-4 w-4 text-sakhi-pink" />
                            </div>
                            <span className="text-xs font-[800] text-sakhi-muted uppercase">Mood</span>
                        </div>
                        <p className="text-xl font-[900] text-sakhi-text capitalize">
                            {recentMood}
                        </p>
                        <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-sakhi-pink to-sakhi-purple" />
                        </div>
                    </div>

                    {/* Time */}
                    <div className="metric-card">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                <Clock className="h-4 w-4 text-sakhi-sky" />
                            </div>
                            <span className="text-xs font-[800] text-sakhi-muted uppercase">Time</span>
                        </div>
                        <p className="text-2xl font-[900] text-sakhi-text">
                            {Math.round(timeSpent?.total_minutes || 0)}m
                        </p>
                    </div>

                    {/* Alerts */}
                    <div className="metric-card">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
                                    <Bell className="h-4 w-4 text-sakhi-yellow" />
                                </div>
                            </div>
                            {alertCount > 0 && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-[800] text-white">
                                    {alertCount}
                                </span>
                            )}
                        </div>
                        <p className="text-2xl font-[900] text-sakhi-text">
                            Alerts
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Focus Topics ── */}
            <div className="px-5 mb-5">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-base">✨</span>
                    <h3 className="text-base font-[800] text-sakhi-text">Focus Topics Today</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    {topTopics.length > 0 ? (
                        topTopics.map((topic, i) => (
                            <span
                                key={i}
                                className="inline-flex items-center gap-1.5 rounded-full bg-white border border-gray-100 px-3.5 py-1.5 text-sm font-[700] text-sakhi-text shadow-sm"
                            >
                                {getTopicEmoji(topic.name)}
                                {topic.name.charAt(0).toUpperCase() + topic.name.slice(1)}
                            </span>
                        ))
                    ) : (
                        <span className="text-sm font-[600] text-sakhi-muted italic">
                            No topics explored yet
                        </span>
                    )}
                </div>
            </div>

            {/* ── Bottom Nav ── */}
            <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-100 px-4 py-2 flex items-center justify-around z-30">
                {[
                    { id: "home", icon: Home, label: "Home" },
                    { id: "reports", icon: BarChart3, label: "Reports" },
                    { id: "settings", icon: Settings, label: "Settings" },
                    { id: "help", icon: HelpCircle, label: "Help" },
                ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeNav === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveNav(item.id)}
                            className={`flex flex-col items-center gap-0.5 py-1 px-3 transition-colors ${
                                isActive ? "text-sakhi-purple" : "text-sakhi-muted"
                            }`}
                        >
                            <Icon className="h-5 w-5" />
                            <span className="text-[10px] font-[700]">{item.label}</span>
                        </button>
                    );
                })}
            </nav>
        </MobileShell>
    );
}
