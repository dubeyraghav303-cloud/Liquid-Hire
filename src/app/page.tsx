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
  { icon: Bot, label: "Live AI", detail: "Tough human recruiter." },
  { icon: Flame, label: "Brutal Roast", detail: "Unfiltered, harsh feedback." },
  { icon: FileText, label: "Tailor", detail: "Align with any JD." },
];

const faqs = [
  { q: "HOW REALISTIC IS THE AI INTERVIEW?", a: "Extremely. Our AI dynamically adjusts its questioning based on your resume and your real-time verbal answers, mimicking a tough human recruiter." },
  { q: "IS THE RESUME ROAST REALLY THAT BRUTAL?", a: "Yes. We don't sugarcoat. The AI will point out weak bullet points, buzzword fluff, and exactly why your resume might be getting rejected." },
  { q: "CAN I TAILOR MY RESUME FOR MULTIPLE JOBS?", a: "Absolutely. You can paste any job description and Authin will instantly restructure your resume to highlight the most relevant skills and experiences." },
  { q: "IS AUTHIN FREE TO USE?", a: "We offer a generous Free tier that includes basic mock interviews and resume roasts. For advanced analytics and unlimited tailoring, you can upgrade to Pro." },
];

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden font-sans bg-[#FFFBED] text-black scroll-smooth selection:bg-[#FF3366] selection:text-white">
      {/* Brutalist Grid Background */}
      <div className="pointer-events-none absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '40px 40px' }} />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-6 pb-24 pt-10 md:pt-14">
        <LandingNavbar />

        {/* HERO SECTION */}
        <section className="grid gap-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center mt-8 lg:mt-12 pt-8">
          {/* Left Column: Text & CTA */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-10 relative z-10"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 border-4 border-black bg-[#EAFF00] px-4 py-2 text-sm font-bold uppercase tracking-widest text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <Sparkles className="h-5 w-5" />
              The Career Cheat Code
            </motion.div>
            
            <div className="space-y-6">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-6xl font-black uppercase leading-[0.9] text-black md:text-7xl lg:text-[6rem] tracking-tighter"
              >
                DOMINATE YOUR NEXT <span className="text-[#FF3366] mix-blend-multiply underline decoration-8 decoration-[#00E5FF]">INTERVIEW</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="max-w-xl text-xl font-bold text-black/80 md:text-2xl border-l-8 border-[#FF3366] pl-6"
              >
                Stop failing. Practice with our brutal AI recruiter, get your resume roasted, and perfectly tailor your application for any job. FAST.
              </motion.p>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-wrap items-center gap-6"
            >
              <Link href="/login">
                <motion.button 
                  whileHover={{ scale: 1.02, x: 2, y: -2 }}
                  whileTap={{ scale: 0.98, x: 0, y: 0, boxShadow: "0px 0px 0px 0px rgba(0,0,0,1)" }}
                  className="flex items-center gap-3 border-4 border-black bg-[#00E5FF] px-8 py-5 text-xl font-black uppercase text-black transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:bg-[#EAFF00]"
                >
                  START FREE MOCK <ArrowRight className="h-6 w-6 stroke-[3]" />
                </motion.button>
              </Link>
              <Link href="#about">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="border-4 border-black bg-white px-8 py-5 text-xl font-black uppercase text-black transition-all hover:bg-black hover:text-white"
                >
                  LEARN MORE
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
              className="grid gap-4 sm:grid-cols-3 pt-6"
            >
              {perks.map((perk) => (
                <motion.div 
                  key={perk.label} 
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ y: -5, rotate: -2 }}
                  className="border-4 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform"
                >
                  <perk.icon className="h-8 w-8 text-[#FF3366] mb-3" />
                  <p className="text-sm font-black uppercase tracking-wider text-black mb-1">{perk.label}</p>
                  <p className="text-xs font-bold text-black/70 leading-tight">{perk.detail}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Column: Visual UI Representation */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="relative lg:ml-auto w-full max-w-lg z-0"
          >
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative overflow-hidden border-8 border-black bg-[#7B61FF] p-8 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] rotate-2 hover:rotate-0 transition-transform duration-300"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#EAFF00] rounded-full blur-3xl opacity-50 translate-x-10 -translate-y-10" />
              
              <div className="relative space-y-8">
                <div className="flex items-center justify-between border-b-4 border-black pb-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-black">AUTHIN</p>
                    <p className="mt-1 text-3xl font-black uppercase tracking-tight text-white stroke-black">LIVE ASSESSMENT</p>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 border-2 border-black bg-[#FF3366] px-3 py-1.5 text-xs font-bold text-white uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <span className="h-2 w-2 bg-white animate-ping" />
                    REC
                  </motion.button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {highlightCards.map((card, i) => (
                    <motion.div 
                      key={card.subtitle}
                      whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? -3 : 3 }}
                      className="border-4 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <p className="text-xs font-black uppercase text-[#7B61FF]">{card.title}</p>
                      <p className="mt-1 text-xs font-bold text-black/60">{card.subtitle}</p>
                      <p className="mt-4 text-4xl font-black text-black">{card.value}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="border-4 border-black bg-[#00E5FF] p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-base font-black uppercase text-black">Performance</p>
                      <p className="text-xs font-bold text-black/70">Confidence & Clarity</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center border-2 border-black bg-[#EAFF00] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <Zap className="h-6 w-6 stroke-[3]" />
                    </div>
                  </div>
                  <div className="h-24 border-t-4 border-black bg-white p-3 relative flex items-end">
                     {/* Decorative graph bars */}
                     <div className="absolute bottom-0 left-3 flex items-end gap-2 h-16 w-full">
                        {[40, 70, 45, 90, 65, 80, 50, 100, 75].map((height, i) => (
                          <motion.div 
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            transition={{ duration: 1, delay: 0.5 + i * 0.1, ease: "easeOut" }}
                            className="w-4 lg:w-5 border-2 border-black bg-[#FF3366]"
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
              className="absolute -right-8 -top-8 hidden w-48 border-4 border-black bg-[#EAFF00] p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:block z-10 rotate-3"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center border-2 border-black bg-white text-black">
                  <Target className="h-6 w-6" />
                </div>
                <p className="text-sm font-black uppercase text-black">Tailor Match</p>
              </div>
              <p className="text-4xl font-black text-black">98.5%</p>
            </motion.div>

            <motion.div 
              animate={{ y: [5, -5, 5], rotate: [-4, -6, -4] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-10 -left-10 hidden w-56 border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] lg:block z-20 -rotate-3"
            >
              <p className="text-sm font-black uppercase text-black/60">Interview Score</p>
              <p className="mt-2 text-6xl font-black text-[#FF3366]">A+</p>
              <div className="mt-4 h-4 w-full border-2 border-black bg-gray-200 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "95%" }}
                  transition={{ duration: 1.5, delay: 1 }}
                  className="h-full bg-[#00E5FF] border-r-2 border-black" 
                />
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className="mt-40 pt-20 border-t-8 border-black scroll-mt-20">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-5xl font-black uppercase md:text-7xl text-black leading-none">WHY AUTHIN <br/><span className="text-[#00E5FF] bg-black px-2 mt-2 inline-block">EXISTS</span></h2>
              <p className="mt-8 text-xl font-bold text-black/80 leading-relaxed border-l-8 border-[#EAFF00] pl-6 bg-white p-6 border-y-4 border-r-4 border-t-black border-r-black border-b-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
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
              className="relative h-[400px] border-8 border-black bg-[#FF3366] overflow-hidden flex items-center justify-center shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] -rotate-2"
            >
               <Bot className="h-48 w-48 text-black" />
               <div className="absolute bottom-4 right-4 bg-white border-4 border-black p-2 font-black uppercase text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-6">AI MODE: RUTHLESS</div>
            </motion.div>
          </div>
        </section>

        {/* PLATFORM SECTION */}
        <section id="platform" className="mt-40 pt-20 border-t-8 border-black scroll-mt-20">
           <motion.div 
             initial={{ opacity: 0, y: 40 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, margin: "-100px" }}
             transition={{ duration: 0.8 }}
             className="text-center max-w-4xl mx-auto mb-20 px-4"
           >
             <h2 className="text-5xl font-black uppercase md:text-7xl text-black">THE ULTIMATE ARSENAL</h2>
             <p className="mt-6 text-2xl font-bold text-black/70 uppercase border-4 border-black bg-[#EAFF00] inline-block px-6 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">Bypass the ATS & crush the final round.</p>
           </motion.div>

           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
             {[
               { icon: Bot, title: "AI Interviews", desc: "Real-time voice interviews that dynamically adapt to your resume.", bg: "bg-[#00E5FF]", delay: 0.1 },
               { icon: Flame, title: "Brutal Roast", desc: "Stop wondering why you were rejected. Get raw, unforgiving feedback.", bg: "bg-[#FF3366]", delay: 0.2 },
               { icon: FileText, title: "Resume Tailor", desc: "Instantly rewrite your resume to match the exact requirements.", bg: "bg-[#EAFF00]", delay: 0.3 },
               { icon: Search, title: "Job Finder", desc: "Discover active roles perfectly suited to your newly tailored profile.", bg: "bg-[#7B61FF]", delay: 0.4 }
             ].map((feature, i) => (
               <motion.div
                 key={feature.title}
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true, margin: "-50px" }}
                 transition={{ duration: 0.6, delay: feature.delay }}
                 whileHover={{ y: -8, scale: 1.02, rotate: i % 2 === 0 ? 2 : -2 }}
                 className={`group relative border-4 border-black ${feature.bg} p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer flex flex-col`}
               >
                 <div className="flex h-16 w-16 items-center justify-center border-4 border-black bg-white mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:-translate-y-2 transition-transform">
                    <feature.icon className="h-8 w-8 text-black" />
                 </div>
                 <h3 className={`text-2xl font-black uppercase text-black ${feature.bg === 'bg-[#7B61FF]' || feature.bg === 'bg-[#FF3366]' ? 'text-white' : ''} stroke-black`}>{feature.title}</h3>
                 <p className={`mt-4 text-base font-bold flex-1 ${feature.bg === 'bg-[#7B61FF]' || feature.bg === 'bg-[#FF3366]' ? 'text-white/90' : 'text-black/80'}`}>{feature.desc}</p>
               </motion.div>
             ))}
           </div>
        </section>

        {/* PRICING SECTION */}
        <section id="pricing" className="mt-40 pt-20 border-t-8 border-black scroll-mt-20">
           <motion.div 
             initial={{ opacity: 0, y: 40 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, margin: "-100px" }}
             transition={{ duration: 0.8 }}
             className="text-center max-w-4xl mx-auto mb-20 px-4"
           >
             <h2 className="text-5xl font-black uppercase md:text-7xl text-black">NO BS PRICING</h2>
             <p className="mt-6 text-2xl font-bold text-black/70 uppercase">Invest in your career. Upgrade when ready.</p>
           </motion.div>

           <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              {/* Free Tier */}
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, rotate: -1 }}
                className="border-8 border-black bg-white p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col"
              >
                <h3 className="text-4xl font-black uppercase text-black">Starter</h3>
                <p className="mt-2 font-bold text-black/60 uppercase">Dipping your toes in.</p>
                <div className="mt-8 text-7xl font-black text-black">$0<span className="text-2xl font-bold text-black/50">/mo</span></div>
                <ul className="mt-10 space-y-4 flex-1">
                  {["1 AI Mock Interview / week", "Basic Resume Roast", "3 Resume Tailors / month", "Access to Job Board"].map(feature => (
                    <li key={feature} className="flex items-center gap-4 text-lg font-bold text-black">
                      <Check className="h-6 w-6 text-[#FF3366] stroke-[4]" /> {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/login">
                  <button className="mt-10 w-full border-4 border-black bg-white py-5 text-xl font-black uppercase text-black transition-all hover:bg-black hover:text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
                    Get Started Free
                  </button>
                </Link>
              </motion.div>

              {/* Pro Tier */}
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, rotate: 1 }}
                className="relative border-8 border-black bg-[#EAFF00] p-10 flex flex-col shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="absolute -top-6 -right-6 border-4 border-black bg-[#FF3366] px-6 py-2 text-lg font-black uppercase tracking-wider text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-6">MOST POPULAR</div>
                <h3 className="text-4xl font-black uppercase text-black">Pro</h3>
                <p className="mt-2 font-bold text-black/70 uppercase">For the serious job seeker.</p>
                <div className="mt-8 text-7xl font-black text-black">$29<span className="text-2xl font-bold text-black/50">/mo</span></div>
                <ul className="mt-10 space-y-4 flex-1">
                  {["Unlimited AI Mock Interviews", "Brutal, In-depth Roasts", "Unlimited Resume Tailoring", "Priority Job Matches", "Detailed Analytics & Insights"].map(feature => (
                    <li key={feature} className="flex items-center gap-4 text-lg font-bold text-black">
                      <Check className="h-6 w-6 text-black stroke-[4]" /> {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/login">
                  <button className="mt-10 w-full border-4 border-black bg-black py-5 text-xl font-black uppercase text-white transition-all hover:bg-[#00E5FF] hover:text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
                    Upgrade to Pro
                  </button>
                </Link>
              </motion.div>
           </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="mt-40 pt-20 border-t-8 border-black scroll-mt-20">
           <motion.div 
             initial={{ opacity: 0, y: 40 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, margin: "-100px" }}
             transition={{ duration: 0.8 }}
             className="text-center max-w-4xl mx-auto mb-16 px-4"
           >
             <h2 className="text-5xl font-black uppercase md:text-7xl text-black">FAQ</h2>
           </motion.div>

           <div className="max-w-4xl mx-auto space-y-6">
             {faqs.map((faq, i) => (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1 }}
                 className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
               >
                 <button 
                   onClick={() => setOpenFaq(openFaq === i ? null : i)}
                   className={`flex w-full items-center justify-between p-6 text-left transition-colors ${openFaq === i ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
                 >
                   <span className="text-xl font-black uppercase">{faq.q}</span>
                   <ChevronDown className={`h-6 w-6 transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`} />
                 </button>
                 <motion.div 
                   initial={false}
                   animate={{ height: openFaq === i ? "auto" : 0, opacity: openFaq === i ? 1 : 0 }}
                   className="overflow-hidden bg-[#FFFBED]"
                 >
                   <p className="p-8 text-lg font-bold text-black/80 leading-relaxed border-t-4 border-black">{faq.a}</p>
                 </motion.div>
               </motion.div>
             ))}
           </div>
        </section>

      </div>
    </div>
  );
}
