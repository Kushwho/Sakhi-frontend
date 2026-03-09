"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lightbulb, TrendingUp, TrendingDown, Clock, Calendar, CheckCircle2, ChevronDown, BookOpen } from "lucide-react";
import { useAuth, type Profile } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { fetchDashboardData, type TimeSpentData, type MoodData, type TopicsData, type StreakData, type AlertsData } from "@/lib/api";

export default function DashboardPage() {
    const router = useRouter();
    const { isLoggedIn, profiles, ready } = useAuth();
    const { profileToken } = useProfile();
    
    // The parent might have multiple children.
    const childProfiles = profiles.filter(p => p.type === "child");
    const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

    // Initial logic to set default child and enforce auth bounds
    useEffect(() => {
        if (!ready) return;
        
        if (!isLoggedIn) {
            router.push("/login");
            return;
        }
        
        // If the user refreshed the page, profileToken is gone. Send them back to Profile picker
        if (!profileToken) {
            router.push("/profiles");
            return;
        }

        if (childProfiles.length > 0 && !selectedChildId) {
            setSelectedChildId(childProfiles[0].id);
        }
    }, [ready, isLoggedIn, profileToken, childProfiles, selectedChildId, router]);

    const activeChild = childProfiles.find(p => p.id === selectedChildId);

    // Dashboard Data States
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    const [timeSpent, setTimeSpent] = useState<TimeSpentData | null>(null);
    const [mood, setMood] = useState<MoodData | null>(null);
    const [topics, setTopics] = useState<TopicsData | null>(null);
    const [streak, setStreak] = useState<StreakData | null>(null);
    const [alerts, setAlerts] = useState<AlertsData | null>(null);

    // Fetch dashboard data
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
                if (isMounted) {
                    setError(err instanceof Error ? err.message : "Failed to fetch dashboard data");
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchAll();

        return () => {
            isMounted = false;
        };
    }, [selectedChildId]);

    // Data processing for charts
    const chartBars = useMemo(() => {
        if (!timeSpent?.daily) return [];
        
        // Ensure we have a 7-day structure, mapping the data
        const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']; // simplified standard week
        
        // This is a simplified mapping that just takes the last 7 days provided by the API
        // In a strictly correct implementation, we'd map dates to correct weekdays.
        return days.map((label, i) => {
            const dataPoint = timeSpent.daily[timeSpent.daily.length - 7 + i] || { minutes: 0 };
            
            // Assuming max minutes in a day for scaling visually is 60m (1 hour)
            const visualHeight = Math.min((dataPoint.minutes / 60) * 100, 100);
            
            return {
                label,
                active: visualHeight,
                minutes: dataPoint.minutes
            };
        });
    }, [timeSpent]);

    // Format topics for the breakdown
    const topTopics = useMemo(() => {
        if (!topics?.topics) return [];
        // Map the topic counts to a visual percentage (relative to the max count)
        const sorted = [...topics.topics].sort((a, b) => b.count - a.count).slice(0, 5);
        const maxCount = sorted.length > 0 ? sorted[0].count : 1;
        
        const colors = ["bg-emerald-400", "bg-indigo-400", "bg-amber-500", "bg-orange-500", "bg-rose-400"];
        
        return sorted.map((t, i) => ({
            name: t.name.charAt(0).toUpperCase() + t.name.slice(1), // capitalize
            score: Math.round((t.count / maxCount) * 100), // relative percentage
            rawCount: t.count,
            color: colors[i % colors.length]
        }));
    }, [topics]);

    const activeAlert = alerts?.alerts?.[0]; // Show the most recent alert

    if (!ready || loading && !timeSpent) {
        return (
            <main className="min-h-screen bg-[#0F172A] flex items-center justify-center">
                 <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="h-10 w-10 rounded-full border-4 border-sakhi-purple/30 border-t-sakhi-purple"
                />
            </main>
        );
    }

    if (childProfiles.length === 0) {
        return (
             <main className="min-h-screen bg-[#0F172A] text-slate-100 p-8 flex flex-col items-center justify-center">
                 <h2 className="text-xl font-bold mb-4">No child profiles found.</h2>
                 <button 
                     onClick={() => router.push('/setup')}
                     className="bg-sakhi-purple px-6 py-2 rounded-xl font-bold"
                 >
                     Add a Child Profile
                 </button>
             </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#0F172A] text-slate-100 p-8 font-['Nunito',sans-serif]">
            <div className="max-w-5xl mx-auto space-y-6">
                
                {/* Header section */}
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
                    <div className="flex items-center gap-4">
                        <div className="relative h-14 w-14 overflow-hidden rounded-full bg-gradient-to-tr from-orange-300 to-yellow-300 flex items-center justify-center p-1">
                            <div className="h-full w-full rounded-full bg-yellow-100 flex items-center justify-center text-2xl">
                                👦🏼
                            </div>
                        </div>
                        <div>
                            {childProfiles.length > 1 ? (
                                <div className="relative group">
                                    <select 
                                        className="appearance-none bg-transparent text-2xl font-bold tracking-tight text-white pr-8 focus:outline-none cursor-pointer"
                                        value={selectedChildId || ""}
                                        onChange={(e) => setSelectedChildId(e.target.value)}
                                    >
                                        {childProfiles.map(p => (
                                            <option key={p.id} value={p.id} className="bg-slate-800 text-sm">
                                                {p.display_name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                                </div>
                            ) : (
                                <h1 className="text-2xl font-bold tracking-tight text-white">{activeChild?.display_name || "Child"}</h1>
                            )}
                            <p className="text-sm font-semibold text-slate-400">
                                {activeChild?.age ? `Age ${activeChild.age}` : "No age set"}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
                            <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
                            <div className="h-2 w-2 rounded-full bg-orange-400"></div>
                        </div>
                        <div className="rounded-xl bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-300 border border-slate-700/50">
                            Learning Streak: {streak?.current_streak || 0} 🔥
                        </div>
                    </div>
                </header>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl font-semibold text-sm">
                        {error}
                    </div>
                )}

                {/* 3 Top Cards (Adapted to API Data) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Time Spent */}
                    <div className="rounded-2xl bg-[#1E293B] p-6 border border-slate-700/50 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 opacity-50"></div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-extrabold tracking-wider text-slate-400">TIME WITH SAKHI</h2>
                            <span className="rounded-full bg-emerald-500/10 p-2 text-emerald-400"><Clock className="h-4 w-4" /></span>
                        </div>
                        <div className="mb-1 text-emerald-400">
                            <span className="text-5xl font-black font-serif">
                                {Math.floor((timeSpent?.total_minutes || 0) / 60)}
                            </span>
                            <span className="text-2xl font-bold ml-1">h</span>
                            <span className="text-5xl font-black font-serif ml-2">
                                {Math.round(timeSpent?.total_minutes || 0) % 60}
                            </span>
                            <span className="text-2xl font-bold ml-1">m</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-400 mb-6 mt-2">Total session time</p>
                        <p className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" /> 
                            {timeSpent?.daily?.[timeSpent.daily.length - 1]?.minutes?.toFixed(1) || 0}m in last session
                        </p>
                    </div>

                    {/* Streak */}
                    <div className="rounded-2xl bg-[#1E293B] p-6 border border-slate-700/50 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-amber-500 opacity-50"></div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-extrabold tracking-wider text-slate-400">CURRENT STREAK</h2>
                            <span className="rounded-full bg-orange-500/10 p-2 text-orange-400"><Calendar className="h-4 w-4" /></span>
                        </div>
                        <div className="mb-1 text-orange-400">
                            <span className="text-5xl font-black font-serif">{streak?.current_streak || 0}</span>
                            <span className="text-xl font-bold ml-2">days</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-400 mb-6 mt-2">Active learning days</p>
                        <p className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" /> Longest: {streak?.longest_streak || 0} days
                        </p>
                    </div>

                    {/* Tops Topics & Mood */}
                    <div className="rounded-2xl bg-[#1E293B] p-6 border border-slate-700/50 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-400 to-blue-500 opacity-50"></div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-extrabold tracking-wider text-slate-400">RECENT MOOD</h2>
                            <span className="rounded-full bg-sky-500/10 p-2 text-sky-400"><CheckCircle2 className="h-4 w-4" /></span>
                        </div>
                        <div className="mb-1 h-14 overflow-hidden">
                             <p className="text-sm font-bold text-slate-200 line-clamp-3 leading-snug">
                                {mood?.summaries?.[0]?.mood || "Not enough data for mood summary yet."}
                             </p>
                        </div>
                        <p className="text-xs font-semibold text-slate-400 mb-4 mt-2 border-t border-slate-700/50 pt-3">
                            Top emotion detected: {
                                mood?.emotion_distribution?.[0] ? 
                                `${mood.emotion_distribution[0].emotion} (${mood.emotion_distribution[0].count})` : "N/A"
                            }
                        </p>
                        <p className="text-xs font-bold text-sky-400 flex items-center gap-1">
                            <BookOpen className="h-3 w-3" /> {topics?.total_unique || 0} unique topics explored
                        </p>
                    </div>
                </div>

                {/* Study Sessions Chart */}
                <div className="rounded-2xl bg-[#1E293B] p-6 border border-slate-700/50 shadow-sm relative">
                    {loading && (
                         <div className="absolute inset-0 bg-slate-900/50 z-20 flex items-center justify-center rounded-2xl backdrop-blur-[2px]">
                             <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="h-6 w-6 rounded-full border-2 border-emerald-400/50 border-t-emerald-400" />
                         </div>
                    )}
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-sm font-extrabold tracking-wider text-slate-400">SESSION MINUTES — LAST 7 DAYS</h2>
                        <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                            <div className="flex items-center gap-1.5">
                                <div className="h-2 w-2 rounded-full bg-emerald-400"></div> Minutes
                            </div>
                        </div>
                    </div>
                    
                    <div className="h-48 w-full flex items-end justify-between px-4 pb-2 border-b border-slate-700/50 relative">
                        <div className="absolute top-0 left-0 w-full border-t border-slate-700/30"></div>
                        <div className="absolute top-1/2 left-0 w-full border-t border-slate-700/30 -translate-y-1/2"></div>
                        
                        {chartBars.map((day, i) => (
                            <div key={i} className="flex flex-col items-center justify-end h-full w-12 gap-2 relative z-10 group/bar">
                                <div className="w-6 flex flex-col justify-end gap-1 opacity-80 hover:opacity-100 transition-opacity">
                                    {(day.minutes > 0) ? (
                                        <div style={{ height: `${day.active}%` }} className="w-full bg-emerald-400 rounded-sm relative">
                                            {/* Tooltip */}
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-xs px-2 py-1 rounded border border-slate-700 opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-30">
                                                {day.minutes.toFixed(1)} mins
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full h-1 bg-slate-700 rounded-sm"></div>
                                    )}
                                </div>
                                <span className="text-xs font-bold text-slate-500 mt-2">{day.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Subject Mastery / Topics Breakdown */}
                <div className="rounded-2xl bg-[#1E293B] p-6 border border-slate-700/50 shadow-sm relative">
                    {loading && (
                         <div className="absolute inset-0 bg-slate-900/50 z-20 flex items-center justify-center rounded-2xl backdrop-blur-[2px]" />
                    )}
                    <h2 className="text-sm font-extrabold tracking-wider text-slate-400 mb-6">TOP TOPICS DISCUSSED</h2>
                    
                    {topTopics.length === 0 ? (
                        <p className="text-sm text-slate-400 italic">No topics recorded yet for {activeChild?.display_name}.</p>
                    ) : (
                        <div className="space-y-5">
                            {topTopics.map((subject, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-sm font-bold mb-2">
                                        <span className="text-slate-200">{subject.name}</span>
                                        <span className={subject.color.replace('bg-', 'text-')}>{subject.rawCount} mentions</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${subject.score}%` }}
                                            transition={{ duration: 1, ease: "easeOut", delay: i * 0.1 }}
                                            className={`h-full ${subject.color} rounded-full`}
                                        ></motion.div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Alerts / Weak Concept Alert */}
                {activeAlert && !activeAlert.dismissed ? (
                    <div className={`rounded-2xl bg-[#1E293B] p-6 border shadow-sm relative overflow-hidden ${
                        activeAlert.severity === 'critical' ? 'border-red-500/40' : 
                        activeAlert.severity === 'warning' ? 'border-orange-500/40' : 
                        'border-blue-500/40'
                    }`}>
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                            activeAlert.severity === 'critical' ? 'bg-red-500' : 
                            activeAlert.severity === 'warning' ? 'bg-orange-500' : 
                            'bg-blue-500'
                        }`}></div>
                        <div className="flex gap-4">
                            <div className="mt-1">
                                <Lightbulb className={`h-6 w-6 ${
                                     activeAlert.severity === 'critical' ? 'text-red-400 fill-red-400/20' : 
                                     activeAlert.severity === 'warning' ? 'text-orange-400 fill-orange-400/20' : 
                                     'text-blue-400 fill-blue-400/20'
                                }`} />
                            </div>
                            <div>
                                <h3 className={`text-base font-bold mb-1 ${
                                     activeAlert.severity === 'critical' ? 'text-red-400' : 
                                     activeAlert.severity === 'warning' ? 'text-orange-400' : 
                                     'text-blue-400'
                                }`}>
                                    {activeAlert.title || "Observation Note"}
                                </h3>
                                <p className="text-sm font-semibold text-slate-400 leading-relaxed">
                                    {activeAlert.description}
                                </p>
                                <p className="text-xs font-semibold text-slate-500 mt-2">
                                    Recorded on: {new Date(activeAlert.recorded_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-2xl bg-[#1E293B]/50 p-6 border border-slate-700/30 flex items-center justify-center">
                         <p className="text-sm font-bold text-slate-500">No active alerts for {activeChild?.display_name} right now.</p>
                    </div>
                )}

            </div>
        </main>
    );
}

