"use client";

import { useRouter } from "next/navigation";

import { useEffect, useMemo, useRef, useState } from "react";
import Webcam from "react-webcam";
import {
  Camera,
  Headphones,
  Mic,
  MicOff,
  PhoneOff,
  Settings,
  Video,
  VideoOff,
} from "lucide-react";
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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true }, video: true });
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

  return (
    <div className="relative min-h-[calc(100vh-80px)] bg-slate-50 p-6 flex flex-col items-center">
      
      {/* Timer Display */}
      <div className="absolute top-6 right-6 z-10 flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-white shadow-lg ring-1 ring-white/10">
        <span className={`text-sm font-bold tracking-wider ${timeLeft < 60 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
          {formatTime(timeLeft)}
        </span>
        <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">remaining</span>
      </div>

      {/* Role Modal */}
      {showRoleModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-slate-900/5">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Start Interview</h2>
            <p className="mt-2 text-sm text-slate-500 font-medium">What role are you applying for?</p>
            <input
              autoFocus
              className="mt-6 w-full rounded-2xl border border-slate-200 p-4 text-sm font-medium outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50"
              placeholder="e.g. Senior Frontend Developer"
              value={manualRole}
              onChange={e => setManualRole(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRoleSubmit()}
            />
            <button
              onClick={handleRoleSubmit}
              className="mt-6 w-full rounded-2xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md"
            >
              Begin Interview Session
            </button>
          </div>
        </div>
      )}

      {/* Main Interview Area */}
      <div className="w-full max-w-5xl flex-1 flex flex-col gap-6 mt-4">
        
        {/* Question card */}
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 transition-all duration-300 hover:shadow-md">
          <div className="flex items-center gap-3">
             <span className="relative flex h-2.5 w-2.5">
               <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isAiSpeaking ? 'bg-indigo-400' : 'bg-emerald-400'}`}></span>
               <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isAiSpeaking ? 'bg-indigo-500' : 'bg-emerald-500'}`}></span>
             </span>
             <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
               {isAiSpeaking ? "AI is speaking" : "Your Turn (Speak now)"}
             </p>
          </div>
          <p className="mt-4 text-xl font-medium text-slate-800 leading-relaxed">{currentQuestion}</p>
        </div>

        {/* Video Area */}
        <div className="relative w-full flex-1 min-h-[500px] rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 shadow-xl ring-1 ring-slate-900/10 flex flex-col">
          <div className="relative flex h-full gap-4 flex-col md:flex-row">
            
            {/* Candidate Video */}
            <div className="relative flex-1 overflow-hidden rounded-2xl bg-black/80">
              <Webcam
                ref={webcamRef}
                audio={true}
                mirrored
                onUserMedia={handleUserMedia}
                onUserMediaError={(e) => console.error("Webcam/Audio Error:", e)}
                className={`h-full w-full object-cover transition-opacity duration-500 ${videoOn ? 'opacity-100' : 'opacity-0'}`}
                videoConstraints={{ facingMode: "user" }}
              />

              {/* User Transcript Overlay */}
              {userTranscript && (
                <div className="absolute inset-x-8 bottom-24 rounded-2xl bg-black/60 p-5 text-center text-white backdrop-blur-md shadow-2xl transition-all duration-300">
                  <p className="text-lg font-medium leading-relaxed">"{userTranscript}"</p>
                  {silenceCountdown !== null && (
                    <p className="text-sm font-semibold text-indigo-300 mt-2">Sending in {silenceCountdown}s...</p>
                  )}
                  <p className="text-xs text-zinc-400 mt-2">Vol: {currentVolume.toFixed(0)}</p>
                </div>
              )}

              {/* Recording indicator */}
              <div className="absolute left-6 top-6 flex items-center gap-2 rounded-full bg-black/50 px-4 py-1.5 text-xs font-semibold text-rose-200 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                Recording
              </div>
            </div>

            {/* AI interviewer tile */}
            <div className={`flex w-full md:w-72 flex-col justify-between rounded-2xl p-6 text-slate-100 shadow-inner transition-colors duration-500 ${isAiSpeaking ? 'bg-indigo-900/90 ring-2 ring-indigo-500 shadow-indigo-500/20' : 'bg-slate-900/80'}`}>
              <div className="flex flex-col items-center gap-4 pt-8 text-center">
                <div className="relative h-24 w-24">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg" />
                  {isAiSpeaking && <span className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-75" />}
                  <div className="absolute inset-0 flex items-center justify-center text-white/50">
                    <Headphones size={36} />
                  </div>
                </div>
                <div>
                  <p className="text-xl font-bold tracking-tight">AI Interviewer</p>
                  <p className="text-sm text-indigo-300 font-medium mt-1">{isAiSpeaking ? "Speaking..." : "Listening..."}</p>
                </div>
              </div>
              <div className="mt-8 rounded-xl bg-black/20 p-5 text-sm text-slate-300 backdrop-blur-sm">
                {isAiSpeaking ? (
                  <div className="flex items-center gap-3 text-indigo-300">
                    <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                    <p className="font-medium">Explaining question</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-emerald-400">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <p className="font-medium">Listening to you...</p>
                    </div>
                    <div className="flex justify-between border-t border-white/10 pt-3 text-xs text-slate-400 font-medium">
                      <span>Threshold: 15</span>
                      <span>Level: {currentVolume.toFixed(0)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom controls */}
          <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
            <div className="pointer-events-auto flex items-center gap-4 rounded-full bg-slate-900/90 px-8 py-3.5 text-slate-100 shadow-2xl backdrop-blur-md ring-1 ring-white/10">
              <button
                onClick={toggleMic}
                className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${micOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-rose-500 hover:bg-rose-600'}`}
              >
                {micOn ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
              <button
                onClick={() => setVideoOn(!videoOn)}
                className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${videoOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-rose-500 hover:bg-rose-600'}`}
              >
                {videoOn ? <Video size={20} /> : <VideoOff size={20} />}
              </button>

              {/* DONE SPEAKING BUTTON */}
              <button
                type="button"
                onClick={() => {
                  if (!userTranscript.trim()) return; // Don't submit empty
                  handleUserAnswer(userTranscript);
                }}
                disabled={isAiSpeaking || !userTranscript.trim()}
                className={`flex h-12 items-center gap-2 rounded-full px-8 text-sm font-bold shadow-lg transition-all duration-300
                      ${(isAiSpeaking || !userTranscript.trim())
                    ? 'bg-slate-700 text-slate-400 opacity-50 cursor-not-allowed'
                    : 'bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-105'}`}
              >
                Done Speaking
              </button>

              {/* Helper Text */}
              {(!userTranscript.trim() && !isAiSpeaking && isListening) && (
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 rounded-lg bg-black/80 px-4 py-2 text-xs font-semibold tracking-wide text-white backdrop-blur-md animate-bounce">
                  Say something...
                </div>
              )}

              <div className="h-8 w-px bg-white/10 mx-2" />

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
                className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${isEnding ? 'bg-slate-400 cursor-not-allowed' : 'bg-rose-500 hover:bg-rose-600 hover:rotate-12'}`}
                title="End Interview"
              >
                {isEnding ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <PhoneOff size={20} />}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
