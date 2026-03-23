"use client";

import { useState, useEffect } from "react";
import { API_CONFIG } from "@/config/api";

interface DailyTip {
    tip: string;
    category: string;
    action: string;
}

const categoryIcons: Record<string, string> = {
    practice: "💻",
    learning: "📚",
    progress: "🎯",
    networking: "🤝",
    project: "🔨",
    reflection: "✍️",
    wellness: "🧠",
};

const categoryColors: Record<string, string> = {
    practice: "from-blue-500 to-cyan-500",
    learning: "from-purple-500 to-pink-500",
    progress: "from-green-500 to-emerald-500",
    networking: "from-orange-500 to-amber-500",
    project: "from-red-500 to-rose-500",
    reflection: "from-indigo-500 to-violet-500",
    wellness: "from-teal-500 to-green-500",
};

export default function DailyTip() {
    const [tip, setTip] = useState<DailyTip | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTip = async () => {
            try {
                const res = await fetch(`${API_CONFIG.BASE_URL}/api/gamification/daily`);
                if (res.ok) {
                    const data = await res.json();
                    setTip(data);
                }
            } catch (error) {
                console.error("Error fetching daily tip:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTip();
    }, []);

    if (loading) {
        return (
            <div className="glass-panel rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-white/10 rounded w-1/3 mb-3"></div>
                <div className="h-4 bg-white/10 rounded w-full mb-2"></div>
                <div className="h-4 bg-white/10 rounded w-2/3"></div>
            </div>
        );
    }

    if (!tip) return null;

    const icon = categoryIcons[tip.category] || "💡";
    const gradient = categoryColors[tip.category] || "from-indigo-500 to-purple-500";

    return (
        <div className="glass-panel rounded-2xl p-6 animate-fadeIn relative overflow-hidden group hover-lift">
            {/* Gradient accent bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`}></div>

            {/* Floating background decoration */}
            <div className={`absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br ${gradient} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity`}></div>

            <div className="relative z-10">
                <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl shadow-lg`}>
                        {icon}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-indigo-400 uppercase tracking-wider">Daily Tip</span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500 capitalize">{tip.category}</span>
                        </div>
                        <p className="text-lg font-semibold text-white leading-snug">{tip.tip}</p>
                        <p className="mt-2 text-sm text-gray-400 flex items-center gap-2">
                            <span className="text-indigo-400">→</span>
                            {tip.action}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
