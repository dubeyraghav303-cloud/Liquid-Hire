"use client";

import { useEffect, useState, useMemo } from "react";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { Plus, Trash2 } from "lucide-react";

type Skill = {
    id: string;
    name: string;
    value: number;
    trend: "up" | "down";
};

export default function SettingsPage() {
    const supabase = useMemo(() => createSupabaseBrowserClient(), []);
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<string | null>(null);

    // Profile Form
    const [fullName, setFullName] = useState("");
    const [resumeText, setResumeText] = useState("");
    const [targetRole, setTargetRole] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");

    // Skills State (Restored)
    const [skills, setSkills] = useState<Skill[]>([]);
    const [newSkillName, setNewSkillName] = useState("");
    const [newSkillValue, setNewSkillValue] = useState(50);


    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setUserId(user.id);

            const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (profile) {
                setFullName(profile.full_name || "");
                setResumeText(profile.resume_text || "");
                setTargetRole(profile.target_role || "");
                setAvatarUrl(profile.avatar_url || "");
            }
            // ... (skills fetch)
            const { data: skillsData } = await supabase.from("skills").select("*").eq("user_id", user.id);
            if (skillsData) setSkills(skillsData);
            setLoading(false);
        };
        fetchProfile();
    }, [supabase]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 100 * 1024) { // 100KB limit for base64
            setMessage("Error: Image too large. Max 100KB.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const updateProfile = async () => {
        if (!userId) return;
        setMessage(null);

        // Attempt upsert (create if not exists)
        const updates = {
            id: userId,
            full_name: fullName,
            target_role: targetRole,
            avatar_url: avatarUrl
        };

        const { error } = await supabase.from("profiles").upsert(updates);

        if (error) {
            console.error("Update Error", error);
            setMessage(`Error: ${error.message}`);
        } else {
            setMessage("Profile updated successfully!");
        }
    };

    const addSkill = async () => {
        if (!userId || !newSkillName) return;
        const newSkill = {
            user_id: userId,
            name: newSkillName,
            value: newSkillValue,
            trend: "up" as const,
        };

        const { data, error } = await supabase.from("skills").insert(newSkill).select().single();
        if (error) {
            setMessage(`Error adding skill: ${error.message}`);
        } else if (data) {
            setSkills([...skills, data]);
            setNewSkillName("");
            setNewSkillValue(50);
        }
    };

    const deleteSkill = async (id: string) => {
        const { error } = await supabase.from("skills").delete().eq("id", id);
        if (error) {
            setMessage(`Error deleting skill: ${error.message}`);
        } else {
            setSkills(skills.filter((s) => s.id !== id));
        }
    };

    if (loading) return <div className="p-8">Loading settings...</div>;

    return (
        <div className="max-w-4xl space-y-8 p-8">
            {/* ... */}
            {/* Profile Section */}
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">Profile Information</h2>

                <div className="mb-6 flex gap-6 items-center">
                    <div className="h-20 w-20 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">No Img</div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Profile Photo</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Max 100KB (Base64)</p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Full Name</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500"
                            placeholder="e.g. John Doe"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Resume Upload (PDF)</label>
                        <div className="relative">
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    setLoading(true);
                                    setMessage("Parsing resume...");

                                    const formData = new FormData();
                                    formData.append("file", file);

                                    try {
                                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000"}/api/parse-resume`, {
                                            method: "POST",
                                            body: formData,
                                        });

                                        if (!res.ok) throw new Error("Parsing failed");

                                        const data = await res.json();
                                        if (data.text) {
                                            setResumeText(data.text);
                                            // Auto-save parsed resume text to profile
                                            const { error } = await supabase
                                                .from("profiles")
                                                .upsert({
                                                    id: userId,
                                                    resume_text: data.text,
                                                    // Maintain other fields if needed, but upsert merges if we just send ID + changed field? 
                                                    // No, Supabase upsert replaces unless we specify. 
                                                    // "profiles" row might have other data.
                                                    // Safest is to just set state and let user click "Save Changes" OR call updateProfile immediately with new state.
                                                    // Calling updateProfile relies on state which might not be updated yet in closure.
                                                    // Let's call supabase directly here for the specific field to be safe "rewrite everytime".
                                                    updated_at: new Date().toISOString()
                                                });

                                            if (!error) {
                                                setMessage("Resume parsed and saved!");
                                            } else {
                                                console.error("Supabase Save Error:", error);
                                                setMessage(`Save failed: ${error.message}`);
                                            }
                                        }
                                    } catch (err) {
                                        console.error(err);
                                        setMessage("Error parsing resume.");
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                        </div>
                    </div>
                    {/* ... Rest of inputs */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Title / Target Role</label>
                        <input
                            type="text"
                            value={targetRole}
                            onChange={(e) => setTargetRole(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500"
                            placeholder="e.g. Senior Developer"
                        />
                    </div>
                </div>

                <div className="mt-4 space-y-2">
                    <label className="text-sm font-medium text-slate-700">Resume Text (Parsed)</label>
                    <textarea
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        className="h-48 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500"
                        placeholder="Paste your resume text here or upload a PDF above..."
                    />
                </div>
            </div>

            <div className="mt-6">
                <button
                    onClick={updateProfile}
                    className="rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                    Save Changes
                </button>
            </div>

            {/* Skills Section */}
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">Developed Areas (Skills)</h2>
                <p className="mb-4 text-sm text-slate-500">These will appear on your dashboard.</p>

                <div className="mb-6 flex gap-4">
                    <input
                        type="text"
                        value={newSkillName}
                        onChange={(e) => setNewSkillName(e.target.value)}
                        className="flex-1 rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500"
                        placeholder="Skill name (e.g. Leadership)"
                    />
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={newSkillValue}
                        onChange={(e) => setNewSkillValue(Number(e.target.value))}
                        className="w-24 rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500"
                    />
                    <button
                        onClick={addSkill}
                        className="flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                    >
                        <Plus size={16} /> Add
                    </button>
                </div>

                <div className="space-y-2 bg-slate-50 p-4 rounded-2xl">
                    {skills.length === 0 && <p className="text-sm text-slate-400">No skills added yet.</p>}
                    {skills.map((skill) => (
                        <div key={skill.id} className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
                            <div>
                                <span className="font-medium text-slate-900">{skill.name}</span>
                                <span className="ml-2 text-xs text-slate-500">{skill.value}%</span>
                            </div>
                            <button
                                onClick={() => deleteSkill(skill.id)}
                                className="text-rose-500 hover:text-rose-600"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {
                message && (
                    <div className="fixed bottom-8 right-8 rounded-2xl bg-slate-900 px-6 py-3 text-white shadow-lg">
                        {message}
                    </div>
                )
            }
        </div>
    );
}
