import { createSupabaseServerClient } from "@/utils/supabase/server";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
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

    const scoreColor =
        score >= 70
            ? "text-emerald-500"
            : score >= 40
                ? "text-amber-500"
                : "text-rose-500";

    return (
        <div className="min-h-[calc(100vh-80px)] bg-slate-50 px-6 py-10">
            <div className="mx-auto max-w-4xl space-y-6">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"
                >
                    <ArrowLeft size={16} />
                    Back to Dashboard
                </Link>

                {/* Header Card */}
                <div className="rounded-[30px] bg-white p-8 shadow-sm ring-1 ring-slate-100">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">
                                {interview.job_role} Interview Report
                            </h1>
                            <p className="mt-2 text-slate-500">
                                {new Date(interview.created_at).toLocaleDateString()} at{" "}
                                {new Date(interview.created_at).toLocaleTimeString()}
                            </p>
                            <p className="mt-4 text-sm text-slate-600 leading-relaxed max-w-2xl">
                                {interview.summary}
                            </p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className={`text-6xl font-bold ${scoreColor}`}>{score}</div>
                            <div className="text-xs uppercase tracking-wider text-slate-400">
                                Overall Score
                            </div>
                        </div>
                    </div>
                </div>

                {/* Questions List */}
                <div className="space-y-6">
                    <h2 className="ml-2 text-lg font-semibold text-slate-900">
                        Detailed Feedback
                    </h2>

                    {report.length === 0 ? (
                        <div className="rounded-[30px] bg-white p-8 text-center text-slate-500 shadow-sm ring-1 ring-slate-100">
                            No detailed feedback available for this interview.
                        </div>
                    ) : (
                        report.map((item, index) => (
                            <div
                                key={index}
                                className="overflow-hidden rounded-[30px] bg-white shadow-sm ring-1 ring-slate-100"
                            >
                                <div className="border-b border-slate-50 bg-slate-50/50 p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                                Question {index + 1}
                                            </span>
                                            <h3 className="mt-1 text-lg font-medium text-slate-900">
                                                {item.question}
                                            </h3>
                                        </div>
                                        <div
                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold ${item.score >= 7
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : item.score >= 4
                                                        ? "bg-amber-100 text-amber-700"
                                                        : "bg-rose-100 text-rose-700"
                                                }`}
                                        >
                                            {item.score}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-6 p-6 md:grid-cols-2">
                                    {/* User Answer */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                            <div className="h-2 w-2 rounded-full bg-slate-300" />
                                            Your Answer
                                        </div>
                                        <p className="text-sm leading-relaxed text-slate-600">
                                            "{item.user_answer}"
                                        </p>
                                        <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                                            <span className="block mb-1 font-semibold text-slate-700">Analysis</span>
                                            {item.feedback}
                                        </div>
                                    </div>

                                    {/* Ideal Answer */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                                            <CheckCircle2 size={16} />
                                            Ideal Answer
                                        </div>
                                        <div className="rounded-2xl bg-emerald-50/50 p-5 text-sm leading-relaxed text-emerald-900 ring-1 ring-emerald-100">
                                            {item.ideal_answer}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
