import { Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import { Bell, Calendar, Grid, Home, MessageSquare, Search, Settings, Briefcase, Flame } from "lucide-react";
import type { ReactNode } from "react";
import "@/app/globals.css";
import { HEADER_USER, NAV_LINKS } from "@/lib/mockData";
import UserHeader from "@/components/UserHeader";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
});

const iconMap: Record<string, ReactNode> = {
  home: <Home size={18} />,
  grid: <Grid size={18} />,
  calendar: <Calendar size={18} />,
  message: <MessageSquare size={18} />,
  settings: <Settings size={18} />,
  briefcase: <Briefcase size={18} />,
  flame: <Flame size={18} />,
};

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${jakarta.className} min-h-screen bg-slate-50 text-slate-900`}>
      <div className="flex min-h-screen">
        <aside className="hidden w-20 flex-col items-center gap-6 border-r border-slate-200 bg-white/90 px-4 py-8 shadow-sm lg:flex">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 text-lg font-semibold text-white shadow-md">
            LH
          </div>
          <div className="flex-1 space-y-3">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-center rounded-2xl p-3 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label={item.label}
              >
                {iconMap[item.icon]}
              </Link>
            ))}
          </div>
        </aside>

        <div className="flex flex-1 flex-col">
          <UserHeader />
          <main className="flex-1 px-5 pb-24 pt-6 lg:pb-10">{children}</main>
        </div>

        {/* Bottom Navigation for Mobile */}
        <nav className="fixed bottom-0 z-50 flex w-full justify-around border-t border-slate-200 bg-white/90 p-3 backdrop-blur lg:hidden">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center justify-center rounded-2xl p-3 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
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
