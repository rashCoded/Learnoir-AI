"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_CONFIG } from "@/config/api";

interface Example {
    input: string;
    output: string;
    explanation?: string;
}

interface Problem {
    id: number;
    title: string;
    difficulty: string;
    topic: string;
    description: string;
    examples: Example[];
    constraints: string[];
    starter_code: { python: string; javascript: string };
    solution_hint?: string;
}

interface EvaluationResult {
    is_correct: boolean;
    passed_tests: number;
    total_tests: number;
    feedback: string;
    suggestions: string[];
    time_complexity?: string;
    space_complexity?: string;
}

interface UserStats {
    total_solved: number;
    easy_solved: number;
    medium_solved: number;
    hard_solved: number;
}

const TOPICS = [
    "arrays",
    "strings",
    "linked-lists",
    "trees",
    "graphs",
    "dynamic-programming",
    "sorting",
    "searching",
    "hash-tables",
    "recursion"
];

const DIFFICULTIES = ["easy", "medium", "hard"];

export default function CodingTestPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [problem, setProblem] = useState<Problem | null>(null);
    const [code, setCode] = useState("");
    const [language, setLanguage] = useState<"python" | "javascript">("javascript");
    const [loading, setLoading] = useState(false);
    const [evaluating, setEvaluating] = useState(false);
    const [result, setResult] = useState<EvaluationResult | null>(null);
    const [stats, setStats] = useState<UserStats>({ total_solved: 0, easy_solved: 0, medium_solved: 0, hard_solved: 0 });
    const [showHint, setShowHint] = useState(false);

    // Problem generator state
    const [selectedDifficulty, setSelectedDifficulty] = useState("easy");
    const [selectedTopic, setSelectedTopic] = useState("arrays");
    const [problemsFound, setProblemsFound] = useState(0);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        }
    }, [status, router]);

    useEffect(() => {
        fetchStats();
        fetchProblemsCount();
    }, [session]);

    const fetchStats = async () => {
        if (!session?.user?.email) return;
        try {
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/coding/history/${session.user.email}`);
            if (res.ok) {
                const data = await res.json();
                setStats(data.stats || { total_solved: 0, easy_solved: 0, medium_solved: 0, hard_solved: 0 });
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const fetchProblemsCount = async () => {
        try {
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/coding/problems`);
            if (res.ok) {
                const data = await res.json();
                setProblemsFound(data.count || 0);
            }
        } catch (error) {
            console.error("Error fetching problems:", error);
        }
    };

    const generateProblem = async () => {
        setLoading(true);
        setResult(null);
        setShowHint(false);
        try {
            const token = localStorage.getItem("learnoir_token");
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/coding/generate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    difficulty: selectedDifficulty,
                    topic: selectedTopic
                })
            });

            if (!res.ok) throw new Error("Failed to generate problem");

            const data = await res.json();
            setProblem(data);
            setCode(data.starter_code?.[language] || "// Your code here");
            fetchProblemsCount();
        } catch (error) {
            console.error("Error generating problem:", error);
        } finally {
            setLoading(false);
        }
    };

    const runCode = async () => {
        if (!problem || !session?.user?.email) return;

        setEvaluating(true);
        setResult(null);
        try {
            const token = localStorage.getItem("learnoir_token");
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/coding/evaluate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    problem_id: problem.id,
                    code: code,
                    language: language,
                    user_email: session.user.email
                })
            });

            if (!res.ok) throw new Error("Failed to evaluate code");

            const data = await res.json();
            setResult(data);
            if (data.is_correct) {
                fetchStats();
            }
        } catch (error) {
            console.error("Error evaluating code:", error);
        } finally {
            setEvaluating(false);
        }
    };

    const resetCode = () => {
        if (problem) {
            setCode(problem.starter_code?.[language] || "// Your code here");
        }
        setResult(null);
    };

    const switchLanguage = (newLang: "python" | "javascript") => {
        setLanguage(newLang);
        if (problem) {
            setCode(problem.starter_code?.[newLang] || "// Your code here");
        }
    };

    const getDifficultyColor = (diff: string) => {
        switch (diff.toLowerCase()) {
            case "easy": return "bg-green-500/20 text-green-400 border-green-500/30";
            case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
            case "hard": return "bg-red-500/20 text-red-400 border-red-500/30";
            default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
        }
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="spinner h-12 w-12"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Navbar */}
            <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                    <div className="flex items-center gap-2">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600"></div>
                            <span className="text-xl font-bold">Learnoir</span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                            Dashboard
                        </Link>
                        <Link href="/progress" className="text-gray-400 hover:text-white transition-colors">
                            My Progress
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="pt-20 px-4 md:px-8 pb-8">
                {/* Header with stats */}
                <div className="max-w-7xl mx-auto mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold gradient-text">AI Coding Test</h1>
                            <p className="text-gray-400 mt-1">Practice coding problems with AI-powered evaluation</p>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400">✓ Solved:</span>
                                <span className="font-bold text-white">{stats.total_solved}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400">⏱ Time:</span>
                                <span className="font-bold text-white">5m</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400">🔥 Streak:</span>
                                <span className="font-bold text-white">1</span>
                            </div>
                        </div>
                    </div>

                    {/* Main content grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Panel - Problem */}
                        <div className="space-y-6">
                            {/* Problem Generator */}
                            <div className="glass-panel p-6 rounded-xl">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <span className="text-xl">✨</span> Generate New Problem
                                </h3>
                                <div className="text-sm text-gray-400 mb-4">
                                    {problemsFound} problems found
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Difficulty</label>
                                        <select
                                            value={selectedDifficulty}
                                            onChange={(e) => setSelectedDifficulty(e.target.value)}
                                            className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                        >
                                            {DIFFICULTIES.map(d => (
                                                <option key={d} value={d} className="bg-gray-900">
                                                    {d.charAt(0).toUpperCase() + d.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Topic</label>
                                        <select
                                            value={selectedTopic}
                                            onChange={(e) => setSelectedTopic(e.target.value)}
                                            className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                        >
                                            {TOPICS.map(t => (
                                                <option key={t} value={t} className="bg-gray-900">
                                                    {t.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <button
                                    onClick={generateProblem}
                                    disabled={loading}
                                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="spinner h-5 w-5"></div>
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <span>✨</span> Generate Problem
                                        </>
                                    )}
                                </button>
                                <p className="text-xs text-gray-500 text-center mt-2">
                                    AI will generate a unique problem based on your selected difficulty and topic
                                </p>
                            </div>

                            {/* Problem Display */}
                            {problem && (
                                <div className="glass-panel p-6 rounded-xl animate-fadeIn">
                                    <div className="flex items-start justify-between mb-4">
                                        <h2 className="text-xl font-bold text-white">{problem.title}</h2>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(problem.difficulty)}`}>
                                            {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                                        </span>
                                    </div>

                                    <div className="mb-6">
                                        <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                                            <span>📋</span> Problem Description
                                        </h3>
                                        <p className="text-gray-400 whitespace-pre-wrap text-sm leading-relaxed">
                                            {problem.description}
                                        </p>
                                    </div>

                                    {/* Examples */}
                                    <div className="mb-6">
                                        <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                                            <span>✅</span> Examples
                                        </h3>
                                        <div className="space-y-4">
                                            {problem.examples.map((example, idx) => (
                                                <div key={idx} className="bg-black/40 rounded-lg p-4 border border-white/5">
                                                    <div className="mb-2">
                                                        <span className="text-xs text-gray-500">Example {idx + 1}</span>
                                                    </div>
                                                    <div className="grid gap-2 text-sm">
                                                        <div>
                                                            <span className="text-gray-400">Input: </span>
                                                            <code className="text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">{example.input}</code>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-400">Output: </span>
                                                            <code className="text-green-400 bg-green-500/10 px-2 py-0.5 rounded">{example.output}</code>
                                                        </div>
                                                        {example.explanation && (
                                                            <div className="text-gray-500 text-xs mt-1">
                                                                <span className="text-gray-400">Note: </span>
                                                                {example.explanation}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Constraints */}
                                    {problem.constraints && problem.constraints.length > 0 && (
                                        <div className="mb-4">
                                            <h3 className="text-sm font-semibold text-gray-300 mb-2">Constraints:</h3>
                                            <ul className="text-sm text-gray-500 space-y-1">
                                                {problem.constraints.map((c, idx) => (
                                                    <li key={idx} className="flex items-start gap-2">
                                                        <span className="text-indigo-400">•</span>
                                                        <code className="text-gray-400">{c}</code>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Hint */}
                                    {problem.solution_hint && (
                                        <div>
                                            {!showHint ? (
                                                <button
                                                    onClick={() => setShowHint(true)}
                                                    className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-2"
                                                >
                                                    <span>💡</span> Show Hint
                                                </button>
                                            ) : (
                                                <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-4 animate-fadeIn">
                                                    <p className="text-sm text-indigo-300">
                                                        <span className="font-semibold">💡 Hint:</span> {problem.solution_hint}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right Panel - Code Editor */}
                        <div className="space-y-6">
                            <div className="glass-panel rounded-xl overflow-hidden">
                                {/* Editor Header */}
                                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/40">
                                    <div className="flex items-center gap-4">
                                        <button
                                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${true ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
                                                }`}
                                        >
                                            {"</>"} Code Editor
                                        </button>
                                        <button className="px-4 py-1.5 text-sm text-gray-400 hover:text-white transition-all">
                                            📋 Test Cases
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={resetCode}
                                            className="px-4 py-1.5 text-sm text-gray-400 hover:text-white border border-white/10 rounded-lg transition-all hover:bg-white/5"
                                        >
                                            ↺ Reset
                                        </button>
                                        <button
                                            onClick={runCode}
                                            disabled={evaluating || !problem}
                                            className="px-6 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {evaluating ? (
                                                <>
                                                    <div className="spinner h-4 w-4 border-white"></div>
                                                    Evaluating...
                                                </>
                                            ) : (
                                                <>
                                                    ▶ Run Code
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Language Selector */}
                                <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10 bg-gray-900/50">
                                    <div className="flex items-center gap-1 text-sm">
                                        <span className="text-green-400">●</span>
                                        <span className="text-gray-400">Code Editor</span>
                                    </div>
                                    <select
                                        value={language}
                                        onChange={(e) => switchLanguage(e.target.value as "python" | "javascript")}
                                        className="ml-4 px-3 py-1 bg-gray-800 border border-white/10 rounded text-sm text-white focus:outline-none"
                                    >
                                        <option value="javascript">JavaScript</option>
                                        <option value="python">Python</option>
                                    </select>
                                    <span className="ml-auto text-xs text-gray-500 flex items-center gap-1">
                                        <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                        Ready
                                    </span>
                                </div>

                                {/* Code Editor */}
                                <div className="bg-[#1e1e1e] min-h-[400px]">
                                    <div className="flex">
                                        {/* Line Numbers */}
                                        <div className="p-4 text-right text-gray-600 text-sm font-mono select-none border-r border-white/5 bg-black/20">
                                            {code.split('\n').map((_, i) => (
                                                <div key={i}>{i + 1}</div>
                                            ))}
                                        </div>
                                        {/* Code Area */}
                                        <textarea
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            className="flex-1 p-4 bg-transparent text-gray-100 font-mono text-sm resize-none focus:outline-none min-h-[400px]"
                                            placeholder={problem ? "// Start coding here..." : "// Generate a problem first..."}
                                            disabled={!problem}
                                            spellCheck={false}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Evaluation Result */}
                            {result && (
                                <div className={`glass-panel p-6 rounded-xl animate-fadeIn border-l-4 ${result.is_correct ? "border-l-green-500" : "border-l-red-500"
                                    }`}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className={`text-3xl ${result.is_correct ? "text-green-500" : "text-red-500"}`}>
                                            {result.is_correct ? "✓" : "✗"}
                                        </span>
                                        <div>
                                            <h3 className={`font-bold ${result.is_correct ? "text-green-400" : "text-red-400"}`}>
                                                {result.is_correct ? "Accepted!" : "Wrong Answer"}
                                            </h3>
                                            <p className="text-sm text-gray-400">
                                                Passed {result.passed_tests}/{result.total_tests} test cases
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <p className="text-gray-300 text-sm">{result.feedback}</p>
                                    </div>

                                    {result.time_complexity && (
                                        <div className="flex gap-4 text-sm mb-4">
                                            <span className="text-gray-400">
                                                Time: <span className="text-indigo-400">{result.time_complexity}</span>
                                            </span>
                                            <span className="text-gray-400">
                                                Space: <span className="text-indigo-400">{result.space_complexity}</span>
                                            </span>
                                        </div>
                                    )}

                                    {result.suggestions && result.suggestions.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-300 mb-2">Suggestions:</h4>
                                            <ul className="text-sm text-gray-400 space-y-1">
                                                {result.suggestions.map((s, idx) => (
                                                    <li key={idx} className="flex items-start gap-2">
                                                        <span className="text-yellow-400">•</span>
                                                        {s}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-white/10 bg-black py-8">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h3 className="font-bold text-white">Learnoir</h3>
                            <p className="text-sm text-gray-500">AI-powered career development platform</p>
                        </div>
                        <div className="flex gap-6 text-sm text-gray-400">
                            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                            <Link href="/progress" className="hover:text-white transition-colors">Progress</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
