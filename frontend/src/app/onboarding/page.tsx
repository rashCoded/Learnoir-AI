"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { API_CONFIG } from "@/config/api";

const GOALS = [
    { id: "job", label: "Full-time Job", description: "Looking for a full-time position" },
    { id: "internship", label: "Internship", description: "Seeking internship opportunities" },
    { id: "skill_upgrade", label: "Skill Upgrade", description: "Improving existing skills" }
];

const ROLES = [
    { id: "backend", label: "Backend Developer", icon: "server" },
    { id: "frontend", label: "Frontend Developer", icon: "layout" },
    { id: "fullstack", label: "Full Stack Developer", icon: "layers" },
    { id: "ml_engineer", label: "ML Engineer", icon: "brain" },
    { id: "data_scientist", label: "Data Scientist", icon: "chart" },
    { id: "devops", label: "DevOps Engineer", icon: "cloud" },
    { id: "mobile", label: "Mobile Developer", icon: "phone" },
    { id: "cloud", label: "Cloud Engineer", icon: "server" }
];

const EXPERIENCE_LEVELS = [
    { id: "beginner", label: "Beginner", description: "0-1 years experience", projects: "0-2 projects" },
    { id: "intermediate", label: "Intermediate", description: "1-3 years experience", projects: "3-5 projects" },
    { id: "advanced", label: "Advanced", description: "3+ years experience", projects: "5+ projects" }
];

const COMMON_SKILLS = [
    "Python", "JavaScript", "TypeScript", "Java", "C++", "Go", "Rust",
    "React", "Vue", "Angular", "Node.js", "Django", "FastAPI", "Spring",
    "SQL", "MongoDB", "PostgreSQL", "Redis", "Docker", "Kubernetes",
    "AWS", "GCP", "Azure", "Git", "REST API", "GraphQL", "Machine Learning"
];

export default function OnboardingPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        goal: "",
        target_role: "",
        experience_level: "",
        skills: [] as string[]
    });

    const handleGoalSelect = (goalId: string) => {
        setFormData({ ...formData, goal: goalId });
    };

    const handleRoleSelect = (roleId: string) => {
        setFormData({ ...formData, target_role: roleId });
    };

    const handleExperienceSelect = (level: string) => {
        setFormData({ ...formData, experience_level: level });
    };

    const toggleSkill = (skill: string) => {
        const skills = formData.skills.includes(skill)
            ? formData.skills.filter(s => s !== skill)
            : [...formData.skills, skill];
        setFormData({ ...formData, skills });
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const completeOnboarding = async () => {
        if (!session?.user?.email) return;
        setLoading(true);

        try {
            const token = localStorage.getItem("learnoir_token");
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/auth/onboarding`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` })
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                router.push("/dashboard");
            }
        } catch (error) {
            console.error("Onboarding error:", error);
        } finally {
            setLoading(false);
        }
    };

    const canProceed = () => {
        switch (step) {
            case 1: return formData.goal !== "";
            case 2: return formData.target_role !== "";
            case 3: return formData.experience_level !== "";
            case 4: return true; // Skills are optional
            default: return false;
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col">
            {/* Progress Bar */}
            <div className="fixed top-0 left-0 right-0 h-1 bg-gray-800">
                <div
                    className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-300"
                    style={{ width: `${(step / 4) * 100}%` }}
                />
            </div>

            {/* Header */}
            <div className="pt-16 pb-8 text-center">
                <h1 className="text-3xl font-bold text-white">Welcome to Learnoir</h1>
                <p className="text-gray-400 mt-2">Let's personalize your learning journey</p>
                <p className="text-sm text-gray-500 mt-1">Step {step} of 4</p>
            </div>

            {/* Content */}
            <div className="flex-1 flex items-start justify-center px-4 pb-32">
                <div className="w-full max-w-2xl">

                    {/* Step 1: Goal Selection */}
                    {step === 1 && (
                        <div className="space-y-6 animate-fadeIn">
                            <h2 className="text-2xl font-semibold text-white text-center">What's your goal?</h2>
                            <div className="space-y-4">
                                {GOALS.map((goal) => (
                                    <button
                                        key={goal.id}
                                        onClick={() => handleGoalSelect(goal.id)}
                                        className={`w-full p-6 rounded-xl border text-left transition-all ${formData.goal === goal.id
                                            ? "border-indigo-500 bg-indigo-500/20"
                                            : "border-white/10 bg-white/5 hover:border-white/30"
                                            }`}
                                    >
                                        <p className="text-lg font-semibold text-white">{goal.label}</p>
                                        <p className="text-sm text-gray-400 mt-1">{goal.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Role Selection */}
                    {step === 2 && (
                        <div className="space-y-6 animate-fadeIn">
                            <h2 className="text-2xl font-semibold text-white text-center">Select your target role</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {ROLES.map((role) => (
                                    <button
                                        key={role.id}
                                        onClick={() => handleRoleSelect(role.id)}
                                        className={`p-4 rounded-xl border text-left transition-all ${formData.target_role === role.id
                                            ? "border-indigo-500 bg-indigo-500/20"
                                            : "border-white/10 bg-white/5 hover:border-white/30"
                                            }`}
                                    >
                                        <p className="font-semibold text-white">{role.label}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Experience Level */}
                    {step === 3 && (
                        <div className="space-y-6 animate-fadeIn">
                            <h2 className="text-2xl font-semibold text-white text-center">Your experience level</h2>
                            <div className="space-y-4">
                                {EXPERIENCE_LEVELS.map((level) => (
                                    <button
                                        key={level.id}
                                        onClick={() => handleExperienceSelect(level.id)}
                                        className={`w-full p-6 rounded-xl border text-left transition-all ${formData.experience_level === level.id
                                            ? "border-indigo-500 bg-indigo-500/20"
                                            : "border-white/10 bg-white/5 hover:border-white/30"
                                            }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-lg font-semibold text-white">{level.label}</p>
                                                <p className="text-sm text-gray-400 mt-1">{level.description}</p>
                                            </div>
                                            <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">
                                                {level.projects}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 4: Skills Selection */}
                    {step === 4 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="text-center">
                                <h2 className="text-2xl font-semibold text-white">Select your skills</h2>
                                <p className="text-gray-400 mt-2">Choose skills you already have (optional)</p>
                            </div>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {COMMON_SKILLS.map((skill) => (
                                    <button
                                        key={skill}
                                        onClick={() => toggleSkill(skill)}
                                        className={`px-4 py-2 rounded-full text-sm transition-all ${formData.skills.includes(skill)
                                            ? "bg-indigo-600 text-white"
                                            : "bg-white/5 text-gray-300 border border-white/10 hover:border-white/30"
                                            }`}
                                    >
                                        {skill}
                                    </button>
                                ))}
                            </div>
                            {formData.skills.length > 0 && (
                                <p className="text-center text-sm text-gray-400">
                                    {formData.skills.length} skills selected
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Fixed Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-white/10 p-6">
                <div className="max-w-2xl mx-auto flex gap-4">
                    {step > 1 && (
                        <button
                            onClick={prevStep}
                            className="px-6 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-all"
                        >
                            Back
                        </button>
                    )}

                    {step < 4 ? (
                        <button
                            onClick={nextStep}
                            disabled={!canProceed()}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Continue
                        </button>
                    ) : (
                        <button
                            onClick={completeOnboarding}
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50"
                        >
                            {loading ? "Setting up..." : "Complete Setup"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
