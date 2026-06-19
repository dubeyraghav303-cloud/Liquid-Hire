"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowUpRight, Play, Briefcase, Wand2, Flame, Award, Calendar, Sparkles } from "lucide-react";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

// Helper components
const StatCard = ({ title, value, subtitle, icon, delay }: { title: string; value: string | number; subtitle: string; icon: React.ReactNode; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300"
  >
    <div className="flex items-center justify-between">
      <span className="text-sm font-semibold text-slate-500">{title}</span>
      <div className="rounded-2xl bg-indigo-50/50 p-2 text-indigo-600">
        {icon}
      </div>
    </div>
    <div className="mt-4">
      <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h3>
      <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
    </div>
  </motion.div>
);

const InterviewItem = ({
  id,
  date,
  role,
  score,
}: {
  id: string;
  date: string;
  role: string;
  score?: number;
}) => {
  const router = useRouter();

  const getScoreColor = (s: number) => {
    if (s >= 70) return "bg-emerald-50 text-emerald-700 border-emerald-100";
    if (s >= 40) return "bg-amber-50 text-amber-700 border-amber-100";
    return "bg-rose-50 text-rose-700 border-rose-100";
  };

  return (
    <motion.div
      whileHover={{ x: 4 }}
      onClick={() => router.push(`/report/${id}`)}
      className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3.5 transition-all hover:bg-slate-50 hover:shadow-sm"
    >
      <div>
        <p className="text-sm font-semibold text-slate-800">{role || "General Interview"}</p>
        <p className="text-xs text-slate-400">{new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
      </div>
      <div className="flex items-center gap-3">
        {score !== undefined && score !== null && (
          <span className={`rounded-xl border px-2.5 py-1 text-[10px] font-semibold tracking-wider ${getScoreColor(score)}`}>
            {score}/100
          </span>
        )}
        <div className="rounded-full bg-slate-50 p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowUpRight size={14} />
        </div>
      </div>
    </motion.div>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [profile, setProfile] = useState<{
    full_name: string;
    target_role: string;
    avatar_url: string;
    completion: number;
  }>({
    full_name: "User",
    target_role: "Candidate",
    avatar_url: "",
    completion: 0,
  });

  const [interviews, setInterviews] = useState<any[]>([]);
  const [totalInterviews, setTotalInterviews] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);
  const [roleKeys, setRoleKeys] = useState<string[]>([]);
  const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6", "#ec4899"];

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        // Calculate dynamic profile completion based on existing fields
        let fields = 0;
        let filled = 0;
        const checkFields = ['full_name', 'date_of_birth', 'phone_number', 'degree', 'stream', 'year_of_graduation', 'college', 'resume_text'];
        checkFields.forEach(f => {
          fields++;
          if (profileData[f]) filled++;
        });
        const completionPercentage = Math.round((filled / fields) * 100);

        setProfile({
          full_name: profileData.full_name || "User",
          target_role: profileData.target_role || "Candidate",
          avatar_url: profileData.avatar_url || "",
          completion: completionPercentage,
        });
      }

      const { data: allInterviews } = await supabase
        .from("interviews")
        .select("id, created_at, job_role, score")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (allInterviews) {
        setTotalInterviews(allInterviews.length);
        setInterviews([...allInterviews].reverse());

        const interviewsByRole: Record<string, any[]> = {};
        allInterviews.forEach((iv) => {
          const role = iv.job_role || "General";
          if (!interviewsByRole[role]) interviewsByRole[role] = [];
          interviewsByRole[role].push(iv);
        });

        const maxAttempts = 5;
        const normalizedData: any[] = [];
        for (let i = 0; i < maxAttempts; i++) {
          normalizedData.push({ index: `Attempt ${i + 1}`, attemptNum: i + 1 });
        }

        const rolesFound: string[] = [];
        Object.keys(interviewsByRole).forEach((role) => {
          rolesFound.push(role);
          const roleIvs = interviewsByRole[role];
          const last5 = roleIvs.slice(-maxAttempts);

          last5.forEach((iv, idx) => {
            normalizedData[idx][role] = iv.score || 0;
          });
        });

        setRoleKeys(rolesFound);
        setChartData(normalizedData);
      }
    };
    fetchData();
  }, [supabase]);

  const circumference = 2 * Math.PI * 48;
  const progress = (profile.completion / 100) * circumference;

  const startProctoredInterview = () => {
    const interviewId = crypto.randomUUID();
    router.push(`/interview/${interviewId}`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-1">
      {/* Welcome & Overview Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Hi, {profile.full_name.split(" ")[0]}!
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Here's the summary of your AI interview readiness and job tailoring analytics.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white border border-slate-100 rounded-2xl px-4 py-2 shadow-sm self-start">
          <Calendar size={14} className="text-indigo-500" />
          <span>Last Updated: Today</span>
        </div>
      </div>

      {/* Top Level Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Interviews Completed"
          value={totalInterviews}
          subtitle="AI Practice assessments taken"
          icon={<Award size={20} />}
          delay={0.05}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between"
        >
          <div className="space-y-2">
            <span className="text-sm font-semibold text-slate-500">Profile Completion</span>
            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{profile.completion}%</h3>
            <p className="text-xs text-slate-400">Complete profile increases AI match score</p>
          </div>
          <div className="relative h-20 w-20 flex-shrink-0">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="48" stroke="#f1f5f9" strokeWidth="8" fill="none" />
              <circle
                cx="60"
                cy="60"
                r="48"
                stroke="url(#progressGrad)"
                strokeWidth="8"
                strokeDasharray={`${progress} ${circumference - progress}`}
                strokeLinecap="round"
                fill="none"
              />
              <defs>
                <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">
              {profile.completion}%
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="rounded-3xl border border-slate-100 bg-gradient-to-br from-indigo-500 to-violet-600 p-6 shadow-md text-white flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-indigo-100">Quick Tips</span>
            <Sparkles size={16} className="text-amber-300" />
          </div>
          <p className="mt-4 text-sm font-medium leading-relaxed text-indigo-50">
            "Success is not final, failure is not fatal: it is the courage to continue that counts."
          </p>
          <div className="mt-4 pt-3 border-t border-white/10 text-xs text-indigo-200">
            — Winston Churchill
          </div>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Section: Quick Actions & Chart */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Quick Actions Grid */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">AI Interview Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={startProctoredInterview}
                className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-slate-100 bg-slate-900 p-4 transition-all duration-300 hover:bg-slate-800 hover:shadow-md"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white group-hover:bg-white/20 transition-colors">
                  <Play size={16} fill="currentColor" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-white">Start Practice Interview</p>
                  <p className="text-xs text-slate-400">Launch proctored AI questions</p>
                </div>
              </button>

              <button
                onClick={() => router.push('/jobs')}
                className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 transition-all duration-300 hover:bg-slate-50 hover:shadow-sm"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                  <Briefcase size={16} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-800">Find Internships</p>
                  <p className="text-xs text-slate-500">Search relevant open roles</p>
                </div>
              </button>

              <button
                onClick={() => router.push('/jobs')}
                className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 transition-all duration-300 hover:bg-slate-50 hover:shadow-sm"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                  <Wand2 size={16} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-800">Tailor Resume</p>
                  <p className="text-xs text-slate-500">Use Chameleon™ Optimizer</p>
                </div>
              </button>

              <button
                onClick={() => router.push('/roast')}
                className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 transition-all duration-300 hover:bg-slate-50 hover:shadow-sm"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-100 transition-colors">
                  <Flame size={16} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-800">The Resume Roast</p>
                  <p className="text-xs text-slate-500">Get direct, unfiltered AI feedback</p>
                </div>
              </button>
            </div>
          </div>

          {/* Performance Area Chart */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800 tracking-tight">Role Performance Trends</h2>
                <p className="text-xs text-slate-400">Score analysis of your last 5 attempts per role</p>
              </div>
            </div>
            <div className="h-72 w-full">
              {roleKeys.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl p-6 text-slate-400">
                  <Sparkles size={28} className="mb-2 text-slate-300" />
                  <p className="text-sm font-medium">No performance data yet</p>
                  <p className="text-xs text-slate-400">Complete an interview to see your scores graphed here</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                    <defs>
                      {roleKeys.map((role, idx) => (
                        <linearGradient key={role} id={`color${role.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={COLORS[idx % COLORS.length]} stopOpacity={0.25} />
                          <stop offset="100%" stopColor={COLORS[idx % COLORS.length]} stopOpacity={0.01} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="index" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 11 }} domain={[0, 100]} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} />
                    {roleKeys.map((role, idx) => (
                      <Area
                        key={role}
                        type="monotone"
                        dataKey={role}
                        stroke={COLORS[idx % COLORS.length]}
                        fill={`url(#color${role.replace(/\s/g, '')})`}
                        strokeWidth={2.5}
                        name={role}
                        connectNulls
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

        </div>

        {/* Right Section: Recent Interviews History */}
        <div className="lg:col-span-4">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm h-full flex flex-col">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Recent Interviews</h2>
              <p className="text-xs text-slate-400">History of your AI practice attempts</p>
            </div>
            
            <div className="flex-1 space-y-3">
              {interviews.length === 0 ? (
                <div className="flex h-full min-h-[200px] flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl p-6 text-slate-400">
                  <Play size={24} className="mb-2 text-slate-300" />
                  <p className="text-sm font-medium">No history found</p>
                  <p className="text-xs text-slate-400">Take your first interview to begin tracking history</p>
                </div>
              ) : (
                interviews.slice(0, 6).map((iv, i) => (
                  <InterviewItem
                    key={i}
                    id={iv.id}
                    date={iv.created_at}
                    role={iv.job_role}
                    score={iv.score}
                  />
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
