'use client';

import { useState, use, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { z } from 'zod';
import { ChevronRight, Download, Wand2, Briefcase, User, CheckCircle2, AlertTriangle, UserCircle } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/utils/supabase/client';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// --- PDF Generator ---
const styles = StyleSheet.create({
    page: { flexDirection: 'column', backgroundColor: '#fff', padding: 30 },
    header: { marginBottom: 20, borderBottom: '1px solid #000', paddingBottom: 10 },
    name: { fontSize: 24, fontWeight: 'bold' },
    section: { margin: 10, padding: 10 },
    heading: { fontSize: 16, borderBottom: '1px solid #000', marginBottom: 5, paddingBottom: 2, fontWeight: 'bold' },
    text: { fontSize: 11, marginBottom: 5, lineHeight: 1.5, fontFamily: 'Helvetica' },
    bullet: { fontSize: 11, marginBottom: 3, marginLeft: 10, fontFamily: 'Helvetica' },
});

const TailoredPDF = ({ data, fullName }: { data: any, fullName: string }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.name}>{fullName}</Text>
            </View>
            <View style={styles.section}>
                <Text style={styles.heading}>Professional Summary</Text>
                <Text style={styles.text}>{data.professional_summary}</Text>
            </View>
            <View style={styles.section}>
                <Text style={styles.heading}>Experience</Text>
                {data.experience_bullets.map((exp: any, i: number) => (
                    <View key={i} style={{ marginBottom: 10 }}>
                        <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{exp.role} at {exp.company}</Text>
                        {exp.bullets.map((b: string, j: number) => (
                            <Text key={j} style={styles.bullet}>• {b}</Text>
                        ))}
                    </View>
                ))}
            </View>
            <View style={styles.section}>
                <Text style={styles.heading}>Key Skills</Text>
                <Text style={styles.text}>{data.skills_to_highlight.join(', ')}</Text>
            </View>
        </Page>
    </Document>
);

// --- Zod Schema ---
const tailorSchema = z.object({
    professional_summary: z.string(),
    experience_bullets: z.array(z.object({
        company: z.string(),
        role: z.string(),
        bullets: z.array(z.string())
    })),
    skills_to_highlight: z.array(z.string()),
    cover_letter_snippet: z.string()
});

export default function TailorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const searchParams = useSearchParams();

    const [job, setJob] = useState<any>(null);
    const [profileName, setProfileName] = useState("Candidate");
    const [hasStarted, setHasStarted] = useState(false);

    const supabase = createSupabaseBrowserClient();

    useEffect(() => {
        async function init() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: p } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
                if (p) setProfileName(p.full_name || "Candidate");
            }

            const { data: jobData } = await supabase.from('jobs').select('*').eq('id', id).single();
            if (jobData) {
                setJob(jobData);
            } else if (id === 'external') {
                if (typeof window !== 'undefined') {
                    const stored = sessionStorage.getItem('temp_tailor_job');
                    if (stored) {
                        try {
                            const parsed = JSON.parse(stored);
                            setJob(parsed);
                        } catch (e) {
                            console.error("Failed to parse stored job", e);
                        }
                    }
                }
                if (!job && searchParams.get('title')) {
                    setJob({
                        title: searchParams.get('title') || "Unknown Role",
                        company: searchParams.get('company') || "Unknown Company",
                        description: searchParams.get('description') || "No description provided."
                    });
                }
            } else {
                setJob({
                    title: "Senior Product Engineer",
                    company: "Tech Corp",
                    description: "We are looking for a Senior Product Engineer with React, Node.js, and AI experience. Must handle high pressure environments."
                });
            }
        }
        init();
    }, [id]);

    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const { object, submit, isLoading, error } = useObject({
        api: '/api/tailor',
        schema: tailorSchema,
        onError: (err) => {
            console.error("Tailor Error:", err);
            setErrorMsg(`TAILOR FAILED: ${err.message || "UNKNOWN ERROR"}`);
            setHasStarted(false);
        },
    });

    const handleTailor = () => {
        if (!job) return;
        setErrorMsg(null);
        setHasStarted(true);
        submit({
            jobId: id,
            jobDescription: job.description || job.title
        });
    };

    if (!job) return (
        <div className="flex h-[500px] w-full items-center justify-center bg-[#FFFBED] border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            <Wand2 className="h-12 w-12 animate-spin text-black stroke-[3]" />
        </div>
    );

    return (
        <div className="flex flex-col md:flex-row border-8 border-black bg-[#FFFBED] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] min-h-[calc(100vh-120px)] mb-10 overflow-hidden selection:bg-[#FF3366] selection:text-white">
            
            {/* LEFT: JOB CONTEXT */}
            <div className="md:w-1/3 p-8 border-b-8 md:border-b-0 md:border-r-8 border-black bg-white flex flex-col gap-6 z-10">
                <div>
                    <span className="bg-[#00E5FF] border-4 border-black text-black px-4 py-2 font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] inline-block mb-6">TARGET ROLE</span>
                    <h1 className="text-4xl md:text-5xl font-black text-black uppercase tracking-tighter leading-none">{job.title}</h1>
                    <p className="text-xl font-bold text-black/70 mt-2 bg-[#EAFF00] inline-block px-2 border-2 border-black uppercase">{job.company}</p>
                </div>

                <div className="flex-1 flex flex-col">
                    <h3 className="text-2xl font-black text-black uppercase tracking-tight mb-4 flex items-center gap-2"><Briefcase className="stroke-[3]"/> JOB DESCRIPTION</h3>
                    <div className="flex-1 overflow-y-auto max-h-[600px] border-4 border-black bg-[#FFFBED] p-6 text-sm font-bold text-black uppercase shadow-inner whitespace-pre-wrap leading-relaxed">
                        {job.description}
                    </div>
                </div>
            </div>

            {/* RIGHT: CHAMELEON EDITOR */}
            <div className="md:w-2/3 flex flex-col bg-[#FFFBED] relative">
                
                {/* Action Bar */}
                <div className="border-b-8 border-black bg-[#EAFF00] flex flex-col sm:flex-row items-center justify-between p-6 z-10 gap-4 shadow-sm">
                    <div className="flex items-center gap-4 bg-white border-4 border-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div className={`w-4 h-4 border-2 border-black ${isLoading ? 'bg-[#FF3366] animate-pulse' : object ? 'bg-[#00E5FF]' : 'bg-black'}`} />
                        <span className="text-lg font-black text-black uppercase tracking-widest">
                            {isLoading ? 'AI TAILORING...' : object ? 'TAILORED RESUME READY' : 'RESUME CHAMELEON™'}
                        </span>
                    </div>

                    <div className="flex gap-4">
                        {!object && !isLoading && (
                            <button
                                onClick={handleTailor}
                                className="flex items-center gap-2 border-4 border-black bg-[#FF3366] text-white px-8 py-3 text-lg font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                            >
                                <Wand2 size={24} className="stroke-[3]" />
                                AUTO-TAILOR
                            </button>
                        )}
                        {object && (
                            <PDFDownloadLink document={<TailoredPDF data={object} fullName={profileName} />} fileName="Tailored_Resume.pdf">
                                {/* @ts-ignore */}
                                {({ loading }) => (
                                    <button className="flex items-center gap-2 border-4 border-black bg-black text-white px-8 py-3 text-lg font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-white hover:text-black hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                                        <Download size={24} className="stroke-[3]" />
                                        {loading ? 'PREPARING...' : 'DOWNLOAD PDF'}
                                    </button>
                                )}
                            </PDFDownloadLink>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-12 relative bg-gray-100">
                    
                    {/* Default State */}
                    {!hasStarted && !isLoading && !object && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-[#FFFBED]">
                            {errorMsg ? (
                                <div className="border-8 border-black bg-white p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center">
                                    <div className="bg-[#FF3366] border-4 border-black p-4 mb-4 text-white">
                                        <AlertTriangle size={48} className="stroke-[3]" />
                                    </div>
                                    <p className="text-3xl font-black text-black uppercase">GENERATION FAILED</p>
                                    <p className="text-lg font-bold text-black/70 mt-2 uppercase">{errorMsg}</p>
                                    <button
                                        onClick={() => setErrorMsg(null)}
                                        className="mt-8 border-4 border-black bg-[#EAFF00] px-6 py-2 text-xl font-black text-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                                    >
                                        DISMISS
                                    </button>
                                </div>
                            ) : (
                                <div className="border-8 border-black bg-white p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center hover:-translate-y-2 hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] transition-all">
                                    <div className="bg-[#00E5FF] border-4 border-black p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                        <UserCircle size={48} className="stroke-[3] text-black" />
                                    </div>
                                    <p className="text-4xl font-black text-black uppercase tracking-tight">READY TO TAILOR</p>
                                    <p className="text-lg font-bold text-black/70 mt-2 uppercase">CLICK "AUTO-TAILOR" TO REWRITE YOUR RESUME FOR THIS ROLE.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#FFFBED] p-8">
                            <div className="border-8 border-black bg-white p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center">
                                <div className="bg-[#EAFF00] border-4 border-black p-6 mb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                                    <Wand2 size={64} className="stroke-[3] text-black animate-spin-slow" />
                                </div>
                                <h3 className="text-4xl font-black text-black uppercase tracking-tight">TAILORING RESUME...</h3>
                                <p className="text-lg font-bold text-black/70 mt-2 uppercase bg-[#00E5FF] px-4 py-1 border-2 border-black animate-pulse">ANALYZING JOB DESCRIPTION & MATCHING SKILLS</p>
                            </div>
                        </div>
                    )}

                    {/* Result (Professional Rendering) */}
                    {object && (
                        <div className="max-w-3xl mx-auto bg-white border border-gray-300 shadow-md min-h-[800px] p-10 md:p-14 animate-in fade-in slide-in-from-bottom-10 duration-700 font-sans text-gray-900">
                            
                            {/* Header */}
                            <div className="border-b-2 border-gray-900 pb-4 mb-8">
                                <h1 className="text-3xl font-bold tracking-tight text-gray-900">{profileName}</h1>
                            </div>

                            <div className="space-y-8">
                                {/* Summary */}
                                <div>
                                    <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2 border-b border-gray-200 pb-1">Professional Profile</h2>
                                    <p className="text-sm text-gray-700 leading-relaxed">{object.professional_summary}</p>
                                </div>

                                {/* Skills */}
                                <div>
                                    <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2 border-b border-gray-200 pb-1">Core Competencies</h2>
                                    <div className="flex flex-wrap gap-x-2 gap-y-1">
                                        {object.skills_to_highlight?.map((skill, i) => (
                                            <span key={i} className="text-sm text-gray-700">
                                                {skill}{i < object.skills_to_highlight.length - 1 ? ',' : ''}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Experience */}
                                <div>
                                    <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 border-b border-gray-200 pb-1">Professional Experience</h2>
                                    <div className="space-y-6">
                                        {object.experience_bullets?.map((exp, i) => (
                                            exp ? (
                                                <div key={i}>
                                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-2">
                                                        <h3 className="text-base font-bold text-gray-900">{exp.role}</h3>
                                                        <span className="text-sm font-medium text-gray-600">{exp.company}</span>
                                                    </div>
                                                    <ul className="list-disc ml-5 space-y-1.5 text-sm text-gray-700">
                                                        {exp.bullets?.map((b, j) => (
                                                            <li key={j} className="pl-1 leading-relaxed">{b}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ) : null
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
