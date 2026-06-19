import { Loader2 } from "lucide-react";

export default function SettingsLoading() {
  return (
    <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <p className="text-sm font-medium animate-pulse">Loading settings...</p>
      </div>
    </div>
  );
}
