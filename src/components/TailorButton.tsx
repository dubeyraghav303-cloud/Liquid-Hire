"use client";

import { Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TailorButton({ job }: { job: any }) {
    const router = useRouter();

    const handleTailorClick = () => {
        if (job.source === 'external') {
            // Store job data in sessionStorage for retrieval on the tailor page
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
            className="flex items-center gap-2 border-4 border-black bg-[#EAFF00] px-6 py-3 text-sm font-black uppercase text-black transition-all hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
            <Wand2 size={18} className="stroke-[3]" />
            TAILOR
        </button>
    );
}
