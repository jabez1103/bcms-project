"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LoginForm from "./LoginForm";
import Typewriter from "../ui/Typewriter";

export default function MobileLogin() {
  return (
    <div className="relative min-h-screen w-full bg-slate-950 flex flex-col">
      {/* BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/bisu.png"
          alt="Background"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/40 to-slate-950" />
      </div>

      {/* HEADER */}
      <header className="relative z-50 flex items-center justify-between px-3 sm:px-4 py-4 sm:py-5">
        <div className="flex items-center gap-3">
          {/* BACK BUTTON */}
          <Link 
            href="/" 
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-white transition-all active:scale-90"
          >
            <ArrowLeft size={18} />
          </Link>

          {/* LOGO & TITLE */}
          <div className="flex items-center gap-2.5">
            <div className="relative h-9 w-9 overflow-hidden rounded-lg bg-white/10 p-1.5 backdrop-blur-md border border-white/20">
              <Image src="/logo.png" alt="Logo" fill sizes="36px" className="object-contain p-0.5" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-[11px] font-black tracking-tighter leading-none text-white">
                BISU CLEARANCE
              </h1>
              <p className="text-[8px] font-bold tracking-[0.2em] text-white/50">
                MANAGEMENT SYSTEM
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* LOGIN FORM CONTAINER */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-start px-2 sm:px-3 pt-12 sm:pt-14 pb-6 sm:pb-8">
        <div className="w-full max-w-[400px] animate-in fade-in zoom-in-95 duration-700">
          <div className="text-center mb-4 h-6 flex items-center justify-center">
            <Typewriter 
              text={["Welcome back, BISU'an!", "Sign in to your portal", "Secure Digital Clearance"]} 
              speed={60}
              pause={3000}
              className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]" 
            />
          </div>
          <LoginForm mobile />
        </div>
      </main>

      {/* DECORATIVE BOTTOM LINE */}
      <div className="absolute bottom-0 left-0 h-1.5 w-full bg-gradient-to-r from-transparent via-brand-500/20 to-transparent" />
    </div>
  );
}
