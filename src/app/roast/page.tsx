'use client';

import { useState } from 'react';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { Upload, Flame, Share2, AlertTriangle, Terminal, ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import Link from 'next/link';

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
        if (score < 50) return 'text-[#00E5FF]';
        if (score < 80) return 'text-[#EAFF00]';
        return 'text-[#FF3366]';
    };

    return (
        <div className="min-h-screen bg-[#FFFBED] text-black font-sans p-4 md:p-10 relative overflow-y-auto selection:bg-[#FF3366] selection:text-white">
            {/* Brutalist Grid Background */}
            <div className="pointer-events-none absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '40px 40px' }} />

            {/* Back Button */}
            <Link href="/dashboard" className="absolute top-6 left-6 z-50 flex items-center gap-2 border-4 border-black bg-white px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all text-black">
                <ArrowLeft className="w-5 h-5 stroke-[3]" />
                <span className="font-black uppercase tracking-widest text-sm">ABORT</span>
            </Link>

            <main className="max-w-5xl mx-auto relative z-10 flex flex-col items-center gap-12 pt-20 md:pt-10">

                {/* Header */}
                <div className="text-center space-y-4 border-b-8 border-black pb-8 w-full animate-in fade-in slide-in-from-top-10 duration-700">
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase text-black hover:scale-105 transition-transform cursor-default">
                        THE <span className="bg-[#FF3366] text-white px-4 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] inline-block hover:-rotate-3 transition-transform">ROAST</span>
                    </h1>
                    <p className="bg-[#EAFF00] border-4 border-black inline-block px-4 py-2 text-black font-black uppercase tracking-widest text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                        BRUTAL CAREER COACHING
                    </p>
                </div>

                {/* Error Message */}
                {(error || errorMsg) && (
                    <div className="w-full max-w-2xl bg-white border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-6 flex items-center gap-4 text-black">
                        <div className="bg-[#FF3366] p-3 border-4 border-black text-white">
                            <AlertTriangle className="w-8 h-8 stroke-[3]" />
                        </div>
                        <p className="text-xl font-black uppercase">{errorMsg || "AN UNEXPECTED ERROR OCCURRED. CHECK CONSOLE."}</p>
                    </div>
                )}

                {/* Input Zone - Only show if not loading/done */}
                {!isLoading && !object && (
                    <div className="w-full max-w-2xl border-8 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-12 flex flex-col items-center justify-center gap-8 hover:-translate-y-4 hover:shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer group animate-in fade-in zoom-in-95 slide-in-from-bottom-12 duration-1000">
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="hidden"
                            id="resume-upload"
                        />
                        <label htmlFor="resume-upload" className="flex flex-col items-center cursor-pointer w-full">
                            <div className="border-4 border-black bg-[#EAFF00] p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] group-hover:bg-[#00E5FF] group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                                <Upload className="w-16 h-16 text-black group-hover:animate-bounce" strokeWidth={3} />
                            </div>
                            <span className="text-3xl text-black mt-8 font-black uppercase tracking-tight text-center">
                                {file ? file.name : "DROP RESUME PDF HERE"}
                            </span>
                        </label>

                        {file && (
                            <button
                                onClick={handleRoast}
                                className="mt-8 px-10 py-5 bg-[#FF3366] text-white font-black uppercase text-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1.5 hover:translate-y-1.5 active:scale-95 transition-all w-full"
                            >
                                IGNITE ROAST
                            </button>
                        )}
                    </div>
                )}

                {/* Loading State: Scanning */}
                {isLoading && !object && (
                    <div className="flex flex-col items-center gap-8 border-8 border-black bg-[#EAFF00] p-16 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                        <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                            <Terminal className="w-20 h-20 text-black animate-spin-slow" strokeWidth={3} />
                        </div>
                        <p className="text-4xl text-black font-black uppercase tracking-tight blinking-cursor">
                            SCANNING LIES...
                        </p>
                    </div>
                )}

                {/* Result View */}
                {object && (
                    <div className="w-full grid md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-10 duration-700">

                        {/* Left: Burn Score */}
                        <div className="border-8 border-black bg-black p-10 flex flex-col items-center justify-center text-center relative shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] group hover:-translate-y-2 hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] transition-all">
                            <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-8 group-hover:bg-[#FF3366] group-hover:text-white transition-colors text-black">
                                <Flame className="w-24 h-24 stroke-[3]" />
                            </div>
                            <h2 className="text-4xl font-black uppercase text-white mb-2">BURN SCORE</h2>
                            <div className={`text-9xl font-black tracking-tighter ${burnColor(object?.burn_score ?? 0)} drop-shadow-[4px_4px_0px_rgba(255,255,255,1)]`}>
                                {object?.burn_score ?? 0}
                            </div>
                            <p className="bg-white border-4 border-black px-4 py-2 text-black font-black text-xl mt-8 uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                {(object?.burn_score ?? 0) > 80 ? 'CRITICAL FAILURE' : (object?.burn_score ?? 0) > 50 ? 'MEDIOCRE AT BEST' : 'SURVIVABLE'}
                            </p>
                        </div>

                        {/* Right: The Breakdown */}
                        <div className="space-y-8">
                            <div className="bg-white border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                                <div className="bg-[#00E5FF] border-b-8 border-black p-6">
                                    <h3 className="text-3xl font-black text-black flex items-center gap-4 uppercase tracking-tight">
                                        <div className="bg-white border-4 border-black p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                            <Terminal className="w-8 h-8 stroke-[3]" />
                                        </div>
                                        SUMMARY
                                    </h3>
                                </div>
                                <div className="p-8">
                                    <p className="text-black font-bold text-xl leading-relaxed uppercase">
                                        {object.roast_summary}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                                <div className="bg-[#FF3366] border-b-8 border-black p-6">
                                    <h3 className="text-3xl font-black text-white flex items-center gap-4 uppercase tracking-tight">
                                        <div className="bg-white border-4 border-black p-2 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                            <AlertTriangle className="w-8 h-8 stroke-[3]" />
                                        </div>
                                        WEAK POINTS
                                    </h3>
                                </div>
                                <div className="p-8">
                                    <ul className="space-y-4">
                                        {object.weak_points?.map((point, i) => (
                                            <li key={i} className="flex items-start gap-4 text-black font-bold text-lg uppercase border-l-8 border-black pl-4">
                                                <span className="text-[#FF3366] text-3xl leading-none -mt-1 font-black">X</span>
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <button className="w-full py-6 bg-[#EAFF00] border-8 border-black text-black font-black text-2xl uppercase flex items-center justify-center gap-4 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all">
                                <Share2 className="w-8 h-8 stroke-[3]" /> SHARE DATA
                            </button>
                        </div>
                    </div>
                )}

            </main>

            <style jsx global>{`
        .blinking-cursor:after {
          content: '_';
          animation: blink 1s step-end infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
        </div>
    );
}
