"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_CONFIG } from "@/config/api";

// SVG Icons
const ArrowLeftIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

const AcademicCapIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    </svg>
);

const CodeIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
);

const QuizIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ProjectIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
);

interface LearningResult {
    skill_gap_summary: string;
    coding_exercises: {
        title: string;
        skill: string;
        difficulty: string;
        description: string;
        starter_code: string;
        hints: string[];
        expected_output: string;
    }[];
    quizzes: {
        topic: string;
        skill: string;
        questions: {
            question: string;
            options: string[];
            correct_index: number;
            explanation: string;
        }[];
    }[];
    mini_projects: {
        title: string;
        description: string;
        skills_practiced: string[];
        duration: string;
        steps: string[];
        evaluation_criteria: string[];
    }[];
    recommended_order: string[];
    estimated_time: string;
}

const ROLE_OPTIONS = [
    "Backend Developer",
    "Frontend Developer",
    "Full Stack Developer",
    "ML Engineer",
    "DevOps Engineer",
    "Data Analyst"
];

export default function LearningPage() {
    const [resumeData, setResumeData] = useState<any>(null);
    const [targetRole, setTargetRole] = useState("Full Stack Developer");
    const [weakSkills, setWeakSkills] = useState<string[]>([]);
    const [customSkill, setCustomSkill] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<LearningResult | null>(null);
    const [activeTab, setActiveTab] = useState<"exercises" | "quizzes" | "projects">("exercises");
    const [selectedExercise, setSelectedExercise] = useState<number | null>(null);
    const [selectedQuiz, setSelectedQuiz] = useState<number | null>(null);
    const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: number }>({});
    const [showHints, setShowHints] = useState<{ [key: number]: boolean }>({});

    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("learnoir_resume_data");
            if (saved) setResumeData(JSON.parse(saved));
        }
    }, []);

    const commonWeakSkills = [
        "System Design", "Data Structures", "Algorithms", "TypeScript", "Testing",
        "Docker", "AWS", "SQL", "GraphQL", "CI/CD", "Kubernetes", "Redis"
    ];

    const toggleWeakSkill = (skill: string) => {
        setWeakSkills(prev =>
            prev.includes(skill)
                ? prev.filter(s => s !== skill)
                : [...prev, skill]
        );
    };

    const addCustomSkill = () => {
        if (customSkill.trim() && !weakSkills.includes(customSkill.trim())) {
            setWeakSkills([...weakSkills, customSkill.trim()]);
            setCustomSkill("");
        }
    };

    const handleGenerate = async () => {
        if (weakSkills.length === 0) return;

        setIsLoading(true);
        setResult(null);

        try {
            const token = localStorage.getItem("learnoir_token");
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/learning/skill-gap-exercises`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    current_skills: resumeData?.skills || [],
                    target_role: targetRole,
                    experience_level: "intermediate",
                    weak_skills: weakSkills
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

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "easy": return "bg-green-500/20 text-green-400";
            case "medium": return "bg-yellow-500/20 text-yellow-400";
            case "hard": return "bg-red-500/20 text-red-400";
            default: return "bg-gray-500/20 text-gray-400";
        }
    };

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[120px]"></div>
                <div className="absolute top-40 -right-40 h-[500px] w-[500px] rounded-full bg-fuchsia-600/20 blur-[120px]"></div>
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
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-sm mb-4">
                        <AcademicCapIcon />
                        Learning Lab
                    </div>
                    <h1 className="text-4xl font-bold mb-3">
                        Practice Your Weak Skills
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        AI generates personalized coding exercises, quizzes, and mini-projects
                        to help you bridge your skill gaps.
                    </p>
                </div>

                {/* Setup Section */}
                {!result && !isLoading && (
                    <div className="max-w-3xl mx-auto space-y-6">
                        {/* Target Role */}
                        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
                            <h3 className="font-semibold text-white mb-4">Target Role</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {ROLE_OPTIONS.map((role) => (
                                    <button
                                        key={role}
                                        onClick={() => setTargetRole(role)}
                                        className={`p-3 rounded-xl border text-sm transition-all ${targetRole === role
                                            ? "border-violet-500 bg-violet-500/20 text-violet-400"
                                            : "border-white/10 hover:border-white/30"
                                            }`}
                                    >
                                        {role}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Weak Skills */}
                        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
                            <h3 className="font-semibold text-white mb-2">Skills to Improve</h3>
                            <p className="text-sm text-gray-400 mb-4">Select skills you want to practice</p>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {commonWeakSkills.map((skill) => (
                                    <button
                                        key={skill}
                                        onClick={() => toggleWeakSkill(skill)}
                                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${weakSkills.includes(skill)
                                            ? "bg-violet-600 text-white"
                                            : "bg-white/5 text-gray-400 hover:bg-white/10"
                                            }`}
                                    >
                                        {skill}
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={customSkill}
                                    onChange={(e) => setCustomSkill(e.target.value)}
                                    placeholder="Add custom skill..."
                                    className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                                    onKeyPress={(e) => e.key === "Enter" && addCustomSkill()}
                                />
                                <button
                                    onClick={addCustomSkill}
                                    className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
                                >
                                    Add
                                </button>
                            </div>

                            {weakSkills.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <p className="text-sm text-gray-400 mb-2">Selected:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {weakSkills.map((skill) => (
                                            <span key={skill} className="px-3 py-1 bg-violet-600 text-white rounded-lg text-sm flex items-center gap-2">
                                                {skill}
                                                <button onClick={() => toggleWeakSkill(skill)} className="hover:text-red-300">×</button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={weakSkills.length === 0}
                            className="w-full px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold text-lg rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            <AcademicCapIcon />
                            Generate Learning Content
                        </button>
                    </div>
                )}

                {/* Loading */}
                {isLoading && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-400 animate-pulse">Creating personalized exercises...</p>
                    </div>
                )}

                {/* Results */}
                {result && (
                    <div className="space-y-6 animate-fadeIn">
                        <button
                            onClick={() => { setResult(null); setSelectedExercise(null); setSelectedQuiz(null); }}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeftIcon /> Generate new content
                        </button>

                        {/* Summary Card */}
                        <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-600/10 to-fuchsia-600/10 p-6">
                            <p className="text-lg text-gray-300">{result.skill_gap_summary}</p>
                            <p className="text-sm text-violet-400 mt-2">Estimated time: {result.estimated_time}</p>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2">
                            {[
                                { id: "exercises", label: "Coding Exercises", icon: <CodeIcon />, count: result.coding_exercises.length },
                                { id: "quizzes", label: "Quizzes", icon: <QuizIcon />, count: result.quizzes.length },
                                { id: "projects", label: "Mini Projects", icon: <ProjectIcon />, count: result.mini_projects.length }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => { setActiveTab(tab.id as any); setSelectedExercise(null); setSelectedQuiz(null); }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === tab.id
                                        ? "bg-violet-600 text-white"
                                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                                        }`}
                                >
                                    {tab.icon}
                                    {tab.label} ({tab.count})
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
                            {/* Coding Exercises */}
                            {activeTab === "exercises" && selectedExercise === null && (
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold mb-4">Coding Exercises</h3>
                                    {result.coding_exercises.map((exercise, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedExercise(idx)}
                                            className="w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:border-violet-500/30 transition-all text-left"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-semibold">{exercise.title}</h4>
                                                <span className={`px-2 py-0.5 rounded text-xs ${getDifficultyColor(exercise.difficulty)}`}>
                                                    {exercise.difficulty}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-400">Skill: {exercise.skill}</p>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Selected Exercise */}
                            {activeTab === "exercises" && selectedExercise !== null && (
                                <div className="space-y-4">
                                    <button
                                        onClick={() => setSelectedExercise(null)}
                                        className="flex items-center gap-2 text-gray-400 hover:text-white"
                                    >
                                        <ArrowLeftIcon /> Back to exercises
                                    </button>

                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-semibold">{result.coding_exercises[selectedExercise].title}</h3>
                                        <span className={`px-3 py-1 rounded ${getDifficultyColor(result.coding_exercises[selectedExercise].difficulty)}`}>
                                            {result.coding_exercises[selectedExercise].difficulty}
                                        </span>
                                    </div>

                                    <p className="text-gray-300">{result.coding_exercises[selectedExercise].description}</p>

                                    <div className="p-4 rounded-xl bg-black/50 font-mono text-sm overflow-x-auto">
                                        <pre className="text-green-400 whitespace-pre-wrap">{result.coding_exercises[selectedExercise].starter_code}</pre>
                                    </div>

                                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                        <p className="text-sm text-blue-400">Expected Output:</p>
                                        <p className="font-mono mt-1">{result.coding_exercises[selectedExercise].expected_output}</p>
                                    </div>

                                    <button
                                        onClick={() => setShowHints({ ...showHints, [selectedExercise]: !showHints[selectedExercise] })}
                                        className="text-violet-400 text-sm hover:underline"
                                    >
                                        {showHints[selectedExercise] ? "Hide hints" : "Show hints"}
                                    </button>

                                    {showHints[selectedExercise] && (
                                        <ul className="space-y-2">
                                            {result.coding_exercises[selectedExercise].hints.map((hint, hidx) => (
                                                <li key={hidx} className="text-sm text-gray-400 flex items-start gap-2">
                                                    <span className="text-violet-400">💡</span> {hint}
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    <Link href="/coding-test" className="inline-block px-6 py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-500 transition-all">
                                        Open Code Editor
                                    </Link>
                                </div>
                            )}

                            {/* Quizzes */}
                            {activeTab === "quizzes" && selectedQuiz === null && (
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold mb-4">Quizzes</h3>
                                    {result.quizzes.map((quiz, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => { setSelectedQuiz(idx); setQuizAnswers({}); }}
                                            className="w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:border-violet-500/30 transition-all text-left"
                                        >
                                            <h4 className="font-semibold">{quiz.topic}</h4>
                                            <p className="text-sm text-gray-400">{quiz.questions.length} questions • Skill: {quiz.skill}</p>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Selected Quiz */}
                            {activeTab === "quizzes" && selectedQuiz !== null && (
                                <div className="space-y-6">
                                    <button
                                        onClick={() => { setSelectedQuiz(null); setQuizAnswers({}); }}
                                        className="flex items-center gap-2 text-gray-400 hover:text-white"
                                    >
                                        <ArrowLeftIcon /> Back to quizzes
                                    </button>

                                    <h3 className="text-xl font-semibold">{result.quizzes[selectedQuiz].topic}</h3>

                                    {result.quizzes[selectedQuiz].questions.map((q, qidx) => (
                                        <div key={qidx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                                            <p className="font-medium mb-3">Q{qidx + 1}: {q.question}</p>
                                            <div className="space-y-2">
                                                {q.options.map((opt, oidx) => {
                                                    const isSelected = quizAnswers[qidx] === oidx;
                                                    const isCorrect = oidx === q.correct_index;
                                                    const showResult = quizAnswers[qidx] !== undefined;

                                                    return (
                                                        <button
                                                            key={oidx}
                                                            onClick={() => setQuizAnswers({ ...quizAnswers, [qidx]: oidx })}
                                                            disabled={showResult}
                                                            className={`w-full p-3 rounded-lg text-left transition-all ${showResult
                                                                ? isCorrect
                                                                    ? "bg-green-500/20 border-green-500 text-green-400"
                                                                    : isSelected
                                                                        ? "bg-red-500/20 border-red-500 text-red-400"
                                                                        : "bg-white/5 border-white/10 text-gray-400"
                                                                : isSelected
                                                                    ? "bg-violet-500/20 border-violet-500"
                                                                    : "bg-white/5 border-white/10 hover:bg-white/10"
                                                                } border`}
                                                        >
                                                            {opt}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {quizAnswers[qidx] !== undefined && (
                                                <p className="mt-3 text-sm text-gray-400 p-3 bg-white/5 rounded-lg">
                                                    💡 {q.explanation}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Projects */}
                            {activeTab === "projects" && (
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold mb-4">Mini Projects</h3>
                                    {result.mini_projects.map((project, idx) => (
                                        <div key={idx} className="p-6 rounded-xl bg-white/5 border border-white/10">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-semibold text-lg">{project.title}</h4>
                                                <span className="text-sm text-gray-400">{project.duration}</span>
                                            </div>
                                            <p className="text-gray-300 mb-4">{project.description}</p>

                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {project.skills_practiced.map((skill, sidx) => (
                                                    <span key={sidx} className="px-2 py-1 bg-violet-500/20 text-violet-400 rounded text-xs">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>

                                            <details className="text-sm">
                                                <summary className="cursor-pointer text-violet-400 hover:underline">View Steps</summary>
                                                <ol className="mt-3 space-y-2 text-gray-400">
                                                    {project.steps.map((step, sidx) => (
                                                        <li key={sidx} className="flex items-start gap-2">
                                                            <span className="text-violet-400">{sidx + 1}.</span> {step}
                                                        </li>
                                                    ))}
                                                </ol>
                                            </details>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
