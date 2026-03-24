"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";

function SessionTokenSync() {
    const { data: session } = useSession();

    useEffect(() => {
        const currentEmail = session?.user?.email || null;
        const previousEmail = localStorage.getItem("learnoir_session_email");

        if (!currentEmail) {
            localStorage.removeItem("learnoir_token");
            localStorage.removeItem("learnoir_resume_data");
            localStorage.removeItem("learnoir_session_email");
            return;
        }

        if (previousEmail && previousEmail !== currentEmail) {
            localStorage.removeItem("learnoir_resume_data");
        }

        localStorage.setItem("learnoir_session_email", currentEmail);

        const accessToken = (session as any)?.accessToken as string | undefined;
        if (accessToken) {
            localStorage.setItem("learnoir_token", accessToken);
        }
    }, [session]);

    return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <SessionTokenSync />
            {children}
        </SessionProvider>
    );
}
