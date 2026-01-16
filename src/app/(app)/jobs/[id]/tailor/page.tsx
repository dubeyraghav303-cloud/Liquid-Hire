'use client';

import { useState, use, useEffect } from 'react';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { z } from 'zod';
import { ChevronRight, Download, Wand2, Briefcase, User, CheckCircle2 } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/utils/supabase/client';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// --- PDF Generator ---
const styles = StyleSheet.create({
    page: { flexDirection: 'column', backgroundColor: '#fff', padding: 30 },
    header: { marginBottom: 20, borderBottom: '1px solid #ccc', paddingBottom: 10 },
    name: { fontSize: 24, fontWeight: 'bold' },
    section: { margin: 10, padding: 10 },
    heading: { fontSize: 16, borderBottom: '1px solid #eee', marginBottom: 5, paddingBottom: 2, fontWeight: 'bold' },
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
    // Use `use` to unwrap params in Next.js 15+
    const { id } = use(params);

    const [job, setJob] = useState<any>(null);
    const [profileName, setProfileName] = useState("Candidate");
    const [hasStarted, setHasStarted] = useState(false);

    // Supabase for fetching job/profile
    const supabase = createSupabaseBrowserClient();

    useEffect(() => {
        async function init() {
            // 1. Fetch Profile Name
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: p } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
                if (p) setProfileName(p.full_name || "Candidate");
            }

            // 2. Fetch Job Details
            // If internal (uuid), fetch from DB. If external (likely not uuid or not found in DB), might be tricky.
            // For now assuming internal job or passed state. 
            // Since the user scrapes jobs, they might not be in DB unless saved.
            // If existing logic assumes /jobs matches /api/jobs output, we need to handle that.
            // Let's assume for this feature, we fetch from 'jobs' table. 
            // If it's an external job from the scraper, usually it has a link. 
            // If the user wants to tailor for an external job, we'd need to pass the text.
            // For simplicity in this demo, let's fetch from 'jobs' OR fallback to a placeholder if demoing.

            const { data: jobData } = await supabase.from('jobs').select('*').eq('id', id).single();
            if (jobData) {
                setJob(jobData);
            } else {
                // Fallback/Mock for demo (or handling external IDs if we had a store)
                setJob({
                    title: "Senior Product Engineer",
                    company: "Tech Corp",
                    description: "We are looking for a Senior Product Engineer with React, Node.js, and AI experience. Must handle high pressure environments."
                });
            }
        }
        init();
    }, [id]);

    const { object, submit, isLoading } = useObject({
        api: '/api/tailor',
        schema: tailorSchema,
    });

    const handleTailor = () => {
        if (!job) return;
        setHasStarted(true);
        submit({
            jobId: id,
            jobDescription: job.description || job.title // Fallback
        });
    };

    if (!job) return <div className="p-10 text-center">Loading Job Context...</div>;

    return (
        <div className="h-[calc(100vh-80px)] flex bg-slate-50 overflow-hidden">
            {/* LEFT: JOB CONTEXT */}
            <div className="w-1/2 p-6 border-r border-slate-200 overflow-y-auto bg-white/50">
                <div className="mb-6">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Target Role</span>
                    <h1 className="text-3xl font-bold text-slate-900 mt-2">{job.title}</h1>
                    <p className="text-slate-500 font-medium">{job.company}</p>
                </div>

                <div className="prose prose-sm prose-slate max-w-none">
                    <h3 className="text-slate-900 font-semibold mb-2">Job Description</h3>
                    <div className="whitespace-pre-wrap text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100/50">
                        {job.description}
                    </div>
                </div>
            </div>

            {/* RIGHT: CHAMELEON EDITOR */}
            <div className="w-1/2 flex flex-col bg-slate-100/50 relative">
                {/* Action Bar */}
                <div className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shadow-sm z-10">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-400 animate-pulse' : object ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <span className="text-sm font-semibold text-slate-700">
                            {isLoading ? 'AI Tailoring...' : object ? 'Tailored Resume Ready' : 'Resume Chameleon™'}
                        </span>
                    </div>

                    <div className="flex gap-2">
                        {!object && !isLoading && (
                            <button
                                onClick={handleTailor}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                            >
                                <Wand2 size={16} />
                                Auto-Tailor
                            </button>
                        )}
                        {object && (
                            <PDFDownloadLink document={<TailoredPDF data={object} fullName={profileName} />} fileName="Tailored_Resume.pdf">
                                {/* @ts-ignore */}
                                {({ loading }) => (
                                    <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all">
                                        <Download size={16} />
                                        {loading ? 'Preparing...' : 'Download PDF'}
                                    </button>
                                )}
                            </PDFDownloadLink>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 relative">
                    {!hasStarted && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                                <User size={32} className="text-indigo-400" />
                            </div>
                            <p>Click "Auto-Tailor" to rewrite your resume for this role.</p>
                        </div>
                    )}

                    {object && (
                        <div className="max-w-2xl mx-auto bg-white shadow-xl shadow-slate-200/50 min-h-[800px] p-10 rounded-sm ring-1 ring-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {/* Header */}
                            <div className="border-b-2 border-slate-800 pb-4 mb-6">
                                <h1 className="text-3xl font-bold text-slate-900 uppercase tracking-tight">{profileName}</h1>
                            </div>

                            {/* Summary */}
                            <div className="mb-6">
                                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-1">Professional Profile</h2>
                                <p className="text-sm text-slate-700 leading-relaxed">{object.professional_summary}</p>
                            </div>

                            {/* Skills */}
                            <div className="mb-6">
                                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-1">Core Competencies</h2>
                                <div className="flex flex-wrap gap-2">
                                    {object.skills_to_highlight?.map((skill, i) => (
                                        <span key={i} className="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded-md font-medium">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Experience */}
                            <div>
                                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-1">Professional Experience</h2>
                                {object.experience_bullets?.map((exp, i) => (
                                    exp ? (
                                        <div key={i} className="mb-4 break-inside-avoid">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h3 className="text-sm font-bold text-slate-900">{exp.role}</h3>
                                                <span className="text-xs text-slate-500 font-medium">{exp.company}</span>
                                            </div>
                                            <ul className="list-disc ml-4 space-y-1">
                                                {exp.bullets?.map((b, j) => (
                                                    <li key={j} className="text-xs text-slate-600 pl-1">{b}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : null
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
