"use client";

import { useState } from "react";
import { API_CONFIG } from "@/config/api";

interface ResumeUploadProps {
    onUploadComplete: (data: { skills: string[], roles: any[], experience?: string[] }) => void;
    userEmail?: string;  // Optional user email for saving PDF to database
}

export default function ResumeUpload({ onUploadComplete, userEmail }: ResumeUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [feedback, setFeedback] = useState<any>(null);
    const [loadingFeedback, setLoadingFeedback] = useState(false);
    const [uploadedData, setUploadedData] = useState<any>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setFeedback(null);
            setUploadedData(null);
            setUploadProgress(0);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        setError("");
        setUploadProgress(0);

        const formData = new FormData();
        formData.append("file", file);

        try {
            // Use XMLHttpRequest for progress tracking
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener("progress", (e) => {
                if (e.lengthComputable) {
                    const progress = Math.round((e.loaded / e.total) * 100);
                    setUploadProgress(progress);
                }
            });

            xhr.addEventListener("load", async () => {
                if (xhr.status === 200) {
                    const data = JSON.parse(xhr.responseText);
                    setUploadedData(data);
                    onUploadComplete(data);

                    // Also save PDF to database for current authenticated user
                    if (file) {
                        try {
                            const savePdfFormData = new FormData();
                            savePdfFormData.append("file", file);
                            const authToken = localStorage.getItem("learnoir_token");
                            await fetch(`${API_CONFIG.BASE_URL}/api/resume/save-pdf`, {
                                method: "POST",
                                headers: {
                                    ...(authToken && { Authorization: `Bearer ${authToken}` })
                                },
                                body: savePdfFormData
                            });
                            console.log("PDF saved to database");
                        } catch (saveErr) {
                            console.error("Failed to save PDF to database:", saveErr);
                        }
                    }

                    setLoading(false);
                } else {
                    throw new Error("Failed to analyze resume");
                }
            });

            xhr.addEventListener("error", () => {
                setError("Error uploading resume. Please try again.");
                setLoading(false);
            });

            xhr.open("POST", `${API_CONFIG.BASE_URL}/api/resume/analyze`);
            xhr.send(formData);
        } catch (err) {
            setError("Error uploading resume. Please try again.");
            console.error(err);
            setLoading(false);
        }
    };

    const getFeedback = async () => {
        if (!file) return;

        setLoadingFeedback(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/resume/feedback`, {
                method: "POST",
                headers: {
                    ...(token && { "Authorization": `Bearer ${token}` })
                },
                body: formData
            });
            const data = await res.json();
            setFeedback(data);
        } catch (error) {
            console.error("Error getting feedback:", error);
        } finally {
            setLoadingFeedback(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="border-b border-white/10 pb-5">
                <h3 className="text-2xl font-bold leading-6 text-white">Upload Your Resume</h3>
                <p className="mt-2 max-w-4xl text-sm text-gray-400">
                    Upload your resume (PDF) to analyze your skills and get personalized career recommendations.
                </p>
            </div>

            <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer bg-white/5 hover:bg-white/10 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-12 h-12 mb-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mb-2 text-sm text-gray-300">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PDF files only</p>
                        {file && <p className="mt-2 text-sm text-indigo-400 font-medium">{file.name}</p>}
                    </div>
                    <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                </label>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            {/* Upload Progress Bar */}
            {loading && uploadProgress > 0 && (
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-400">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    </div>
                </div>
            )}

            <button
                onClick={handleUpload}
                disabled={!file || loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? "Analyzing Resume..." : "Analyze Resume"}
            </button>

            {/* Resume Feedback Button */}
            {uploadedData && !feedback && (
                <div className="text-center pt-4">
                    <button
                        onClick={getFeedback}
                        disabled={loadingFeedback}
                        className="px-6 py-2 bg-white/5 text-indigo-400 font-medium rounded-lg hover:bg-white/10 transition-all border border-indigo-500/30"
                    >
                        {loadingFeedback ? "Analyzing..." : "🔍 Get AI Resume Feedback"}
                    </button>
                </div>
            )}

            {/* Feedback Display */}
            {feedback && (
                <div className="glass-panel p-6 space-y-6 animate-fadeIn">
                    <div className="border-b border-white/10 pb-4">
                        <h4 className="text-xl font-bold text-white mb-2">Resume Feedback</h4>
                        <p className="text-sm text-gray-400">AI-powered analysis of your resume</p>
                    </div>

                    <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-lg p-6 text-center">
                        <div className="text-sm font-medium text-gray-400 mb-2">ATS Compatibility Score</div>
                        <div className="text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            {feedback.ats_score}/100
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                            {feedback.ats_score >= 80 ? "Excellent" : feedback.ats_score >= 60 ? "Good" : "Needs Improvement"}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
                            <h5 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Strengths
                            </h5>
                            <ul className="space-y-2">
                                {feedback.strengths.map((s: string, i: number) => (
                                    <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                        <span className="text-green-400 mt-1">•</span>
                                        <span>{s}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                            <h5 className="font-semibold text-red-400 mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Areas to Improve
                            </h5>
                            <ul className="space-y-2">
                                {feedback.weaknesses.map((w: string, i: number) => (
                                    <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                        <span className="text-red-400 mt-1">•</span>
                                        <span>{w}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
                        <h5 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            Actionable Suggestions
                        </h5>
                        <ul className="space-y-2">
                            {feedback.suggestions.map((s: string, i: number) => (
                                <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                    <span className="text-blue-400 mt-1">💡</span>
                                    <span>{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
