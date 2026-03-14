// components/HeroDemoEmbed.tsx
"use client";

import { useState } from "react";

export default function HeroDemoEmbed() {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div className="relative w-full max-w-6xl mx-auto px-6">
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl opacity-50" />

            {/* Frame container */}
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-indigo-500/10 bg-black">
                {/* Browser-like top bar */}
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-900/80 border-b border-white/5">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                        <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <div className="flex-1 flex justify-center">
                        <div className="px-4 py-1 bg-gray-800/50 rounded-md text-xs text-gray-400 font-mono">
                            learnoir.app/dashboard
                        </div>
                    </div>
                    <div className="w-16" /> {/* Spacer for symmetry */}
                </div>

                {/* Loading placeholder */}
                {!isLoaded && (
                    <div className="absolute inset-0 top-[44px] flex items-center justify-center bg-gray-900">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm text-gray-400">Loading preview...</span>
                        </div>
                    </div>
                )}

                {/* Iframe */}
                <iframe
                    src="/demo-preview"
                    title="Learnoir interactive dashboard demo"
                    className={`w-full h-[480px] md:h-[520px] border-0 transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                    sandbox="allow-scripts allow-same-origin"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onLoad={() => setIsLoaded(true)}
                />
            </div>

            {/* Caption */}
            <p className="text-center text-sm text-gray-500 mt-4">
                Interactive preview - all features work in the full version
            </p>
        </div>
    );
}
