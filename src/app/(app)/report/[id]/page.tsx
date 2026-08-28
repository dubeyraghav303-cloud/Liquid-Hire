import { createSupabaseServerClient } from "@/utils/supabase/server";
import { ArrowLeft, CheckCircle2, AlertTriangle, ChevronRight, X } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

type QuestionFeedback = {
    score: number;
    feedback: string;
    question: string;
    user_answer: string;
    ideal_answer: string;
};

type Props = {
    params: Promise<{ id: string }>;
};

export default async function ReportPage({ params }: Props) {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();

    const { data: interview } = await supabase
        .from("interviews")
        .select("*")
        .eq("id", id)
        .single();

    if (!interview) {
        return notFound();
    }

    const report = (interview.json_report as QuestionFeedback[]) || [];
    const score = interview.score ?? 0;

    const getScoreColor = (s: number) => {
        if (s >= 70) return "bg-[#00E5FF] text-black";
        if (s >= 40) return "bg-[#EAFF00] text-black";
        return "bg-[#FF3366] text-white";
    };

    const getScoreBorder = (s: number) => {
        if (s >= 70) return "border-[#00E5FF]";
        if (s >= 40) return "border-[#EAFF00]";
        return "border-[#FF3366]";
    };

    return (
        <div className="min-h-[calc(100vh-80px)] bg-[#FFFBED] p-4 md:p-10 selection:bg-[#FF3366] selection:text-white">
            <div className="mx-auto max-w-5xl space-y-12">
                
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 border-4 border-black bg-white px-4 py-2 text-sm font-black uppercase text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                    <ArrowLeft size={16} className="stroke-[3]" />
                    BACK TO BASE
                </Link>

                {/* Header Card */}
                <div className="border-8 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row md:items-stretch overflow-hidden">
                    <div className="p-8 md:p-12 flex-1 border-b-8 md:border-b-0 md:border-r-8 border-black flex flex-col justify-center">
                        <span className="bg-[#EAFF00] border-4 border-black inline-block px-4 py-1 text-sm font-black uppercase tracking-widest w-fit shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6">POST-MORTEM</span>
                        <h1 className="text-4xl md:text-6xl font-black text-black uppercase tracking-tighter">
                            {interview.job_role} <br/>
                            <span className="bg-[#FF3366] text-white px-2 mt-2 inline-block">REPORT</span>
                        </h1>
                        <p className="mt-6 text-sm font-bold uppercase text-black/60 bg-black/5 inline-block p-2 border-2 border-black/10">
                            {new Date(interview.created_at).toLocaleDateString()} AT {new Date(interview.created_at).toLocaleTimeString()}
                        </p>
                        <div className="mt-8 border-l-8 border-black pl-6">
                            <p className="text-lg font-bold text-black uppercase leading-relaxed">
                                {interview.summary}
                            </p>
                        </div>
                    </div>
                    <div className={`p-12 flex flex-col items-center justify-center min-w-[300px] ${getScoreColor(score)}`}>
                        <div className="text-xs font-black uppercase tracking-widest mb-4 bg-white/20 px-4 py-1 border-2 border-current">
                            OVERALL SCORE
                        </div>
                        <div className="text-8xl font-black tracking-tighter drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                            {score}
                        </div>
                    </div>
                </div>

                {/* Questions List */}
                <div className="space-y-8">
                    <h2 className="text-4xl font-black uppercase text-black border-b-8 border-black pb-4 flex items-center gap-4">
                        <AlertTriangle className="stroke-[3] text-[#FF3366]" size={40} />
                        DETAILED BREAKDOWN
                    </h2>

                    {report.length === 0 ? (
                        <div className="border-8 border-black bg-white p-12 text-center shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                            <p className="text-2xl font-black uppercase text-black">NO DETAILED FEEDBACK AVAILABLE.</p>
                            <p className="text-lg font-bold uppercase text-black/60 mt-4">INTERVIEW MIGHT HAVE BEEN ABORTED TOO EARLY.</p>
                        </div>
                    ) : (
                        report.map((item, index) => {
                            const itemScoreColor = getScoreColor(item.score * 10);
                            return (
                                <div
                                    key={index}
                                    className="border-8 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden group hover:-translate-y-2 hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] transition-all"
                                >
                                    <div className="border-b-8 border-black bg-black p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                                        <div className="flex-1">
                                            <span className="bg-white border-2 border-black px-3 py-1 text-xs font-black uppercase tracking-widest text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                                QUESTION {index + 1}
                                            </span>
                                            <h3 className="mt-6 text-2xl font-black text-white uppercase leading-tight">
                                                {item.question}
                                            </h3>
                                        </div>
                                        <div
                                            className={`flex h-20 w-20 shrink-0 items-center justify-center text-4xl font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${itemScoreColor}`}
                                        >
                                            {item.score}
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2">
                                        {/* User Answer & Analysis */}
                                        <div className="p-8 border-b-8 md:border-b-0 md:border-r-8 border-black bg-[#FFFBED] flex flex-col">
                                            <div className="flex items-center gap-3 text-lg font-black uppercase text-black mb-4">
                                                <div className="h-4 w-4 bg-[#FF3366] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" />
                                                YOUR ANSWER
                                            </div>
                                            <p className="text-base font-bold text-black uppercase leading-relaxed border-l-4 border-black pl-4 mb-8 flex-1">
                                                "{item.user_answer}"
                                            </p>
                                            
                                            <div className="mt-auto border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                                                <span className="bg-black text-white px-2 py-1 text-xs font-black uppercase tracking-widest mb-4 inline-block">ANALYSIS</span>
                                                <p className="text-sm font-bold text-black uppercase leading-relaxed">
                                                    {item.feedback}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Ideal Answer */}
                                        <div className="p-8 bg-white flex flex-col">
                                            <div className="flex items-center gap-3 text-lg font-black uppercase text-black mb-4">
                                                <div className="bg-[#00E5FF] p-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                                    <CheckCircle2 size={20} className="stroke-[3]" />
                                                </div>
                                                IDEAL ANSWER
                                            </div>
                                            <div className="border-4 border-black bg-[#EAFF00] p-6 text-sm font-bold uppercase leading-relaxed text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex-1">
                                                {item.ideal_answer}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
