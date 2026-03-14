// app/api/demo-data/route.ts
import { NextResponse } from "next/server";

export async function GET() {
    // Static demo data - safe to expose
    const data = {
        user: {
            name: "Demo User",
            targetRole: "Full Stack Developer",
            experience: "2 years",
        },
        stats: {
            tasksCompleted: 12,
            streak: 5,
            skillScore: 87,
            roleMatches: 4,
        },
        progress: [
            { week: 1, title: "JavaScript Fundamentals", progress: 100 },
            { week: 2, title: "React & State Management", progress: 100 },
            { week: 3, title: "Backend with Node.js", progress: 65 },
            { week: 4, title: "Databases & APIs", progress: 0 },
        ],
        recentActivity: [
            {
                title: "Completed System Design Quiz",
                when: "2 hours ago",
                tag: "quiz",
                xp: 15
            },
            {
                title: "Built REST API Project",
                when: "Yesterday",
                tag: "project",
                category: "Backend"
            },
            {
                title: "Resume analyzed by AI",
                when: "2 days ago",
                tag: "resume",
                score: 87
            },
        ],
        skills: {
            strengths: ["JavaScript", "React", "Node.js", "Git"],
            weaknesses: ["System Design", "AWS", "Docker"],
            recommended: "TypeScript",
        },
        roleMatches: [
            { role: "Full Stack Developer", match: 85, jobs: "500+" },
            { role: "Frontend Developer", match: 92, jobs: "800+" },
            { role: "Backend Developer", match: 78, jobs: "400+" },
            { role: "DevOps Engineer", match: 45, jobs: "200+" },
        ],
    };

    return NextResponse.json(data);
}
