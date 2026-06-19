"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import TailorButton from "@/components/TailorButton";

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
        className="col-span-full rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-100 border border-slate-100"
      >
        <p className="text-sm font-semibold text-slate-800">No jobs found for "{query}" in "{location || 'Remote'}".</p>
        <p className="text-xs text-slate-400 mt-2">Try broadening your search terms or changing the location.</p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {jobs.map((job, index) => (
        <motion.div
          key={`${job.source}-${job.id ?? job.title}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
          className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 border border-slate-100 transition-all hover:shadow-md hover:-translate-y-1"
        >
          <div className="mb-4">
            <div className="flex items-start justify-between">
              <div>
                <Link href={job.source === 'internal' ? `/jobs/${job.id}` : '#'} className="block">
                  <h3 className="text-base font-bold text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {job.title}
                  </h3>
                </Link>
                <p className="text-xs font-medium text-slate-500 mt-1">
                  {job.company ?? "Unknown company"}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-[10px] font-bold tracking-wider uppercase ${job.source === "internal"
                  ? "bg-indigo-50 text-indigo-700"
                  : "bg-emerald-50 text-emerald-700"
                  }`}
              >
                {job.location ?? "Remote"}
              </span>
            </div>
            {job.description && (
              <p className="mt-4 text-xs text-slate-500 line-clamp-3 leading-relaxed">
                {job.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {job.source}
            </span>

            <div className="flex items-center gap-2">
              <TailorButton job={job} />
              {job.url ? (
                <a
                  href={job.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 shadow-sm"
                >
                  Apply Now
                </a>
              ) : (
                <button disabled className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-400 cursor-not-allowed">
                  Coming Soon
                </button>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
