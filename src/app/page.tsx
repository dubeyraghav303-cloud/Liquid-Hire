import Link from "next/link";
import LandingNavbar from "@/components/LandingNavbar";

const highlightCards = [
  { title: "Trading Pairs", subtitle: "Unparalleled Market Access", value: "46%" },
  { title: "Trading Pairs", subtitle: "Execution Confidence", value: "96%" },
];

const perks = [
  { label: "Regulated environment", detail: "Fully compliant AI-led hiring" },
  { label: "Precision matching", detail: "Vector search over resumes & roles" },
  { label: "Real-time trust", detail: "Live proctoring & analytics" },
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(116,74,255,0.35),transparent_35%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(66,178,255,0.25),transparent_32%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_80%,rgba(123,52,255,0.22),transparent_38%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#0b0719_0%,#05030d_48%,#08041a_100%)]" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-24 pt-10 md:pt-14">
        <LandingNavbar />

        <section className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/70 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-purple-400 to-blue-400" />
              AI-first Recruitment · Built for precision & trust
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
                Elevate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-300 to-white">Hiring</span>{" "}
                Experience
              </h1>
              <p className="max-w-xl text-base text-white/70 md:text-lg">
                Unlock your recruiting potential in a regulated, AI-powered environment. LiquidHire blends trading-grade polish with deep candidate intelligence for decisive hiring.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/login">
                <button className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-purple-700 transition hover:scale-[1.02] hover:shadow-[0_10px_40px_rgba(255,255,255,0.25)]">
                  Sign Up & Trade Talent
                </button>
              </Link>
              <button className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white">
                See product demo →
              </button>
            </div>
            <div className="grid gap-4 md:max-w-2xl md:grid-cols-3">
              {perks.map((perk) => (
                <div key={perk.label} className="glass-card rounded-2xl p-4">
                  <p className="text-xs uppercase tracking-[0.1em] text-white/60">{perk.label}</p>
                  <p className="mt-2 text-sm text-white/80">{perk.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#120d24] via-[#0c0a1b] to-[#080615] p-8 shadow-[0_30px_100px_rgba(0,0,0,0.6)] backdrop-blur">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(123,92,255,0.35),transparent_35%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(54,146,255,0.28),transparent_40%)]" />
              <div className="relative space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-white/50">LiquidHire</p>
                    <p className="text-2xl font-semibold text-white">Realtime Hiring Feed</p>
                  </div>
                  <button className="rounded-full bg-white/10 px-4 py-2 text-xs text-white/80 backdrop-blur transition hover:bg-white/15">
                    Live
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {highlightCards.map((card) => (
                    <div key={card.subtitle} className="glass-card relative overflow-hidden rounded-2xl p-4">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-70" />
                      <div className="relative">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/50">{card.title}</p>
                        <p className="mt-2 text-sm text-white/80">{card.subtitle}</p>
                        <p className="mt-5 text-3xl font-semibold text-white">{card.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="glass-card rounded-2xl p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/70">Candidate Liquidity</p>
                      <p className="text-xs text-white/50">Stable execution across hiring pipelines</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-white/10 ring-1 ring-white/10" />
                  </div>
                  <div className="mt-6 h-36 overflow-hidden rounded-xl bg-gradient-to-b from-white/10 to-white/0 p-4">
                    <div className="h-full w-full rounded-lg bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.24),transparent_45%),radial-gradient(circle_at_60%_80%,rgba(104,72,255,0.25),transparent_40%)]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -right-6 top-6 hidden w-40 rounded-2xl border border-white/10 bg-white/10 p-4 text-sm backdrop-blur md:block">
              <p className="text-white/60">Signal Strength</p>
              <p className="mt-3 text-3xl font-semibold text-white">92%</p>
              <div className="mt-4 h-2 rounded-full bg-white/10">
                <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-purple-500 to-blue-400" />
              </div>
            </div>

            <div className="absolute -left-10 -bottom-12 hidden w-44 rotate-[-6deg] rounded-3xl border border-white/10 bg-white/10 p-4 text-sm backdrop-blur lg:block">
              <p className="text-white/60">Confidence Index</p>
              <p className="mt-3 text-2xl font-semibold text-white">A+</p>
              <p className="mt-2 text-xs text-white/50">AI-graded consistency</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
