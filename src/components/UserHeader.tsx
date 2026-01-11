"use client";

import { useEffect, useState, useMemo } from "react";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { Bell, Search } from "lucide-react";

export default function UserHeader() {
    const supabase = useMemo(() => createSupabaseBrowserClient(), []);
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

        // Optional: Subscribe to changes if we want real-time updates without refresh
        // For now, simple fetch on mount is consistent with app pattern
    }, [supabase]);

    const initials = profile?.full_name
        ? profile.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
        : "LH";

    return (
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-5 py-4 backdrop-blur">
            {/* Desktop Search */}
            <div className="hidden items-center gap-3 rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-slate-200/70 md:flex md:min-w-[360px]">
                <Search size={16} className="text-slate-400" />
                <input
                    type="text"
                    placeholder="Search tasks, projects, candidates..."
                    className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                />
            </div>
            {/* Mobile Search Icon */}
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 md:hidden">
                <Search size={18} />
            </button>

            <div className="flex items-center gap-4">
                <button className="relative h-11 w-11 rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:text-slate-900">
                    <Bell className="mx-auto mt-3" size={18} />
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-500" />
                </button>
                <div className="flex items-center gap-3 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-slate-200">
                    <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-200 shadow">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500 text-sm font-semibold text-white">
                                {initials}
                            </div>
                        )}
                    </div>
                    <div className="hidden leading-tight md:block">
                        <p className="text-sm font-semibold text-slate-900">
                            {profile?.full_name || "Loading..."}
                        </p>
                        <p className="text-xs text-slate-500">
                            {profile?.target_role || "..."}
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
}
