"use client";

interface RoleSelectorProps {
    roles: any[]; // Passed from parent
    onRoleSelect: (role: any) => void;
}

export default function RoleSelector({ roles, onRoleSelect }: RoleSelectorProps) {
    // No more fetching here! We use the roles passed down.

    if (!roles || roles.length === 0) {
        return <div className="text-center text-gray-400">No roles found. Try uploading your resume again.</div>;
    }

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium text-white">Recommended Career Paths</h3>
            <div className="grid gap-6 md:grid-cols-2">
                {roles.map((role, index) => (
                    <div
                        key={index}
                        className="flex flex-col justify-between rounded-xl border border-white/10 bg-white/5 p-6 shadow-sm transition-all hover:bg-white/10 hover:scale-[1.02]"
                    >
                        <div>
                            <div className="flex items-center justify-between">
                                <h4 className="text-xl font-semibold text-white">{role.name}</h4>
                                <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-400 ring-1 ring-inset ring-green-500/20">
                                    {role.match_score}% Match
                                </span>
                            </div>
                            <div className="mt-4">
                                <p className="text-sm font-medium text-gray-300">Missing Skills:</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {role.missing_skills.map((skill: string) => (
                                        <span
                                            key={skill}
                                            className="inline-flex items-center rounded bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400 ring-1 ring-inset ring-red-500/20"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => onRoleSelect(role)}
                            className="mt-6 w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
                        >
                            Select & Generate Roadmap
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
