"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import ResumeUpload from "@/components/dashboard/ResumeUpload";
import { API_CONFIG } from "@/config/api";

interface UserProfile {
    id: number;
    name: string;
    email: string;
    goal: string | null;
    target_role: string | null;
    experience_level: string | null;
    skills: string[] | null;
    current_streak: number;
    created_at: string;
}

// SVG Icons
const ArrowLeftIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

const DocumentIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const UserIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const TargetIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const TrashIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const CheckCircleIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ROLE_OPTIONS = [
    { id: "backend_developer", name: "Backend Developer" },
    { id: "frontend_developer", name: "Frontend Developer" },
    { id: "fullstack_developer", name: "Fullstack Developer" },
    { id: "ml_engineer", name: "ML Engineer" },
    { id: "devops_engineer", name: "DevOps Engineer" },
    { id: "data_analyst", name: "Data Analyst" },
];

const GOAL_OPTIONS = [
    { id: "job", name: "Full-time Job" },
    { id: "internship", name: "Internship" },
    { id: "skill_upgrade", name: "Skill Upgrade" },
];

const EXPERIENCE_OPTIONS = [
    { id: "beginner", name: "Beginner (0-1 years)" },
    { id: "intermediate", name: "Intermediate (1-3 years)" },
    { id: "advanced", name: "Advanced (3+ years)" },
];

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [resumeData, setResumeData] = useState<any>(null);
    const [showResumeUpload, setShowResumeUpload] = useState(false);
    const [editingPreferences, setEditingPreferences] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Editable fields
    const [selectedGoal, setSelectedGoal] = useState("");
    const [selectedRole, setSelectedRole] = useState("");
    const [selectedExperience, setSelectedExperience] = useState("");

    useEffect(() => {
        const email = session?.user?.email;
        if (!email) {
            setResumeData(null);
            return;
        }

        const owner = localStorage.getItem("learnoir_session_email");
        if (owner === email) {
            const saved = localStorage.getItem("learnoir_resume_data");
            setResumeData(saved ? JSON.parse(saved) : null);
        } else {
            setResumeData(null);
        }
    }, [session?.user?.email]);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!session?.user?.email) return;
            try {
                const tokenFromSession = (session as any)?.accessToken as string | undefined;
                let token = localStorage.getItem("learnoir_token");
                if (!token && tokenFromSession) {
                    localStorage.setItem("learnoir_token", tokenFromSession);
                    token = tokenFromSession;
                }

                if (!token) {
                    setIsLoading(false);
                    router.push("/auth/signin");
                    return;
                }

                const res = await fetch(`${API_CONFIG.BASE_URL}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const profile = await res.json();
                    setUserProfile(profile);
                    setSelectedGoal(profile.goal || "");
                    setSelectedRole(profile.target_role || "");
                    setSelectedExperience(profile.experience_level || "");
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (status === "authenticated") {
            fetchProfile();
        } else if (status === "unauthenticated") {
            router.push("/auth/signin");
        }
    }, [status, session?.user?.email, router]);

    const handleResumeUploadComplete = (data: any) => {
        setResumeData(data);
        localStorage.setItem("learnoir_resume_data", JSON.stringify(data));
        setShowResumeUpload(false);
        setMessage({ type: "success", text: "Resume uploaded successfully!" });
        setTimeout(() => setMessage(null), 3000);
    };

    const handleDeleteResume = () => {
        if (confirm("Are you sure you want to delete your saved resume?")) {
            localStorage.removeItem("learnoir_resume_data");
            setResumeData(null);
            setMessage({ type: "success", text: "Resume deleted." });
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleSavePreferences = async () => {
        if (!session?.user?.email) return;
        setSaving(true);
        try {
            const token = localStorage.getItem("learnoir_token");
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/auth/onboarding`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` })
                },
                body: JSON.stringify({
                    goal: selectedGoal,
                    target_role: selectedRole,
                    experience_level: selectedExperience,
                    skills: userProfile?.skills || []
                })
            });
            if (res.ok) {
                setEditingPreferences(false);
                setMessage({ type: "success", text: "Preferences updated!" });
                // Refresh profile
                const profileRes = await fetch(`${API_CONFIG.BASE_URL}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (profileRes.ok) setUserProfile(await profileRes.json());
            } else {
                setMessage({ type: "error", text: "Failed to update preferences" });
            }
        } catch (error) {
            setMessage({ type: "error", text: "Error updating preferences" });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    if (status === "loading" || isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-[120px]"></div>
                <div className="absolute top-40 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[120px]"></div>
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
            <main className="relative z-10 mx-auto max-w-4xl pt-24 px-4 sm:px-6 lg:px-8 pb-16">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">My Profile</h1>
                    <p className="text-gray-400">Manage your resume, preferences, and account settings</p>
                </div>

                {/* Message Banner */}
                {message && (
                    <div className={`mb-6 p-4 rounded-xl border ${message.type === "success" ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-red-500/10 border-red-500/30 text-red-400"}`}>
                        {message.text}
                    </div>
                )}

                <div className="space-y-6">
                    {/* Personal Info */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                                <UserIcon />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">Personal Information</h2>
                                <p className="text-sm text-gray-400">Your account details</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-sm text-gray-400 mb-1">Name</p>
                                <p className="font-medium">{session?.user?.name}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-sm text-gray-400 mb-1">Email</p>
                                <p className="font-medium">{session?.user?.email}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-sm text-gray-400 mb-1">Member Since</p>
                                <p className="font-medium">{userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : "N/A"}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-sm text-gray-400 mb-1">Current Streak</p>
                                <p className="font-medium text-orange-400">{userProfile?.current_streak || 0} days</p>
                            </div>
                        </div>
                    </div>

                    {/* Resume Management */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                                    <DocumentIcon />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">Resume Management</h2>
                                    <p className="text-sm text-gray-400">Your active resume for all features</p>
                                </div>
                            </div>
                        </div>

                        {showResumeUpload ? (
                            <div className="border border-white/10 rounded-xl p-6 bg-black/30">
                                <ResumeUpload onUploadComplete={handleResumeUploadComplete} />
                                <button
                                    onClick={() => setShowResumeUpload(false)}
                                    className="mt-4 text-sm text-gray-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : resumeData ? (
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <CheckCircleIcon />
                                        <div>
                                            <p className="font-medium text-green-400">{resumeData.filename || "Resume.pdf"}</p>
                                            <p className="text-sm text-gray-400">{resumeData.skills?.length || 0} skills detected</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setShowResumeUpload(true)}
                                            className="px-4 py-2 rounded-lg bg-indigo-600 text-sm font-medium hover:bg-indigo-500 transition-all"
                                        >
                                            Replace
                                        </button>
                                        <button
                                            onClick={handleDeleteResume}
                                            className="p-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
                                        >
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </div>
                                {resumeData.skills && resumeData.skills.length > 0 && (
                                    <div>
                                        <p className="text-sm text-gray-400 mb-2">Detected Skills:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {resumeData.skills.map((skill: string, idx: number) => (
                                                <span key={idx} className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-sm">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8 border border-dashed border-white/20 rounded-xl">
                                <DocumentIcon />
                                <p className="text-gray-400 mt-2 mb-4">No resume uploaded yet</p>
                                <button
                                    onClick={() => setShowResumeUpload(true)}
                                    className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-all"
                                >
                                    Upload Resume
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Preferences */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                    <TargetIcon />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">Career Preferences</h2>
                                    <p className="text-sm text-gray-400">Your onboarding answers</p>
                                </div>
                            </div>
                            {!editingPreferences && (
                                <button
                                    onClick={() => setEditingPreferences(true)}
                                    className="px-4 py-2 rounded-lg border border-white/20 text-sm hover:bg-white/10 transition-all"
                                >
                                    Edit
                                </button>
                            )}
                        </div>

                        {editingPreferences ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Goal</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {GOAL_OPTIONS.map((option) => (
                                            <button
                                                key={option.id}
                                                onClick={() => setSelectedGoal(option.id)}
                                                className={`p-3 rounded-xl border text-sm transition-all ${selectedGoal === option.id ? 'border-indigo-500 bg-indigo-500/20 text-indigo-400' : 'border-white/10 hover:border-white/30'}`}
                                            >
                                                {option.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Target Role</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {ROLE_OPTIONS.map((option) => (
                                            <button
                                                key={option.id}
                                                onClick={() => setSelectedRole(option.id)}
                                                className={`p-3 rounded-xl border text-sm transition-all ${selectedRole === option.id ? 'border-indigo-500 bg-indigo-500/20 text-indigo-400' : 'border-white/10 hover:border-white/30'}`}
                                            >
                                                {option.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Experience Level</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {EXPERIENCE_OPTIONS.map((option) => (
                                            <button
                                                key={option.id}
                                                onClick={() => setSelectedExperience(option.id)}
                                                className={`p-3 rounded-xl border text-sm transition-all ${selectedExperience === option.id ? 'border-indigo-500 bg-indigo-500/20 text-indigo-400' : 'border-white/10 hover:border-white/30'}`}
                                            >
                                                {option.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={handleSavePreferences}
                                        disabled={saving}
                                        className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-all disabled:opacity-50"
                                    >
                                        {saving ? "Saving..." : "Save Changes"}
                                    </button>
                                    <button
                                        onClick={() => setEditingPreferences(false)}
                                        className="px-6 py-3 rounded-lg border border-white/20 hover:bg-white/10 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                    <p className="text-sm text-gray-400 mb-1">Goal</p>
                                    <p className="font-medium">{GOAL_OPTIONS.find(g => g.id === userProfile?.goal)?.name || userProfile?.goal || "Not set"}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                    <p className="text-sm text-gray-400 mb-1">Target Role</p>
                                    <p className="font-medium">{ROLE_OPTIONS.find(r => r.id === userProfile?.target_role)?.name || userProfile?.target_role?.replace(/_/g, " ") || "Not set"}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                    <p className="text-sm text-gray-400 mb-1">Experience</p>
                                    <p className="font-medium">{EXPERIENCE_OPTIONS.find(e => e.id === userProfile?.experience_level)?.name || userProfile?.experience_level || "Not set"}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Danger Zone */}
                    <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6">
                        <h2 className="text-xl font-semibold text-red-400 mb-2">Danger Zone</h2>
                        <p className="text-sm text-gray-400 mb-4">Irreversible actions. Please be careful.</p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => {
                                    if (confirm("Are you sure you want to sign out?")) {
                                        localStorage.removeItem("learnoir_resume_data");
                                        localStorage.removeItem("learnoir_token");
                                        signOut({ callbackUrl: "/" });
                                    }
                                }}
                                className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all text-sm"
                            >
                                Sign Out
                            </button>
                            <button
                                onClick={() => alert("Account deletion is not yet implemented. Contact support.")}
                                className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all text-sm"
                            >
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
