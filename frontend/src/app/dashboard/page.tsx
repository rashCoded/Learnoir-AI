"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ResumeUpload from "@/components/dashboard/ResumeUpload";
import RoadmapView from "@/components/dashboard/RoadmapView";
import InterviewPrepView from "@/components/dashboard/InterviewPrepView";
import SkillRadarChart from "@/components/dashboard/SkillRadarChart";
import PremiumUpgradeModal from "@/components/PremiumUpgradeModal";
import PremiumBadge from "@/components/PremiumBadge";
import { API_CONFIG } from "@/config/api";

interface UserProfile {
    onboarding_complete: boolean;
    goal: string | null;
    target_role: string | null;
    experience_level: string | null;
    skills: string[] | null;
    current_streak: number;
    subscription_plan: string;
}

// SVG Icons
const DocumentIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const CheckCircleIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const MapIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
);

const QuestionIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const CodeIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
);

const UserIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const FireIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 23c-3.866 0-7-3.134-7-7 0-3.037 2.013-5.596 4.5-6.8V3c0-1.105.895-2 2-2h1c1.105 0 2 .895 2 2v6.2c2.487 1.204 4.5 3.763 4.5 6.8 0 3.866-3.134 7-7 7z" />
    </svg>
);

const ChevronDownIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

const ArrowLeftIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

const ArrowRightIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
);

const XIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const UploadIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const ROLE_OPTIONS = [
    { id: "backend_developer", name: "Backend Developer", skills: ["Node.js", "Python", "SQL", "APIs", "System Design"] },
    { id: "frontend_developer", name: "Frontend Developer", skills: ["React", "TypeScript", "CSS", "HTML", "Next.js"] },
    { id: "fullstack_developer", name: "Fullstack Developer", skills: ["React", "Node.js", "SQL", "APIs", "TypeScript"] },
    { id: "ml_engineer", name: "ML Engineer", skills: ["Python", "TensorFlow", "PyTorch", "ML Algorithms", "Data Science"] },
    { id: "devops_engineer", name: "DevOps Engineer", skills: ["Docker", "Kubernetes", "CI/CD", "AWS", "Linux"] },
    { id: "data_analyst", name: "Data Analyst", skills: ["SQL", "Python", "Excel", "Tableau", "Statistics"] },
];

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeView, setActiveView] = useState<"welcome" | "roadmap" | "interview" | "resume">("welcome");
    const [resumeData, setResumeData] = useState<any>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("learnoir_resume_data");
            return saved ? JSON.parse(saved) : null;
        }
        return null;
    });
    const [selectedRole, setSelectedRole] = useState<any>(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [roadmapGenerated, setRoadmapGenerated] = useState(false);

    // Resume Modal State
    const [showResumeModal, setShowResumeModal] = useState(false);
    const [saveResumeToProfile, setSaveResumeToProfile] = useState(true);
    const [tempResumeData, setTempResumeData] = useState<any>(null);

    // Resume Feedback State
    const [resumeFeedback, setResumeFeedback] = useState<any>(null);
    const [feedbackLoading, setFeedbackLoading] = useState(false);
    const [showAnalysisModal, setShowAnalysisModal] = useState(false);
    const [selectedAnalysisFile, setSelectedAnalysisFile] = useState<File | null>(null);

    // Premium State
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const isPremium = userProfile?.subscription_plan === "premium";

    const handlePremiumSuccess = () => {
        // Refresh user profile to get updated subscription status
        window.location.reload();
    };

    // Save resumeData to localStorage when it changes (only if saveToProfile is true)
    useEffect(() => {
        if (resumeData && typeof window !== "undefined" && saveResumeToProfile) {
            localStorage.setItem("learnoir_resume_data", JSON.stringify(resumeData));
        }
    }, [resumeData, saveResumeToProfile]);

    // Fetch user profile and check onboarding status
    useEffect(() => {
        const fetchUserData = async () => {
            if (!session?.user?.email) return;

            try {
                const token = localStorage.getItem("learnoir_token");
                const profileRes = await fetch(`${API_CONFIG.BASE_URL}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (profileRes.ok) {
                    const profile = await profileRes.json();
                    setUserProfile(profile);

                    if (!profile.onboarding_complete) {
                        router.push("/onboarding");
                        return;
                    }
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (status === "authenticated") {
            fetchUserData();
        } else if (status === "unauthenticated") {
            router.push("/auth/signin");
        }
    }, [status, session?.user?.email, router]);

    const handleResumeUploadComplete = (data: any) => {
        if (saveResumeToProfile) {
            setResumeData(data);
            setTempResumeData(null);
        } else {
            setTempResumeData(data);
        }
        setShowResumeModal(false);
    };

    const getActiveResume = () => tempResumeData || resumeData;

    if (status === "loading" || isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-400">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    const userName = session?.user?.name?.split(" ")[0] || "there";
    const preferredRole = userProfile?.target_role?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-[120px]"></div>
                <div className="absolute top-40 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[120px]"></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[300px] w-[600px] rounded-full bg-blue-600/10 blur-[100px]"></div>
            </div>

            {/* Resume Upload Modal */}
            {showResumeModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-2xl mx-4 rounded-2xl border border-white/10 bg-gray-900 shadow-2xl">
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <h2 className="text-xl font-bold">Upload Resume</h2>
                            <button onClick={() => setShowResumeModal(false)} className="text-gray-400 hover:text-white">
                                <XIcon />
                            </button>
                        </div>
                        <div className="p-6">
                            <ResumeUpload onUploadComplete={handleResumeUploadComplete} userEmail={session?.user?.email || undefined} />

                            {/* Save Options */}
                            <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={saveResumeToProfile}
                                        onChange={(e) => setSaveResumeToProfile(e.target.checked)}
                                        className="w-5 h-5 rounded bg-gray-800 border-gray-600 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <div>
                                        <p className="font-medium text-white">Save resume to my profile</p>
                                        <p className="text-sm text-gray-400">Use for all features (roadmap, interview prep, etc.)</p>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="resumeOption"
                                        checked={!saveResumeToProfile}
                                        onChange={() => setSaveResumeToProfile(false)}
                                        className="w-5 h-5 bg-gray-800 border-gray-600 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <div>
                                        <p className="font-medium text-white">Use temporarily</p>
                                        <p className="text-sm text-gray-400">Only for this session, won't be saved</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Premium Upgrade Modal */}
            <PremiumUpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                onSuccess={handlePremiumSuccess}
                userEmail={session?.user?.email || ""}
                userName={session?.user?.name || ""}
            />

            {/* Navbar */}
            <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <Image src="/logo.png" alt="Learnoir" width={32} height={32} className="rounded" />
                        <span className="text-xl font-bold tracking-tight">Learnoir</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        {/* Streak Counter */}
                        {(userProfile?.current_streak ?? 0) > 0 && (
                            <div className="flex items-center gap-1 text-orange-400 font-semibold px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30">
                                <FireIcon />
                                <span>{userProfile?.current_streak}</span>
                            </div>
                        )}

                        {/* Premium Badge or Upgrade Button */}
                        {isPremium ? (
                            <PremiumBadge size="sm" />
                        ) : (
                            <button
                                onClick={() => setShowUpgradeModal(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:from-indigo-500 hover:to-purple-500 transition-all"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2L1 21h22L12 2zm0 4l7.53 13H4.47L12 6z" />
                                </svg>
                                Upgrade
                            </button>
                        )}

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold">
                                    {userName.charAt(0).toUpperCase()}
                                </div>
                                <span className="hidden sm:block text-sm">{userName}</span>
                                <ChevronDownIcon />
                            </button>

                            {showProfileMenu && (
                                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-white/10 bg-gray-900/95 backdrop-blur-xl shadow-2xl py-2">
                                    <div className="px-4 py-3 border-b border-white/10">
                                        <p className="font-semibold text-white">{session?.user?.name}</p>
                                        <p className="text-sm text-gray-400">{session?.user?.email}</p>
                                    </div>
                                    <div className="py-1">
                                        <Link href="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/10">
                                            <UserIcon />
                                            My Profile
                                        </Link>
                                        <Link href="/progress" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/10">
                                            <MapIcon />
                                            My Progress
                                        </Link>
                                        <button
                                            onClick={() => { setShowResumeModal(true); setShowProfileMenu(false); }}
                                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 w-full text-left"
                                        >
                                            <DocumentIcon />
                                            {resumeData ? "Manage Resume" : "Upload Resume"}
                                        </button>
                                    </div>
                                    <div className="border-t border-white/10 pt-1 mt-1">
                                        <button
                                            onClick={() => signOut({ callbackUrl: "/" })}
                                            className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-white/10 w-full text-left"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 mx-auto max-w-6xl pt-24 px-4 sm:px-6 lg:px-8 pb-16">
                {/* Welcome View */}
                {activeView === "welcome" && (
                    <div className="space-y-8 animate-fadeIn">
                        {/* Neutral Welcome Text */}
                        <div className="text-center py-6">
                            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                Welcome back, {userName}
                            </h1>
                            <p className="text-lg text-gray-400">
                                Explore roles and generate a personalized roadmap
                            </p>
                            {preferredRole && (
                                <p className="text-sm text-gray-500 mt-2">
                                    Your preferred role: <span className="text-indigo-400">{preferredRole}</span>
                                </p>
                            )}
                        </div>

                        {/* Resume Status Card */}
                        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${resumeData ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                    <DocumentIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    {resumeData ? (
                                        <>
                                            <div className="flex items-center gap-2 text-green-400 font-medium">
                                                <CheckCircleIcon />
                                                <span>Resume: {resumeData.filename || "Resume.pdf"}</span>
                                            </div>
                                            <p className="text-sm text-gray-400">
                                                {resumeData?.skills?.length || 0} skills detected • Analyzed recently
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-white font-medium">Resume: No resume uploaded</p>
                                            <p className="text-sm text-gray-400">Upload for personalized recommendations</p>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <button
                                    onClick={() => setShowResumeModal(true)}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-500 transition-all"
                                >
                                    <UploadIcon className="w-4 h-4" />
                                    {resumeData ? "Replace" : "Upload Resume"}
                                </button>
                                {!resumeData && (
                                    <button
                                        onClick={() => { setSaveResumeToProfile(false); setShowResumeModal(true); }}
                                        className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-white/20 text-sm text-gray-300 hover:bg-white/10 transition-all"
                                    >
                                        Use Temporarily
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Main Action Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Learning Roadmap Card */}
                            <button
                                onClick={() => setActiveView("roadmap")}
                                className="group p-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 text-left hover:border-indigo-400/60 hover:from-indigo-600/20 hover:to-purple-600/20 transition-all"
                            >
                                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                                    <MapIcon className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Learning Roadmap</h3>
                                <p className="text-gray-400 text-sm mb-4">Select any role and generate a personalized 8-week plan</p>
                                <div className="text-indigo-400 font-semibold flex items-center gap-2 group-hover:translate-x-1 transition-transform text-sm">
                                    Choose Role <ArrowRightIcon />
                                </div>
                            </button>

                            {/* Improve Resume Card */}
                            <button
                                onClick={() => setActiveView("resume")}
                                className="group p-6 rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-600/10 to-pink-600/10 text-left hover:border-purple-400/60 hover:from-purple-600/20 hover:to-pink-600/20 transition-all"
                            >
                                <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                                    <DocumentIcon className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Improve Resume</h3>
                                <p className="text-gray-400 text-sm mb-4">AI feedback and ATS compatibility score</p>
                                <div className="text-purple-400 font-semibold flex items-center gap-2 group-hover:translate-x-1 transition-transform text-sm">
                                    Get Feedback <ArrowRightIcon />
                                </div>
                            </button>

                            {/* Interview Prep Card */}
                            <button
                                onClick={() => setActiveView("interview")}
                                className="group p-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-600/10 to-teal-600/10 text-left hover:border-emerald-400/60 hover:from-emerald-600/20 hover:to-teal-600/20 transition-all"
                            >
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                                    <QuestionIcon className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Interview Prep</h3>
                                <p className="text-gray-400 text-sm mb-4">MCQ assessments and coding challenges</p>
                                <div className="text-emerald-400 font-semibold flex items-center gap-2 group-hover:translate-x-1 transition-transform text-sm">
                                    Start Practice <ArrowRightIcon />
                                </div>
                            </button>
                        </div>

                        {/* Advanced AI Features */}
                        <div className="mt-8">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2L1 21h22L12 2zm0 4l7.53 13H4.47L12 6z" />
                                </svg>
                                Advanced AI Features
                                {!isPremium && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                        Premium
                                    </span>
                                )}
                            </h2>
                            {!isPremium && (
                                <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-indigo-600/10 to-purple-600/10 border border-indigo-500/30 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        <span className="text-gray-300 text-sm">Upgrade to Premium to unlock all advanced features</span>
                                    </div>
                                    <button
                                        onClick={() => setShowUpgradeModal(true)}
                                        className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:from-indigo-500 hover:to-purple-500 transition-all"
                                    >
                                        Upgrade - ₹499/year
                                    </button>
                                </div>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* AI Recruiter Simulator */}
                                {isPremium ? (
                                    <Link href="/recruiter-sim" className="group p-5 rounded-xl border border-red-500/30 bg-gradient-to-br from-red-600/10 to-pink-600/10 hover:border-red-400/60 transition-all">
                                        <div className="w-10 h-10 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center mb-3">
                                            <UserIcon className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-semibold text-white mb-1">Recruiter Simulator</h3>
                                        <p className="text-xs text-gray-400">See why you'd get rejected or hired</p>
                                    </Link>
                                ) : (
                                    <button onClick={() => setShowUpgradeModal(true)} className="group p-5 rounded-xl border border-red-500/30 bg-gradient-to-br from-red-600/10 to-pink-600/10 hover:border-red-400/60 transition-all text-left relative">
                                        <div className="absolute top-2 right-2">
                                            <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <div className="w-10 h-10 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center mb-3">
                                            <UserIcon className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-semibold text-white mb-1">Recruiter Simulator</h3>
                                        <p className="text-xs text-gray-400">See why you'd get rejected or hired</p>
                                    </button>
                                )}

                                {/* Project Builder */}
                                {isPremium ? (
                                    <Link href="/project-builder" className="group p-5 rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 hover:border-blue-400/60 transition-all">
                                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
                                            <CodeIcon className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-semibold text-white mb-1">Project Builder</h3>
                                        <p className="text-xs text-gray-400">Generate projects from job descriptions</p>
                                    </Link>
                                ) : (
                                    <button onClick={() => setShowUpgradeModal(true)} className="group p-5 rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 hover:border-blue-400/60 transition-all text-left relative">
                                        <div className="absolute top-2 right-2">
                                            <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
                                            <CodeIcon className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-semibold text-white mb-1">Project Builder</h3>
                                        <p className="text-xs text-gray-400">Generate projects from job descriptions</p>
                                    </button>
                                )}

                                {/* Job Matching */}
                                {isPremium ? (
                                    <Link href="/job-match" className="group p-5 rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-600/10 to-teal-600/10 hover:border-emerald-400/60 transition-all">
                                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                        <h3 className="font-semibold text-white mb-1">Job Matching</h3>
                                        <p className="text-xs text-gray-400">See your role match percentages</p>
                                    </Link>
                                ) : (
                                    <button onClick={() => setShowUpgradeModal(true)} className="group p-5 rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-600/10 to-teal-600/10 hover:border-emerald-400/60 transition-all text-left relative">
                                        <div className="absolute top-2 right-2">
                                            <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                        <h3 className="font-semibold text-white mb-1">Job Matching</h3>
                                        <p className="text-xs text-gray-400">See your role match percentages</p>
                                    </button>
                                )}

                                {/* Learning Lab */}
                                {isPremium ? (
                                    <Link href="/learning" className="group p-5 rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-600/10 to-fuchsia-600/10 hover:border-violet-400/60 transition-all">
                                        <div className="w-10 h-10 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center mb-3">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                            </svg>
                                        </div>
                                        <h3 className="font-semibold text-white mb-1">Learning Lab</h3>
                                        <p className="text-xs text-gray-400">Exercises for your weak skills</p>
                                    </Link>
                                ) : (
                                    <button onClick={() => setShowUpgradeModal(true)} className="group p-5 rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-600/10 to-fuchsia-600/10 hover:border-violet-400/60 transition-all text-left relative">
                                        <div className="absolute top-2 right-2">
                                            <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <div className="w-10 h-10 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center mb-3">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                            </svg>
                                        </div>
                                        <h3 className="font-semibold text-white mb-1">Learning Lab</h3>
                                        <p className="text-xs text-gray-400">Exercises for your weak skills</p>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Coding Test Link */}
                        <div className="text-center">
                            {isPremium ? (
                                <Link
                                    href="/coding-test"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-blue-500/30 bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 transition-all"
                                >
                                    <CodeIcon />
                                    <span className="font-medium">Coding Practice Environment</span>
                                    <ArrowRightIcon />
                                </Link>
                            ) : (
                                <button
                                    onClick={() => setShowUpgradeModal(true)}
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-blue-500/30 bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 transition-all"
                                >
                                    <CodeIcon />
                                    <span className="font-medium">Coding Practice Environment</span>
                                    <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Roadmap View */}
                {activeView === "roadmap" && (
                    <div className="space-y-6 animate-fadeIn">
                        <button
                            onClick={() => { setActiveView("welcome"); setRoadmapGenerated(false); }}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeftIcon /> Back to Dashboard
                        </button>

                        {/* Role Selector */}
                        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
                            <h3 className="text-lg font-semibold text-white mb-2">Select Target Role</h3>
                            <p className="text-sm text-gray-400 mb-4">Choose any role to generate a roadmap. This is just for exploration.</p>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                                {ROLE_OPTIONS.map((role) => {
                                    const isPreferred = role.id === userProfile?.target_role || role.name.toLowerCase().includes((userProfile?.target_role || "").toLowerCase());
                                    return (
                                        <button
                                            key={role.id}
                                            onClick={() => { setSelectedRole(role); setRoadmapGenerated(false); }}
                                            className={`p-4 rounded-xl border text-left transition-all relative ${selectedRole?.id === role.id
                                                ? 'border-indigo-500 bg-indigo-500/20 ring-2 ring-indigo-500/50'
                                                : isPreferred
                                                    ? 'border-indigo-500/50 bg-indigo-500/10'
                                                    : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                                                }`}
                                        >
                                            {isPreferred && (
                                                <span className="absolute -top-2 -right-2 px-2 py-0.5 text-xs bg-indigo-600 text-white rounded-full">
                                                    Preferred
                                                </span>
                                            )}
                                            <p className={`font-medium ${selectedRole?.id === role.id ? 'text-indigo-400' : 'text-white'}`}>
                                                {role.name}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {role.skills.slice(0, 3).join(", ")}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Resume Status Box in Roadmap */}
                        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Resume for Analysis</h3>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getActiveResume() ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                        <DocumentIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        {getActiveResume() ? (
                                            <>
                                                <p className="font-medium text-white">
                                                    {getActiveResume().filename || "Resume.pdf"}
                                                    {tempResumeData && <span className="ml-2 text-xs text-yellow-400">(Temporary)</span>}
                                                </p>
                                                <p className="text-sm text-gray-400">
                                                    {getActiveResume()?.skills?.length || 0} skills will be used for roadmap
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="font-medium text-yellow-400">No resume uploaded</p>
                                                <p className="text-sm text-gray-400">Upload for a more personalized roadmap</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <button
                                        onClick={() => setShowResumeModal(true)}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-500 transition-all"
                                    >
                                        <UploadIcon className="w-4 h-4" />
                                        {getActiveResume() ? "Replace" : "Upload"}
                                    </button>
                                    {!getActiveResume() && (
                                        <button
                                            onClick={() => { setSaveResumeToProfile(false); setShowResumeModal(true); }}
                                            className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-white/20 text-sm text-gray-300 hover:bg-white/10 transition-all"
                                        >
                                            Use Temporarily
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Generate Button */}
                        {selectedRole && !roadmapGenerated && (
                            <button
                                onClick={() => setRoadmapGenerated(true)}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-lg hover:from-indigo-500 hover:to-purple-500 transition-all flex items-center justify-center gap-2"
                            >
                                <MapIcon className="w-5 h-5" />
                                Analyze & Generate Roadmap for {selectedRole.name}
                            </button>
                        )}

                        {/* Roadmap Display */}
                        {selectedRole && roadmapGenerated && (
                            <>
                                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
                                    <RoadmapView
                                        role={selectedRole}
                                        currentSkills={getActiveResume()?.skills || userProfile?.skills || []}
                                        experience={getActiveResume()?.experience || []}
                                    />
                                </div>

                                {/* Skill Gap Chart */}
                                {getActiveResume()?.skills && (
                                    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
                                        <h3 className="text-lg font-semibold text-white mb-4">Your Skill Gap Analysis</h3>
                                        <SkillRadarChart
                                            currentSkills={getActiveResume().skills}
                                            requiredSkills={[...getActiveResume().skills, ...(selectedRole?.skills || [])]}
                                        />
                                    </div>
                                )}

                                {/* Start Learning Button */}
                                <div className="text-center pt-4">
                                    <Link href="/progress">
                                        <button className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-lg rounded-xl hover:from-green-500 hover:to-emerald-500 transition-all shadow-lg shadow-green-500/25 flex items-center gap-3 mx-auto">
                                            <CheckCircleIcon className="w-5 h-5" />
                                            Save & Start Learning
                                        </button>
                                    </Link>
                                    <p className="text-sm text-gray-500 mt-2">This will save the roadmap to your profile</p>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Interview View */}
                {activeView === "interview" && (
                    <div className="space-y-6 animate-fadeIn">
                        <button
                            onClick={() => setActiveView("welcome")}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeftIcon /> Back to Dashboard
                        </button>
                        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
                            <InterviewPrepView role={selectedRole?.name || userProfile?.target_role || "Software Developer"} />
                        </div>
                    </div>
                )}

                {/* Resume Feedback View */}
                {activeView === "resume" && (
                    <div className="space-y-6 animate-fadeIn">
                        <button
                            onClick={() => { setActiveView("welcome"); setResumeFeedback(null); }}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeftIcon /> Back to Dashboard
                        </button>

                        <div className="text-center py-4">
                            <h1 className="text-3xl font-bold text-white mb-2">Improve Your Resume</h1>
                            <p className="text-gray-400">Get AI-powered feedback and ATS compatibility analysis</p>
                        </div>

                        {/* Resume Upload/Status */}
                        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Your Resume</h3>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${resumeData ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                        <DocumentIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        {resumeData ? (
                                            <>
                                                <div className="flex items-center gap-2 text-green-400 font-medium">
                                                    <CheckCircleIcon />
                                                    <span>{resumeData.filename || "Resume.pdf"}</span>
                                                </div>
                                                <p className="text-sm text-gray-400">
                                                    {resumeData?.skills?.length || 0} skills detected
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="font-medium text-yellow-400">No resume uploaded</p>
                                                <p className="text-sm text-gray-400">Upload a resume to get feedback</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowResumeModal(true)}
                                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-500 transition-all"
                                >
                                    <UploadIcon className="w-4 h-4" />
                                    {resumeData ? "Replace Resume" : "Upload Resume"}
                                </button>
                            </div>
                        </div>

                        {/* Get Feedback Button - Opens Modal */}
                        {!resumeFeedback && (
                            <button
                                onClick={() => setShowAnalysisModal(true)}
                                disabled={feedbackLoading}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-lg hover:from-purple-500 hover:to-pink-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {feedbackLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Analyzing Resume...
                                    </>
                                ) : (
                                    <>
                                        <DocumentIcon className="w-5 h-5" />
                                        Get AI Feedback
                                    </>
                                )}
                            </button>
                        )}

                        {/* Analysis Modal */}
                        {showAnalysisModal && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
                                <div className="w-full max-w-lg mx-4 rounded-2xl border border-white/10 bg-gray-900 shadow-2xl">
                                    <div className="flex items-center justify-between p-6 border-b border-white/10">
                                        <h2 className="text-xl font-bold">Select Resume for Analysis</h2>
                                        <button onClick={() => { setShowAnalysisModal(false); setSelectedAnalysisFile(null); }} className="text-gray-400 hover:text-white">
                                            <XIcon />
                                        </button>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        {/* Option 1: Use Saved Resume */}
                                        {resumeData && (
                                            <button
                                                onClick={async () => {
                                                    setShowAnalysisModal(false);
                                                    setFeedbackLoading(true);
                                                    try {
                                                        // Call analyze-saved-pdf endpoint with user email
                                                        const userEmail = session?.user?.email;
                                                        if (!userEmail) {
                                                            throw new Error("User not authenticated");
                                                        }
                                                        const response = await fetch(`${API_CONFIG.BASE_URL}/api/resume/analyze-saved-pdf?email=${encodeURIComponent(userEmail)}`, {
                                                            method: "POST"
                                                        });
                                                        if (response.ok) {
                                                            const feedback = await response.json();
                                                            setResumeFeedback(feedback);
                                                        } else {
                                                            const errorData = await response.json().catch(() => null);
                                                            setResumeFeedback({ ats_score: 0, strengths: ["Analysis failed"], weaknesses: [errorData?.detail || "No saved PDF found. Upload via 'Upload Different PDF'"], suggestions: [] });
                                                        }
                                                    } catch (error) {
                                                        console.error("Error:", error);
                                                        setResumeFeedback({ ats_score: 0, strengths: ["Error"], weaknesses: ["Please try uploading a new PDF"], suggestions: [] });
                                                    } finally {
                                                        setFeedbackLoading(false);
                                                    }
                                                }}
                                                className="w-full p-4 rounded-xl border border-green-500/30 bg-green-500/10 text-left hover:bg-green-500/20 transition-all"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center">
                                                        <CheckCircleIcon className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-white">Use Saved Resume</p>
                                                        <p className="text-sm text-gray-400">{resumeData.filename || "Resume.pdf"} • {resumeData.skills?.length || 0} skills</p>
                                                    </div>
                                                </div>
                                            </button>
                                        )}

                                        {/* Option 2: Upload New PDF */}
                                        <div className="space-y-3">
                                            <input
                                                type="file"
                                                id="analysis-pdf-upload"
                                                accept=".pdf"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) setSelectedAnalysisFile(file);
                                                }}
                                            />
                                            <label
                                                htmlFor="analysis-pdf-upload"
                                                className={`w-full p-4 rounded-xl border ${selectedAnalysisFile ? 'border-indigo-500/50 bg-indigo-500/10' : 'border-white/10 bg-white/5'} text-left hover:bg-white/10 transition-all flex items-center gap-4 cursor-pointer`}
                                            >
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedAnalysisFile ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                                    <UploadIcon className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-white">{selectedAnalysisFile ? selectedAnalysisFile.name : "Upload Different PDF"}</p>
                                                    <p className="text-sm text-gray-400">{selectedAnalysisFile ? "Click to change file" : "Select a PDF file to analyze"}</p>
                                                </div>
                                            </label>

                                            {selectedAnalysisFile && (
                                                <button
                                                    onClick={async () => {
                                                        setShowAnalysisModal(false);
                                                        setFeedbackLoading(true);
                                                        try {
                                                            const formData = new FormData();
                                                            formData.append("file", selectedAnalysisFile);
                                                            const response = await fetch(`${API_CONFIG.BASE_URL}/api/resume/ai-feedback-pdf`, {
                                                                method: "POST",
                                                                body: formData
                                                            });
                                                            if (response.ok) {
                                                                const feedback = await response.json();
                                                                setResumeFeedback(feedback);
                                                            } else {
                                                                setResumeFeedback({ ats_score: 0, strengths: ["Analysis failed"], weaknesses: ["Please try again"], suggestions: [] });
                                                            }
                                                        } catch (error) {
                                                            setResumeFeedback({ ats_score: 0, strengths: ["Connection error"], weaknesses: ["Please check backend"], suggestions: [] });
                                                        } finally {
                                                            setFeedbackLoading(false);
                                                            setSelectedAnalysisFile(null);
                                                        }
                                                    }}
                                                    className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <DocumentIcon className="w-4 h-4" />
                                                    Analyze {selectedAnalysisFile.name}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Feedback Results */}
                        {resumeFeedback && (
                            <div className="space-y-6">
                                {/* ATS Score */}
                                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 text-center">
                                    <h3 className="text-lg font-semibold text-white mb-4">ATS Compatibility Score</h3>
                                    <div className="relative w-32 h-32 mx-auto mb-4">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle
                                                cx="64"
                                                cy="64"
                                                r="56"
                                                stroke="rgba(255,255,255,0.1)"
                                                strokeWidth="12"
                                                fill="none"
                                            />
                                            <circle
                                                cx="64"
                                                cy="64"
                                                r="56"
                                                stroke={resumeFeedback.ats_score >= 80 ? "#22c55e" : resumeFeedback.ats_score >= 60 ? "#eab308" : "#ef4444"}
                                                strokeWidth="12"
                                                fill="none"
                                                strokeDasharray={`${(resumeFeedback.ats_score / 100) * 352} 352`}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-4xl font-bold text-white">{resumeFeedback.ats_score}</span>
                                        </div>
                                    </div>
                                    <p className={`text-sm ${resumeFeedback.ats_score >= 80 ? "text-green-400" : resumeFeedback.ats_score >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                                        {resumeFeedback.ats_score >= 80 ? "Great! Your resume is ATS-friendly" : resumeFeedback.ats_score >= 60 ? "Good, but could be improved" : "Needs significant improvement"}
                                    </p>
                                </div>

                                {/* Strengths & Weaknesses */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-6">
                                        <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                                            <CheckCircleIcon className="w-5 h-5" /> Strengths
                                        </h3>
                                        <ul className="space-y-2">
                                            {resumeFeedback.strengths.map((s: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2 text-gray-300">
                                                    <span className="text-green-400 mt-1">•</span> {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
                                        <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            Areas to Improve
                                        </h3>
                                        <ul className="space-y-2">
                                            {resumeFeedback.weaknesses.map((w: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2 text-gray-300">
                                                    <span className="text-red-400 mt-1">•</span> {w}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Suggestions */}
                                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
                                    <h3 className="text-lg font-semibold text-white mb-4">Suggestions</h3>
                                    <div className="space-y-3">
                                        {resumeFeedback.suggestions.map((s: string, i: number) => (
                                            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                                                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                    {i + 1}
                                                </div>
                                                <p className="text-gray-300">{s}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Get New Feedback Button */}
                                <div className="text-center">
                                    <button
                                        onClick={() => setResumeFeedback(null)}
                                        className="px-6 py-3 rounded-xl border border-white/20 text-gray-300 hover:bg-white/10 transition-all"
                                    >
                                        Analyze Again
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* No Resume State */}
                        {!resumeData && (
                            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-12 text-center">
                                <DocumentIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-white mb-2">No Resume Uploaded</h3>
                                <p className="text-gray-400 mb-6">Upload your resume to get AI-powered feedback and suggestions</p>
                                <button
                                    onClick={() => setShowResumeModal(true)}
                                    className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-all"
                                >
                                    Upload Resume
                                </button>
                            </div>
                        )}
                    </div>
                )
                }
            </main >
        </div >
    );
}
