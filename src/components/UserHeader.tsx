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
        <header className="sticky top-0 z-10 flex items-center justify-between border-b-8 border-black bg-[#00E5FF] px-5 py-4 shadow-[0px_8px_0px_0px_rgba(0,0,0,1)]">
            {/* Logo/Title */}
            <div className="flex items-center gap-4">
                <img src="/logo.png" alt="Authin Logo" className="h-10 w-10 border-4 border-black bg-white object-contain shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
                <div className="flex flex-col">
                  <span className="text-2xl font-black uppercase text-black tracking-tighter leading-none">Authin</span>
                  <span className="bg-[#EAFF00] border-2 border-black px-2 py-0.5 text-xs font-bold uppercase text-black w-fit mt-1">DASHBOARD</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative">
                    <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-3 border-4 border-black bg-white px-3 py-1.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all">
                        <div className="h-10 w-10 overflow-hidden border-2 border-black bg-black">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-[#FF3366] text-sm font-black text-white uppercase">
                                    {initials}
                                </div>
                            )}
                        </div>
                        <div className="hidden leading-none md:block text-left uppercase">
                            <p className="text-sm font-black text-black">
                                {profile?.full_name || "LOADING..."}
                            </p>
                            <p className="text-xs font-bold text-black/70">
                                {profile?.target_role || "..."}
                            </p>
                        </div>
                    </button>
                    {showDropdown && (
                        <div className="absolute right-0 top-full mt-3 w-56 border-4 border-black bg-white p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-50">
                            <p className="text-lg font-black uppercase text-black truncate">{profile?.full_name}</p>
                            <p className="text-sm font-bold uppercase text-black/60 mb-4 truncate">{profile?.target_role}</p>
                            <button
                                onClick={() => {
                                    setShowDropdown(false);
                                    router.push('/settings');
                                }}
                                className="w-full border-4 border-black bg-[#EAFF00] py-2.5 text-sm font-black uppercase text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                            >
                                EDIT PROFILE
                            </button>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleLogout}
                    title="Log Out"
                    className="h-12 w-12 border-4 border-black bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FF3366] hover:text-white hover:shadow-none hover:translate-x-1 hover:translate-y-1 flex items-center justify-center transition-all"
                >
                    <LogOut size={20} strokeWidth={3} />
                </button>
            </div>
        </header>
    );
}
