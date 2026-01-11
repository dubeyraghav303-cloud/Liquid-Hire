"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

export default function OnboardingPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, [supabase]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const pdf = e.dataTransfer.files?.[0];
    if (pdf) setFile(pdf);
  };

  const handleFile = (picked: FileList | null) => {
    if (!picked?.[0]) return;
    setFile(picked[0]);
  };

  const parseAndSave = async () => {
    if (!file || !userId) {
      setMessage("Missing file or user session.");
      return;
    }
    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE}/api/parse-resume`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      setMessage("Failed to parse resume.");
      setUploading(false);
      return;
    }

    const { text } = (await res.json()) as { text: string };
    setResumeText(text);

    const { error } = await supabase
      .from("profiles")
      .update({ resume_text: text })
      .eq("id", userId);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Resume saved to your profile.");
    }
    setUploading(false);
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col gap-6 bg-slate-50 px-6 py-10">
      <div className="max-w-4xl rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Onboarding</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">Upload your resume</h1>
            <p className="text-sm text-slate-500">Drag & drop a PDF. We’ll extract text and store it securely.</p>
          </div>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`mt-6 flex min-h-[220px] flex-col items-center justify-center rounded-3xl border-2 border-dashed ${dragOver ? "border-slate-500 bg-slate-50" : "border-slate-200"
            } bg-white px-6 text-center shadow-inner`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => handleFile(e.target.files)}
          />
          <p className="text-sm font-semibold text-slate-800">
            {file ? file.name : "Drop your PDF here or click to browse"}
          </p>
          <p className="mt-2 text-xs text-slate-500">Only PDF is supported</p>
          <button
            onClick={() => inputRef.current?.click()}
            className="mt-4 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
          >
            Browse files
          </button>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            {resumeText ? `${resumeText.slice(0, 80)}...` : "No text extracted yet."}
          </div>
          <div className="flex gap-3">
            {resumeText && (
              <a
                href="/dashboard"
                className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Continue to Dashboard
              </a>
            )}
            <button
              onClick={parseAndSave}
              disabled={uploading || !file}
              className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {uploading ? "Processing..." : "Parse & Save"}
            </button>
          </div>
        </div>
        {message && <p className="mt-3 text-sm text-emerald-600">{message}</p>}
      </div>
    </div>
  );
}

