"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [step, setStep] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  // Step 1 States: Personal
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");

  // Step 2 States: Education
  const [degree, setDegree] = useState("");
  const [stream, setStream] = useState("");
  const [yearOfGraduation, setYearOfGraduation] = useState("");
  const [college, setCollege] = useState("");
  const [linkedinProfile, setLinkedinProfile] = useState("");

  // Step 3 States: Resume
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
        if (data && data.full_name) {
          setFullName(data.full_name);
        }
      }
    };
    fetchUser();
  }, [supabase]);

  // Handle Step 0 transition
  useEffect(() => {
    if (step === 0) {
      const timer = setTimeout(() => {
        setStep(1);
      }, 3000); // Wait 3 seconds then go to step 1
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleSavePersonal = async () => {
    if (!userId) return;
    setUploading(true);
    const updates = {
      id: userId,
      full_name: fullName,
      date_of_birth: dob,
      phone_number: phone,
    };
    const { error } = await supabase.from("profiles").upsert(updates);
    setUploading(false);
    if (!error) {
      setStep(2);
    } else {
      setMessage(error.message);
    }
  };

  const handleSaveEducation = async () => {
    if (!userId) return;
    setUploading(true);
    const updates = {
      id: userId,
      degree,
      stream,
      year_of_graduation: yearOfGraduation,
      college,
      linkedin_profile: linkedinProfile
    };
    const { error } = await supabase.from("profiles").upsert(updates);
    setUploading(false);
    if (!error) {
      setStep(3);
    } else {
      setMessage(error.message);
    }
  };

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

  const [manualMode, setManualMode] = useState(false);
  const [manualResumeText, setManualResumeText] = useState("");

  const parseAndSave = async () => {
    if (!userId) {
      setMessage("Missing user session.");
      return;
    }

    if (manualMode) {
      if (!manualResumeText.trim()) {
        setMessage("Please paste your resume text first.");
        return;
      }
      setUploading(true);
      setMessage(null);
      try {
        const { error } = await supabase
          .from("profiles")
          .upsert({ id: userId, resume_text: manualResumeText.trim() });

        if (error) {
          setMessage(error.message);
        } else {
          setMessage("Resume saved to your profile.");
          router.push("/dashboard");
        }
      } catch (err) {
        console.error(err);
        setMessage("Failed to save resume. Please try again.");
      } finally {
        setUploading(false);
      }
      return;
    }

    if (!file) {
      setMessage("Missing file.");
      return;
    }
    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/api/parse-resume`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        setMessage("Failed to parse resume. You can switch to manual paste below.");
        setUploading(false);
        return;
      }

      const { text } = (await res.json()) as { text: string };
      setResumeText(text);

      const { error } = await supabase
        .from("profiles")
        .upsert({ id: userId, resume_text: text });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Resume saved to your profile.");
        router.push("/dashboard");
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to fetch. Switch to manual paste below if the parser service is down.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-50 px-6 py-10 overflow-hidden">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="step0"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight">
              Welcome, {fullName || "Candidate"}
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="mt-4 text-slate-500 text-lg"
            >
              Let's set up your profile.
            </motion.p>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-100"
          >
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.2em] text-indigo-500 font-semibold">Step 1 of 3</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Personal Details</h2>
              <p className="text-sm text-slate-500">Let's start with the basics.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  placeholder="e.g. +1 234 567 8900"
                />
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              {message && <p className="text-sm text-rose-500">{message}</p>}
              <button
                onClick={handleSavePersonal}
                disabled={uploading || !fullName || !dob || !phone}
                className="ml-auto rounded-full bg-indigo-600 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-700 hover:shadow-lg disabled:opacity-50"
              >
                {uploading ? "Saving..." : "Continue"}
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-100"
          >
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.2em] text-indigo-500 font-semibold">Step 2 of 3</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Education Details</h2>
              <p className="text-sm text-slate-500">Tell us a bit about your academic background.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Degree</label>
                <select
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-white"
                >
                  <option value="">Select Degree...</option>
                  <option value="High School">High School</option>
                  <option value="Bachelors">Bachelors</option>
                  <option value="Masters">Masters</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Stream</label>
                <input
                  type="text"
                  value={stream}
                  onChange={(e) => setStream(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  placeholder="e.g. Computer Science"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Year of Graduation</label>
                <input
                  type="text"
                  value={yearOfGraduation}
                  onChange={(e) => setYearOfGraduation(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  placeholder="e.g. 2024"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">College/University</label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  placeholder="e.g. MIT"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">LinkedIn Profile <span className="text-slate-400 font-normal">(Optional)</span></label>
                <input
                  type="text"
                  value={linkedinProfile}
                  onChange={(e) => setLinkedinProfile(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <div className="flex gap-4">
                 <button
                  onClick={() => setStep(1)}
                  className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50"
                >
                  Back
                </button>
              </div>
              <button
                onClick={handleSaveEducation}
                disabled={uploading || !degree || !stream || !yearOfGraduation || !college}
                className="rounded-full bg-indigo-600 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-700 hover:shadow-lg disabled:opacity-50"
              >
                {uploading ? "Saving..." : "Continue"}
              </button>
            </div>
            {message && <p className="mt-4 text-center text-sm text-rose-500 font-medium">{message}</p>}
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-indigo-500 font-semibold">Step 3 of 3</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  {manualMode ? "Paste your resume text" : "Upload your resume"}
                </h2>
                <p className="text-sm text-slate-500">
                  {manualMode 
                    ? "Paste the text of your resume directly to complete the setup."
                    : "Drag & drop a PDF. We’ll extract text and store it securely."}
                </p>
              </div>
              <button
                onClick={() => {
                  setManualMode(!manualMode);
                  setMessage(null);
                }}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                {manualMode ? "Switch to Upload" : "Or Paste Manually"}
              </button>
            </div>

            {manualMode ? (
              <div className="mt-8">
                <textarea
                  value={manualResumeText}
                  onChange={(e) => setManualResumeText(e.target.value)}
                  className="w-full h-[260px] rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
                  placeholder="Paste your resume contents, experience, and contact information here..."
                />
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`mt-8 flex min-h-[260px] flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-all ${
                  dragOver ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-slate-50"
                } px-6 text-center`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files)}
                />
                
                <div className="mb-4 h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>

                <p className="text-sm font-semibold text-slate-800">
                  {file ? file.name : "Drop your PDF here or click to browse"}
                </p>
                <p className="mt-2 text-xs text-slate-500">Only PDF is supported</p>
                <button
                  onClick={() => inputRef.current?.click()}
                  className="mt-6 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Browse files
                </button>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between">
              <div className="flex gap-4">
                 <button
                  onClick={() => setStep(2)}
                  className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50"
                >
                  Back
                </button>
              </div>
              <button
                onClick={parseAndSave}
                disabled={uploading || (manualMode ? !manualResumeText.trim() : !file)}
                className="rounded-full bg-indigo-600 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-700 hover:shadow-lg disabled:opacity-50"
              >
                {uploading ? "Processing..." : "Finish Onboarding"}
              </button>
            </div>
            {message && <p className="mt-4 text-center text-sm text-indigo-600 font-medium">{message}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
