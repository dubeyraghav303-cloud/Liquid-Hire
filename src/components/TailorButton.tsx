"use client";

import { Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TailorButton({ job }: { job: any }) {
    const router = useRouter();

    const handleTailorClick = () => {
        if (job.source === 'external') {
            // Store job data in sessionStorage for retrieval on the tailor page
            // This avoids URL length limits
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('temp_tailor_job', JSON.stringify(job));
            }
            router.push(`/jobs/external/tailor`);
        } else {
            router.push(`/jobs/${job.id}/tailor`);
        }
    };

    return (
        <button
            onClick={handleTailorClick}
            className="flex items-center gap-1.5 rounded-full bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
        >
            <Wand2 size={14} />
            Tailor
        </button>
    );
}
