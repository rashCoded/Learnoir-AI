import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { API_CONFIG } from "@/config/api";

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
                    const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/login`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password,
                        }),
                    });

                    if (!response.ok) {
                        return null;
                    }
                    
                    const data = await response.json();
                    return {
                        id: String(data.user.id),
                        name: data.user.name,
                        email: data.user.email,
                        accessToken: data.access_token,
                    };
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
                    const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/oauth-sync`, {
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
                        return false;
                    }

                    const syncData = await response.json();
                    if (!syncData?.access_token) {
                        console.error("OAuth sync succeeded but backend token missing");
                        return false;
                    }

                    (user as any).accessToken = syncData.access_token;
                } catch (error) {
                    console.error("OAuth sync error:", error);
                    return false;
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

            // Safety net for Google OAuth: ensure backend JWT exists on first sign in.
            if (account?.provider === "google" && !token.accessToken && token.email) {
                try {
                    const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/oauth-sync`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email: token.email,
                            name: token.name || token.email.split("@")[0],
                            provider: "google",
                            provider_id: account.providerAccountId,
                        }),
                    });

                    if (response.ok) {
                        const syncData = await response.json();
                        token.accessToken = syncData?.access_token;
                    }
                } catch (error) {
                    console.error("OAuth token sync error:", error);
                }
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
