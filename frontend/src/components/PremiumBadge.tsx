"use client";

interface PremiumBadgeProps {
    size?: "sm" | "md" | "lg";
    showText?: boolean;
}

export default function PremiumBadge({ size = "md", showText = true }: PremiumBadgeProps) {
    const sizeClasses = {
        sm: "text-xs px-2 py-0.5",
        md: "text-sm px-3 py-1",
        lg: "text-base px-4 py-1.5",
    };

    const iconSizes = {
        sm: "w-3 h-3",
        md: "w-4 h-4",
        lg: "w-5 h-5",
    };

    return (
        <div
            className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-yellow-400 font-semibold ${sizeClasses[size]}`}
        >
            <svg className={iconSizes[size]} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L1 21h22L12 2zm0 4l7.53 13H4.47L12 6z" />
            </svg>
            {showText && <span>Premium</span>}
        </div>
    );
}
