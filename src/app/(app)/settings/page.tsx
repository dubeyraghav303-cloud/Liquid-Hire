"use client";

import { useEffect, useState, useMemo } from "react";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { Loader2, Camera, Save, UserCircle, Briefcase, GraduationCap, MapPin, Link as LinkIcon, AlertTriangle } from "lucide-react";

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
            setMessage({ text: "ERROR: IMAGE TOO LARGE. MAX 100KB.", type: "error" });
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
            setMessage({ text: `ERROR: ${error.message}`, type: "error" });
        } else {
            setMessage({ text: "PROFILE UPDATED SUCCESSFULLY!", type: "success" });
        }
        setSaving(false);
        setTimeout(() => setMessage(null), 3000);
    };

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center bg-[#FFFBED]">
                <Loader2 className="h-12 w-12 animate-spin text-black" strokeWidth={3} />
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-80px)] w-full max-w-5xl mx-auto space-y-12">
            
            {/* Header Section */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-8 border-black pb-8 mt-4"
            >
                <div>
                    <h1 className="text-5xl md:text-7xl font-black text-black tracking-tighter uppercase">ACCOUNT <br/>SETTINGS</h1>
                </div>
                <button
                    onClick={updateProfile}
                    disabled={saving}
                    className="flex items-center gap-4 border-8 border-black bg-[#FF3366] px-8 py-4 text-2xl font-black uppercase text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
                >
                    {saving ? <Loader2 size={24} className="animate-spin stroke-[3]" /> : <Save size={24} className="stroke-[3]" />}
                    SAVE DATA
                </button>
            </motion.div>

            {/* Profile Information Card */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="border-8 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
            >
                <div className="bg-[#00E5FF] border-b-8 border-black p-6 flex items-center gap-4">
                    <div className="border-4 border-black bg-white p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <UserCircle size={28} className="stroke-[3]" />
                    </div>
                    <h2 className="text-3xl font-black text-black uppercase tracking-tight">PERSONAL INTEL</h2>
                </div>

                <div className="p-8 space-y-8">
                    <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start border-b-4 border-black pb-8">
                        <div className="relative group">
                            <div className="h-32 w-32 overflow-hidden border-4 border-black bg-[#EAFF00] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-black">
                                        <Camera size={40} strokeWidth={3} />
                                    </div>
                                )}
                            </div>
                            <label className="absolute bottom-[-10px] right-[-10px] border-4 border-black bg-[#FF3366] p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer hover:bg-black hover:text-white transition-colors text-white z-10">
                                <Camera size={20} strokeWidth={3} />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        <div className="text-center sm:text-left space-y-2">
                            <h3 className="text-2xl font-black uppercase text-black">MUGSHOT</h3>
                            <p className="text-sm font-bold uppercase text-black/60">Upload a professional headshot. Max size 100KB.</p>
                        </div>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2">
                        <div className="space-y-4">
                            <label className="text-lg font-black uppercase text-black">AGENT NAME</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full border-4 border-black bg-[#FFFBED] px-4 py-4 text-xl font-bold text-black outline-none transition focus:bg-[#EAFF00] shadow-inner"
                                placeholder="E.G. JOHN DOE"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-lg font-black uppercase text-black">TARGET MISSION</label>
                            <div className="relative">
                                <Briefcase size={20} className="absolute left-4 top-4.5 text-black stroke-[3]" />
                                <input
                                    type="text"
                                    value={targetRole}
                                    onChange={(e) => setTargetRole(e.target.value)}
                                    className="w-full border-4 border-black bg-[#FFFBED] pl-12 pr-4 py-4 text-xl font-bold text-black outline-none transition focus:bg-[#EAFF00] shadow-inner uppercase"
                                    placeholder="E.G. SENIOR DEV"
                                />
                            </div>
                        </div>

                        <div className="space-y-4 md:col-span-2 border-t-4 border-black pt-8">
                            <label className="text-lg font-black uppercase text-black flex items-center justify-between">
                                <span>RESUME UPLOAD (PDF)</span>
                            </label>
                            <div className="flex items-center gap-4 border-4 border-black bg-[#EAFF00] p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;

                                        setMessage({ text: "PARSING RESUME...", type: "info" });
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
                                                setMessage({ text: "RESUME EXTRACTED! REMEMBER TO SAVE.", type: "success" });
                                            }
                                        } catch (err) {
                                            console.error(err);
                                            setMessage({ text: "ERROR PARSING RESUME.", type: "error" });
                                        } finally {
                                            setSaving(false);
                                            setTimeout(() => setMessage(null), 3000);
                                        }
                                    }}
                                    className="w-full text-lg font-bold text-black file:mr-4 file:py-2 file:px-4 file:border-4 file:border-black file:text-sm file:font-black file:uppercase file:bg-white file:text-black hover:file:bg-black hover:file:text-white transition-all cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="space-y-4 md:col-span-2">
                            <label className="text-lg font-black uppercase text-black">EXTRACTED RESUME DATA</label>
                            <textarea
                                value={resumeText}
                                onChange={(e) => setResumeText(e.target.value)}
                                className="h-64 w-full border-4 border-black bg-[#FFFBED] px-4 py-4 text-sm font-bold text-black outline-none transition focus:bg-white shadow-inner resize-y uppercase font-mono"
                                placeholder="PASTE YOUR RAW RESUME DATA HERE OR UPLOAD A PDF..."
                            />
                            <p className="text-xs font-bold uppercase text-black/60 bg-[#EAFF00] p-2 border-2 border-black inline-block">THIS DATA DRIVES THE AI TAILORING SYSTEM.</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Education Section */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="border-8 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] mb-12"
            >
                <div className="bg-[#EAFF00] border-b-8 border-black p-6 flex items-center gap-4">
                    <div className="border-4 border-black bg-white p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <GraduationCap size={28} className="stroke-[3]" />
                    </div>
                    <h2 className="text-3xl font-black text-black uppercase tracking-tight">ACADEMICS & COMMS</h2>
                </div>

                <div className="p-8 grid gap-8 md:grid-cols-2">
                    <div className="space-y-4">
                        <label className="text-lg font-black uppercase text-black">RANK / DEGREE</label>
                        <select
                            value={degree}
                            onChange={(e) => setDegree(e.target.value)}
                            className="w-full border-4 border-black bg-[#FFFBED] px-4 py-4 text-xl font-bold text-black outline-none transition focus:bg-white shadow-inner uppercase appearance-none"
                        >
                            <option value="">SELECT DEGREE...</option>
                            <option value="High School">HIGH SCHOOL</option>
                            <option value="Bachelors">BACHELORS</option>
                            <option value="Masters">MASTERS</option>
                            <option value="PhD">PHD</option>
                        </select>
                    </div>

                    <div className="space-y-4">
                        <label className="text-lg font-black uppercase text-black">SPECIALIZATION</label>
                        <input
                            type="text"
                            value={stream}
                            onChange={(e) => setStream(e.target.value)}
                            className="w-full border-4 border-black bg-[#FFFBED] px-4 py-4 text-xl font-bold text-black outline-none transition focus:bg-white shadow-inner uppercase"
                            placeholder="E.G. COMPUTER SCIENCE"
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-lg font-black uppercase text-black">GRAD YEAR</label>
                        <input
                            type="text"
                            value={yearOfGraduation}
                            onChange={(e) => setYearOfGraduation(e.target.value)}
                            className="w-full border-4 border-black bg-[#FFFBED] px-4 py-4 text-xl font-bold text-black outline-none transition focus:bg-white shadow-inner uppercase"
                            placeholder="E.G. 2024"
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-lg font-black uppercase text-black">INSTITUTION</label>
                        <input
                            type="text"
                            value={college}
                            onChange={(e) => setCollege(e.target.value)}
                            className="w-full border-4 border-black bg-[#FFFBED] px-4 py-4 text-xl font-bold text-black outline-none transition focus:bg-white shadow-inner uppercase"
                            placeholder="E.G. MIT"
                        />
                    </div>

                    <div className="space-y-4 md:col-span-2">
                        <label className="text-lg font-black uppercase text-black">LINKEDIN UPLINK</label>
                        <div className="relative">
                            <LinkIcon size={20} className="absolute left-4 top-4.5 text-black stroke-[3]" />
                            <input
                                type="text"
                                value={linkedinProfile}
                                onChange={(e) => setLinkedinProfile(e.target.value)}
                                className="w-full border-4 border-black bg-[#FFFBED] pl-12 pr-4 py-4 text-xl font-bold text-black outline-none transition focus:bg-white shadow-inner uppercase"
                                placeholder="HTTPS://LINKEDIN.COM/IN/USERNAME"
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
                    className={`fixed bottom-8 right-8 z-50 flex items-center gap-4 border-8 border-black p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] uppercase font-black text-xl ${
                        message.type === 'success' 
                            ? 'bg-[#EAFF00] text-black' 
                            : message.type === 'error'
                            ? 'bg-[#FF3366] text-white'
                            : 'bg-[#00E5FF] text-black'
                    }`}
                >
                    {message.type === 'success' && <div className="h-4 w-4 bg-black" />}
                    {message.type === 'error' && <AlertTriangle size={24} className="stroke-[3]" />}
                    {message.type === 'info' && <Loader2 size={24} className="animate-spin stroke-[3]" />}
                    <p>{message.text}</p>
                </motion.div>
            )}
        </div>
    );
}
