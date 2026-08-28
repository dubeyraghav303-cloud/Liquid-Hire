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
  AlertTriangle
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
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // Data State
  const [resumeText, setResumeText] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("PREPARING YOUR FIRST QUESTION...");
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
          for (let i = 0; i < event.results.length; ++i) {
            fullTranscript += event.results[i][0].transcript;
          }
          if (fullTranscript.trim()) {
            setUserTranscript(fullTranscript);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          if (micOn && !isAiSpeaking) {
            startListening();
          }
        };

        recognitionRef.current = recognition;
      }
    }
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(e => console.error("Error closing AudioContext:", e));
      }
    };
  }, [micOn, isAiSpeaking]);


  useEffect(() => {
    if (isListening && userTranscript) {
      if (currentVolume > 15) {
        resetSilenceTimer(userTranscript);
      } else {
        if (!silenceTimerRef.current) {
          resetSilenceTimer(userTranscript);
        }
      }
    }
  }, [currentVolume, isListening, userTranscript]);


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
        if (webcamRef.current?.video?.srcObject) {
          const stream = webcamRef.current.video.srcObject as MediaStream;
          initAudioAnalysis(stream);
        }
      }
    } catch (e) {
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    setSilenceCountdown(null);
  };

  const resetSilenceTimer = (text: string) => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    setSilenceCountdown(2);

    silenceTimerRef.current = setTimeout(() => {
      handleUserAnswer(text);
    }, 2000);
  };

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

    setCurrentQuestion("THINKING...");
    await startInterview(resumeText, jobRole, newHistory, answer);
  };

  const toggleMic = () => {
    const nextMicState = !micOn;
    if (!nextMicState && userTranscript.trim()) {
      handleUserAnswer(userTranscript);
    }
    setMicOn(nextMicState);
  };

  useEffect(() => {
    if (webcamRef.current?.video?.srcObject) {
      const stream = webcamRef.current.video.srcObject as MediaStream;
      stream.getAudioTracks().forEach((t) => (t.enabled = micOn));
      stream.getVideoTracks().forEach((t) => (t.enabled = videoOn));
      if (micOn) initAudioAnalysis(stream);
    }
  }, [micOn, videoOn, webcamRef?.current?.video?.srcObject]);

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

      const { data: profile } = await supabase
        .from("profiles")
        .select("resume_text")
        .eq("id", uid)
        .maybeSingle();

      const resume = profile?.resume_text ?? "";
      setResumeText(resume);

      setShowRoleModal(true);

      try {
        const health = await fetch(`${API_BASE}/api/health`);
        if (!health.ok) throw new Error("Health check failed");
      } catch (e) {
        setCurrentQuestion("ERROR: BACKEND SERVER IS NOT REACHABLE.");
      }
    };
    void init();
  }, [supabase]);

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
      setCurrentQuestion("ERROR: BACKEND SERVER ISSUE.");
      setIsAiSpeaking(false);
    }
  };

  const saveTranscript = async () => {
    if (!userId) return;

    let score = 0;
    let summary = "No summary generated.";
    let jsonReport = [];

    try {
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
    }

    try {
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
      }
    } catch (dbError) {
      console.error("Unexpected DB saving error:", dbError);
    }
  };

  const resumeAudioContext = async () => {
    if (audioContextRef.current?.state === "suspended") {
      await audioContextRef.current.resume();
    }
  };

  const handleUserMedia = (stream: MediaStream) => {
    initAudioAnalysis(stream);
    resumeAudioContext();
  };

  const [timeLeft, setTimeLeft] = useState(15 * 60);

  useEffect(() => {
    if (timeLeft > 0) {
      const t = setTimeout(() => setTimeLeft(l => l - 1), 1000);
      return () => clearTimeout(t);
    } else if (timeLeft === 0 && history.length > 0) {
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
    <div className="relative min-h-[calc(100vh-80px)] bg-[#FFFBED] p-4 md:p-10 flex flex-col items-center selection:bg-[#FF3366] selection:text-white">
      
      {/* Timer Display */}
      <div className="absolute top-4 right-4 md:top-10 md:right-10 z-10 flex items-center gap-4 bg-white border-4 border-black px-6 py-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <span className={`text-2xl font-black tracking-widest ${timeLeft < 60 ? 'text-[#FF3366] animate-pulse' : 'text-black'}`}>
          {formatTime(timeLeft)}
        </span>
        <span className="text-sm font-black text-black bg-[#EAFF00] px-2 uppercase tracking-widest border-2 border-black">LEFT</span>
      </div>

      {/* Role Modal */}
      {showRoleModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white border-8 border-black p-6 md:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[24px_24px_0px_0px_rgba(0,0,0,1)] transition-all">
            <h2 className="text-3xl md:text-5xl font-black text-black uppercase tracking-tighter mb-4 bg-[#00E5FF] inline-block px-4 py-2 border-4 border-black">START INTERVIEW</h2>
            <p className="mt-2 md:mt-4 text-lg md:text-xl font-bold text-black uppercase tracking-wide">WHAT ROLE ARE YOU APPLYING FOR?</p>
            <input
              autoFocus
              className="mt-6 w-full border-4 border-black bg-[#FFFBED] p-4 text-xl font-bold uppercase text-black placeholder:text-black/30 outline-none focus:ring-4 focus:ring-[#FF3366] focus:bg-white transition-all shadow-inner"
              placeholder="e.g. SENIOR FRONTEND DEVELOPER"
              value={manualRole}
              onChange={e => setManualRole(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleRoleSubmit()}
            />
            <button
              onClick={handleRoleSubmit}
              className="mt-8 w-full border-4 border-black bg-[#FF3366] py-4 text-2xl font-black uppercase text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              BEGIN INTERVIEW
            </button>
          </div>
        </div>
      )}

      {/* Main Interview Area */}
      <div className="w-full max-w-6xl flex-1 flex flex-col gap-8 mt-12 md:mt-24">
        
        {/* Question card */}
        <div className="border-8 border-black bg-white p-8 md:p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all relative">
          <div className="absolute -top-6 left-8 bg-[#EAFF00] border-4 border-black px-6 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
             <div className="flex items-center gap-4">
               <span className={`h-4 w-4 border-2 border-black ${isAiSpeaking ? 'bg-[#FF3366] animate-pulse' : 'bg-[#00E5FF]'}`}></span>
               <p className="text-sm font-black uppercase tracking-[0.2em] text-black">
                 {isAiSpeaking ? "AI IS SPEAKING" : "YOUR TURN (SPEAK NOW)"}
               </p>
             </div>
          </div>
          <p className="mt-6 text-2xl md:text-4xl font-black text-black uppercase leading-tight tracking-tight">{currentQuestion}</p>
        </div>

        {/* Video Area */}
        <div className="relative w-full flex-1 min-h-[600px] border-8 border-black bg-[#00E5FF] p-6 md:p-10 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] flex flex-col">
          <div className="relative flex h-full gap-8 flex-col lg:flex-row">
            
            {/* Candidate Video */}
            <div className="relative flex-1 border-8 border-black bg-black overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]">
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
                <div className="absolute inset-x-8 bottom-28 border-4 border-black bg-[#EAFF00] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
                  <p className="text-2xl font-black text-black uppercase leading-tight">"{userTranscript}"</p>
                  {silenceCountdown !== null && (
                    <p className="text-lg font-bold text-black/70 mt-4 bg-white border-2 border-black inline-block px-3 py-1">SENDING IN {silenceCountdown}S...</p>
                  )}
                  <p className="text-xs font-bold text-black/50 mt-4 uppercase">VOL: {currentVolume.toFixed(0)}</p>
                </div>
              )}

              {/* Recording indicator */}
              <div className="absolute left-6 top-6 flex items-center gap-3 border-4 border-black bg-white px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="h-4 w-4 bg-[#FF3366] border-2 border-black animate-pulse" />
                <span className="text-sm font-black text-black uppercase tracking-widest">RECORDING</span>
              </div>
            </div>

            {/* AI interviewer tile */}
            <div className={`flex w-full lg:w-96 flex-col justify-between border-8 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-colors duration-500 ${isAiSpeaking ? 'bg-[#FF3366]' : 'bg-white'}`}>
              <div className="flex flex-col items-center gap-6 pt-10 text-center">
                <div className="relative h-40 w-40 border-8 border-black bg-black flex items-center justify-center shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]">
                  {isAiSpeaking && <span className="absolute inset-0 bg-white opacity-20 animate-ping" />}
                  <Headphones size={80} className="text-[#00E5FF] stroke-[2]" />
                </div>
                <div>
                  <p className={`text-4xl font-black tracking-tighter uppercase ${isAiSpeaking ? 'text-white' : 'text-black'}`}>AI INTERVIEWER</p>
                  <p className={`text-xl font-bold mt-2 uppercase border-4 border-black inline-block px-4 py-1 ${isAiSpeaking ? 'bg-black text-white' : 'bg-[#EAFF00] text-black'}`}>{isAiSpeaking ? "SPEAKING..." : "LISTENING..."}</p>
                </div>
              </div>
              
              <div className="mt-12 border-4 border-black bg-black p-6 text-sm">
                {isAiSpeaking ? (
                  <div className="flex items-center gap-4 text-white">
                    <span className="h-4 w-4 bg-[#00E5FF] border-2 border-white animate-pulse" />
                    <p className="font-black uppercase tracking-widest text-lg">EXPLAINING QUESTION</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-[#EAFF00]">
                      <span className="h-4 w-4 bg-[#EAFF00] border-2 border-[#EAFF00] animate-pulse" />
                      <p className="font-black uppercase tracking-widest text-lg">LISTENING TO YOU...</p>
                    </div>
                    <div className="flex justify-between border-t-4 border-white/20 pt-4 text-sm font-black text-white uppercase">
                      <span>THRESHOLD: 15</span>
                      <span>LEVEL: {currentVolume.toFixed(0)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom controls */}
          <div className="pointer-events-none absolute inset-x-0 bottom-4 md:bottom-10 flex justify-center z-20 px-4">
            <div className="pointer-events-auto flex items-center gap-2 md:gap-6 border-8 border-black bg-white px-4 md:px-10 py-4 md:py-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] w-full max-w-md md:max-w-none justify-center">
              
              <button
                onClick={toggleMic}
                className={`flex h-12 w-12 md:h-16 md:w-16 items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all shrink-0 ${micOn ? 'bg-[#00E5FF]' : 'bg-[#FF3366]'}`}
              >
                {micOn ? <Mic size={24} className="stroke-[3] text-black" /> : <MicOff size={24} className="stroke-[3] text-white" />}
              </button>
              
              <button
                onClick={() => setVideoOn(!videoOn)}
                className={`flex h-12 w-12 md:h-16 md:w-16 items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all shrink-0 ${videoOn ? 'bg-[#00E5FF]' : 'bg-[#FF3366]'}`}
              >
                {videoOn ? <Video size={24} className="stroke-[3] text-black" /> : <VideoOff size={24} className="stroke-[3] text-white" />}
              </button>

              <div className="h-10 md:h-12 w-2 bg-black mx-1 md:mx-2 shrink-0" />

              {/* DONE SPEAKING BUTTON */}
              <button
                type="button"
                onClick={() => {
                  if (!userTranscript.trim()) return;
                  handleUserAnswer(userTranscript);
                }}
                disabled={isAiSpeaking || !userTranscript.trim()}
                className={`flex h-12 md:h-16 items-center gap-2 px-4 md:px-10 text-sm md:text-xl font-black uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex-1 justify-center whitespace-nowrap
                      ${(isAiSpeaking || !userTranscript.trim())
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#EAFF00] text-black hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'}`}
              >
                DONE <span className="hidden sm:inline">SPEAKING</span>
              </button>

              <div className="h-10 md:h-12 w-2 bg-black mx-1 md:mx-2 shrink-0" />

              <button
                onClick={async () => {
                  if (isEnding) return;
                  setIsEnding(true);
                  try {
                    await saveTranscript();
                  } catch (e) {
                    console.error("Manual save failed:", e);
                  }
                  router.push('/dashboard');
                }}
                disabled={isEnding}
                className={`flex h-12 w-12 md:h-16 md:w-16 items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all shrink-0 ${isEnding ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'}`}
                title="End Interview"
              >
                {isEnding ? <div className="h-5 w-5 md:h-6 md:w-6 animate-spin border-4 border-white border-t-transparent" /> : <PhoneOff size={24} className="stroke-[3] text-white" />}
              </button>

            </div>
            
            {/* Helper Text */}
            {(!userTranscript.trim() && !isAiSpeaking && isListening) && (
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 border-4 border-black bg-[#FF3366] px-6 py-2 text-xl font-black uppercase tracking-widest text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] animate-bounce">
                SAY SOMETHING...
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
