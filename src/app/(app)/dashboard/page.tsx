"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { ArrowDownRight, ArrowUpRight, MoreHorizontal, Play, Briefcase, Wand2, Flame } from "lucide-react";
import {
  FOCUSING_DATA,
  TASK_CARDS,
} from "@/lib/mockData";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

// Types
type Skill = {
  id: string;
  name: string;
  value: number;
  trend: "up" | "down";
};

type Meeting = {
  id: string;
  title: string;
  start_time: string;
  platform: string;
};

const StatChip = ({ color, value, label }: { color: string; value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color} text-white`}>
      {value}
    </div>
    <p className="mt-1 text-xs text-slate-500">{label}</p>
  </div>
);

const TaskCard = ({
  title,
  average,
  gradient,
}: {
  title: string;
  average: number;
  gradient: string;
}) => (
  <div
    className="relative overflow-hidden rounded-[30px] p-6 shadow-sm ring-1 ring-slate-100"
    style={{ background: gradient }}
  >
    <button className="absolute right-4 top-4 text-slate-400">
      <MoreHorizontal size={18} />
    </button>
    <p className="text-sm font-medium text-slate-700">{title}</p>
    <p className="mt-4 text-4xl font-semibold text-slate-900">{average}%</p>
    <p className="text-xs text-slate-500">Avg. Completed</p>
  </div>
);

const SkillRow = ({
  name,
  value,
  trend,
}: {
  name: string;
  value: number;
  trend: "up" | "down";
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between text-sm text-slate-800">
      <p>{name}</p>
      <div className="flex items-center gap-1 text-xs text-slate-500">
        {trend === "up" ? (
          <ArrowUpRight size={14} className="text-emerald-500" />
        ) : (
          <ArrowDownRight size={14} className="text-rose-500" />
        )}
        <span>{value}%</span>
      </div>
    </div>
    <div className="h-2 rounded-full bg-slate-100">
      <div
        className={`h-full rounded-full ${trend === "up" ? "bg-blue-500" : "bg-amber-400"}`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
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
    if (s >= 70) return "bg-emerald-100 text-emerald-700";
    if (s >= 40) return "bg-amber-100 text-amber-700";
    return "bg-rose-100 text-rose-700";
  };

  return (
    <div
      onClick={() => router.push(`/report/${id}`)}
      className="flex cursor-pointer items-center justify-between rounded-2xl px-3 py-3 transition hover:bg-slate-100/70"
    >
      <div>
        <p className="text-sm font-semibold text-slate-900">{role || "General Interview"}</p>
        <p className="text-xs text-slate-500">{new Date(date).toLocaleDateString()}</p>
      </div>
      <div className="flex items-center gap-2">
        {score !== undefined && score !== null && (
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getScoreColor(score)}`}>
            {score}/100
          </span>
        )}
        <ArrowUpRight size={16} className="text-slate-400" />
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  // Data States
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

  const [skills, setSkills] = useState<Skill[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [totalInterviews, setTotalInterviews] = useState(0);

  // Chart State
  const [chartData, setChartData] = useState<any[]>([]);
  const [roleKeys, setRoleKeys] = useState<string[]>([]);
  const COLORS = ["#f43f5e", "#6366f1", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile({
          full_name: profileData.full_name || "User",
          target_role: profileData.target_role || "Candidate",
          avatar_url: profileData.avatar_url || "",
          completion: 75, // Static for now or calc based on fields
        });
      }

      // 2. Fetch Skills
      const { data: skillsData } = await supabase.from("skills").select("*").eq("user_id", user.id);
      if (skillsData) setSkills(skillsData);

      // 3. Fetch Interviews (Ordered by Date ASC for Chart)
      const { data: allInterviews } = await supabase
        .from("interviews")
        .select("id, created_at, job_role, score")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (allInterviews) {
        setTotalInterviews(allInterviews.length);
        // Reverse for the "Recent Interviews" list (we want newest first)
        setInterviews([...allInterviews].reverse());

        // Process Chart Data: Last 5 per role
        const interviewsByRole: Record<string, any[]> = {};
        allInterviews.forEach((iv) => {
          const role = iv.job_role || "General";
          if (!interviewsByRole[role]) interviewsByRole[role] = [];
          interviewsByRole[role].push(iv);
        });

        const maxAttempts = 5;
        const normalizedData: any[] = [];
        // Initialize 5 slots
        for (let i = 0; i < maxAttempts; i++) {
          normalizedData.push({ index: i + 1 });
        }

        const rolesFound: string[] = [];

        Object.keys(interviewsByRole).forEach((role) => {
          rolesFound.push(role);
          const roleIvs = interviewsByRole[role];
          // Take last 5
          const last5 = roleIvs.slice(-maxAttempts);

          last5.forEach((iv, idx) => {
            // Map to Attempt 1..5
            // If we have 2 interviews, are they Attempt 1 & 2? Yes.
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

  // Calculate Prioritized Tasks (Weakest Areas)
  const prioritizedTasks = useMemo(() => {
    if (interviews.length === 0) return TASK_CARDS;

    const roleMaxScores: Record<string, number> = {};
    interviews.forEach((iv) => {
      const role = iv.job_role;
      const score = iv.score || 0;
      if (!role) return;
      if (roleMaxScores[role] === undefined || score > roleMaxScores[role]) {
        roleMaxScores[role] = score;
      }
    });

    const sortedRoles = Object.entries(roleMaxScores)
      .map(([role, score]) => ({ role, score }))
      .sort((a, b) => a.score - b.score);

    const weakest = sortedRoles.slice(0, 3);
    const gradients = [
      "linear-gradient(135deg, #f0f9ff 0%, #cbebff 100%)",
      "linear-gradient(135deg, #fdf4ff 0%, #f0abfc 100%)",
      "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)"
    ];

    if (weakest.length === 0) return TASK_CARDS;

    return weakest.map((item, index) => ({
      title: item.role,
      average: item.score,
      gradient: gradients[index % gradients.length]
    }));
  }, [interviews]);

  return (
    <div className="grid grid-cols-12 gap-6">
      <section className="col-span-12 xl:col-span-8 space-y-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-4 rounded-[30px] bg-white p-6 shadow-sm ring-1 ring-slate-100">
            {/* Profile Card Content */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">{profile.full_name}</p>
                <p className="text-xs text-slate-500">{profile.target_role}</p>
              </div>
              <button className="text-slate-400">
                <MoreHorizontal size={18} />
              </button>
            </div>
            <div className="mt-6 flex flex-col items-center gap-3">
              <div className="relative h-28 w-28">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="48" stroke="#e5e7eb" strokeWidth="10" fill="none" />
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    stroke="url(#grad)"
                    strokeWidth="10"
                    strokeDasharray={`${progress} ${circumference - progress}`}
                    strokeLinecap="round"
                    fill="none"
                  />
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f97316" />
                      <stop offset="100%" stopColor="#f43f5e" />
                    </linearGradient>
                  </defs>
                </svg>
                <div
                  className="absolute inset-1 rounded-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${profile.avatar_url})` }}
                />
              </div>
              <p className="text-sm text-slate-500">Profile Progress</p>
            </div>

            <div className="mt-6 flex flex-col items-center justify-center rounded-2xl bg-slate-50 px-4 py-4 text-center">
              <span className="text-3xl font-bold text-slate-900">{totalInterviews}</span>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Interviews Completed</p>
            </div>

            <div className="mt-4 rounded-xl border-l-4 border-indigo-500 bg-indigo-50 p-4">
              <p className="text-xs font-semibold italic text-indigo-700">
                "Success is not final, failure is not fatal: it is the courage to continue that counts."
              </p>
            </div>
          </div>

          <div className="col-span-12 md:col-span-8 grid grid-cols-1 gap-6">
            <div className="grid grid-cols-2 gap-6">
              <button
                onClick={startProctoredInterview}
                className="group relative overflow-hidden rounded-[30px] bg-slate-900 p-6 text-left shadow-md transition hover:shadow-lg"
              >
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white mb-4 transition group-hover:bg-white/20">
                    <Play size={20} fill="currentColor" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white">Start Interview</p>
                    <p className="text-xs text-slate-300">Proctored AI Assessment</p>
                  </div>
                </div>
                <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
              </button>

              <button
                onClick={() => router.push('/jobs?q=internship')}
                className="group relative overflow-hidden rounded-[30px] bg-white p-6 text-left shadow-sm ring-1 ring-slate-100 transition hover:shadow-md"
              >
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 transition group-hover:bg-indigo-100">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-slate-900">Find Internships</p>
                    <p className="text-xs text-slate-500">Browse open roles</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => router.push('/jobs')}
                className="group relative overflow-hidden rounded-[30px] bg-white p-6 text-left shadow-sm ring-1 ring-slate-100 transition hover:shadow-md"
              >
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4 transition group-hover:bg-emerald-100">
                    <Wand2 size={20} />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-slate-900">Tailor Resume</p>
                    <p className="text-xs text-slate-500">Resume Chameleon™</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => router.push('/roast')}
                className="group relative overflow-hidden rounded-[30px] bg-white p-6 text-left shadow-sm ring-1 ring-slate-100 transition hover:shadow-md"
              >
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-4 transition group-hover:bg-red-100">
                    <Flame size={20} />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-slate-900">The Roast</p>
                    <p className="text-xs text-slate-500">Burn your resume</p>
                  </div>
                </div>
              </button>
            </div>

            {prioritizedTasks.map((card, i) => (
              <div key={i}>
                <TaskCard title={card.title} average={card.average} gradient={card.gradient} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Role Performance</p>
              <p className="text-xs text-slate-500">Last 5 interviews per role</p>
            </div>
          </div>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: 0, right: 0 }}>
                <defs>
                  {roleKeys.map((role, idx) => (
                    <linearGradient key={role} id={`color${role.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS[idx % COLORS.length]} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={COLORS[idx % COLORS.length]} stopOpacity={0.05} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="index" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8" }} label={{ value: 'Attempt', position: 'insideBottom', offset: -5 }} />
                <Tooltip />
                {roleKeys.map((role, idx) => (
                  <Area
                    key={role}
                    type="monotone"
                    dataKey={role}
                    stroke={COLORS[idx % COLORS.length]}
                    fill={`url(#color${role.replace(/\s/g, '')})`}
                    strokeWidth={3}
                    name={role}
                    connectNulls
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section >

      <aside className="col-span-12 xl:col-span-4 space-y-6">
        <div className="rounded-[30px] bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Recent Interviews</p>
              <p className="text-xs text-slate-500">History</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {interviews.length === 0 ? <p className="text-sm text-slate-400">No interviews yet.</p> : interviews.slice(0, 5).map((iv, i) => (
              <InterviewItem
                key={i}
                id={iv.id}
                date={iv.created_at}
                role={iv.job_role}
                score={iv.score}
              />
            ))}
          </div>
        </div>

        <div className="rounded-[30px] bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Developed areas</p>
              <p className="text-xs text-slate-500">From Settings</p>
            </div>
            <button
              onClick={() => router.push('/settings')}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
            >
              Edit
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {skills.length === 0 ? <p className="text-sm text-slate-400">Add skills in Settings to see them here.</p> : skills.map((skill) => (
              <SkillRow key={skill.id} {...skill} />
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
