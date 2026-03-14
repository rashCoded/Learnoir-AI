import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
    providers: [
        // Google OAuth Provider
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        // Existing Credentials Provider
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    // Use 127.0.0.1 explicitly to avoid IPv6 resolution issues
                    const response = await fetch("http://127.0.0.1:8000/api/auth/login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password,
                        }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        return {
                            id: String(data.user.id),
                            name: data.user.name,
                            email: data.user.email,
                            accessToken: data.access_token,
                        };
                    }
                    return null;
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            }
        })
    ],
    pages: {
        signIn: '/auth/signin',
    },
    callbacks: {
        // Sync OAuth users with backend on first sign in
        async signIn({ user, account }) {
            if (account?.provider === "google" && user.email) {
                try {
                    // Create or update user in backend database
                    const response = await fetch("http://127.0.0.1:8000/api/auth/oauth-sync", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email: user.email,
                            name: user.name || user.email.split("@")[0],
                            provider: "google",
                            provider_id: account.providerAccountId,
                        }),
                    });

                    if (!response.ok) {
                        console.error("Failed to sync OAuth user with backend");
                    }
                } catch (error) {
                    console.error("OAuth sync error:", error);
                    // Don't block sign in if sync fails - user can still use frontend
                }
            }
            return true;
        },
        async jwt({ token, user, account }) {
            // Persist the access token to the token on initial sign in
            if (user) {
                token.accessToken = (user as any).accessToken;
                token.id = user.id;
                token.provider = account?.provider;
            }
            return token;
        },
        async session({ session, token }) {
            // Send access token and user id to the client
            (session as any).accessToken = token.accessToken;
            (session as any).provider = token.provider;
            if (session.user) {
                (session.user as any).id = token.id;
            }
            return session;
        },
    },
    session: {
        strategy: "jwt",
    },
});

export { handler as GET, handler as POST };
