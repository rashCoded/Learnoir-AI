"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { API_CONFIG } from "@/config/api";

interface MCQQuestion {
    question: string;
    options: string[];
    correct_answer: number;
    explanation: string;
}

interface Stats {
    total_attempts: number;
    average_score: number;
    questions_practiced: number;
    best_score: number;
    recent_attempts: Array<{
        id: number;
        role: string;
        score: number;
        questions: number;
        correct: number;
        date: string;
    }>;
}

interface InterviewPrepViewProps {
    role: string;
}

// Icon Components
const TargetIcon = () => (
    <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const DocumentIcon = () => (
    <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const TrophyIcon = () => (
    <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
);

const ClipboardIcon = () => (
    <svg className="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
);

const CodeIcon = () => (
    <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
);

const CheckCircleIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const XCircleIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default function InterviewPrepView({ role }: InterviewPrepViewProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [quizType, setQuizType] = useState<"mcq" | "coding" | null>(null);
    const [questions, setQuestions] = useState<MCQQuestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [answers, setAnswers] = useState<(number | null)[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [quizCompleted, setQuizCompleted] = useState(false);

    useEffect(() => {
        fetchStats();
    }, [session]);

    const fetchStats = async () => {
        if (!session?.user?.email) return;
        try {
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/interview/stats/${session.user.email}`);
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const generateMCQQuestions = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/interview/generate-mcq`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    target_role: role,
                    difficulty: "intermediate",
                    count: 10
                })
            });
            const data = await res.json();
            setQuestions(data.questions);
            setCurrentIndex(0);
            setSelectedAnswer(null);
            setShowResult(false);
            setAnswers(new Array(data.questions.length).fill(null));
            setQuizCompleted(false);
        } catch (error) {
            console.error("Error generating questions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectOption = (optionIndex: number) => {
        if (showResult) return;
        setSelectedAnswer(optionIndex);
    };

    const handleSubmitAnswer = () => {
        if (selectedAnswer === null) return;
        const newAnswers = [...answers];
        newAnswers[currentIndex] = selectedAnswer;
        setAnswers(newAnswers);
        setShowResult(true);
    };

    const handleNextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setSelectedAnswer(null);
            setShowResult(false);
        } else {
            finishQuiz();
        }
    };

    const finishQuiz = async () => {
        setQuizCompleted(true);
        if (!session?.user?.email) return;

        const correctCount = answers.filter((a, idx) => a === questions[idx]?.correct_answer).length;

        try {
            await fetch(`${API_CONFIG.BASE_URL}/api/interview/save-attempt`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_email: session.user.email,
                    role: role,
                    total_questions: questions.length,
                    correct_answers: correctCount
                })
            });
            fetchStats();
        } catch (error) {
            console.error("Error saving attempt:", error);
        }
    };

    const restartQuiz = () => {
        setQuizType(null);
        setQuestions([]);
        setAnswers([]);
        setCurrentIndex(0);
        setSelectedAnswer(null);
        setShowResult(false);
        setQuizCompleted(false);
    };

    const getScore = () => {
        const correct = answers.filter((a, idx) => a === questions[idx]?.correct_answer).length;
        return { correct, total: questions.length, percent: Math.round((correct / questions.length) * 100) };
    };

    const chartData = stats?.recent_attempts?.slice().reverse().map((a) => ({
        name: new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: a.score
    })) || [];

    // Quiz Type Selection Screen
    if (!quizType) {
        return (
            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="glass-panel p-6 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Average Score</span>
                            <TargetIcon />
                        </div>
                        <div className="text-3xl font-bold text-white">{stats?.average_score || 0}%</div>
                    </div>
                    <div className="glass-panel p-6 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Questions Practiced</span>
                            <DocumentIcon />
                        </div>
                        <div className="text-3xl font-bold text-white">{stats?.questions_practiced || 0}</div>
                    </div>
                    <div className="glass-panel p-6 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Best Score</span>
                            <TrophyIcon />
                        </div>
                        <div className="text-3xl font-bold text-white">{stats?.best_score || 0}%</div>
                    </div>
                </div>

                {/* Performance Chart */}
                {chartData.length > 0 && (
                    <div className="glass-panel p-6 rounded-xl">
                        <h3 className="text-lg font-semibold text-white mb-4">Performance Trend</h3>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey="name" stroke="#666" fontSize={12} />
                                    <YAxis stroke="#666" fontSize={12} domain={[0, 100]} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                                    <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Quiz Type Selector */}
                <div className="glass-panel p-8 rounded-xl">
                    <h3 className="text-2xl font-bold text-white mb-2">Choose Assessment Type</h3>
                    <p className="text-gray-400 mb-8">Select the type of assessment for <span className="text-indigo-400 font-semibold">{role}</span></p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* MCQ Option */}
                        <button
                            onClick={() => { setQuizType("mcq"); generateMCQQuestions(); }}
                            className="group p-6 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-xl hover:border-indigo-400/60 transition-all text-left"
                        >
                            <div className="mb-4"><ClipboardIcon /></div>
                            <h4 className="text-xl font-bold text-white mb-2">Multiple Choice Questions</h4>
                            <p className="text-gray-400 text-sm">Test your knowledge with MCQs. Get instant feedback on each answer.</p>
                            <div className="mt-4 text-indigo-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-2">
                                Start MCQ Assessment
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </button>

                        {/* Coding Option */}
                        <button
                            onClick={() => router.push("/coding-test")}
                            className="group p-6 bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 rounded-xl hover:border-emerald-400/60 transition-all text-left"
                        >
                            <div className="mb-4"><CodeIcon /></div>
                            <h4 className="text-xl font-bold text-white mb-2">Coding Challenges</h4>
                            <p className="text-gray-400 text-sm">Solve programming problems with AI-powered evaluation.</p>
                            <div className="mt-4 text-emerald-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-2">
                                Start Coding Test
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Recent Quizzes */}
                {stats && stats.recent_attempts && stats.recent_attempts.length > 0 && (
                    <div className="glass-panel p-6 rounded-xl">
                        <h3 className="text-lg font-semibold text-white mb-4">Recent Assessments</h3>
                        <div className="space-y-3">
                            {stats.recent_attempts.slice(0, 5).map((attempt) => (
                                <div key={attempt.id} className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-white/5">
                                    <div>
                                        <p className="font-medium text-white">{attempt.role}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(attempt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-lg font-bold ${attempt.score >= 70 ? 'text-green-400' : attempt.score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                            {attempt.score}%
                                        </p>
                                        <p className="text-xs text-gray-500">{attempt.correct}/{attempt.questions} correct</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Loading State
    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Generating questions...</p>
                </div>
            </div>
        );
    }

    // Quiz Completed Screen
    if (quizCompleted) {
        const score = getScore();
        return (
            <div className="space-y-6">
                <div className="glass-panel p-8 rounded-xl text-center">
                    <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
                        {score.percent >= 70 ? (
                            <CheckCircleIcon className="w-8 h-8 text-green-400" />
                        ) : (
                            <DocumentIcon />
                        )}
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-2">Assessment Complete</h3>
                    <p className="text-gray-400 mb-6">You scored {score.correct} out of {score.total}</p>

                    <div className={`text-6xl font-bold mb-6 ${score.percent >= 70 ? 'text-green-400' : score.percent >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {score.percent}%
                    </div>

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={restartQuiz}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
                        >
                            Start New Assessment
                        </button>
                    </div>
                </div>

                {/* Show all answers */}
                <div className="glass-panel p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-white mb-4">Review Answers</h3>
                    <div className="space-y-4">
                        {questions.map((q, idx) => (
                            <div key={idx} className={`p-4 rounded-lg border ${answers[idx] === q.correct_answer ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10'}`}>
                                <div className="flex items-start gap-3">
                                    <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm ${answers[idx] === q.correct_answer ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                        {answers[idx] === q.correct_answer ? "✓" : "✗"}
                                    </span>
                                    <div>
                                        <p className="text-white font-medium">{q.question}</p>
                                        <p className="text-sm text-gray-400 mt-1">
                                            Your answer: <span className={answers[idx] === q.correct_answer ? 'text-green-400' : 'text-red-400'}>{q.options[answers[idx] || 0]}</span>
                                        </p>
                                        {answers[idx] !== q.correct_answer && (
                                            <p className="text-sm text-green-400 mt-1">Correct: {q.options[q.correct_answer]}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // MCQ Quiz Screen
    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedAnswer === currentQuestion?.correct_answer;

    return (
        <div className="space-y-6">
            {/* Progress Bar */}
            <div className="glass-panel p-4 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Question {currentIndex + 1} of {questions.length}</span>
                    <button onClick={restartQuiz} className="text-sm text-gray-400 hover:text-white flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Exit
                    </button>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Question Card */}
            <div className="glass-panel p-8 rounded-xl">
                <h4 className="text-xl font-semibold text-white mb-6 leading-relaxed">
                    {currentQuestion?.question}
                </h4>

                {/* Options */}
                <div className="space-y-3">
                    {currentQuestion?.options.map((option, idx) => {
                        let optionClass = "p-4 rounded-lg border cursor-pointer transition-all ";

                        if (showResult) {
                            if (idx === currentQuestion.correct_answer) {
                                optionClass += "border-green-500 bg-green-500/20 text-white";
                            } else if (idx === selectedAnswer && idx !== currentQuestion.correct_answer) {
                                optionClass += "border-red-500 bg-red-500/20 text-white";
                            } else {
                                optionClass += "border-white/10 bg-black/20 text-gray-400";
                            }
                        } else {
                            if (idx === selectedAnswer) {
                                optionClass += "border-indigo-500 bg-indigo-500/20 text-white";
                            } else {
                                optionClass += "border-white/10 bg-black/20 text-gray-300 hover:border-white/30 hover:bg-white/5";
                            }
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleSelectOption(idx)}
                                disabled={showResult}
                                className={optionClass + " w-full text-left flex items-center gap-3"}
                            >
                                <span className="flex-shrink-0 w-8 h-8 rounded-full border border-current flex items-center justify-center text-sm font-medium">
                                    {String.fromCharCode(65 + idx)}
                                </span>
                                <span className="flex-1">{option}</span>
                                {showResult && idx === currentQuestion.correct_answer && (
                                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                                )}
                                {showResult && idx === selectedAnswer && idx !== currentQuestion.correct_answer && (
                                    <XCircleIcon className="w-5 h-5 text-red-400" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Explanation */}
                {showResult && (
                    <div className={`mt-6 p-4 rounded-lg ${isCorrect ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                        <p className={`font-semibold mb-2 flex items-center gap-2 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                            {isCorrect ? <CheckCircleIcon className="w-5 h-5" /> : <XCircleIcon className="w-5 h-5" />}
                            {isCorrect ? "Correct" : "Incorrect"}
                        </p>
                        <p className="text-gray-300 text-sm">{currentQuestion?.explanation}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-4 mt-6 pt-4 border-t border-white/10">
                    {!showResult ? (
                        <button
                            onClick={handleSubmitAnswer}
                            disabled={selectedAnswer === null}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Submit Answer
                        </button>
                    ) : (
                        <button
                            onClick={handleNextQuestion}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                        >
                            {currentIndex === questions.length - 1 ? "Finish Assessment" : "Next Question"}
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Current Score */}
            <div className="glass-panel p-4 rounded-xl">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Current Score</span>
                    <span className="text-white font-semibold">
                        {answers.filter((a, idx) => a === questions[idx]?.correct_answer).length} / {currentIndex + (showResult ? 1 : 0)}
                    </span>
                </div>
            </div>
        </div>
    );
}
