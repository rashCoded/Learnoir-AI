"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_CONFIG } from "@/config/api";

interface RoadmapItem {
    id: number;
    week: number;
    title: string;
    tasks: string[];
    project?: string;
    resources?: string[];
    tasks_status: Record<string, boolean>;
}

interface Roadmap {
    id: number;
    role: string;
    duration_weeks: number;
    items: RoadmapItem[];
    progress: number;
}

export default function ProgressPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        } else if (status === "authenticated" && session?.user?.email) {
            loadProgress();
        }
    }, [status, router, session]);

    const loadProgress = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load from database
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/roadmap/active/${encodeURIComponent(session!.user!.email!)}`);
            
            if (res.ok) {
                const data = await res.json();
                if (data) {
                    setRoadmap(data);
                }
            }
        } catch (err) {
            console.error("Error loading progress:", err);
            setError("Failed to load progress from server");
        } finally {
            setLoading(false);
        }
    };

    const toggleTask = async (weekIdx: number, task: string, isCompleted: boolean) => {
        if (!roadmap || !session?.user?.email) return;

        // Optimistic UI update
        const newRoadmap = { ...roadmap };
        newRoadmap.items[weekIdx].tasks_status[task] = !isCompleted;

        // Recalculate progress
        let total = 0;
        let completed = 0;
        newRoadmap.items.forEach((item) => {
            (item.tasks || []).forEach((t) => {
                total++;
                if (item.tasks_status && item.tasks_status[t]) {
                    completed++;
                }
            });
        });
        newRoadmap.progress = total === 0 ? 0 : Math.round((completed / total) * 100);

        setRoadmap(newRoadmap);

        // Save to database
        try {
            await fetch(`${API_CONFIG.BASE_URL}/api/roadmap/progress`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_email: session.user.email,
                    week_idx: weekIdx,
                    task_name: task,
                    status: !isCompleted
                })
            });
            console.log("✅ Progress saved to database");
        } catch (err) {
            console.error("Error saving progress:", err);
        }
    };

    if (loading || status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white">Loading your progress...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black text-white p-8">
                <div className="max-w-4xl mx-auto text-center py-20">
                    <div className="text-6xl mb-4">❌</div>
                    <h1 className="text-3xl font-bold mb-4">Error Loading Progress</h1>
                    <p className="text-gray-400 mb-8">{error}</p>
                    <button
                        onClick={loadProgress}
                        className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!roadmap) {
        return (
            <div className="min-h-screen bg-black text-white p-8">
                <div className="max-w-4xl mx-auto text-center py-20">
                    <div className="text-6xl mb-4">📚</div>
                    <h1 className="text-3xl font-bold mb-4">No Active Roadmap</h1>
                    <p className="text-gray-400 mb-8">Generate a learning roadmap to start tracking your progress!</p>
                    <Link
                        href="/dashboard"
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg inline-block"
                    >
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    // Calculate stats
    const totalTasks = roadmap.items.reduce((acc, item) => acc + (item.tasks?.length || 0), 0);
    const completedTasks = roadmap.items.reduce((acc, item) => {
        return acc + (item.tasks || []).filter(t => item.tasks_status && item.tasks_status[t]).length;
    }, 0);
    const completedWeeks = roadmap.items.filter(item => {
        const tasks = item.tasks || [];
        return tasks.length > 0 && tasks.every(t => item.tasks_status && item.tasks_status[t]);
    }).length;

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Navbar */}
            <nav className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-40">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard" className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600"></div>
                                <span className="text-lg font-bold tracking-tight">Learnoir</span>
                            </Link>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">
                                ← Back to Dashboard
                            </Link>
                            <Link href="/profile" className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold hover:ring-2 hover:ring-white/20 transition-all">
                                {session?.user?.name?.[0] || "U"}
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="mx-auto max-w-6xl py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 animate-fadeIn">
                    <h1 className="text-4xl font-bold mb-2">Your Learning Progress</h1>
                    <p className="text-gray-400">Track your journey to becoming a {roadmap.role}</p>
                    <p className="text-xs text-green-400 mt-1">✓ Synced to your account</p>
                </div>

                {/* Progress Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fadeIn" style={{ animationDelay: "0.1s" }}>
                    <div className="glass-panel p-6 rounded-2xl hover-lift">
                        <div className="text-sm text-gray-400 mb-2">Overall Progress</div>
                        <div className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            {roadmap.progress || 0}%
                        </div>
                        <div className="mt-4 w-full bg-gray-800 rounded-full h-3">
                            <div
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full transition-all duration-500 progress-bar"
                                style={{ width: `${roadmap.progress || 0}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl hover-lift">
                        <div className="text-sm text-gray-400 mb-2">Tasks Completed</div>
                        <div className="text-4xl font-bold text-green-400">
                            {completedTasks} / {totalTasks}
                        </div>
                        <div className="text-xs text-gray-500 mt-2">Keep going! You're doing great.</div>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl hover-lift">
                        <div className="text-sm text-gray-400 mb-2">Weeks Completed</div>
                        <div className="text-4xl font-bold text-purple-400">
                            {completedWeeks} / {roadmap.items.length}
                        </div>
                        <div className="text-xs text-gray-500 mt-2">Weeks with all tasks done</div>
                    </div>
                </div>

                {/* Roadmap Items */}
                <div className="space-y-6 animate-fadeIn" style={{ animationDelay: "0.2s" }}>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <span className="text-3xl">📋</span>
                        Weekly Progress
                    </h2>

                    {roadmap.items.map((item, weekIdx) => {
                        const weekTasks = item.tasks || [];
                        const completedInWeek = weekTasks.filter(t => item.tasks_status && item.tasks_status[t]).length;
                        const weekProgress = weekTasks.length > 0 ? Math.round((completedInWeek / weekTasks.length) * 100) : 0;
                        const isComplete = completedInWeek === weekTasks.length && weekTasks.length > 0;

                        return (
                            <div key={weekIdx} className={`glass-panel p-6 rounded-2xl transition-all hover-lift ${isComplete ? 'ring-2 ring-green-500/50' : ''}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${isComplete ? 'bg-green-600' : 'bg-indigo-600'}`}>
                                            {isComplete ? '✓' : item.week || weekIdx + 1}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">{item.title}</h3>
                                            <span className="text-sm text-gray-400">Week {item.week || weekIdx + 1}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-indigo-400">{weekProgress}%</div>
                                        <div className="text-xs text-gray-400">{completedInWeek}/{weekTasks.length} tasks</div>
                                    </div>
                                </div>

                                <div className="w-full bg-gray-800 rounded-full h-2 mb-6">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 ${isComplete ? 'bg-green-500' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}`}
                                        style={{ width: `${weekProgress}%` }}
                                    ></div>
                                </div>

                                <div className="space-y-3">
                                    {weekTasks.map((task, taskIdx) => {
                                        const isTaskCompleted = item.tasks_status && item.tasks_status[task];
                                        return (
                                            <div
                                                key={taskIdx}
                                                onClick={() => toggleTask(weekIdx, task, isTaskCompleted)}
                                                className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all ${isTaskCompleted ? 'bg-green-500/10 border border-green-500/30' : 'bg-white/5 hover:bg-white/10 border border-transparent'}`}
                                            >
                                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isTaskCompleted ? 'bg-green-600 border-green-600' : 'border-gray-600 hover:border-indigo-500'}`}>
                                                    {isTaskCompleted && <span className="text-white text-sm">✓</span>}
                                                </div>
                                                <span className={`flex-1 ${isTaskCompleted ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                                                    {task}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {item.project && (
                                    <div className="mt-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4">
                                        <div className="text-sm font-semibold text-indigo-400">🔨 Week Project:</div>
                                        <div className="text-sm text-gray-300 mt-1">{item.project}</div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Back to Dashboard Button */}
                <div className="text-center mt-8 animate-fadeIn" style={{ animationDelay: "0.3s" }}>
                    <Link href="/dashboard">
                        <button className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:scale-105">
                            ← Back to Dashboard
                        </button>
                    </Link>
                </div>
            </main>
        </div>
    );
}
