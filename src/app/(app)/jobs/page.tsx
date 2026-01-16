import { createSupabaseServerClient } from "@/utils/supabase/server";
import { Briefcase, MapPin, Wand2 } from "lucide-react";
import Link from "next/link";

type Job = {
  id?: string | number;
  title: string;
  company?: string;
  location?: string;
  source: "internal" | "external";
  url?: string;
  description?: string;
};

// Update type to assume Promise for Next.js 15+ compatibility
type Props = {
  searchParams: Promise<{ q?: string; location?: string }>;
};

async function fetchExternalJobs(query: string, location: string): Promise<Job[]> {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";
    const searchTerm = query.trim();
    if (!searchTerm) return [];
    // Default location to "Remote" if empty, but allow user override
    const searchLocation = location.trim() || "Remote";

    const res = await fetch(`${backendUrl}/api/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: searchTerm, location: searchLocation }),
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Backend scrape failed", await res.text());
      return [];
    }

    const json = await res.json();
    return (json.jobs || []).map((j: any) => ({
      ...j,
      source: "external",
    }));

  } catch (err) {
    console.error("Job fetch failed:", err);
    return [];
  }
}

export default async function JobsPage({ searchParams }: Props) {
  // Await searchParams for Next.js 15+
  const { q = "", location = "" } = await searchParams;

  const query = q;
  const loc = location;

  const supabase = await createSupabaseServerClient();

  const { data: internalJobs = [] } = await supabase
    .from("jobs")
    .select("id, title, company, location")
    .ilike("title", `%${query || ""}%`)
    .limit(5);

  const externalJobs = await fetchExternalJobs(query, loc);

  const combined: Job[] = [
    ...(internalJobs || []).map((j) => ({ ...j, source: "internal" as const })),
    ...externalJobs,
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <form className="flex flex-col gap-3 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Job search</p>
            <h1 className="text-2xl font-semibold text-slate-900">Find your next role</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              name="q"
              defaultValue={query}
              placeholder="Job title, keywords, or skills"
              className="w-full md:w-64 rounded-2xl border border-slate-200 px-4 py-2 text-sm outline-none transition focus:border-slate-400"
            />
            <input
              name="location"
              defaultValue={loc}
              placeholder="Preferred Location (e.g. Remote, NY)"
              className="w-full md:w-52 rounded-2xl border border-slate-200 px-4 py-2 text-sm outline-none transition focus:border-slate-400"
            />
            <button className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              Search
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {combined.map((job) => (
            <div
              key={`${job.source}-${job.id ?? job.title}`}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:shadow-md"
            >
              <div className="mb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <Link href={job.source === 'internal' ? `/jobs/${job.id}` : '#'} className="block">
                      <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {job.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-500 mt-1">
                      {job.company ?? "Unknown company"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-semibold ${job.source === "internal"
                      ? "bg-indigo-50 text-indigo-700"
                      : "bg-emerald-50 text-emerald-700"
                      }`}
                  >
                    {job.location ?? "Remote"}
                  </span>
                </div>
                {job.description && (
                  <p className="mt-3 text-xs text-slate-400 line-clamp-2">
                    {job.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-300">
                  {job.source}
                </span>

                <div className="flex items-center gap-2">
                  {job.source === "internal" && (
                    <Link
                      href={`/jobs/${job.id}/tailor`}
                      className="flex items-center gap-1.5 rounded-full bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                    >
                      <Wand2 size={14} />
                      Tailor
                    </Link>
                  )}
                  {job.url ? (
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
                    >
                      Apply Now
                    </a>
                  ) : (
                    <button disabled className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-400">
                      Coming Soon
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {combined.length === 0 && (
            <div className="col-span-full rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-100">
              <p className="text-sm text-slate-500">No jobs found for "{query}" in "{loc || 'Remote'}".</p>
              <p className="text-xs text-slate-400 mt-1">Try broadening your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

