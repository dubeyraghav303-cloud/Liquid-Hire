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
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 md:flex-row md:items-center md:justify-between">
            <div>
                <p className="text-xs uppercase tracking-[0.2em] font-semibold text-slate-400">Job search</p>
                <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Find your next role</h1>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <div className="relative w-full sm:w-64">
                    <Search size={16} className="absolute left-4 top-3 text-slate-400" />
                    <input
                        name="q"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Job title, keywords..."
                        className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
                    />
                </div>
                <div className="relative w-full sm:w-52">
                    <MapPin size={16} className="absolute left-4 top-3 text-slate-400" />
                    <input
                        name="location"
                        value={loc}
                        onChange={(e) => setLoc(e.target.value)}
                        placeholder="Location (e.g. Remote)"
                        className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70 shadow-sm"
                >
                    {isPending ? <Loader2 size={16} className="animate-spin" /> : "Search"}
                </button>
            </div>
        </form>
    );
}
