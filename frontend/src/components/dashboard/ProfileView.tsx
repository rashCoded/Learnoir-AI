"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { API_CONFIG } from '@/config/api';

interface Achievement {
    id: number;
    badge_name: string;
    badge_type: string;
    description: string;
    earned_at: string;
}

export default function ProfileView() {
    const { data: session } = useSession();
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [stats, setStats] = useState({
        daysActive: 1,
        tasksCompleted: 0,
        roadmapsGenerated: 1,
        streak: 1
    });

    useEffect(() => {
        const fetchAchievements = async () => {
            try {
                const res = await fetch(`${API_CONFIG.BASE_URL}/api/gamification/achievements`);
                if (res.ok) {
                    const data = await res.json();
                    setAchievements(data.achievements || []);
                }
            } catch (error) {
                console.error("Error fetching achievements:", error);
            }
        };

        fetchAchievements();
    }, []);

    const statCards = [
        { label: "Days Active", value: stats.daysActive, icon: "📅", gradient: "from-blue-500 to-cyan-500" },
        { label: "Tasks Completed", value: stats.tasksCompleted, icon: "✅", gradient: "from-green-500 to-emerald-500" },
        { label: "Roadmaps Generated", value: stats.roadmapsGenerated, icon: "🗺️", gradient: "from-purple-500 to-pink-500" },
        { label: "Day Streak", value: stats.streak, icon: "🔥", gradient: "from-orange-500 to-red-500" },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Profile Header Card */}
            <div className="glass-panel rounded-2xl p-8 animate-fadeIn">
                <div className="flex items-center space-x-6 mb-8">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg ring-4 ring-white/10">
                        {session?.user?.name?.[0] || "U"}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">{session?.user?.name}</h2>
                        <p className="text-indigo-300">{session?.user?.email}</p>
                        <span className="inline-flex items-center rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400 ring-1 ring-inset ring-green-500/20 mt-2">
                            Active Member
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <label className="block text-xs font-medium text-gray-400 uppercase">Full Name</label>
                        <div className="mt-1 text-white font-medium">{session?.user?.name}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <label className="block text-xs font-medium text-gray-400 uppercase">Email</label>
                        <div className="mt-1 text-white font-medium">{session?.user?.email}</div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fadeIn" style={{ animationDelay: "0.1s" }}>
                {statCards.map((stat, idx) => (
                    <div key={idx} className="glass-panel rounded-xl p-4 hover-lift">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-xl mb-3`}>
                            {stat.icon}
                        </div>
                        <div className="text-3xl font-bold text-white">{stat.value}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Achievements Section */}
            <div className="glass-panel rounded-2xl p-6 animate-fadeIn" style={{ animationDelay: "0.2s" }}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="text-2xl">🏆</span>
                        Achievements
                    </h3>
                    <span className="text-sm text-gray-400">{achievements.length} earned</span>
                </div>

                {achievements.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {achievements.map((achievement) => (
                            <div key={achievement.id} className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-center gap-3 hover-lift">
                                <div className="text-3xl">🏅</div>
                                <div>
                                    <div className="font-semibold text-yellow-400">{achievement.badge_name}</div>
                                    <div className="text-sm text-gray-400">{achievement.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <div className="text-4xl mb-3">🎯</div>
                        <p className="text-gray-400">No achievements yet. Keep learning to earn badges!</p>
                        <Link href="/dashboard" className="inline-block mt-4 px-4 py-2 bg-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-500 transition-colors">
                            Go to Dashboard
                        </Link>
                    </div>
                )}
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn" style={{ animationDelay: "0.3s" }}>
                <Link href="/progress" className="glass-panel rounded-xl p-6 hover-lift group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl">
                            📊
                        </div>
                        <div>
                            <div className="font-semibold text-white group-hover:text-indigo-400 transition-colors">View Progress</div>
                            <div className="text-sm text-gray-400">Track your learning journey</div>
                        </div>
                    </div>
                </Link>
                <Link href="/dashboard" className="glass-panel rounded-xl p-6 hover-lift group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-2xl">
                            🚀
                        </div>
                        <div>
                            <div className="font-semibold text-white group-hover:text-indigo-400 transition-colors">Continue Learning</div>
                            <div className="text-sm text-gray-400">Back to your dashboard</div>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
