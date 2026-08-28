import { Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import { Bell, Calendar, Grid, Home, MessageSquare, Search, Settings, Briefcase, Flame } from "lucide-react";
import type { ReactNode } from "react";
import "@/app/globals.css";
import { HEADER_USER, NAV_LINKS } from "@/lib/mockData";
import UserHeader from "@/components/UserHeader";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

const iconMap: Record<string, ReactNode> = {
  home: <Home size={24} strokeWidth={3} />,
  grid: <Grid size={24} strokeWidth={3} />,
  calendar: <Calendar size={24} strokeWidth={3} />,
  message: <MessageSquare size={24} strokeWidth={3} />,
  settings: <Settings size={24} strokeWidth={3} />,
  briefcase: <Briefcase size={24} strokeWidth={3} />,
  flame: <Flame size={24} strokeWidth={3} />,
};

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${jakarta.className} min-h-screen bg-[#FFFBED] text-black selection:bg-[#FF3366] selection:text-white`}>
      {/* Brutalist Grid Background */}
      <div className="pointer-events-none fixed inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '40px 40px', zIndex: 0 }} />

      <div className="flex min-h-screen relative z-10">
        <aside className="hidden w-24 flex-col items-center gap-6 border-r-8 border-black bg-white px-4 py-8 shadow-[8px_0px_0px_0px_rgba(0,0,0,1)] lg:flex z-50">
          <img src="/logo.png" alt="Authin Logo" className="h-12 w-12 border-4 border-black object-contain shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-[#EAFF00]" />
          <div className="flex-1 space-y-4 w-full mt-4">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group flex w-full items-center justify-center border-4 border-transparent p-3 text-black transition-all duration-300 hover:border-black hover:bg-[#00E5FF] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1"
                aria-label={item.label}
              >
                {iconMap[item.icon]}
              </Link>
            ))}
          </div>
        </aside>

        <div className="flex flex-1 flex-col z-10">
          <UserHeader />
          <main className="flex-1 px-4 sm:px-6 pb-24 pt-6 lg:pb-10">{children}</main>
        </div>

        {/* Bottom Navigation for Mobile */}
        <nav className="fixed bottom-0 z-50 flex w-full justify-around border-t-8 border-black bg-white p-3 shadow-[0px_-8px_0px_0px_rgba(0,0,0,1)] lg:hidden">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center justify-center border-4 border-transparent p-3 text-black transition-all hover:border-black hover:bg-[#EAFF00] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1"
              aria-label={item.label}
            >
              {iconMap[item.icon]}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
