"use client";

import { useEffect, useState, useMemo } from "react";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Bell, LogOut } from "lucide-react";

export default function UserHeader() {
    const supabase = useMemo(() => createSupabaseBrowserClient(), []);
    const router = useRouter();
    const [showDropdown, setShowDropdown] = useState(false);
    const [profile, setProfile] = useState<{ full_name: string; target_role: string; avatar_url?: string } | null>({
        full_name: "User",
        target_role: "Candidate",
        avatar_url: ""
    });

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from("profiles")
                .select("full_name, target_role, avatar_url")
                .eq("id", user.id)
                .maybeSingle();

            if (data) {
                setProfile({
                    full_name: data.full_name || "User",
                    target_role: data.target_role || "Candidate",
                    avatar_url: data.avatar_url || ""
                });
            }
        };

        fetchProfile();
    }, [supabase]);

    const initials = profile?.full_name
        ? profile.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
        : "AU";

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-5 py-4 backdrop-blur">
            {/* Logo/Title */}
            <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Authin Logo" className="h-8 w-auto rounded-lg object-contain shadow-sm" />
                <span className="text-lg font-bold text-slate-800 tracking-tight">Authin</span>
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">Candidate Dashboard</span>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative">
                    <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-3 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 hover:shadow-md">
                        <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-200 shadow">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500 text-sm font-semibold text-white">
                                    {initials}
                                </div>
                            )}
                        </div>
                        <div className="hidden leading-tight md:block text-left">
                            <p className="text-sm font-semibold text-slate-900">
                                {profile?.full_name || "Loading..."}
                            </p>
                            <p className="text-xs text-slate-500">
                                {profile?.target_role || "..."}
                            </p>
                        </div>
                    </button>
                    {showDropdown && (
                        <div className="absolute right-0 top-full mt-3 w-56 rounded-2xl bg-white p-4 shadow-xl ring-1 ring-slate-200 transition-all">
                            <p className="text-sm font-bold text-slate-900 truncate">{profile?.full_name}</p>
                            <p className="text-xs text-slate-500 mb-4 truncate">{profile?.target_role}</p>
                            <button
                                onClick={() => {
                                    setShowDropdown(false);
                                    router.push('/settings');
                                }}
                                className="w-full rounded-xl bg-indigo-50 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                            >
                                Edit Profile
                            </button>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleLogout}
                    title="Log Out"
                    className="h-11 w-11 rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center"
                >
                    <LogOut size={18} />
                </button>
            </div>
        </header>
    );
}
