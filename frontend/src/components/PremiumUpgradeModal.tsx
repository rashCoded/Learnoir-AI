"use client";

import { useState } from "react";
import { api } from "@/lib/api";

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface PremiumUpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userEmail: string;
    userName: string;
}

const PREMIUM_FEATURES = [
    { name: "AI Recruiter Simulator", description: "See why you'd get rejected or hired" },
    { name: "Auto Project Builder", description: "Generate portfolio projects from JDs" },
    { name: "Smart Job Matching", description: "See your role match percentages" },
    { name: "Learning Lab", description: "Personalized exercises for weak skills" },
    { name: "Coding Practice", description: "AI-generated coding challenges" },
];

const FREE_FEATURES = [
    { name: "Resume Analysis", included: true },
    { name: "Basic Career Roadmap", included: true },
    { name: "Interview Prep (MCQs)", included: true },
    { name: "Progress Tracking", included: true },
];

export default function PremiumUpgradeModal({
    isOpen,
    onClose,
    onSuccess,
    userEmail,
    userName,
}: PremiumUpgradeModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadRazorpayScript = (): Promise<boolean> => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleUpgrade = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Load Razorpay script
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                throw new Error("Failed to load payment gateway");
            }

            // Create order
            const orderResult = await api.createPaymentOrder();
            if (orderResult.error || !orderResult.data) {
                throw new Error(orderResult.error || "Failed to create order");
            }

            const { order_id, amount, currency, key_id } = orderResult.data;

            // Open Razorpay checkout
            const options = {
                key: key_id,
                amount: amount,
                currency: currency,
                name: "Learnoir AI",
                description: "Premium Subscription - 1 Year",
                order_id: order_id,
                prefill: {
                    email: userEmail,
                    name: userName,
                },
                theme: {
                    color: "#6366f1",
                },
                handler: async (response: {
                    razorpay_order_id: string;
                    razorpay_payment_id: string;
                    razorpay_signature: string;
                }) => {
                    // Verify payment
                    try {
                        const verifyResult = await api.verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        if (verifyResult.error) {
                            setError(verifyResult.error);
                            return;
                        }

                        // Success!
                        onSuccess();
                        onClose();
                    } catch (err) {
                        setError("Payment verification failed");
                    }
                },
                modal: {
                    ondismiss: () => {
                        setIsLoading(false);
                    },
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();

        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-lg mx-4 rounded-xl border border-white/10 bg-gray-900 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="relative p-4 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-b border-white/10">
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2L1 21h22L12 2zm0 4l7.53 13H4.47L12 6z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Upgrade to Premium</h2>
                            <p className="text-gray-400 text-sm">Unlock all AI-powered features</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    {/* Pricing */}
                    <div className="text-center mb-4">
                        <div className="flex items-baseline justify-center gap-1">
                            <span className="text-4xl font-bold text-white">₹499</span>
                            <span className="text-gray-400 text-sm">/year</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">One-time payment, no auto-renewal</p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        {/* Free Features */}
                        <div className="p-3 rounded-lg border border-white/10 bg-white/5">
                            <h3 className="font-semibold text-gray-400 mb-2 text-xs uppercase tracking-wider">Free Plan</h3>
                            <ul className="space-y-1">
                                {FREE_FEATURES.map((feature) => (
                                    <li key={feature.name} className="flex items-center gap-1.5 text-gray-300 text-xs">
                                        <svg className="w-3 h-3 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {feature.name}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Premium Features */}
                        <div className="p-3 rounded-lg border border-indigo-500/30 bg-indigo-500/10">
                            <h3 className="font-semibold text-indigo-400 mb-2 text-xs uppercase tracking-wider flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2L1 21h22L12 2zm0 4l7.53 13H4.47L12 6z" />
                                </svg>
                                Premium Only
                            </h3>
                            <ul className="space-y-1">
                                {PREMIUM_FEATURES.map((feature) => (
                                    <li key={feature.name} className="flex items-center gap-1.5 text-white text-xs">
                                        <svg className="w-3 h-3 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {feature.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-3 p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                            {error}
                        </div>
                    )}

                    {/* CTA */}
                    <button
                        onClick={handleUpgrade}
                        disabled={isLoading}
                        className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Upgrade Now - ₹499/year
                            </>
                        )}
                    </button>

                    {/* Trust badges */}
                    <div className="mt-3 flex items-center justify-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Secure Payment
                        </span>
                        <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Powered by Razorpay
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
