"use client";

import Link from "next/link";
import LandingNavbar from "@/components/LandingNavbar";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { ArrowRight, Bot, Target, Shield, Zap, Sparkles, Activity, Flame, Search, FileText, Check, ChevronDown } from "lucide-react";

const highlightCards = [
  { title: "Mock Interviews", subtitle: "Real-time AI Feedback", value: "99%" },
  { title: "Resume Roasts", subtitle: "Brutal Honesty", value: "100%" },
];

const perks = [
  { icon: Bot, label: "Live AI Interviews", detail: "Experience high-pressure technical & behavioral rounds." },
  { icon: Flame, label: "Brutal Roast", detail: "Get unfiltered, harsh feedback to actually improve." },
  { icon: FileText, label: "Resume Tailor", detail: "Instantly align your resume with any job description." },
];

const faqs = [
  { q: "How realistic is the AI Interview?", a: "Extremely. Our AI dynamically adjusts its questioning based on your resume and your real-time verbal answers, mimicking a tough human recruiter." },
  { q: "Is the Resume Roast really that brutal?", a: "Yes. We don't sugarcoat. The AI will point out weak bullet points, buzzword fluff, and exactly why your resume might be getting rejected." },
  { q: "Can I tailor my resume for multiple jobs?", a: "Absolutely. You can paste any job description and Authin will instantly restructure your resume to highlight the most relevant skills and experiences." },
  { q: "Is Authin free to use?", a: "We offer a generous Free tier that includes basic mock interviews and resume roasts. For advanced analytics and unlimited tailoring, you can upgrade to Pro." },
];

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden text-white bg-[#05030d] scroll-smooth">
      {/* Dynamic Backgrounds */}
      <motion.div style={{ y, opacity }} className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(116,74,255,0.35),transparent_35%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(66,178,255,0.25),transparent_32%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_80%,rgba(123,52,255,0.22),transparent_38%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#0b0719_0%,#05030d_48%,#08041a_100%)]" />
      </motion.div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-24 pt-10 md:pt-14">
        <LandingNavbar />

        {/* HERO SECTION */}
        <section className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center mt-8 lg:mt-12 pt-8">
          {/* Left Column: Text & CTA */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-10"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/70 backdrop-blur shadow-[0_0_20px_rgba(116,74,255,0.15)]"
            >
              <Sparkles className="h-4 w-4 text-purple-400" />
              The Ultimate Career Cheat Code
            </motion.div>
            
            <div className="space-y-6">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-5xl font-semibold leading-[1.1] text-white md:text-6xl lg:text-7xl"
              >
                Ace Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-300 to-white">Interview</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="max-w-xl text-lg text-white/70 md:text-xl md:leading-relaxed"
              >
                Stop failing interviews. Practice with our brutal AI recruiter, get your resume roasted, and perfectly tailor your application for any job in seconds.
              </motion.p>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-wrap items-center gap-4"
            >
              <Link href="/login">
                <motion.button 
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 40px rgba(255,255,255,0.25)" }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-semibold text-purple-700 transition-colors hover:bg-slate-100"
                >
                  Start Your Free Mock Interview <ArrowRight className="h-4 w-4" />
                </motion.button>
              </Link>
              <Link href="#about">
                <motion.button 
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-full border border-white/20 px-8 py-4 text-sm font-semibold text-white/80 transition-colors hover:border-white/40 hover:text-white"
                >
                  Learn More
                </motion.button>
              </Link>
            </motion.div>
            
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1, delayChildren: 0.6 }
                }
              }}
              className="grid gap-4 sm:grid-cols-3 pt-6 border-t border-white/10"
            >
              {perks.map((perk) => (
                <motion.div 
                  key={perk.label} 
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.08)" }}
                  className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition-colors"
                >
                  <perk.icon className="h-6 w-6 text-blue-400 mb-3" />
                  <p className="text-[10px] uppercase tracking-[0.1em] text-white/60 mb-1">{perk.label}</p>
                  <p className="text-sm font-medium text-white/90 leading-tight">{perk.detail}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Column: Visual UI Representation */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="relative lg:ml-auto w-full max-w-lg"
            style={{ perspective: "1000px" }}
          >
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#120d24] via-[#0c0a1b] to-[#080615] p-8 shadow-[0_30px_100px_rgba(0,0,0,0.6)] backdrop-blur"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(123,92,255,0.35),transparent_35%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(54,146,255,0.28),transparent_40%)]" />
              <div className="relative space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">Authin</p>
                    <p className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Live Assessment</p>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 rounded-full bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-400 backdrop-blur ring-1 ring-rose-500/20"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
                    Recording
                  </motion.button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {highlightCards.map((card, i) => (
                    <motion.div 
                      key={card.subtitle}
                      whileHover={{ scale: 1.03 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
                      <div className="relative">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-blue-300">{card.title}</p>
                        <p className="mt-1 text-sm text-white/80">{card.subtitle}</p>
                        <p className="mt-4 text-3xl font-semibold text-white">{card.value}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-white/90">Interview Performance</p>
                      <p className="text-xs text-white/50">Confidence & Clarity metrics</p>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/30">
                      <Zap className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="h-24 overflow-hidden rounded-xl bg-gradient-to-b from-white/5 to-transparent p-3 relative flex items-end">
                     {/* Decorative graph bars */}
                     <div className="absolute bottom-0 left-3 flex items-end gap-2 h-16 opacity-60">
                        {[40, 70, 45, 90, 65, 80, 50, 100, 75, 85].map((height, i) => (
                          <motion.div 
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            transition={{ duration: 1, delay: 0.5 + i * 0.1, ease: "easeOut" }}
                            className="w-4 lg:w-5 rounded-t-sm bg-gradient-to-t from-purple-500/50 to-blue-400/80"
                          />
                        ))}
                     </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Floating Elements */}
            <motion.div 
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -right-4 -top-6 hidden w-44 rounded-2xl border border-white/10 bg-[#1a1438]/80 p-5 text-sm backdrop-blur-xl shadow-2xl md:block z-10"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <Target className="h-4 w-4" />
                </div>
                <p className="text-xs font-medium text-white/80">Tailor Match</p>
              </div>
              <p className="text-3xl font-bold text-white tracking-tight">98.5<span className="text-lg text-white/50">%</span></p>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-emerald-400">Keyword Alignment</p>
            </motion.div>

            <motion.div 
              animate={{ y: [5, -5, 5], rotate: [-4, -6, -4] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-8 -left-8 hidden w-48 rounded-3xl border border-white/10 bg-[#0d1b2a]/80 p-5 text-sm backdrop-blur-xl shadow-2xl lg:block z-10"
            >
              <p className="text-xs text-white/60 uppercase tracking-widest">Interview Score</p>
              <p className="mt-2 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">A+</p>
              <div className="mt-3 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "95%" }}
                  transition={{ duration: 1.5, delay: 1 }}
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500" 
                />
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className="mt-32 pt-20 border-t border-white/5 scroll-mt-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-semibold md:text-5xl text-white">Why Authin Exists</h2>
              <p className="mt-6 text-lg text-white/60 leading-relaxed">
                The job market is broken. Candidates send hundreds of resumes into the void and fail interviews without ever knowing why. 
                <br/><br/>
                We built Authin to give you the unfair advantage. By simulating the exact high-pressure environments of top tech companies, providing brutal, actionable feedback on your resume, and instantly tailoring your applications, we turn candidates into absolute top-tier hires.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative h-80 rounded-3xl border border-white/10 bg-white/5 overflow-hidden flex items-center justify-center backdrop-blur-sm"
            >
               <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/10 opacity-50" />
               <Bot className="h-32 w-32 text-white/20" />
            </motion.div>
          </div>
        </section>

        {/* PLATFORM SECTION */}
        <section id="platform" className="mt-32 pt-20 border-t border-white/5 scroll-mt-20">
           <motion.div 
             initial={{ opacity: 0, y: 40 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, margin: "-100px" }}
             transition={{ duration: 0.8 }}
             className="text-center max-w-3xl mx-auto mb-16 px-4"
           >
             <h2 className="text-3xl font-semibold md:text-5xl text-white">The Ultimate Candidate Arsenal</h2>
             <p className="mt-6 text-lg text-white/60">Everything you need to bypass the ATS and crush the final round.</p>
           </motion.div>

           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
             {[
               { icon: Bot, title: "AI Interviews", desc: "Real-time voice interviews that dynamically adapt to your resume and answers.", delay: 0.1 },
               { icon: Flame, title: "Brutal Roast", desc: "Stop wondering why you were rejected. Get raw, unforgiving feedback.", delay: 0.2 },
               { icon: FileText, title: "Resume Tailor", desc: "Paste a job description and instantly rewrite your resume to match the exact requirements.", delay: 0.3 },
               { icon: Search, title: "Job Finder", desc: "Discover active roles perfectly suited to your newly tailored profile.", delay: 0.4 }
             ].map((feature, i) => (
               <motion.div
                 key={feature.title}
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true, margin: "-50px" }}
                 transition={{ duration: 0.6, delay: feature.delay }}
                 whileHover={{ y: -8, scale: 1.02 }}
                 className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur transition-all hover:bg-white/10 cursor-pointer flex flex-col"
               >
                 <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                 <feature.icon className="h-8 w-8 text-indigo-400 mb-6" />
                 <h3 className="relative text-xl font-semibold text-white">{feature.title}</h3>
                 <p className="relative mt-4 text-sm text-white/60 leading-relaxed flex-1">{feature.desc}</p>
               </motion.div>
             ))}
           </div>
        </section>

        {/* PRICING SECTION */}
        <section id="pricing" className="mt-32 pt-20 border-t border-white/5 scroll-mt-20">
           <motion.div 
             initial={{ opacity: 0, y: 40 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, margin: "-100px" }}
             transition={{ duration: 0.8 }}
             className="text-center max-w-3xl mx-auto mb-16 px-4"
           >
             <h2 className="text-3xl font-semibold md:text-5xl text-white">Simple, Transparent Pricing</h2>
             <p className="mt-6 text-lg text-white/60">Invest in your career. Upgrade when you're ready.</p>
           </motion.div>

           <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Tier */}
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur flex flex-col"
              >
                <h3 className="text-2xl font-semibold text-white">Starter</h3>
                <p className="mt-2 text-white/60">Perfect for dipping your toes in.</p>
                <div className="mt-6 text-5xl font-bold text-white">$0<span className="text-xl font-normal text-white/50">/mo</span></div>
                <ul className="mt-8 space-y-4 flex-1">
                  {["1 AI Mock Interview / week", "Basic Resume Roast", "3 Resume Tailors / month", "Access to Job Board"].map(feature => (
                    <li key={feature} className="flex items-center gap-3 text-white/80">
                      <Check className="h-5 w-5 text-emerald-400" /> {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/login">
                  <button className="mt-8 w-full rounded-2xl border border-white/20 bg-transparent py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                    Get Started Free
                  </button>
                </Link>
              </motion.div>

              {/* Pro Tier */}
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                className="relative rounded-3xl border border-indigo-500/50 bg-indigo-900/20 p-8 backdrop-blur flex flex-col shadow-[0_0_40px_rgba(99,102,241,0.15)]"
              >
                <div className="absolute top-0 right-8 -translate-y-1/2 rounded-full bg-indigo-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">Most Popular</div>
                <h3 className="text-2xl font-semibold text-white">Pro</h3>
                <p className="mt-2 text-indigo-200/70">For the serious job seeker.</p>
                <div className="mt-6 text-5xl font-bold text-white">$29<span className="text-xl font-normal text-white/50">/mo</span></div>
                <ul className="mt-8 space-y-4 flex-1">
                  {["Unlimited AI Mock Interviews", "Brutal, In-depth Roasts", "Unlimited Resume Tailoring", "Priority Job Matches", "Detailed Analytics & Insights"].map(feature => (
                    <li key={feature} className="flex items-center gap-3 text-white/80">
                      <Check className="h-5 w-5 text-indigo-400" /> {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/login">
                  <button className="mt-8 w-full rounded-2xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 shadow-lg">
                    Upgrade to Pro
                  </button>
                </Link>
              </motion.div>
           </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="mt-32 pt-20 border-t border-white/5 scroll-mt-20">
           <motion.div 
             initial={{ opacity: 0, y: 40 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, margin: "-100px" }}
             transition={{ duration: 0.8 }}
             className="text-center max-w-3xl mx-auto mb-16 px-4"
           >
             <h2 className="text-3xl font-semibold md:text-5xl text-white">Frequently Asked Questions</h2>
           </motion.div>

           <div className="max-w-3xl mx-auto space-y-4">
             {faqs.map((faq, i) => (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1 }}
                 className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden backdrop-blur"
               >
                 <button 
                   onClick={() => setOpenFaq(openFaq === i ? null : i)}
                   className="flex w-full items-center justify-between p-6 text-left"
                 >
                   <span className="text-lg font-medium text-white">{faq.q}</span>
                   <ChevronDown className={`h-5 w-5 text-white/50 transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`} />
                 </button>
                 <motion.div 
                   initial={false}
                   animate={{ height: openFaq === i ? "auto" : 0, opacity: openFaq === i ? 1 : 0 }}
                   className="overflow-hidden"
                 >
                   <p className="px-6 pb-6 text-white/60 leading-relaxed">{faq.a}</p>
                 </motion.div>
               </motion.div>
             ))}
           </div>
        </section>

      </div>
    </div>
  );
}
