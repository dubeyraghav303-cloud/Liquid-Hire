import { Loader2 } from "lucide-react";

export default function JobsLoading() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] w-full flex-col items-center justify-center bg-slate-50 px-6 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        {/* Search Bar Skeleton */}
        <div className="h-24 w-full animate-pulse rounded-3xl bg-white shadow-sm ring-1 ring-slate-100" />
        
        {/* Jobs Grid Skeleton */}
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
      </div>
    </div>
  );
}
