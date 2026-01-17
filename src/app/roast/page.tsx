'use client';

import { useState } from 'react';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { Upload, Flame, Share2, AlertTriangle, Terminal } from 'lucide-react';
import { z } from 'zod';

const roastSchema = z.object({
    roast_summary: z.string(),
    burn_score: z.number(),
    weak_points: z.array(z.string()),
});

export default function RoastPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const { object, submit, isLoading, error } = useObject({
        api: '/api/roast',
        schema: roastSchema,
        onError: (err) => {
            console.error("Roast Error:", err);
            setErrorMsg(`Roast Failed: ${err.message || "Unknown error"}`);
            setIsScanning(false);
        },
        onFinish: () => {
            setIsScanning(false);
        }
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setErrorMsg(null);
        }
    };

    const handleRoast = async () => {
        if (!file) return;
        setErrorMsg(null);
        setIsScanning(true);

        try {
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = error => reject(error);
            });

            // Remove the data URL prefix (e.g., "data:application/pdf;base64,") to get just the base64 string
            const base64Data = base64.split(',')[1];
            submit({ fileBase64: base64Data });

        } catch (err) {
            console.error("File Read Error:", err);
            setErrorMsg("Failed to read file.");
            setIsScanning(false);
        }
    };

    const burnColor = (score: number) => {
        if (score < 50) return 'text-green-500';
        if (score < 80) return 'text-orange-500';
        return 'text-red-600';
    };

    return (
        <div className="min-h-screen bg-black text-green-500 font-mono p-4 md:p-10 relative overflow-hidden selection:bg-green-900 selection:text-white">
            {/* Background Glitch Effects (Simplified) */}
            <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-900 via-transparent to-transparent" />

            <main className="max-w-4xl mx-auto relative z-10 flex flex-col items-center gap-8">

                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase glitch-text">
                        The <span className="text-red-600">Roast</span>
                    </h1>
                    <p className="text-green-700 uppercase tracking-widest text-xs md:text-sm">
                        LiquidHire // Brutal Career Coaching
                    </p>
                </div>

                {/* Error Message */}
                {(error || errorMsg) && (
                    <div className="w-full max-w-lg bg-red-950/30 border border-red-500/50 p-4 rounded-xl flex items-center gap-3 text-red-400">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <p className="text-sm font-bold">{errorMsg || "An unexpected error occurred. Check console."}</p>
                    </div>
                )}

                {/* Input Zone - Only show if not loading/done */}
                {!isLoading && !object && (
                    <div className="w-full max-w-lg border-2 border-dashed border-green-800 rounded-xl p-10 flex flex-col items-center justify-center gap-4 hover:border-red-600 transition-colors group cursor-pointer bg-black/50">
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="hidden"
                            id="resume-upload"
                        />
                        <label htmlFor="resume-upload" className="flex flex-col items-center cursor-pointer">
                            <Upload className="w-12 h-12 text-green-700 group-hover:text-red-500 transition-transform group-hover:scale-110 duration-300" />
                            <span className="text-sm text-green-600 mt-2 font-bold group-hover:text-red-400">
                                {file ? file.name : "DROP RESUME PDF HERE"}
                            </span>
                        </label>

                        {file && (
                            <button
                                onClick={handleRoast}
                                className="mt-4 px-8 py-3 bg-red-600 text-black font-black uppercase text-lg hover:bg-red-500 hover:scale-105 active:scale-95 transition-all w-full clip-path-polygon"
                            >
                                Ignite Roast
                            </button>
                        )}
                    </div>
                )}

                {/* Loading State: Scanning */}
                {isLoading && !object && (
                    <div className="flex flex-col items-center gap-4 animate-pulse">
                        <Terminal className="w-16 h-16 text-red-500 animate-spin-slow" />
                        <p className="text-xl text-red-500 font-bold uppercase blinking-cursor">
                            SCANNING LIES...
                        </p>
                    </div>
                )}

                {/* Result View */}
                {object && (
                    <div className="w-full grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-10 duration-700">

                        {/* Left: Burn Score */}
                        <div className="border border-red-900/50 bg-red-950/10 p-8 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-red-500/5 blur-3xl animate-pulse" />
                            <Flame className={`w-20 h-20 mb-4 ${burnColor(object?.burn_score ?? 0)}`} />
                            <h2 className="text-2xl font-bold uppercase text-red-500 mb-2">Burn Score</h2>
                            <div className={`text-8xl font-black ${burnColor(object?.burn_score ?? 0)}`}>
                                {object?.burn_score ?? 0}
                            </div>
                            <p className="text-red-400/60 text-xs mt-2 uppercase tracking-widest">
                                {(object?.burn_score ?? 0) > 80 ? 'CRITICAL FAILURE' : (object?.burn_score ?? 0) > 50 ? 'MEDIOCRE AT BEST' : 'SURVIVABLE'}
                            </p>
                        </div>

                        {/* Right: The Breakdown */}
                        <div className="space-y-6">
                            <div className="bg-green-950/10 border border-green-900/50 p-6 rounded-xl">
                                <h3 className="text-xl font-bold text-green-500 mb-4 border-b border-green-900 pb-2 flex items-center gap-2">
                                    <Terminal className="w-5 h-5" /> SUMMARY
                                </h3>
                                <p className="text-green-300 leading-relaxed font-sans text-lg">
                                    {object.roast_summary}
                                </p>
                            </div>

                            <div className="bg-red-950/10 border border-red-900/50 p-6 rounded-xl">
                                <h3 className="text-xl font-bold text-red-500 mb-4 border-b border-red-900 pb-2 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" /> WEAK POINTS
                                </h3>
                                <ul className="space-y-2">
                                    {object.weak_points?.map((point, i) => (
                                        <li key={i} className="flex items-start gap-2 text-red-300 font-sans">
                                            <span className="text-red-600 mt-1">x</span>
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold uppercase rounded-xl flex items-center justify-center gap-2 transition-all">
                                <Share2 className="w-5 h-5" /> Share Data
                            </button>
                        </div>
                    </div>
                )}

            </main>

            <style jsx global>{`
        .clip-path-polygon {
          clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
        }
        .blinking-cursor:after {
          content: '_';
          animation: blink 1s step-end infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .glitch-text {
          text-shadow: 2px 2px 0px #ff0000, -2px -2px 0px #00ff00;
        }
      `}</style>
        </div>
    );
}
