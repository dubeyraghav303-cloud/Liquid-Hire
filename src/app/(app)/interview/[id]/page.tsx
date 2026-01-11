"use client";

import { useRouter } from "next/navigation";

import { useEffect, useMemo, useRef, useState } from "react";
import Webcam from "react-webcam";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import {
  Camera,
  Grid,
  Headphones,
  Home,
  Mic,
  MicOff,
  PhoneOff,
  Settings,
  Video,
} from "lucide-react";
import { INTERVIEW_CANDIDATES, RADAR_METRICS } from "@/lib/mockData";
import { useProctoring } from "@/hooks/useProctoring";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

type HistoryItem = { role: "user" | "model"; content: string };

// Type definitions for Web Speech API
interface Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}

export default function InterviewPage() {
  const router = useRouter();
  const webcamRef = useRef<Webcam | null>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Audio Context Ref
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  // Ensure the Uint8Array is backed by a plain ArrayBuffer to match
  // the `AnalyserNode.getByteFrequencyData` signature which expects
  // `Uint8Array<ArrayBuffer>` not `Uint8Array<ArrayBufferLike>`.
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // Data State
  const [resumeText, setResumeText] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("Preparing your first question...");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // UX State
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [manualRole, setManualRole] = useState("");
  const [userTranscript, setUserTranscript] = useState("");
  const [silenceCountdown, setSilenceCountdown] = useState<number | null>(null);
  // Debug toggle for threshold
  const [currentVolume, setCurrentVolume] = useState(0);

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const videoElement = webcamRef.current?.video ?? null;
  const proctorState = useProctoring({ videoElement: videoElement as HTMLVideoElement | null });

  // Init Audio Context for Volume Meter
  const initAudioAnalysis = (stream: MediaStream) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);
      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyzeVolume();
    }
  };

  const analyzeVolume = () => {
    if (!analyserRef.current || !dataArrayRef.current) return;
    // TypeScript's DOM typings can require a stricter Uint8Array<ArrayBuffer>.
    // Cast here to satisfy the analyzer API which expects a plain `Uint8Array`.
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);

    let sum = 0;
    for (let i = 0; i < dataArrayRef.current.length; i++) {
      sum += dataArrayRef.current[i];
    }
    const average = sum / dataArrayRef.current.length;
    setCurrentVolume(average); // 0 to 255

    requestAnimationFrame(analyzeVolume);
  };

  // Init Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let fullTranscript = "";
          // CRITICAL FIX: Iterate from 0 to capture entire session history, not just new chunks
          for (let i = 0; i < event.results.length; ++i) {
            fullTranscript += event.results[i][0].transcript;
          }
          if (fullTranscript.trim()) {
            setUserTranscript(fullTranscript);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          // Auto-restart if we should still be listening
          if (micOn && !isAiSpeaking) {
            console.log("Recognition ended, restarting...");
            startListening();
          }
        };

        recognitionRef.current = recognition;
      }
    }
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recognitionRef.current) {
        recognitionRef.current.onend = null; // Prevent loop on unmount
        recognitionRef.current.stop();
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(e => console.error("Error closing AudioContext:", e));
      }
    };
  }, [micOn, isAiSpeaking]); // Added dependencies to closure



  // NEW: Effect to monitor volume and reset timer ONLY if loud enough
  useEffect(() => {
    // Threshold: 10 (out of 255) is roughly background noise. 
    // User requested "higher decibel cap". Let's set it to 20 for safer gating.
    if (isListening && userTranscript) {
      if (currentVolume > 15) {
        // It's loud enough to be speech, KICK the timer down the road
        resetSilenceTimer(userTranscript);
      } else {
        // It's too quiet, let the timer burn!
        // Do nothing means silenceTimer continues to countdown
        if (!silenceTimerRef.current) {
          // Convert instant silence to 2s wait if we just dropped below threshold
          resetSilenceTimer(userTranscript);
        }
      }
    }
  }, [currentVolume, isListening, userTranscript]);


  // Manage Listen/speak state
  useEffect(() => {
    if (isAiSpeaking || !micOn) {
      stopListening();
    } else if (!isAiSpeaking && micOn && jobRole) {
      startListening();
    }
  }, [isAiSpeaking, micOn, jobRole]);

  const startListening = () => {
    try {
      if (recognitionRef.current && !isListening) {
        recognitionRef.current.start();
        setIsListening(true);
        console.log("Started listening...");

        // Hook up audio analysis if we have a stream
        if (webcamRef.current?.video?.srcObject) {
          const stream = webcamRef.current.video.srcObject as MediaStream;
          initAudioAnalysis(stream);
        }
      }
    } catch (e) {
      // Ignore, already started
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      console.log("Stopped listening.");
    }
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    setSilenceCountdown(null);
  };

  const resetSilenceTimer = (text: string) => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    setSilenceCountdown(2);

    silenceTimerRef.current = setTimeout(() => {
      console.log("Silence detected (Volume gated), submitting...");
      handleUserAnswer(text);
    }, 2000);
  };

  // Countdown effect
  useEffect(() => {
    if (silenceCountdown === null) return;
    if (silenceCountdown > 0) {
      const t = setTimeout(() => setSilenceCountdown(c => (c !== null ? c - 1 : null)), 1000);
      return () => clearTimeout(t);
    }
  }, [silenceCountdown]);

  const handleUserAnswer = async (answer: string) => {
    if (!answer.trim()) return;
    stopListening();
    setUserTranscript("");
    setSilenceCountdown(null);

    const newHistory = [...history, { role: "user" as const, content: answer }];
    setHistory(newHistory);

    setCurrentQuestion("Thinking...");
    await startInterview(resumeText, jobRole, newHistory, answer);
  };

  // Manual Mic Toggle Handler
  const toggleMic = () => {
    const nextMicState = !micOn;
    if (!nextMicState && userTranscript.trim()) {
      handleUserAnswer(userTranscript);
    }
    setMicOn(nextMicState);
  };

  // Media Track Handling
  useEffect(() => {
    if (webcamRef.current?.video?.srcObject) {
      const stream = webcamRef.current.video.srcObject as MediaStream;
      stream.getAudioTracks().forEach((t) => (t.enabled = micOn));
      stream.getVideoTracks().forEach((t) => (t.enabled = videoOn));

      // Ensure analysis is hooked up if streams change/init
      if (micOn) initAudioAnalysis(stream);
    }
  }, [micOn, videoOn, webcamRef?.current?.video?.srcObject]);

  // TTS Helper
  const speak = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => {
        setIsAiSpeaking(true);
        stopListening();
      };
      utterance.onend = () => {
        setIsAiSpeaking(false);
      };
      utterance.onerror = () => setIsAiSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return;
      setUserId(uid);

      // Fetch profile safely
      const { data: profile } = await supabase
        .from("profiles")
        .select("resume_text")
        .eq("id", uid)
        .maybeSingle();

      const resume = profile?.resume_text ?? "";
      setResumeText(resume);

      // If we could fetch target_role we would, but for now we reset content
      // Asking user for role is safer if schema is broken
      setShowRoleModal(true);

      // Health check
      try {
        const health = await fetch(`${API_BASE}/api/health`);
        if (!health.ok) throw new Error("Health check failed");
      } catch (e) {
        setCurrentQuestion("Error: Backend server is not reachable.");
      }
    };
    void init();
  }, [supabase]);

  // Handle Role Selection
  const handleRoleSubmit = async () => {
    const role = manualRole || "Software Engineer";
    setJobRole(role);
    setShowRoleModal(false);
    await requestMicrophone();
    await startInterview(resumeText, role, [], "START_INTERVIEW");
  };

  const requestMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      stream.getTracks().forEach(t => t.stop());
      setMicOn(true);
      setVideoOn(true);
    } catch (err) {
      console.error("Mic/Cam permission denied", err);
      setMicOn(false);
      setVideoOn(false);
    }
  };

  const startInterview = async (resume: string, role: string, priorHistory: HistoryItem[], currentAnswer: string) => {
    setIsAiSpeaking(true);
    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_text: resume || "Result not provided.",
          job_role: role,
          history: priorHistory,
          current_answer: currentAnswer,
        }),
      });
      if (!res.ok) throw new Error("Backend error");
      const payload = await res.json();
      if (payload?.next_question) {
        setCurrentQuestion(payload.next_question);
        setHistory((prev) => [...prev, { role: "model", content: payload.next_question }]);
        speak(payload.next_question);
      }
    } catch (err) {
      console.error("Failed to start interview:", err);
      setCurrentQuestion("Error: Backend server issue.");
      setIsAiSpeaking(false);
    }
  };

  const saveTranscript = async () => {
    if (!userId) return;

    let score = 0;
    let summary = "No summary generated.";
    let jsonReport = [];

    try {
      // 1. Generate Score & Summary via Backend
      const res = await fetch(`${API_BASE}/api/end-interview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: history,
          job_role: jobRole,
          resume_text: resumeText,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        score = data.score;
        summary = data.summary;
        jsonReport = data.json_report;
      }
    } catch (e) {
      console.error("Error generating score/summary from backend:", e);
      // Fallback: still save the interview even if scoring fails
    }

    try {
      // 2. Save to Supabase
      const { error } = await supabase.from("interviews").insert({
        user_id: userId,
        transcript: history,
        job_role: jobRole,
        score: score,
        summary: summary,
        json_report: jsonReport,
      });

      if (error) {
        console.error("Supabase Insert Error:", error);
      } else {
        console.log("Interview saved successfully!");
      }
    } catch (dbError) {
      console.error("Unexpected DB saving error:", dbError);
    }
  };

  // Ensure AudioContext is running (fix for "suspended" state)
  const resumeAudioContext = async () => {
    if (audioContextRef.current?.state === "suspended") {
      await audioContextRef.current.resume();
    }
  };

  const handleUserMedia = (stream: MediaStream) => {
    console.log("Webcam stream acquired:", stream.id);
    initAudioAnalysis(stream);
    resumeAudioContext();
  };

  // Timer State
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes

  // Timer Effect
  useEffect(() => {
    if (timeLeft > 0) {
      const t = setTimeout(() => setTimeLeft(l => l - 1), 1000);
      return () => clearTimeout(t);
    } else if (timeLeft === 0 && history.length > 0) {
      // Auto-end interview
      saveTranscript();
      router.push('/dashboard');
    }
  }, [timeLeft, history]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ...

  return (
    <div className="relative grid min-h-[calc(100vh-80px)] grid-cols-12 gap-6 bg-slate-50">
      {/* ... */}

      {/* Timer Display */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-white shadow-lg">
        <span className={`text-sm font-bold ${timeLeft < 60 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
          {formatTime(timeLeft)}
        </span>
        <span className="text-xs text-slate-400">remaining</span>
      </div>


      {/* Role Modal */}
      {showRoleModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-slate-900">Start Interview</h2>
            <p className="mt-2 text-sm text-slate-500">What role are you applying for?</p>
            <input
              autoFocus
              className="mt-4 w-full rounded-2xl border border-slate-200 p-3 outline-none focus:border-indigo-500"
              placeholder="e.g. Frontend Developer"
              value={manualRole}
              onChange={e => setManualRole(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRoleSubmit()}
            />
            <button
              onClick={handleRoleSubmit}
              className="mt-6 w-full rounded-2xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700"
            >
              Begin Interview
            </button>
          </div>
        </div>
      )}

      {/* Left tools sidebar */}
      <aside className="col-span-1 flex flex-col items-center gap-4 rounded-3xl bg-white py-6 shadow-sm ring-1 ring-slate-100">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white text-sm font-semibold">
          LH
        </div>
        {/* Unused buttons removed as per request */}

        <div className="mt-auto">
          <button
            onClick={() => router.push('/settings')}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
          >
            <Settings size={18} />
          </button>
        </div>
      </aside>

      {/* Center stage */}
      <section className="col-span-12 lg:col-span-7 space-y-4">
        <div className="relative h-[400px] rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 shadow-md">
          <div className="relative flex h-full gap-4">
            <div className="relative flex-1 overflow-hidden rounded-2xl bg-black/80">
              <Webcam
                ref={webcamRef}
                audio={true}
                mirrored
                onUserMedia={handleUserMedia}
                onUserMediaError={(e) => console.error("Webcam/Audio Error:", e)}
                className={`h-full w-full rounded-2xl object-cover transition-opacity ${videoOn ? 'opacity-100' : 'opacity-0'}`}
                videoConstraints={{ facingMode: "user" }}
              />

              {/* User Transcript Overlay */}
              {userTranscript && (
                <div className="absolute inset-x-4 bottom-12 rounded-xl bg-black/60 p-4 text-center text-white backdrop-blur">
                  <p className="text-sm font-medium">"{userTranscript}"</p>
                  {silenceCountdown !== null && (
                    <p className="text-xs text-indigo-300 mt-1">Sending in {silenceCountdown}s...</p>
                  )}
                  <p className="text-[10px] text-zinc-500 mt-1">Vol: {currentVolume.toFixed(0)}</p>
                </div>
              )}

              {/* Recording indicator */}
              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-rose-200 backdrop-blur">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
                Recording
              </div>
            </div>

            {/* AI interviewer tile */}
            <div className={`flex w-48 flex-col justify-between rounded-2xl p-3 text-slate-100 shadow-inner transition-colors ${isAiSpeaking ? 'bg-indigo-900/80 ring-2 ring-indigo-500' : 'bg-slate-900/70'}`}>
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-blue-500" />
                  {isAiSpeaking && <span className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-75" />}
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-semibold">AI Interviewer</p>
                  <p className="text-[11px] text-slate-300">{isAiSpeaking ? "Speaking..." : "Listening..."}</p>
                </div>
              </div>
              <div className="mt-4 space-y-1 text-[11px] text-slate-300">
                {isAiSpeaking ? (
                  <p className="text-indigo-300">● Explaining question</p>
                ) : (
                  <div className="space-y-1">
                    <p className="text-emerald-300 animate-pulse">● Listening to you...</p>
                    <p className="text-xs text-slate-400">Threshold: 15 | Level: {currentVolume.toFixed(0)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom controls */}
          <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
            <div className="pointer-events-auto flex items-center gap-4 rounded-full bg-slate-900/80 px-6 py-3 text-slate-100 shadow-xl backdrop-blur">
              <button
                onClick={toggleMic}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition ${micOn ? 'bg-slate-700' : 'bg-rose-500'}`}
              >
                {micOn ? <Mic size={18} /> : <MicOff size={18} />}
              </button>
              <button
                onClick={() => setVideoOn(!videoOn)}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition ${videoOn ? 'bg-slate-700' : 'bg-rose-500'}`}
              >
                {videoOn ? <Video size={18} /> : <PhoneOff size={18} className="rotate-45" />}
              </button>

              {/* DONE SPEAKING BUTTON */}
              <button
                type="button"
                onClick={() => {
                  if (!userTranscript.trim()) return; // Don't submit empty
                  handleUserAnswer(userTranscript);
                }}
                disabled={isAiSpeaking || !userTranscript.trim()}
                className={`flex h-11 items-center gap-2 rounded-full px-5 text-sm font-bold shadow-lg transition
                      ${(isAiSpeaking || !userTranscript.trim())
                    ? 'bg-slate-700 text-slate-400 opacity-50 cursor-not-allowed'
                    : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
              >
                <span className="hidden md:inline">Done Speaking</span>
                <span className="md:hidden">Done</span>
              </button>
              {/* Helper Text */}
              {(!userTranscript.trim() && !isAiSpeaking && isListening) && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-md bg-black/60 px-2 py-1 text-xs text-white backdrop-blur">
                  Say something...
                </div>
              )}

              <button
                onClick={async () => {
                  if (isEnding) return;
                  setIsEnding(true);
                  try {
                    // Manual termination: save before exit
                    await saveTranscript();
                  } catch (e) {
                    console.error("Manual save failed:", e);
                  }
                  router.push('/dashboard');
                }}
                disabled={isEnding}
                className={`flex h-11 w-11 items-center justify-center rounded-full transition ${isEnding ? 'bg-slate-400 cursor-not-allowed' : 'bg-rose-500 hover:bg-rose-600'}`}
                title="End Interview"
              >
                {isEnding ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <PhoneOff size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Question card */}
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {isAiSpeaking ? "AI is speaking" : "Your Turn (Speak now)"}
          </p>
          <p className="mt-3 text-sm text-slate-800 md:text-base">{currentQuestion}</p>
        </div>
      </section>

      {/* Right analytics panel */}
      <aside className="col-span-12 lg:col-span-4 space-y-4">
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 h-full">
          <p className="font-semibold text-slate-900">Live Analytics</p>
          <div className="mt-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={RADAR_METRICS}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "#64748b" }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </aside>
    </div>
  );
}
