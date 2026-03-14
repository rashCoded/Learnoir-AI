"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfileForm() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        college: "",
        year: "1",
        branch: "",
        cgpa: "",
        skills: "",
        interests: [] as string[],
    });

    const interestOptions = [
        "Web Development",
        "App Development",
        "Machine Learning",
        "Data Science",
        "Cloud Computing",
        "Cybersecurity",
        "Blockchain",
        "DevOps",
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleInterestToggle = (interest: string) => {
        setFormData((prev) => {
            const interests = prev.interests.includes(interest)
                ? prev.interests.filter((i) => i !== interest)
                : [...prev.interests, interest];
            return { ...prev, interests };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Submit data to backend
        console.log("Profile Data:", formData);
        // Redirect to dashboard or resume upload
        router.push("/dashboard");
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">College/University</label>
                    <input
                        type="text"
                        name="college"
                        value={formData.college}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Year of Study</label>
                    <select
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                    >
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                        <option value="grad">Graduated</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Branch/Major</label>
                    <input
                        type="text"
                        name="branch"
                        value={formData.branch}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Current CGPA (Optional)</label>
                    <input
                        type="number"
                        name="cgpa"
                        step="0.01"
                        min="0"
                        max="10"
                        value={formData.cgpa}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Technical Skills (Comma separated)</label>
                <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="e.g. Python, Java, React, SQL"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Areas of Interest</label>
                <div className="flex flex-wrap gap-2">
                    {interestOptions.map((interest) => (
                        <button
                            key={interest}
                            type="button"
                            onClick={() => handleInterestToggle(interest)}
                            className={`rounded-full px-4 py-1 text-sm font-medium transition-colors ${formData.interests.includes(interest)
                                    ? "bg-indigo-600 text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                        >
                            {interest}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    className="rounded-md bg-indigo-600 px-6 py-2 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    Complete Profile
                </button>
            </div>
        </form>
    );
}
