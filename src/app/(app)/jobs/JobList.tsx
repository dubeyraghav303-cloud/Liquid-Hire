"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import TailorButton from "@/components/TailorButton"; // Ensure this component is updated or accepts classes if needed, or we just leave it as is if it's external

type Job = {
  id?: string | number;
  title: string;
  company?: string;
  location?: string;
  source: "internal" | "external";
  url?: string;
  description?: string;
};

export default function JobList({ jobs, query, location }: { jobs: Job[], query: string, location: string }) {
  if (jobs.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="col-span-full border-8 border-black bg-white p-12 text-center shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
      >
        <p className="text-3xl font-black uppercase text-black">NO JOBS FOUND FOR "{query}" IN "{location || 'REMOTE'}".</p>
        <p className="text-lg font-bold uppercase text-black/60 mt-4">Try broadening your search terms or changing the location.</p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      {jobs.map((job, index) => (
        <motion.div
          key={`${job.source}-${job.id ?? job.title}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
          className="group relative flex flex-col justify-between border-8 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-none hover:translate-x-2 hover:translate-y-2 hover:bg-[#EAFF00]"
        >
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Link href={job.source === 'internal' ? `/jobs/${job.id}` : '#'} className="block">
                  <h3 className="text-2xl font-black text-black uppercase tracking-tight group-hover:underline decoration-4 decoration-black transition-all line-clamp-2">
                    {job.title}
                  </h3>
                </Link>
                <p className="text-sm font-bold uppercase text-black/70 mt-2 bg-white inline-block border-2 border-black px-2 py-0.5">
                  {job.company ?? "UNKNOWN COMPANY"}
                </p>
              </div>
              <span
                className={`border-4 border-black px-3 py-1 text-xs font-black tracking-widest uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${job.source === "internal"
                  ? "bg-[#00E5FF] text-black"
                  : "bg-[#FF3366] text-white"
                  }`}
              >
                {job.location ?? "REMOTE"}
              </span>
            </div>
            {job.description && (
              <p className="mt-6 text-sm font-bold text-black/80 line-clamp-3 leading-relaxed uppercase border-l-4 border-black pl-4">
                {job.description}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t-8 border-black pt-6 mt-4 gap-4">
            <span className="text-sm font-black uppercase tracking-widest text-black/50">
              {job.source}
            </span>

            <div className="flex items-center gap-4">
              {/* TailorButton is rendered here, ideally it gets its own maximalist styles if we can edit it, otherwise it stays functional */}
              <TailorButton job={job} />
              
              {job.url ? (
                <a
                  href={job.url}
                  target="_blank"
                  rel="noreferrer"
                  className="border-4 border-black bg-[#FF3366] px-6 py-3 text-sm font-black uppercase text-white transition-all hover:bg-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                >
                  APPLY NOW
                </a>
              ) : (
                <button disabled className="border-4 border-black bg-gray-300 px-6 py-3 text-sm font-black uppercase text-black/50 cursor-not-allowed shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  COMING SOON
                </button>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
