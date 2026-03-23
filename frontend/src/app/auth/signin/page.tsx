"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect, Suspense } from "react"; 
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

type MessageType = {
    text: string;
    type: 'success' | 'error' | 'info';
};

function SignInContent() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<MessageType | null>(null);
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const registered = searchParams.get("registered");
        if (registered) {
            setMessage({
                text: "Account created successfully! Please sign in.",
                type: 'success'
            });
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);

        console.log("🔐 Starting login process...");

        try {
            const { data, error } = await api.login({ email, password });

            console.log("📡 Backend response:", { data, error });

            if (error) {
                console.error("❌ Login error from backend:", error);
                setMessage({ text: error, type: 'error' });
                setLoading(false);
                return;
            }

            if (data?.access_token) {
                console.log("✅ Login successful, token received");

                const signInResult = await signIn("credentials", {
                    email,
                    password,
                    redirect: false
                });

                console.log("🔑 NextAuth result:", signInResult);

                if (signInResult?.error) {
                    console.error("⚠️ NextAuth sign-in error:", signInResult.error);
                }

                console.log("🚀 Redirecting to dashboard...");
                router.push("/dashboard");
            } else {
                throw new Error("No access token in response");
            }
        } catch (error) {
            console.error("❌ Login error:", error);
            setMessage({
                text: error instanceof Error ? error.message : "An error occurred. Please try again.",
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col justify-center bg-black px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600"></div>
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white">
                    Sign in to Learnoir
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                {message && (
                    <div className={`p-3 rounded-md ${message.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                        {message.text}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium leading-6 text-white">
                            Email address
                        </label>
                        <div className="mt-2">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm font-medium leading-6 text-white">
                                Password
                            </label>
                        </div>
                        <div className="mt-2 relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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

                    <div className="flex items-center justify-end">
                        <Link href="/auth/forgot-password" className="text-sm text-indigo-400 hover:text-indigo-300">
                            Forgot your password?
                        </Link>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Signing in..." : "Sign in"}
                        </button>
                    </div>
                </form>

                {/* OAuth Divider */}
                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-black px-2 text-gray-400">Or continue with</span>
                        </div>
                    </div>
                </div>

                {/* Google OAuth Button */}
                <div className="mt-6">
                    <button
                        type="button"
                        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                        className="flex w-full items-center justify-center gap-3 rounded-md bg-white/5 px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-white/10 hover:bg-white/10 transition-all"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>
                </div>

                <p className="mt-10 text-center text-sm text-gray-400">
                    Not a member?{" "}
                    <Link href="/auth/signup" className="font-semibold leading-6 text-indigo-400 hover:text-indigo-300">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}


export default function SignIn() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <SignInContent />
        </Suspense>
    );
}
