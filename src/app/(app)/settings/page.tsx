"use client";

import { useEffect, useState, useMemo } from "react";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { Loader2, Camera, Save, UserCircle, Briefcase, GraduationCap, MapPin, Link as LinkIcon } from "lucide-react";

export default function SettingsPage() {
    const supabase = useMemo(() => createSupabaseBrowserClient(), []);
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

    // Profile Form
    const [fullName, setFullName] = useState("");
    const [resumeText, setResumeText] = useState("");
    const [targetRole, setTargetRole] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");

    // Education State
    const [degree, setDegree] = useState("");
    const [stream, setStream] = useState("");
    const [yearOfGraduation, setYearOfGraduation] = useState("");
    const [college, setCollege] = useState("");
    const [linkedinProfile, setLinkedinProfile] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                window.location.href = '/login';
                return;
            }
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
                setDegree(profile.degree || "");
                setStream(profile.stream || "");
                setYearOfGraduation(profile.year_of_graduation || "");
                setCollege(profile.college || "");
                setLinkedinProfile(profile.linkedin_profile || "");
            }
            setLoading(false);
        };
        fetchProfile();
    }, [supabase]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 100 * 1024) { // 100KB limit for base64
            setMessage({ text: "Error: Image too large. Max 100KB.", type: "error" });
            setTimeout(() => setMessage(null), 3000);
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
        setSaving(true);
        setMessage(null);

        const updates = {
            id: userId,
            full_name: fullName,
            target_role: targetRole,
            avatar_url: avatarUrl,
            degree,
            stream,
            year_of_graduation: yearOfGraduation,
            college,
            linkedin_profile: linkedinProfile,
            resume_text: resumeText,
            updated_at: new Date().toISOString()
        };

        const { error } = await supabase.from("profiles").upsert(updates);

        if (error) {
            console.error("Update Error", error);
            setMessage({ text: `Error: ${error.message}`, type: "error" });
        } else {
            setMessage({ text: "Profile updated successfully!", type: "success" });
        }
        setSaving(false);
        setTimeout(() => setMessage(null), 3000);
    };

    if (loading) {
        // Handled by loading.tsx, but just in case for client side re-renders
        return (
            <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-80px)] bg-slate-50 px-6 py-10">
            <div className="mx-auto max-w-4xl space-y-8">
                
                {/* Header Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-4"
                >
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Account Settings</h1>
                        <p className="text-sm text-slate-500 mt-1">Manage your profile, resume, and preferences.</p>
                    </div>
                    <button
                        onClick={updateProfile}
                        disabled={saving}
                        className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50 shadow-sm"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save Changes
                    </button>
                </motion.div>

                {/* Profile Information Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="rounded-2xl bg-indigo-50/50 p-2 text-indigo-600">
                            <UserCircle size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 tracking-tight">Personal Information</h2>
                    </div>

                    <div className="mb-8 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                        <div className="relative group">
                            <div className="h-24 w-24 overflow-hidden rounded-full bg-slate-100 ring-4 ring-white shadow-sm border border-slate-200">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-slate-400 bg-slate-50">
                                        <Camera size={32} strokeWidth={1.5} />
                                    </div>
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 rounded-full bg-white p-1.5 shadow-md ring-1 ring-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                                <Camera size={14} className="text-slate-600" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        <div className="text-center sm:text-left space-y-1">
                            <h3 className="text-sm font-semibold text-slate-800">Profile Photo</h3>
                            <p className="text-xs text-slate-500">Upload a professional headshot. Max size 100KB.</p>
                            <label className="inline-block mt-2 cursor-pointer rounded-xl bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100">
                                Choose Image
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                            </label>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Full Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-slate-50/50"
                                placeholder="e.g. John Doe"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Target Role</label>
                            <div className="relative">
                                <Briefcase size={16} className="absolute left-4 top-3.5 text-slate-400" />
                                <input
                                    type="text"
                                    value={targetRole}
                                    onChange={(e) => setTargetRole(e.target.value)}
                                    className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-slate-50/50"
                                    placeholder="e.g. Senior Software Engineer"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                                <span>Resume Upload (PDF)</span>
                            </label>
                            <div className="flex items-center gap-4">
                                <div className="relative flex-1">
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;

                                            setMessage({ text: "Parsing resume...", type: "info" });
                                            setSaving(true);

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
                                                    setMessage({ text: "Resume parsed successfully! Don't forget to save.", type: "success" });
                                                }
                                            } catch (err) {
                                                console.error(err);
                                                setMessage({ text: "Error parsing resume.", type: "error" });
                                            } finally {
                                                setSaving(false);
                                                setTimeout(() => setMessage(null), 3000);
                                            }
                                        }}
                                        className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all bg-slate-50/50"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Parsed Resume Text</label>
                            <textarea
                                value={resumeText}
                                onChange={(e) => setResumeText(e.target.value)}
                                className="h-48 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-slate-50/50 resize-none"
                                placeholder="Paste your resume text here or upload a PDF above..."
                            />
                            <p className="text-[10px] text-slate-400">This text is used by the AI to tailor your applications and generate interview questions.</p>
                        </div>
                    </div>
                </motion.div>

                {/* Education Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="rounded-2xl bg-emerald-50/50 p-2 text-emerald-600">
                            <GraduationCap size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 tracking-tight">Education & Links</h2>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Degree</label>
                            <select
                                value={degree}
                                onChange={(e) => setDegree(e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-slate-50/50 appearance-none"
                            >
                                <option value="">Select Degree...</option>
                                <option value="High School">High School</option>
                                <option value="Bachelors">Bachelors</option>
                                <option value="Masters">Masters</option>
                                <option value="PhD">PhD</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Stream / Major</label>
                            <input
                                type="text"
                                value={stream}
                                onChange={(e) => setStream(e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-slate-50/50"
                                placeholder="e.g. Computer Science"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Year of Graduation</label>
                            <input
                                type="text"
                                value={yearOfGraduation}
                                onChange={(e) => setYearOfGraduation(e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-slate-50/50"
                                placeholder="e.g. 2024"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">College / University</label>
                            <input
                                type="text"
                                value={college}
                                onChange={(e) => setCollege(e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-slate-50/50"
                                placeholder="e.g. MIT"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">LinkedIn Profile</label>
                            <div className="relative">
                                <LinkIcon size={16} className="absolute left-4 top-3.5 text-slate-400" />
                                <input
                                    type="text"
                                    value={linkedinProfile}
                                    onChange={(e) => setLinkedinProfile(e.target.value)}
                                    className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-slate-50/50"
                                    placeholder="https://linkedin.com/in/username"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Notification Toast */}
                {message && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20 }}
                        className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-2xl px-6 py-4 shadow-xl border ${
                            message.type === 'success' 
                                ? 'bg-emerald-900 text-emerald-50 border-emerald-800' 
                                : message.type === 'error'
                                ? 'bg-rose-900 text-rose-50 border-rose-800'
                                : 'bg-indigo-900 text-indigo-50 border-indigo-800'
                        }`}
                    >
                        {message.type === 'success' && <div className="h-2 w-2 rounded-full bg-emerald-400" />}
                        {message.type === 'error' && <div className="h-2 w-2 rounded-full bg-rose-400" />}
                        {message.type === 'info' && <Loader2 size={16} className="animate-spin text-indigo-400" />}
                        <p className="text-sm font-medium">{message.text}</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
