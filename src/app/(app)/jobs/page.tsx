import { createSupabaseServerClient } from "@/utils/supabase/server";
import JobSearchForm from "./JobSearchForm";
import JobList from "./JobList";
import { Suspense } from "react";
import JobsLoading from "./loading";

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

async function JobsContent({ query, loc }: { query: string, loc: string }) {
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

  return <JobList jobs={combined} query={query} location={loc} />;
}

export default async function JobsPage({ searchParams }: Props) {
  // Await searchParams for Next.js 15+
  const { q = "", location = "" } = await searchParams;

  const query = q;
  const loc = location;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        
        {/* Search Form component handles client-side form submissions and shows loading state on button */}
        <JobSearchForm initialQuery={query} initialLocation={loc} />

        {/* Suspense boundary will trigger jobs/loading.tsx (or this fallback) when searchParams change! */}
        <Suspense key={query + loc} fallback={
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 w-full animate-pulse rounded-3xl bg-white shadow-sm ring-1 ring-slate-100 p-5 flex flex-col justify-between">
                <div>
                  <div className="h-4 w-3/4 bg-slate-100 rounded-md mb-2" />
                  <div className="h-3 w-1/2 bg-slate-100 rounded-md" />
                </div>
                <div className="flex justify-between border-t border-slate-50 pt-4">
                  <div className="h-4 w-16 bg-slate-100 rounded-md" />
                  <div className="flex gap-2">
                    <div className="h-8 w-24 bg-slate-100 rounded-full" />
                    <div className="h-8 w-24 bg-slate-100 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        }>
          <JobsContent query={query} loc={loc} />
        </Suspense>

      </div>
    </div>
  );
}
