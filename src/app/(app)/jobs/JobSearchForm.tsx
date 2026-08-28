"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, MapPin } from "lucide-react";

export default function JobSearchForm({ initialQuery, initialLocation }: { initialQuery: string; initialLocation: string }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [query, setQuery] = useState(initialQuery);
    const [loc, setLoc] = useState(initialLocation);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(() => {
            const params = new URLSearchParams();
            if (query) params.set("q", query);
            if (loc) params.set("location", loc);
            router.push(`?${params.toString()}`);
        });
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 border-8 border-black bg-white p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] md:flex-row md:items-end md:justify-between animate-in fade-in slide-in-from-top-12 duration-700 hover:-translate-y-1 hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] transition-all">
            <div className="md:w-1/3">
                <p className="text-sm uppercase tracking-widest font-black text-black bg-[#EAFF00] border-4 border-black inline-block px-3 py-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4 hover:scale-105 hover:-rotate-3 transition-transform cursor-default">Job search</p>
                <h1 className="text-4xl lg:text-5xl font-black text-black tracking-tighter uppercase cursor-default hover:scale-[1.02] transition-transform">Find your <br/> next role</h1>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch gap-4 w-full md:w-2/3">
                <div className="relative flex-1">
                    <Search size={20} strokeWidth={3} className="absolute left-4 top-4.5 text-black" />
                    <input
                        name="q"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="JOB TITLE, KEYWORDS..."
                        className="w-full h-full border-4 border-black pl-12 pr-4 py-4 text-lg font-bold text-black outline-none transition focus:bg-[#EAFF00] shadow-inner uppercase bg-[#FFFBED]"
                    />
                </div>
                <div className="relative flex-1">
                    <MapPin size={20} strokeWidth={3} className="absolute left-4 top-4.5 text-black" />
                    <input
                        name="location"
                        value={loc}
                        onChange={(e) => setLoc(e.target.value)}
                        placeholder="LOCATION (E.G. REMOTE)"
                        className="w-full h-full border-4 border-black pl-12 pr-4 py-4 text-lg font-bold text-black outline-none transition focus:bg-[#EAFF00] shadow-inner uppercase bg-[#FFFBED]"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex w-full sm:w-auto items-center justify-center gap-2 border-4 border-black bg-black px-8 py-4 text-xl font-black uppercase text-white transition hover:bg-[#FF3366] hover:-translate-y-1 hover:-translate-x-1 disabled:opacity-70 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]"
                >
                    {isPending ? <Loader2 size={24} className="animate-spin stroke-[3]" /> : "SEARCH"}
                </button>
            </div>
        </form>
    );
}
