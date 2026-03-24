"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";

function SessionTokenSync() {
    const { data: session } = useSession();

    useEffect(() => {
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
