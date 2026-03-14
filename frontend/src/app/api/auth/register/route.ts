import { NextResponse } from "next/server";

// In a real app, this would be a database connection
// For this MVP, we'll simulate a DB using a global variable (reset on restart)
// In production, use MongoDB/PostgreSQL
let users: any[] = [];

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = users.find((u) => u.email === email);
        if (existingUser) {
            return NextResponse.json(
                { message: "User already exists" },
                { status: 409 }
            );
        }

        // Create new user
        const newUser = { id: Date.now().toString(), name, email, password };
        users.push(newUser);

        return NextResponse.json(
            { message: "User created successfully", user: { name, email } },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

// Helper to get user by email (for NextAuth)
export function getUserByEmail(email: string) {
    return users.find(u => u.email === email);
}
