"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { API_CONFIG } from "@/config/api";

interface RoadmapViewProps {
    role: any;
    currentSkills: string[];
    experience?: string[];
}

export default function RoadmapView({ role, currentSkills, experience = [] }: RoadmapViewProps) {
    const { data: session } = useSession();
    const [roadmap, setRoadmap] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load or generate roadmap
    useEffect(() => {
        const fetchOrGenerateRoadmap = async () => {
            if (!session?.user?.email) {
                setError("Please sign in to generate a roadmap");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // First, check if user has an active roadmap for this role
                // Using correct base URL
                const checkRes = await fetch(`${API_CONFIG.BASE_URL}/api/roadmap/active/${encodeURIComponent(session.user.email)}`);

                if (checkRes.ok) {
                    const existingRoadmap = await checkRes.json();
                    if (existingRoadmap && existingRoadmap.role === role.name) {
                        console.log("📦 Loaded existing roadmap from database");
                        setRoadmap(existingRoadmap);
                        setLoading(false);
                        return;
                    }
                }

                // Generate new roadmap
                const payload = {
                    target_role: role.name,
                    current_skills: currentSkills,
                    skill_gaps: role.missing_skills || [],
                    experience: experience || [],
                    time_commitment: "2 hours/day",
                    user_email: session.user.email
                };

                console.log("📤 Generating new roadmap...");

                const response = await fetch(`${API_CONFIG.BASE_URL}/api/roadmap/generate`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.detail || "Failed to generate roadmap");
                }

                const data = await response.json();
                console.log("✅ Roadmap generated and saved to database!");
                setRoadmap(data);

            } catch (err) {
                console.error("💥 Error:", err);
                setError(err instanceof Error ? err.message : "Failed to load roadmap");
            } finally {
                setLoading(false);
            }
        };

        if (role && role.name && session?.user?.email) {
            fetchOrGenerateRoadmap();
        }
    }, [role?.name, session?.user?.email]);

    const toggleTask = async (weekIdx: number, task: string, currentStatus: boolean) => {
        if (!roadmap || !session?.user?.email) return;

        // Optimistic UI update
        const newRoadmap = { ...roadmap };
        newRoadmap.items[weekIdx].tasks_status[task] = !currentStatus;

        // Recalculate progress
        let total = 0;
        let completed = 0;
        newRoadmap.items.forEach((week: any) => {
            (week.tasks || []).forEach((t: string) => {
                total++;
                if (week.tasks_status && week.tasks_status[t]) {
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
                    status: !currentStatus
                })
            });
            console.log("✅ Progress saved to database");
        } catch (err) {
            console.error("Error saving progress:", err);
        }
    };

    if (loading) return (
        <div className="text-center py-10">
            <div className="inline-block w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400 animate-pulse">Generating your personalized AI roadmap...</p>
        </div>
    );

    if (error) return (
        <div className="text-center py-10">
            <div className="flex items-center justify-center gap-2 text-red-400 text-lg mb-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
            </div>
            <p className="text-gray-500">Please try again or refresh the page.</p>
        </div>
    );

    if (!roadmap || !roadmap.items) return <div className="text-center text-red-400">Failed to load roadmap.</div>;

    const progress = roadmap.progress || 0;

    return (
        <div className="animate-fadeIn">
            {/* Header with Progress */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                        </div>
                        Your Roadmap to {roadmap.role}
                    </h2>
                    <p className="text-gray-400 mt-1">
                        {roadmap.duration_weeks || roadmap.items.length} weeks • Saved to your account
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        {progress}%
                    </div>
                    <div className="text-xs text-gray-400">Complete</div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-800 rounded-full h-3 mb-8 overflow-hidden">
                <div
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full transition-all duration-500 progress-bar"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            {/* Roadmap Timeline */}
            <div className="space-y-4">
                {roadmap.items.map((week: any, weekIdx: number) => {
                    const weekTasks = week.tasks || [];
                    const completedInWeek = weekTasks.filter((t: string) => week.tasks_status && week.tasks_status[t]).length;
                    const weekProgress = weekTasks.length > 0 ? Math.round((completedInWeek / weekTasks.length) * 100) : 0;
                    const isWeekComplete = completedInWeek === weekTasks.length && weekTasks.length > 0;

                    return (
                        <div key={weekIdx} className={`glass-panel rounded-xl p-5 transition-all hover-lift ${isWeekComplete ? 'ring-2 ring-green-500/50' : ''}`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${isWeekComplete ? 'bg-green-600' : 'bg-indigo-600'}`}>
                                        {isWeekComplete ? '✓' : week.week || weekIdx + 1}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">{week.title}</h3>
                                        <span className="text-xs text-gray-500">Week {week.week || weekIdx + 1}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`text-sm font-medium ${isWeekComplete ? 'text-green-400' : 'text-indigo-400'}`}>
                                        {completedInWeek}/{weekTasks.length} tasks
                                    </span>
                                    <div className="w-24 bg-gray-700 rounded-full h-1.5 mt-1">
                                        <div className={`h-1.5 rounded-full transition-all ${isWeekComplete ? 'bg-green-500' : 'bg-indigo-500'}`} style={{ width: `${weekProgress}%` }}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 mt-4">
                                {weekTasks.map((task: string, taskIdx: number) => {
                                    const isCompleted = week.tasks_status && week.tasks_status[task];
                                    return (
                                        <div
                                            key={taskIdx}
                                            onClick={() => toggleTask(weekIdx, task, isCompleted)}
                                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${isCompleted ? 'bg-green-500/10 border border-green-500/30' : 'bg-white/5 hover:bg-white/10 border border-transparent'}`}
                                        >
                                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isCompleted ? 'bg-green-600 border-green-600' : 'border-gray-600'}`}>
                                                {isCompleted && <span className="text-white text-xs">✓</span>}
                                            </div>
                                            <span className={`flex-1 ${isCompleted ? 'text-gray-400 line-through' : 'text-white'}`}>{task}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {week.project && (
                                <div className="mt-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                                    <div className="flex items-center gap-2 text-xs text-purple-400 font-medium">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                        </svg>
                                        Mini Project:
                                    </div>
                                    <p className="text-white text-sm mt-1">{week.project}</p>
                                </div>
                            )}

                            {week.resources && week.resources.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {week.resources.slice(0, 3).map((resource: string, idx: number) => (
                                        <span key={idx} className="flex items-center gap-1 px-2 py-1 bg-gray-800 rounded text-xs text-gray-400">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                            {resource}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
