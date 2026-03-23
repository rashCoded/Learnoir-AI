"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { API_CONFIG } from "@/config/api";

export default function SignUp() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        age: "",
        graduation_year: "",
        user_status: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // OTP verification state
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem("learnoir_token", data.access_token);

                // Send OTP for email verification
                await fetch(`${API_CONFIG.BASE_URL}/api/auth/send-otp`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: formData.email }),
                });

                // Show OTP modal
                setShowOTPModal(true);
            } else {
                const data = await res.json();
                if (data.detail) {
                    if (Array.isArray(data.detail)) {
                        setError(data.detail.map((err: any) => err.msg).join(", "));
                    } else if (typeof data.detail === 'string') {
                        setError(data.detail);
                    } else {
                        setError("Registration failed");
                    }
                } else {
                    setError("Registration failed");
                }
            }
        } catch (err) {
            console.error(err);
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (otp.length !== 6) {
            setOtpError("Please enter a 6-digit OTP");
            return;
        }

        setOtpLoading(true);
        setOtpError("");

        try {
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/auth/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.email, otp }),
            });

            if (res.ok) {
                // OTP verified, sign in and redirect
                const signInResult = await signIn("credentials", {
                    email: formData.email,
                    password: formData.password,
                    redirect: false,
                });

                if (signInResult?.ok) {
                    router.push("/dashboard");
                } else {
                    window.location.href = "/dashboard";
                }
            } else {
                const data = await res.json();
                setOtpError(data.detail || "Invalid OTP");
            }
        } catch (err) {
            setOtpError("Verification failed");
        } finally {
            setOtpLoading(false);
        }
    };

    const resendOTP = async () => {
        setOtpLoading(true);
        try {
            await fetch(`${API_CONFIG.BASE_URL}/api/auth/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.email }),
            });
            setOtpError("OTP resent to your email!");
        } catch (err) {
            setOtpError("Failed to resend OTP");
        } finally {
            setOtpLoading(false);
        }
    };

    const skipVerification = async () => {
        // Allow skipping for now, but email won't be verified
        const signInResult = await signIn("credentials", {
            email: formData.email,
            password: formData.password,
            redirect: false,
        });

        if (signInResult?.ok) {
            router.push("/dashboard");
        } else {
            window.location.href = "/dashboard";
        }
    };

    return (
        <div className="flex min-h-screen flex-col justify-center bg-black px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600"></div>
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white">
                    Create your account
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium leading-6 text-white"
                        >
                            Full Name
                        </label>
                        <div className="mt-2">
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium leading-6 text-white"
                        >
                            Email address
                        </label>
                        <div className="mt-2">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium leading-6 text-white"
                        >
                            Password
                        </label>
                        <div className="mt-2 relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="block w-full rounded-md border-0 bg-white/5 py-1.5 pr-10 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                            >
                                {showPassword ? (
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="age" className="block text-sm font-medium leading-6 text-white">
                                Age (Optional)
                            </label>
                            <div className="mt-2">
                                <input
                                    id="age"
                                    name="age"
                                    type="number"
                                    min="15"
                                    max="100"
                                    value={formData.age}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="graduation_year" className="block text-sm font-medium leading-6 text-white">
                                Graduation Year (Optional)
                            </label>
                            <div className="mt-2">
                                <input
                                    id="graduation_year"
                                    name="graduation_year"
                                    type="number"
                                    min="2020"
                                    max="2030"
                                    placeholder="e.g., 2025"
                                    value={formData.graduation_year}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="user_status" className="block text-sm font-medium leading-6 text-white">
                            I am a... (Optional)
                        </label>
                        <div className="mt-2">
                            <select
                                id="user_status"
                                name="user_status"
                                value={formData.user_status}
                                onChange={handleChange}
                                className="block w-full rounded-md border-0 bg-white/5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                            >
                                <option value="" className="bg-gray-900">Select your status</option>
                                <option value="student" className="bg-gray-900">Student (Looking for first job)</option>
                                <option value="employee" className="bg-gray-900">Employee (Looking to switch)</option>
                                <option value="job_seeker" className="bg-gray-900">Job Seeker</option>
                                <option value="upskilling" className="bg-gray-900">Professional (Upskilling)</option>
                            </select>
                        </div>
                    </div>

                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Creating account..." : "Sign Up"}
                        </button>
                    </div>
                </form>

                <p className="mt-10 text-center text-sm text-gray-400">
                    Already have an account?{" "}
                    <Link
                        href="/auth/signin"
                        className="font-semibold leading-6 text-indigo-400 hover:text-indigo-300"
                    >
                        Sign In
                    </Link>
                </p>
            </div>

            {/* OTP Verification Modal */}
            {showOTPModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-md mx-4 rounded-2xl border border-white/10 bg-gray-900 shadow-2xl p-8">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-white">Verify Your Email</h3>
                            <p className="text-gray-400 mt-2">
                                We sent a 6-digit code to<br />
                                <span className="text-indigo-400 font-medium">{formData.email}</span>
                            </p>
                        </div>

                        {otpError && (
                            <div className={`mb-4 p-3 rounded-lg text-sm text-center ${otpError.includes("resent") ? "bg-green-500/10 border border-green-500/30 text-green-400" : "bg-red-500/10 border border-red-500/30 text-red-400"}`}>
                                {otpError}
                            </div>
                        )}

                        <div className="mb-6">
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                maxLength={6}
                                className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white text-center text-3xl tracking-[0.5em] placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                placeholder="000000"
                            />
                        </div>

                        <button
                            onClick={handleVerifyOTP}
                            disabled={otp.length !== 6 || otpLoading}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50 mb-3"
                        >
                            {otpLoading ? "Verifying..." : "Verify Email"}
                        </button>

                        <button
                            onClick={resendOTP}
                            disabled={otpLoading}
                            className="w-full py-2 text-gray-400 hover:text-white transition-colors text-sm mb-3"
                        >
                            Didn't receive the code? Resend OTP
                        </button>

                        <button
                            onClick={skipVerification}
                            className="w-full py-2 text-gray-500 hover:text-gray-300 transition-colors text-xs"
                        >
                            Skip for now (you can verify later)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
