"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav className="relative z-50 flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-6 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Authin Logo" className="h-10 w-auto rounded-xl object-contain shadow-sm" />
          <div className="leading-tight">
            <p className="text-sm text-white/70">Authin</p>
            <p className="text-xs text-white/50">AI Recruitment Suite</p>
          </div>
        </div>

        {/* Desktop Links */}
        <div className="hidden items-center gap-8 text-sm text-white/70 md:flex">
          <Link href="#about" className="hover:text-white/100 transition-colors">About</Link>
          <Link href="#platform" className="hover:text-white/100 transition-colors">Platform</Link>
          <Link href="#pricing" className="hover:text-white/100 transition-colors">Pricing</Link>
          <Link href="#faq" className="hover:text-white/100 transition-colors">FAQ</Link>
        </div>

        {/* Desktop Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login">
            <button className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-white/40 hover:text-white">
              Login
            </button>
          </Link>
          <Link href="/login">
            <button className="rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-5 py-2 text-sm font-medium text-white shadow-[0_10px_40px_rgba(104,72,255,0.4)] transition hover:shadow-[0_10px_50px_rgba(104,72,255,0.55)]">
              Sign up
            </button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="text-white/70 md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="absolute inset-x-0 top-[80px] z-40 mx-4 rounded-3xl border border-white/10 bg-[#0b0719]/95 p-6 backdrop-blur md:hidden">
          <div className="flex flex-col gap-6 text-center text-sm text-white/70">
            <Link href="#about" className="hover:text-white py-2" onClick={() => setIsMenuOpen(false)}>About</Link>
            <Link href="#platform" className="hover:text-white py-2" onClick={() => setIsMenuOpen(false)}>Platform</Link>
            <Link href="#pricing" className="hover:text-white py-2" onClick={() => setIsMenuOpen(false)}>Pricing</Link>
            <Link href="#faq" className="hover:text-white py-2" onClick={() => setIsMenuOpen(false)}>FAQ</Link>
            <div className="h-px bg-white/10" />
            <Link href="/login" onClick={() => setIsMenuOpen(false)}>
              <button className="w-full rounded-full border border-white/20 px-4 py-3 text-white/80 transition hover:border-white/40 hover:text-white">
                Login
              </button>
            </Link>
            <Link href="/login" onClick={() => setIsMenuOpen(false)}>
              <button className="w-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-5 py-3 font-medium text-white shadow-[0_10px_40px_rgba(104,72,255,0.4)]">
                Sign up
              </button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
