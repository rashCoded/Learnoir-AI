"use client";

import { useState, useEffect } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';

interface SkillRadarChartProps {
    currentSkills: string[];
    requiredSkills: string[];
}

export default function SkillRadarChart({ currentSkills, requiredSkills }: SkillRadarChartProps) {
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        // Create data for radar chart
        const data = requiredSkills.slice(0, 8).map(skill => ({
            skill: skill.length > 15 ? skill.substring(0, 12) + '...' : skill,
            current: currentSkills.includes(skill) ? 100 : 0,
            required: 100
        }));
        setChartData(data);
    }, [currentSkills, requiredSkills]);

    if (chartData.length === 0) {
        return null;
    }

    return (
        <div className="glass-panel p-6">
            <h3 className="text-xl font-bold text-white mb-4">Skill Gap Analysis</h3>
            <p className="text-sm text-gray-400 mb-6">
                Visual comparison of your current skills vs required skills for the role
            </p>

            <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={chartData}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis
                        dataKey="skill"
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    />
                    <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={{ fill: '#9CA3AF' }}
                    />
                    <Radar
                        name="Your Skills"
                        dataKey="current"
                        stroke="#6366F1"
                        fill="#6366F1"
                        fillOpacity={0.6}
                    />
                    <Radar
                        name="Required Skills"
                        dataKey="required"
                        stroke="#10B981"
                        fill="#10B981"
                        fillOpacity={0.3}
                    />
                    <Legend
                        wrapperStyle={{ color: '#FFF' }}
                        iconType="circle"
                    />
                </RadarChart>
            </ResponsiveContainer>

            <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3">
                    <div className="text-2xl font-bold text-indigo-400">
                        {currentSkills.filter(s => requiredSkills.includes(s)).length}
                    </div>
                    <div className="text-xs text-gray-400">Skills You Have</div>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-400">
                        {requiredSkills.filter(s => !currentSkills.includes(s)).length}
                    </div>
                    <div className="text-xs text-gray-400">Skills to Learn</div>
                </div>
            </div>
        </div>
    );
}
