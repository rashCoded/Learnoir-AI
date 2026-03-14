"use client";

import { useState } from "react";

interface LockedFeatureOverlayProps {
    featureName: string;
    onUpgradeClick: () => void;
}

export default function LockedFeatureOverlay({
    featureName,
    onUpgradeClick,
}: LockedFeatureOverlayProps) {
    return (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-black/60 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                </svg>
            </div>
            <p className="text-white font-medium mb-1">{featureName}</p>
            <p className="text-gray-400 text-sm mb-3">Premium Feature</p>
            <button
                onClick={onUpgradeClick}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:from-indigo-500 hover:to-purple-500 transition-all"
            >
                Upgrade to Unlock
            </button>
        </div>
    );
}
