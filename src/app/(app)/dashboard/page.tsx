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
const StatCard = ({ title, value, subtitle, icon, delay, bgClass }: { title: string; value: string | number; subtitle: string; icon: React.ReactNode; delay: number, bgClass: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className={`border-8 border-black ${bgClass} p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300`}
  >
    <div className="flex items-center justify-between">
      <span className="text-sm font-black uppercase text-black">{title}</span>
      <div className="border-4 border-black bg-white p-2 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        {icon}
      </div>
    </div>
    <div className="mt-6 border-t-4 border-black pt-4">
      <h3 className="text-5xl font-black text-black tracking-tighter">{value}</h3>
      <p className="mt-2 text-xs font-bold uppercase text-black/80">{subtitle}</p>
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
    if (s >= 70) return "bg-[#EAFF00] text-black";
    if (s >= 40) return "bg-[#00E5FF] text-black";
    return "bg-[#FF3366] text-white";
  };

  return (
    <motion.div
      whileHover={{ x: 4, y: -2 }}
      onClick={() => router.push(`/report/${id}`)}
      className="flex cursor-pointer items-center justify-between border-4 border-black bg-white px-5 py-4 transition-all hover:bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4"
    >
      <div>
        <p className="text-lg font-black uppercase text-black">{role || "General Interview"}</p>
        <p className="text-sm font-bold text-black/60 uppercase">{new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
      </div>
      <div className="flex items-center gap-4">
        {score !== undefined && score !== null && (
          <span className={`border-2 border-black px-3 py-1.5 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${getScoreColor(score)}`}>
            {score}/100
          </span>
        )}
        <div className="border-2 border-black bg-black p-2 text-white hover:bg-[#EAFF00] hover:text-black transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <ArrowUpRight size={16} strokeWidth={3} />
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
  const COLORS = ["#FF3366", "#00E5FF", "#EAFF00", "#7B61FF", "#FF8C00", "#00FF00"];

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
          normalizedData.push({ index: `ATTEMPT ${i + 1}`, attemptNum: i + 1 });
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
    <div className="max-w-7xl mx-auto space-y-12 px-1">
      {/* Welcome & Overview Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-8 border-black pb-8 mt-4">
        <div>
          <p className="text-lg font-black uppercase text-[#FF3366]">OVERVIEW</p>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-black tracking-tighter uppercase mt-2 break-words">
            WHAT'S UP, <br className="hidden md:block"/> {profile.full_name.split(" ")[0]}!
          </h1>
        </div>
        <div className="flex items-center gap-3 font-black text-black uppercase bg-[#EAFF00] border-4 border-black px-6 py-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <Calendar size={20} strokeWidth={3} />
          <span>LIVE STATS</span>
        </div>
      </div>

      {/* Top Level Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard
          title="Interviews Crushed"
          value={totalInterviews}
          subtitle="AI Practice assessments taken"
          icon={<Award size={24} strokeWidth={3} />}
          delay={0.05}
          bgClass="bg-[#00E5FF]"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="border-8 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between border-b-4 border-black pb-4 mb-4">
            <span className="text-sm font-black uppercase text-black">Profile Completion</span>
            <div className="border-4 border-black bg-[#EAFF00] p-2 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Sparkles size={24} strokeWidth={3} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-5xl font-black text-black tracking-tighter">{profile.completion}%</h3>
              <p className="text-xs font-bold uppercase text-black/70 mt-2">Boosts AI Match Score</p>
            </div>
            <div className="relative h-24 w-24 flex-shrink-0 bg-black rounded-full border-4 border-black">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="48" stroke="#333" strokeWidth="12" fill="none" />
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  stroke="#FF3366"
                  strokeWidth="12"
                  strokeDasharray={`${progress} ${circumference - progress}`}
                  strokeLinecap="square"
                  fill="none"
                />
              </svg>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="border-8 border-black bg-[#7B61FF] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between"
        >
          <div className="flex items-start justify-between border-b-4 border-black pb-4 mb-4">
            <span className="text-sm font-black uppercase text-black bg-[#EAFF00] border-2 border-black px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">BRUTAL TRUTH</span>
            <Flame size={24} strokeWidth={3} className="text-black" />
          </div>
          <p className="text-xl font-black uppercase leading-tight text-white stroke-black">
            "FAILING TO PREPARE IS PREPARING TO FAIL."
          </p>
          <div className="mt-4 pt-4 border-t-4 border-black text-sm font-bold uppercase text-black">
            — NO EXCUSES
          </div>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Section: Quick Actions & Chart */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Quick Actions Grid */}
          <div className="bg-white border-8 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-3xl font-black uppercase text-black border-b-8 border-black pb-4 mb-6">THE ARSENAL</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <button
                onClick={startProctoredInterview}
                className="group relative flex flex-col items-start gap-4 border-4 border-black bg-[#FF3366] p-6 transition-all hover:bg-black hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="flex h-16 w-16 items-center justify-center border-4 border-black bg-white group-hover:bg-[#FF3366] transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Play size={28} strokeWidth={3} className="text-black" />
                </div>
                <div className="text-left">
                  <p className="text-xl font-black uppercase text-white">MOCK INTERVIEW</p>
                  <p className="text-sm font-bold uppercase text-white/80 mt-1">PROCTORED. BRUTAL.</p>
                </div>
              </button>

              <button
                onClick={() => router.push('/jobs')}
                className="group relative flex flex-col items-start gap-4 border-4 border-black bg-[#00E5FF] p-6 transition-all hover:bg-black hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="flex h-16 w-16 items-center justify-center border-4 border-black bg-white group-hover:bg-[#00E5FF] transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Briefcase size={28} strokeWidth={3} className="text-black" />
                </div>
                <div className="text-left">
                  <p className="text-xl font-black uppercase text-black group-hover:text-white">FIND ROLES</p>
                  <p className="text-sm font-bold uppercase text-black/70 group-hover:text-white/70 mt-1">SEARCH & APPLY</p>
                </div>
              </button>

              <button
                onClick={() => router.push('/jobs')}
                className="group relative flex flex-col items-start gap-4 border-4 border-black bg-[#EAFF00] p-6 transition-all hover:bg-black hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="flex h-16 w-16 items-center justify-center border-4 border-black bg-white group-hover:bg-[#EAFF00] transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Wand2 size={28} strokeWidth={3} className="text-black" />
                </div>
                <div className="text-left">
                  <p className="text-xl font-black uppercase text-black group-hover:text-white">TAILOR RESUME</p>
                  <p className="text-sm font-bold uppercase text-black/70 group-hover:text-white/70 mt-1">BEAT THE ATS</p>
                </div>
              </button>

              <button
                onClick={() => router.push('/roast')}
                className="group relative flex flex-col items-start gap-4 border-4 border-black bg-[#7B61FF] p-6 transition-all hover:bg-black hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="flex h-16 w-16 items-center justify-center border-4 border-black bg-white group-hover:bg-[#7B61FF] transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Flame size={28} strokeWidth={3} className="text-black" />
                </div>
                <div className="text-left">
                  <p className="text-xl font-black uppercase text-white">RESUME ROAST</p>
                  <p className="text-sm font-bold uppercase text-white/80 mt-1">NO SUGARCOATING</p>
                </div>
              </button>
            </div>
          </div>

          {/* Performance Area Chart */}
          <div className="border-8 border-black bg-white p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between border-b-8 border-black pb-4 mb-8">
              <div>
                <h2 className="text-3xl font-black uppercase text-black tracking-tight">PERFORMANCE <br/>TRENDS</h2>
              </div>
            </div>
            <div className="h-80 w-full bg-[#FFFBED] border-4 border-black p-4">
              {roleKeys.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center border-4 border-dashed border-black bg-white p-6">
                  <Sparkles size={40} strokeWidth={3} className="mb-4 text-black" />
                  <p className="text-xl font-black uppercase text-black">NO DATA YET</p>
                  <p className="text-sm font-bold uppercase text-black/60 mt-2">TAKE AN INTERVIEW TO SEE STATS</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                    <defs>
                      {roleKeys.map((role, idx) => (
                        <linearGradient key={role} id={`color${role.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={COLORS[idx % COLORS.length]} stopOpacity={1} />
                          <stop offset="100%" stopColor={COLORS[idx % COLORS.length]} stopOpacity={0.2} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#000" />
                    <XAxis dataKey="index" tickLine={false} axisLine={false} tick={{ fill: "#000", fontSize: 12, fontWeight: "900" }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: "#000", fontSize: 12, fontWeight: "900" }} domain={[0, 100]} />
                    <Tooltip contentStyle={{ borderRadius: '0px', border: '4px solid #000', backgroundColor: '#EAFF00', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)', textTransform: 'uppercase', fontWeight: '900' }} />
                    {roleKeys.map((role, idx) => (
                      <Area
                        key={role}
                        type="step"
                        dataKey={role}
                        stroke="#000"
                        fill={`url(#color${role.replace(/\s/g, '')})`}
                        strokeWidth={4}
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
          <div className="border-8 border-black bg-white p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] h-full flex flex-col">
            <div className="mb-8 border-b-8 border-black pb-4">
              <h2 className="text-3xl font-black uppercase text-black tracking-tight">RECENT <br/>BATTLES</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {interviews.length === 0 ? (
                <div className="flex h-full min-h-[200px] flex-col items-center justify-center border-4 border-dashed border-black bg-[#FFFBED] p-6 text-center">
                  <Play size={40} strokeWidth={3} className="mb-4 text-black" />
                  <p className="text-xl font-black uppercase text-black">NO HISTORY</p>
                  <p className="text-sm font-bold uppercase text-black/60 mt-2">TAKE YOUR FIRST INTERVIEW</p>
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
            <button className="mt-8 w-full border-4 border-black bg-[#EAFF00] py-4 text-xl font-black uppercase text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all">
              VIEW ALL HISTORY
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
