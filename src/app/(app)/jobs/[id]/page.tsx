import { createSupabaseServerClient } from "@/utils/supabase/server";
import { ArrowLeft, Briefcase, MapPin, Building2, Wand2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();

    // Fetch job from DB
    const { data: job, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !job) {
        // If not found in DB, we could handle external jobs here if we had a way to lookup.
        // For now, return 404 or a placeholder if it's a demo ID.
        // If the ID is not a valid UUID, Supabase will error.
        // Let's just return 404 for safety.
        // console.error(error);
        // notFound();

        // For Demo purposes, if we can't find it, show a mock if it looks like a demo request?
        // No, let's stick to DB. Users can create jobs in Supabase or use the provided ones.

        // Actually, let's just show a friendly error or handle the case where it might be external.
        // But for "The Chameleon", we need the JD text.
        notFound();
    }

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-6">
            <div className="max-w-4xl mx-auto">
                <Link href="/jobs" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors">
                    <ArrowLeft size={16} />
                    Back to Jobs
                </Link>

                <div className="bg-white rounded-[30px] p-8 shadow-sm ring-1 ring-slate-100">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">{job.title}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-slate-500 text-sm">
                                <div className="flex items-center gap-1">
                                    <Building2 size={16} />
                                    {job.company}
                                </div>
                                <div className="flex items-center gap-1">
                                    <MapPin size={16} />
                                    {job.location}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Briefcase size={16} />
                                    {job.type || "Full-time"}
                                </div>
                            </div>
                        </div>

                        <Link
                            href={`/jobs/${id}/tailor`}
                            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold transition-transform hover:scale-105 active:scale-95 shadow-md shadow-indigo-200"
                        >
                            <Wand2 size={18} />
                            Tailor Resume
                        </Link>
                    </div>

                    <div className="mt-10 border-t border-slate-100 pt-8">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Description</h2>
                        <div className="prose prose-slate max-w-none text-slate-600 whitespace-pre-wrap">
                            {job.description}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
