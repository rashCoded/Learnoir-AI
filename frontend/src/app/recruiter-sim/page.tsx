"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { API_CONFIG } from "@/config/api";

// SVG Icons
const ArrowLeftIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

const UserIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const DocumentIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const UploadIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const CheckIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const XIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const AlertIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

interface RecruiterResult {
    verdict: "shortlist" | "reject" | "maybe";
    verdict_confidence: number;
    shortlist_reasons: string[];
    rejection_risks: string[];
    missing_keywords: {
        keyword: string;
        importance: string;
        found: boolean;
        suggestion?: string;
    }[];
    lines_to_rewrite: {
        original: string;
        rewritten: string;
        reason: string;
    }[];
    ats_score: number;
    recruiter_notes: string;
    action_items: string[];
}

type ResumeSource = "saved" | "upload" | "paste";

export default function RecruiterSimPage() {
    const [resumeText, setResumeText] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<RecruiterResult | null>(null);
    const [activeTab, setActiveTab] = useState<"verdict" | "keywords" | "rewrite" | "actions">("verdict");

    // Resume source state
    const [resumeSource, setResumeSource] = useState<ResumeSource>("saved");
    const [savedResumeExists, setSavedResumeExists] = useState(false);
    const [savedResumeText, setSavedResumeText] = useState("");
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isParsingPdf, setIsParsingPdf] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Check for saved resume on mount
    useEffect(() => {
        // Try the main key first, then fallback
        const stored = localStorage.getItem("learnoir_resume_data") || localStorage.getItem("parsedResumeData");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setSavedResumeExists(true);
                // Construct text from parsed resume data
                const text = constructResumeText(parsed);
                setSavedResumeText(text);
                setResumeText(text);
            } catch {
                setSavedResumeExists(false);
            }
        }
    }, []);

    const constructResumeText = (data: any): string => {
        let text = "";

        if (data.name) text += `Name: ${data.name}\n`;
        if (data.email) text += `Email: ${data.email}\n`;
        if (data.phone) text += `Phone: ${data.phone}\n`;
        if (data.location) text += `Location: ${data.location}\n`;

        if (data.summary) text += `\nSummary:\n${data.summary}\n`;

        if (data.skills?.length) {
            text += `\nSkills:\n${data.skills.join(", ")}\n`;
        }

        if (data.experience?.length) {
            text += `\nExperience:\n`;
            data.experience.forEach((exp: any) => {
                text += `${exp.title} at ${exp.company} (${exp.duration})\n`;
                if (exp.description) text += `${exp.description}\n`;
            });
        }

        if (data.education?.length) {
            text += `\nEducation:\n`;
            data.education.forEach((edu: any) => {
                text += `${edu.degree} from ${edu.institution} (${edu.year})\n`;
            });
        }

        if (data.projects?.length) {
            text += `\nProjects:\n`;
            data.projects.forEach((proj: any) => {
                text += `${proj.name}: ${proj.description}\n`;
            });
        }

        if (data.certifications?.length) {
            text += `\nCertifications:\n${data.certifications.join(", ")}\n`;
        }

        return text;
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            alert("Please upload a PDF file");
            return;
        }

        setUploadedFile(file);
        setIsParsingPdf(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch(`${API_CONFIG.BASE_URL}/api/resume/parse`, {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                const text = constructResumeText(data);
                setResumeText(text);
            } else {
                alert("Failed to parse PDF. Please try pasting your resume text instead.");
                setResumeSource("paste");
            }
        } catch (error) {
            console.error("Error parsing PDF:", error);
            alert("Failed to parse PDF. Please try pasting your resume text instead.");
            setResumeSource("paste");
        } finally {
            setIsParsingPdf(false);
        }
    };

    const handleSourceChange = (source: ResumeSource) => {
        setResumeSource(source);
        if (source === "saved" && savedResumeText) {
            setResumeText(savedResumeText);
        } else if (source === "paste") {
            setResumeText("");
        } else if (source === "upload") {
            setResumeText("");
            setUploadedFile(null);
        }
    };

    const handleSimulate = async () => {
        if (!resumeText.trim() || !jobDescription.trim()) return;

        setIsLoading(true);
        setResult(null);

        try {
            const token = localStorage.getItem("learnoir_token");
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/recruiter/simulate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    resume_text: resumeText,
                    job_description: jobDescription
                })
            });

            if (response.ok) {
                const data = await response.json();
                setResult(data);
            } else {
                console.error("Failed to simulate");
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getVerdictColor = (verdict: string) => {
        switch (verdict) {
            case "shortlist": return "bg-green-500";
            case "reject": return "bg-red-500";
            default: return "bg-yellow-500";
        }
    };

    const getVerdictBg = (verdict: string) => {
        switch (verdict) {
            case "shortlist": return "bg-green-500/10 border-green-500/30 text-green-400";
            case "reject": return "bg-red-500/10 border-red-500/30 text-red-400";
            default: return "bg-yellow-500/10 border-yellow-500/30 text-yellow-400";
        }
    };

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
            <main className="relative z-10 mx-auto max-w-7xl pt-24 px-4 sm:px-6 lg:px-8 pb-16">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-4">
                        <UserIcon />
                        AI Recruiter Simulator
                    </div>
                    <h1 className="text-4xl font-bold mb-3">
                        See Your Resume Through a Recruiter's Eyes
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Get brutally honest feedback on why you might get rejected or shortlisted.
                        No sugarcoating - just real recruiter insights.
                    </p>
                </div>

                {/* Input Section */}
                {!result && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Resume Input */}
                        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                                    <DocumentIcon />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">Your Resume</h3>
                                    <p className="text-sm text-gray-400">Choose how to provide your resume</p>
                                </div>
                            </div>

                            {/* Resume Source Options */}
                            <div className="flex gap-2 mb-4">
                                <button
                                    onClick={() => handleSourceChange("saved")}
                                    disabled={!savedResumeExists}
                                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${resumeSource === "saved"
                                        ? "bg-purple-600 text-white"
                                        : savedResumeExists
                                            ? "bg-white/10 text-gray-300 hover:bg-white/20"
                                            : "bg-white/5 text-gray-500 cursor-not-allowed"
                                        }`}
                                >
                                    <CheckIcon />
                                    Use Saved
                                </button>
                                <button
                                    onClick={() => handleSourceChange("upload")}
                                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${resumeSource === "upload"
                                        ? "bg-purple-600 text-white"
                                        : "bg-white/10 text-gray-300 hover:bg-white/20"
                                        }`}
                                >
                                    <UploadIcon />
                                    Upload PDF
                                </button>
                                <button
                                    onClick={() => handleSourceChange("paste")}
                                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${resumeSource === "paste"
                                        ? "bg-purple-600 text-white"
                                        : "bg-white/10 text-gray-300 hover:bg-white/20"
                                        }`}
                                >
                                    <DocumentIcon />
                                    Paste Text
                                </button>
                            </div>

                            {/* Saved Resume Display */}
                            {resumeSource === "saved" && (
                                <div className="relative">
                                    {savedResumeExists ? (
                                        <>
                                            <div className="absolute top-3 left-3 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-md flex items-center gap-1">
                                                <CheckIcon /> Using saved resume
                                            </div>
                                            <textarea
                                                value={resumeText}
                                                readOnly
                                                className="w-full h-64 bg-black/50 border border-green-500/30 rounded-xl p-4 pt-12 text-white text-sm focus:outline-none resize-none"
                                            />
                                        </>
                                    ) : (
                                        <div className="h-64 bg-black/50 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                                            <DocumentIcon />
                                            <p className="mt-2 text-gray-400">No saved resume found</p>
                                            <p className="text-sm text-gray-500">Upload a resume on the Dashboard first</p>
                                            <Link href="/dashboard" className="mt-3 text-indigo-400 hover:text-indigo-300 text-sm">
                                                Go to Dashboard
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Upload PDF */}
                            {resumeSource === "upload" && (
                                <div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf,application/pdf"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        id="pdf-upload"
                                    />
                                    {!uploadedFile ? (
                                        <label
                                            htmlFor="pdf-upload"
                                            className="h-64 bg-black/50 border-2 border-dashed border-white/20 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-purple-500/50 transition-colors block"
                                        >
                                            <div className="w-16 h-16 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
                                                <UploadIcon />
                                            </div>
                                            <p className="text-white font-medium">Click to upload PDF</p>
                                            <p className="text-sm text-gray-400 mt-1">or drag and drop</p>
                                        </label>
                                    ) : isParsingPdf ? (
                                        <div className="h-64 bg-black/50 border border-purple-500/30 rounded-xl p-4 flex flex-col items-center justify-center">
                                            <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                                            <p className="text-purple-400">Parsing PDF...</p>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <div className="absolute top-3 left-3 px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-md flex items-center gap-1">
                                                <CheckIcon /> {uploadedFile.name}
                                            </div>
                                            <textarea
                                                value={resumeText}
                                                readOnly
                                                className="w-full h-64 bg-black/50 border border-purple-500/30 rounded-xl p-4 pt-12 text-white text-sm focus:outline-none resize-none"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Paste Text */}
                            {resumeSource === "paste" && (
                                <textarea
                                    value={resumeText}
                                    onChange={(e) => setResumeText(e.target.value)}
                                    placeholder="Paste your entire resume here..."
                                    className="w-full h-64 bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
                                />
                            )}
                        </div>

                        {/* Job Description Input */}
                        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">Job Description</h3>
                                    <p className="text-sm text-gray-400">Paste the JD you're applying to</p>
                                </div>
                            </div>
                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste the job description here..."
                                className="w-full h-64 bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
                            />
                        </div>
                    </div>
                )}

                {/* Simulate Button */}
                {!result && (
                    <div className="text-center">
                        <button
                            onClick={handleSimulate}
                            disabled={isLoading || !resumeText.trim() || !jobDescription.trim()}
                            className="px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold text-lg rounded-xl hover:from-red-500 hover:to-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <UserIcon />
                                    Simulate Recruiter Review
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-400 animate-pulse">AI Recruiter is reviewing your application...</p>
                        <p className="text-sm text-gray-500 mt-2">This simulates a real hiring process</p>
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
                            <ArrowLeftIcon /> Try with different resume/JD
                        </button>

                        {/* Verdict Card */}
                        <div className={`rounded-2xl border p-8 text-center ${getVerdictBg(result.verdict)}`}>
                            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${getVerdictColor(result.verdict)} mb-4`}>
                                {result.verdict === "shortlist" ? (
                                    <CheckIcon />
                                ) : result.verdict === "reject" ? (
                                    <XIcon />
                                ) : (
                                    <AlertIcon />
                                )}
                            </div>
                            <h2 className="text-3xl font-bold mb-2 capitalize">{result.verdict}</h2>
                            <p className="text-lg opacity-80">Confidence: {result.verdict_confidence}%</p>
                            <p className="mt-4 text-lg">{result.recruiter_notes}</p>
                            <div className="mt-4 inline-block px-4 py-2 rounded-full bg-white/10">
                                ATS Score: <span className="font-bold">{result.ats_score}/100</span>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {[
                                { id: "verdict", label: "Analysis" },
                                { id: "keywords", label: "Missing Keywords" },
                                { id: "rewrite", label: "Rewrite Suggestions" },
                                { id: "actions", label: "Action Items" }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                        ? "bg-indigo-600 text-white"
                                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
                            {activeTab === "verdict" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Shortlist Reasons */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                                            <CheckIcon /> Why You Might Get Shortlisted
                                        </h3>
                                        <ul className="space-y-3">
                                            {result.shortlist_reasons.map((reason, idx) => (
                                                <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                                    <CheckIcon />
                                                    <span>{reason}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Rejection Risks */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                                            <XIcon /> Why You Might Get Rejected
                                        </h3>
                                        <ul className="space-y-3">
                                            {result.rejection_risks.map((risk, idx) => (
                                                <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                                    <XIcon />
                                                    <span>{risk}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {activeTab === "keywords" && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Missing Keywords from Job Description</h3>
                                    <div className="space-y-3">
                                        {result.missing_keywords.map((kw, idx) => (
                                            <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-semibold text-white">{kw.keyword}</span>
                                                    <span className={`px-2 py-1 rounded text-xs ${kw.importance === "critical"
                                                        ? "bg-red-500/20 text-red-400"
                                                        : kw.importance === "important"
                                                            ? "bg-yellow-500/20 text-yellow-400"
                                                            : "bg-gray-500/20 text-gray-400"
                                                        }`}>
                                                        {kw.importance}
                                                    </span>
                                                </div>
                                                {kw.suggestion && (
                                                    <p className="text-sm text-gray-400">{kw.suggestion}</p>
                                                )}
                                            </div>
                                        ))}
                                        {result.missing_keywords.length === 0 && (
                                            <p className="text-gray-400 text-center py-8">No critical keywords missing!</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === "rewrite" && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Lines to Rewrite</h3>
                                    <div className="space-y-4">
                                        {result.lines_to_rewrite.map((line, idx) => (
                                            <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                                                <div className="mb-3">
                                                    <p className="text-xs text-gray-500 mb-1">ORIGINAL:</p>
                                                    <p className="text-red-400 line-through">{line.original}</p>
                                                </div>
                                                <div className="mb-3">
                                                    <p className="text-xs text-gray-500 mb-1">SUGGESTED:</p>
                                                    <p className="text-green-400">{line.rewritten}</p>
                                                </div>
                                                <div className="pt-2 border-t border-white/10">
                                                    <p className="text-sm text-gray-400">{line.reason}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {result.lines_to_rewrite.length === 0 && (
                                            <p className="text-gray-400 text-center py-8">No specific lines need rewriting!</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === "actions" && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Action Items</h3>
                                    <div className="space-y-3">
                                        {result.action_items.map((action, idx) => (
                                            <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                                                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                                                    {idx + 1}
                                                </div>
                                                <p className="text-white">{action}</p>
                                            </div>
                                        ))}
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
