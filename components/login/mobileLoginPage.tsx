"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LoginForm from "./LoginForm";

export default function MobileLogin() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-purple-950">
      {/* BACKGROUND LAYER */}
      <div className="absolute inset-0">
        <Image src="/bisu.png" alt="Background" fill priority className="object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/90 via-purple-900/40 to-black/90" />
      </div>

      {/* HEADER */}
      <header className="relative z-50 flex items-center justify-between px-6 py-8">
        <div className="flex items-center gap-3">
          {/* BACK BUTTON */}
          <Link 
            href="/" 
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white transition-all active:scale-90"
          >
            <ArrowLeft size={20} />
          </Link>

          {/* LOGO & TITLE */}
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 overflow-hidden rounded-xl bg-white/10 p-2 backdrop-blur-md border border-white/20">
              <Image src="/left_logo.png" alt="Logo" fill className="object-contain p-1" />
            </div>
              <div className="flex flex-col">

                    <h1 className="text-sm font-black tracking-tighter leading-none transition-colors">
                      BISU CLEARANCE
                    </h1>
                    <p className="text-[10px] font-bold tracking-[0.25em] transition-colors ">
                      MANAGEMENT SYSTEM
                    </p>
                </div>
          </div>
        </div>

        
       
      </header>

      {/* LOGIN FORM CONTAINER */}
      <main className="relative z-20 flex h-[calc(100vh-120px)] items-center justify-center px-5">
        <div className="w-full animate-in fade-in zoom-in-95 duration-700">
          <LoginForm mobile />
        </div>
      </main>

      {/* DECORATIVE BOTTOM LINE */}
      <div className="absolute bottom-0 left-0 h-1.5 w-full bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
    </div>
  );
}