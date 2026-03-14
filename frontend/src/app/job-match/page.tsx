"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// SVG Icons
const ArrowLeftIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

const BriefcaseIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const ChartIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const LightbulbIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

interface JobMatchResult {
    skill_strengths: {
        skill: string;
        proficiency: number;
        market_demand: string;
    }[];
    skill_weaknesses: {
        skill: string;
        importance: string;
        learning_time: string;
    }[];
    role_matches: {
        role: string;
        match_percent: number;
        matched_skills: string[];
        missing_skills: string[];
        salary_range: string;
        job_count: string;
    }[];
    recommended_role: string;
    career_insights: string;
    job_listings: {
        title: string;
        company: string;
        location: string;
        match_score: number;
        key_requirements: string[];
    }[];
    next_skill_to_learn: string;
}

export default function JobMatchPage() {
    const [resumeData, setResumeData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<JobMatchResult | null>(null);
    const [activeTab, setActiveTab] = useState<"roles" | "skills" | "jobs">("roles");

    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("learnoir_resume_data");
            if (saved) setResumeData(JSON.parse(saved));
        }
    }, []);

    const handleAnalyze = async () => {
        if (!resumeData?.skills?.length) return;

        setIsLoading(true);
        setResult(null);

        try {
            const token = localStorage.getItem("learnoir_token");
            const response = await fetch("http://localhost:8000/api/jobs/skill-match", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    resume_skills: resumeData.skills,
                    experience_years: resumeData.experience?.length || 1,
                    target_role: null
                })
            });

            if (response.ok) {
                const data = await response.json();
                setResult(data);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getMatchColor = (percent: number) => {
        if (percent >= 80) return "text-green-400";
        if (percent >= 60) return "text-yellow-400";
        return "text-red-400";
    };

    const getMatchBg = (percent: number) => {
        if (percent >= 80) return "bg-green-500";
        if (percent >= 60) return "bg-yellow-500";
        return "bg-red-500";
    };

    const getDemandColor = (demand: string) => {
        switch (demand) {
            case "high": return "text-green-400 bg-green-500/20";
            case "medium": return "text-yellow-400 bg-yellow-500/20";
            default: return "text-gray-400 bg-gray-500/20";
        }
    };

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-emerald-600/20 blur-[120px]"></div>
                <div className="absolute top-40 -right-40 h-[500px] w-[500px] rounded-full bg-teal-600/20 blur-[120px]"></div>
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600"></div>
                        <span className="text-xl font-bold tracking-tight">Learnoir</span>
                    </Link>
                    <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeftIcon /> Back to Dashboard
                    </Link>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 mx-auto max-w-7xl pt-24 px-4 sm:px-6 lg:px-8 pb-16">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm mb-4">
                        <BriefcaseIcon />
                        Smart Job Matching
                    </div>
                    <h1 className="text-4xl font-bold mb-3">
                        See Which Roles Match Your Skills
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        AI analyzes your resume skills and shows role match percentages,
                        skill gaps, and relevant job opportunities.
                    </p>
                </div>

                {/* No Resume Warning */}
                {!resumeData?.skills?.length && !isLoading && (
                    <div className="max-w-xl mx-auto text-center py-12">
                        <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">No Resume Found</h2>
                        <p className="text-gray-400 mb-6">Upload your resume first to get personalized job matching.</p>
                        <Link href="/dashboard" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-500 transition-all">
                            Go to Dashboard
                        </Link>
                    </div>
                )}

                {/* Resume Found - Analyze Button */}
                {resumeData?.skills?.length > 0 && !result && !isLoading && (
                    <div className="max-w-xl mx-auto text-center space-y-6">
                        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
                            <h3 className="font-semibold text-white mb-4">Skills from your resume:</h3>
                            <div className="flex flex-wrap gap-2 justify-center mb-6">
                                {resumeData.skills.slice(0, 15).map((skill: string, idx: number) => (
                                    <span key={idx} className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm">
                                        {skill}
                                    </span>
                                ))}
                                {resumeData.skills.length > 15 && (
                                    <span className="px-3 py-1 bg-white/10 text-gray-400 rounded-full text-sm">
                                        +{resumeData.skills.length - 15} more
                                    </span>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={handleAnalyze}
                            className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-lg rounded-xl hover:from-emerald-500 hover:to-teal-500 transition-all flex items-center gap-3 mx-auto"
                        >
                            <ChartIcon />
                            Analyze My Job Matches
                        </button>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-400 animate-pulse">Analyzing your skills against the job market...</p>
                    </div>
                )}

                {/* Results */}
                {result && (
                    <div className="space-y-6 animate-fadeIn">
                        <button
                            onClick={() => setResult(null)}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeftIcon /> Run new analysis
                        </button>

                        {/* Recommended Role Card */}
                        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-600/10 to-teal-600/10 p-8 text-center">
                            <p className="text-emerald-400 text-sm mb-2">Best Match For You</p>
                            <h2 className="text-3xl font-bold mb-4">{result.recommended_role}</h2>
                            <p className="text-lg text-gray-300 max-w-2xl mx-auto">{result.career_insights}</p>
                            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10">
                                <LightbulbIcon />
                                <span className="text-sm">{result.next_skill_to_learn}</span>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2">
                            {[
                                { id: "roles", label: "Role Matches" },
                                { id: "skills", label: "Skill Analysis" },
                                { id: "jobs", label: "Job Listings" }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === tab.id
                                        ? "bg-emerald-600 text-white"
                                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
                            {activeTab === "roles" && (
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold mb-4">Role Match Percentages</h3>
                                    {result.role_matches.map((role, idx) => (
                                        <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h4 className="font-semibold text-lg">{role.role}</h4>
                                                    <p className="text-sm text-gray-400">{role.salary_range} • {role.job_count}</p>
                                                </div>
                                                <div className={`text-3xl font-bold ${getMatchColor(role.match_percent)}`}>
                                                    {role.match_percent}%
                                                </div>
                                            </div>
                                            <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
                                                <div
                                                    className={`h-2 rounded-full ${getMatchBg(role.match_percent)}`}
                                                    style={{ width: `${role.match_percent}%` }}
                                                ></div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-gray-400 mb-2">Matched Skills</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {role.matched_skills.map((skill, sidx) => (
                                                            <span key={sidx} className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 mb-2">Missing Skills</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {role.missing_skills.map((skill, sidx) => (
                                                            <span key={sidx} className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === "skills" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Strengths */}
                                    <div>
                                        <h3 className="text-xl font-semibold mb-4 text-green-400">Your Strengths</h3>
                                        <div className="space-y-3">
                                            {result.skill_strengths.map((skill, idx) => (
                                                <div key={idx} className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-medium">{skill.skill}</span>
                                                        <span className={`px-2 py-0.5 rounded text-xs ${getDemandColor(skill.market_demand)}`}>
                                                            {skill.market_demand} demand
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-800 rounded-full h-1.5">
                                                        <div
                                                            className="bg-green-500 h-1.5 rounded-full"
                                                            style={{ width: `${skill.proficiency}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Weaknesses */}
                                    <div>
                                        <h3 className="text-xl font-semibold mb-4 text-red-400">Skills to Develop</h3>
                                        <div className="space-y-3">
                                            {result.skill_weaknesses.map((skill, idx) => (
                                                <div key={idx} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-medium">{skill.skill}</span>
                                                        <span className={`px-2 py-0.5 rounded text-xs ${skill.importance === "critical"
                                                            ? "bg-red-500/30 text-red-400"
                                                            : "bg-yellow-500/30 text-yellow-400"
                                                            }`}>
                                                            {skill.importance}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-400">Est. learning time: {skill.learning_time}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "jobs" && (
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold mb-4">Matching Job Listings</h3>
                                    {result.job_listings.map((job, idx) => (
                                        <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h4 className="font-semibold text-lg">{job.title}</h4>
                                                    <p className="text-gray-400">{job.company} • {job.location}</p>
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-sm font-bold ${getMatchBg(job.match_score)}`}>
                                                    {job.match_score}% match
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {job.key_requirements.map((req, ridx) => (
                                                    <span key={ridx} className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300">
                                                        {req}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    <p className="text-center text-gray-500 text-sm mt-4">
                                        These are sample listings based on your skills. Apply on job boards for real opportunities.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
