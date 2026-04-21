"use client";

import Image from "next/image";
import Link from "next/link"; // Added for navigation
import { ArrowLeft } from "lucide-react"; // Added icon
import LoginForm from "./LoginForm";

export default function DesktopLogin() {
  return (
    <main className="relative flex h-screen w-full overflow-hidden bg-white dark:bg-slate-950">
      
      {/* LEFT SIDE: Hero Section */}
      <section className="relative hidden w-1/2 lg:block">
        <div className="absolute inset-0">
          <Image src="/bisu.png" alt="Campus" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 to-indigo-950/80 backdrop-brightness-100" />
        </div>

        <div className="relative z-10 flex h-full flex-col p-12 text-white">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 drop-shadow-2xl">
                <Image src="/left_logo.png" alt="Logo" fill className="object-contain" />
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
          </header>

          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <h1 className="text-5xl font-black tracking-tighter drop-shadow-2xl animate-in fade-in slide-in-from-left-8 duration-700">
              Hello BISU'ans!
            </h1>
            <p className="mt-4 text-xl font-medium text-white/80 tracking-wide">
              Welcome to BCMS
            </p>
          </div>
        </div>
      </section>

      {/* RIGHT SIDE: Authentication */}
      <section className="relative flex w-full flex-col items-center justify-center bg-[#F9FAFB] dark:bg-slate-950 lg:w-1/2">
        
        {/* BACK BUTTON - Positioned at the top-left of this section */}
        <Link 
          href="/" 
          className="group absolute left-8 top-8 flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] text-gray-400 dark:text-slate-500 transition-colors hover:text-purple-600 dark:hover:text-purple-400"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-800 transition-colors group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50 group-hover:text-purple-600 dark:group-hover:text-purple-400">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          </div>
          <span className="hidden sm:inline uppercase">Back</span>
        </Link>

        <div className="z-20 w-full max-w-[450px] px-6">
          <LoginForm />
        </div>
        
        <footer className="absolute bottom-6 text-center text-[13px] font-semibold text-gray-400 dark:text-slate-500 tracking-wide">
          © {new Date().getFullYear()} BISU Clarin Campus — All rights reserved
        </footer>
      </section>
    </main>
  );
}