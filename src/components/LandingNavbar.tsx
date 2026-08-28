"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav className="relative z-50 flex items-center justify-between border-4 border-black bg-[#EAFF00] px-6 py-3 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Authin Logo" className="h-10 w-auto border-2 border-black object-contain bg-white" />
          <div className="leading-none">
            <p className="text-xl font-black uppercase text-black">Authin</p>
            <p className="text-xs font-bold uppercase text-black/70 tracking-widest">AI Suite</p>
          </div>
        </div>

        {/* Desktop Links */}
        <div className="hidden items-center gap-8 text-sm font-black uppercase text-black md:flex">
          <Link href="#about" className="hover:underline decoration-4 decoration-[#FF3366] transition-all">About</Link>
          <Link href="#platform" className="hover:underline decoration-4 decoration-[#00E5FF] transition-all">Platform</Link>
          <Link href="#pricing" className="hover:underline decoration-4 decoration-[#7B61FF] transition-all">Pricing</Link>
          <Link href="#faq" className="hover:underline decoration-4 decoration-[#FF3366] transition-all">FAQ</Link>
        </div>

        {/* Desktop Buttons */}
        <div className="hidden items-center gap-4 md:flex">
          <Link href="/login">
            <button className="border-4 border-black bg-white px-5 py-2 text-sm font-black uppercase text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
              Login
            </button>
          </Link>
          <Link href="/signup">
            <button className="border-4 border-black bg-[#FF3366] px-5 py-2 text-sm font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
              Sign up
            </button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="text-black border-2 border-black bg-white p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:hidden active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={28} strokeWidth={3} /> : <Menu size={28} strokeWidth={3} />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="absolute inset-x-0 top-[90px] z-40 mx-4 border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:hidden">
          <div className="flex flex-col gap-6 text-center text-lg font-black uppercase text-black">
            <Link href="#about" className="hover:bg-[#EAFF00] py-2 border-b-2 border-black/10" onClick={() => setIsMenuOpen(false)}>About</Link>
            <Link href="#platform" className="hover:bg-[#00E5FF] py-2 border-b-2 border-black/10" onClick={() => setIsMenuOpen(false)}>Platform</Link>
            <Link href="#pricing" className="hover:bg-[#7B61FF] py-2 border-b-2 border-black/10 hover:text-white" onClick={() => setIsMenuOpen(false)}>Pricing</Link>
            <Link href="#faq" className="hover:bg-[#FF3366] py-2 border-b-2 border-black/10 hover:text-white" onClick={() => setIsMenuOpen(false)}>FAQ</Link>
            
            <div className="mt-4 flex flex-col gap-4">
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                <button className="w-full border-4 border-black bg-white px-4 py-3 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1">
                  Login
                </button>
              </Link>
              <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                <button className="w-full border-4 border-black bg-[#FF3366] px-5 py-3 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1">
                  Sign up
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
