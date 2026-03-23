"use client";

import { useState } from "react";
import Link from "next/link";
import { API_CONFIG } from "@/config/api";

// SVG Icons
const ArrowLeftIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

const CodeIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
);

const LayersIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
);

const DatabaseIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
);

const RouteIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const FolderIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
);

const CalendarIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const ChecklistIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
);

interface ProjectResult {
    project_title: string;
    project_description: string;
    why_relevant: string;
    tech_stack: {
        frontend: string[];
        backend: string[];
        database: string[];
        tools: string[];
    };
    architecture_components: {
        name: string;
        description: string;
        technologies: string[];
    }[];
    architecture_diagram: string;
    erd_entities: {
        name: string;
        attributes: string[];
    }[];
    erd_relationships: {
        from_entity: string;
        to_entity: string;
        type: string;
    }[];
    erd_diagram: string;
    api_routes: {
        route: string;
        method: string;
        description: string;
        request_body?: string;
        response: string;
    }[];
    folder_structure: string;
    build_guide: {
        week: number;
        title: string;
        tasks: string[];
        deliverables: string[];
    }[];
    evaluation_rubric: {
        criteria: string;
        points: number;
        description: string;
    }[];
}

export default function ProjectBuilderPage() {
    const [jobDescription, setJobDescription] = useState("");
    const [experienceLevel, setExperienceLevel] = useState("intermediate");
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<ProjectResult | null>(null);
    const [activeTab, setActiveTab] = useState<"overview" | "architecture" | "erd" | "api" | "folder" | "build" | "rubric">("overview");

    const handleGenerate = async () => {
        if (!jobDescription.trim()) return;

        setIsLoading(true);
        setResult(null);

        try {
            const token = localStorage.getItem("learnoir_token");
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/projects/generate-from-jd`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    job_description: jobDescription,
                    experience_level: experienceLevel
                })
            });

            if (response.ok) {
                const data = await response.json();
                setResult(data);
                setActiveTab("overview");
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getMethodColor = (method: string) => {
        switch (method.toUpperCase()) {
            case "GET": return "bg-green-500";
            case "POST": return "bg-blue-500";
            case "PUT": return "bg-yellow-500";
            case "DELETE": return "bg-red-500";
            default: return "bg-gray-500";
        }
    };

    const tabs = [
        { id: "overview", label: "Overview", icon: <LayersIcon /> },
        { id: "architecture", label: "Architecture", icon: <CodeIcon /> },
        { id: "erd", label: "Database", icon: <DatabaseIcon /> },
        { id: "api", label: "API Routes", icon: <RouteIcon /> },
        { id: "folder", label: "Structure", icon: <FolderIcon /> },
        { id: "build", label: "Build Guide", icon: <CalendarIcon /> },
        { id: "rubric", label: "Evaluation", icon: <ChecklistIcon /> }
    ];

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[120px]"></div>
                <div className="absolute top-40 -right-40 h-[500px] w-[500px] rounded-full bg-cyan-600/20 blur-[120px]"></div>
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
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm mb-4">
                        <CodeIcon />
                        Auto Project Builder
                    </div>
                    <h1 className="text-4xl font-bold mb-3">
                        Turn Any Job Description Into a Portfolio Project
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        AI generates complete project blueprints: architecture, database design,
                        API routes, and week-by-week build guide.
                    </p>
                </div>

                {/* Input Section */}
                {!result && (
                    <div className="max-w-3xl mx-auto space-y-6">
                        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
                            <h3 className="font-semibold text-white mb-4">Paste Job Description</h3>
                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste the job description you want to build a project for..."
                                className="w-full h-48 bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                            />
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
                            <h3 className="font-semibold text-white mb-4">Your Experience Level</h3>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: "beginner", label: "Beginner", desc: "0-1 years" },
                                    { id: "intermediate", label: "Intermediate", desc: "1-3 years" },
                                    { id: "advanced", label: "Advanced", desc: "3+ years" }
                                ].map((level) => (
                                    <button
                                        key={level.id}
                                        onClick={() => setExperienceLevel(level.id)}
                                        className={`p-4 rounded-xl border text-left transition-all ${experienceLevel === level.id
                                            ? "border-blue-500 bg-blue-500/20"
                                            : "border-white/10 hover:border-white/30"
                                            }`}
                                    >
                                        <p className="font-medium">{level.label}</p>
                                        <p className="text-sm text-gray-400">{level.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || !jobDescription.trim()}
                            className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-lg rounded-xl hover:from-blue-500 hover:to-cyan-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Generating Project Blueprint...
                                </>
                            ) : (
                                <>
                                    <CodeIcon />
                                    Generate Project Blueprint
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-400 animate-pulse">AI Architect is designing your project...</p>
                        <p className="text-sm text-gray-500 mt-2">This may take 15-30 seconds</p>
                    </div>
                )}

                {/* Results Section */}
                {result && (
                    <div className="space-y-6 animate-fadeIn">
                        {/* Try Again Button */}
                        <button
                            onClick={() => setResult(null)}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeftIcon /> Generate different project
                        </button>

                        {/* Project Title Card */}
                        <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 p-8">
                            <h2 className="text-3xl font-bold mb-2">{result.project_title}</h2>
                            <p className="text-lg text-gray-300 mb-4">{result.project_description}</p>
                            <p className="text-blue-400">{result.why_relevant}</p>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                        ? "bg-blue-600 text-white"
                                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                                        }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
                            {activeTab === "overview" && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold mb-4">Tech Stack</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { label: "Frontend", items: result.tech_stack.frontend, color: "purple" },
                                            { label: "Backend", items: result.tech_stack.backend, color: "blue" },
                                            { label: "Database", items: result.tech_stack.database, color: "green" },
                                            { label: "Tools", items: result.tech_stack.tools, color: "orange" }
                                        ].map((stack) => (
                                            <div key={stack.label} className="p-4 rounded-xl bg-white/5 border border-white/10">
                                                <p className={`text-sm text-${stack.color}-400 mb-2`}>{stack.label}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {stack.items.map((item, idx) => (
                                                        <span key={idx} className="px-2 py-1 bg-white/10 rounded text-sm">{item}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === "architecture" && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold mb-4">System Architecture</h3>
                                    <div className="p-4 rounded-xl bg-black/50 font-mono text-sm overflow-x-auto">
                                        <pre className="text-green-400">{result.architecture_diagram}</pre>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                        {result.architecture_components.map((comp, idx) => (
                                            <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                                                <h4 className="font-semibold text-white mb-2">{comp.name}</h4>
                                                <p className="text-sm text-gray-400 mb-3">{comp.description}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {comp.technologies.map((tech, tidx) => (
                                                        <span key={tidx} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">{tech}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === "erd" && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold mb-4">Database Schema (ERD)</h3>
                                    <div className="p-4 rounded-xl bg-black/50 font-mono text-sm overflow-x-auto">
                                        <pre className="text-cyan-400">{result.erd_diagram}</pre>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                                        {result.erd_entities.map((entity, idx) => (
                                            <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                                                <h4 className="font-semibold text-cyan-400 mb-3">{entity.name}</h4>
                                                <ul className="space-y-1">
                                                    {entity.attributes.map((attr, aidx) => (
                                                        <li key={aidx} className="text-sm text-gray-400 font-mono">• {attr}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === "api" && (
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold mb-4">API Routes</h3>
                                    {result.api_routes.map((route, idx) => (
                                        <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`px-2 py-1 ${getMethodColor(route.method)} text-white text-xs font-bold rounded`}>
                                                    {route.method}
                                                </span>
                                                <code className="text-white font-mono">{route.route}</code>
                                            </div>
                                            <p className="text-sm text-gray-400 mb-2">{route.description}</p>
                                            <div className="text-xs text-gray-500 font-mono">
                                                Response: <span className="text-green-400">{route.response}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === "folder" && (
                                <div>
                                    <h3 className="text-xl font-semibold mb-4">Folder Structure</h3>
                                    <div className="p-6 rounded-xl bg-black/50 font-mono text-sm">
                                        <pre className="text-yellow-400 whitespace-pre-wrap">{result.folder_structure}</pre>
                                    </div>
                                </div>
                            )}

                            {activeTab === "build" && (
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold mb-4">Week-by-Week Build Guide</h3>
                                    {result.build_guide.map((week) => (
                                        <div key={week.week} className="p-6 rounded-xl bg-white/5 border border-white/10">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">
                                                    {week.week}
                                                </div>
                                                <h4 className="text-lg font-semibold">{week.title}</h4>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-400 mb-2">Tasks:</p>
                                                    <ul className="space-y-1">
                                                        {week.tasks.map((task, idx) => (
                                                            <li key={idx} className="flex items-start gap-2 text-sm">
                                                                <span className="text-blue-400">•</span> {task}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400 mb-2">Deliverables:</p>
                                                    <ul className="space-y-1">
                                                        {week.deliverables.map((del, idx) => (
                                                            <li key={idx} className="flex items-start gap-2 text-sm">
                                                                <span className="text-green-400">✓</span> {del}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === "rubric" && (
                                <div>
                                    <h3 className="text-xl font-semibold mb-4">Evaluation Rubric</h3>
                                    <div className="space-y-3">
                                        {result.evaluation_rubric.map((item, idx) => (
                                            <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-white">{item.criteria}</h4>
                                                    <p className="text-sm text-gray-400">{item.description}</p>
                                                </div>
                                                <div className="text-2xl font-bold text-blue-400">
                                                    {item.points}
                                                </div>
                                            </div>
                                        ))}
                                        <div className="p-4 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-between">
                                            <span className="font-semibold">Total Points</span>
                                            <span className="text-2xl font-bold text-blue-400">
                                                {result.evaluation_rubric.reduce((sum, item) => sum + item.points, 0)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
