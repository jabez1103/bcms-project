"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowRight, 
  Menu, X, ShieldCheck, Zap, Monitor 
} from "lucide-react";

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle Navbar Background Change on Scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [mobileMenuOpen]);

  const navItems = [
    { title: "Process", href: "#how-it-works" },
    { title: "Policy", href: "#policy" },
    { title: "Directory", href: "#directory" },
    { title: "Official Site", href: "https://bisu.edu.ph" },
  ];

  return (
    <div className="relative min-h-screen bg-white font-body selection:bg-purple-600 selection:text-white scroll-smooth">
      
      {/* --- MOBILE MENU OVERLAY (The Fix) --- */}
      <div className={`fixed inset-0 z-[150] lg:hidden transition-all duration-500 ${
        mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}>
        {/* Dark Glass Backdrop */}
        <div 
          className="absolute inset-0 bg-purple-950/95 backdrop-blur-2xl" 
          onClick={() => setMobileMenuOpen(false)} 
        />
        
        {/* Menu Content */}
        <div className="relative h-full flex flex-col p-8">
          <div className="flex justify-end">
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="p-4 rounded-2xl bg-white/10 text-white active:scale-90 transition-transform"
            >
              <X size={32} />
            </button>
          </div>

          <nav className="flex-1 flex flex-col justify-center gap-8">
            {navItems.map((item, idx) => (
              <Link 
                key={idx} 
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-5xl font-black text-white tracking-tighter hover:text-purple-400 transition-colors"
              >
                {item.title}
              </Link>
            ))}
            <Link 
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-4 inline-flex items-center gap-3 text-2xl font-bold text-purple-400 underline decoration-2 underline-offset-8"
            >
              Sign in to Portal <ArrowRight />
            </Link>
          </nav>

          <div className="pt-8 border-t border-white/10">
            <p className="text-white/40 text-[10px] font-bold tracking-[0.5em] uppercase text-center">
              BISU Clarin Campus • Engineering a Smarter University
            </p>
          </div>
        </div>
      </div>

      {/* --- PREMIUM GLASS NAVBAR --- */}
      <header 
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6 ${
          isScrolled 
            ? "py-3 bg-white/70 backdrop-blur-xl border-b border-purple-100 shadow-sm" 
            : "py-6 bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative h-11 w-11 transition-transform group-hover:rotate-12">
              <Image src="/logo.png" alt="BISU Logo" fill className="object-contain" />
            </div>
            <div className="flex flex-col">
              <h1 className={`text-sm font-black tracking-tighter leading-none transition-colors ${isScrolled ? "text-gray-900" : "text-white"}`}>
                BISU CLEARANCE
              </h1>
              <p className={`text-[10px] font-bold tracking-[0.25em] transition-colors ${isScrolled ? "text-purple-600" : "text-white/70"}`}>
                MANAGEMENT SYSTEM
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-10">
            {navItems.map((item, idx) => (
              <Link 
                key={idx} 
                href={item.href} 
                className={`group relative text-[11px] font-bold uppercase tracking-widest transition-colors ${
                  isScrolled ? "text-gray-600 hover:text-purple-600" : "text-white/80 hover:text-white"
                }`}
              >
                {item.title}
                <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-purple-500 transition-all group-hover:w-full" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="hidden sm:flex items-center gap-2 rounded-2xl bg-purple-600 px-7 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-xl shadow-purple-500/20 transition-all hover:bg-purple-700 hover:-translate-y-1 active:translate-y-0"
            >
              Sign In
              <ArrowRight size={14} />
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button 
              className={`lg:hidden p-2 rounded-xl transition-colors ${isScrolled ? "text-gray-900 bg-gray-100" : "text-white bg-white/10"}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative h-[95vh] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/bisu.png" 
            alt="Campus Background" 
            fill 
            className="object-cover scale-105" 
            priority 
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-950 via-purple-900/40 to-transparent" />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold tracking-[0.3em] uppercase mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            System Online: Clarin Campus
          </div>
          
          <h2 className="text-7xl md:text-[120px] font-black text-white tracking-tighter leading-[0.85] mb-8 drop-shadow-2xl">
            Hello <span className="text-purple-400">BISU'ans!</span>
          </h2>
          
          <p className="mt-6 text-lg md:text-2xl text-white/80 font-medium max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
            Experience a seamless, paperless clearance process. Managed digitally, 
            delivered instantly, built for the future of Bohol Island State University.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/login" className="group h-18 px-12 py-5 flex items-center justify-center rounded-[2rem] bg-white text-purple-900 font-bold text-xl shadow-2xl transition-all hover:scale-105 hover:bg-purple-50">
              Launch Portal
              <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
            </Link>
            <button className="h-18 px-12 py-5 flex items-center justify-center rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/30 text-white font-bold text-xl hover:bg-white/20 transition-all">
              Tutorials
            </button>
          </div>
        </div>
      </section>

      {/* --- THE PROCESS --- */}
      <section id="how-it-works" className="py-32 px-6 bg-[#FDFCFE]">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <h3 className="text-sm font-black text-purple-600 uppercase tracking-[0.4em] mb-4">Workflow</h3>
              <h4 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight leading-none">
                Get cleared in three <br /> simple steps.
              </h4>
            </div>
            <p className="text-gray-500 max-w-xs text-sm font-medium leading-relaxed">
              We've redesigned the clearance logic to eliminate bottlenecks and physical signatures.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: <Monitor className="w-8 h-8" />, 
                title: "Digital Request", 
                desc: "Log in and initiate your clearance. No more physical forms from the registrar.",
                color: "bg-blue-500"
              },
              { 
                icon: <Zap className="w-8 h-8" />, 
                title: "Live Tracking", 
                desc: "Monitor which office has signed off in real-time. Transparent and accountable.",
                color: "bg-purple-500"
              },
              { 
                icon: <ShieldCheck className="w-8 h-8" />, 
                title: "Final Approval", 
                desc: "Download your digital clearance certificate immediately after the final sign-off.",
                color: "bg-emerald-500"
              }
            ].map((step, i) => (
              <div key={i} className="group relative p-12 rounded-[3.5rem] bg-white border border-gray-100 transition-all duration-500 hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.08)] hover:-translate-y-4">
                <div className={`mb-8 inline-flex p-4 rounded-3xl text-white ${step.color} shadow-lg shadow-inherit transition-transform group-hover:rotate-12`}>
                  {step.icon}
                </div>
                <h5 className="text-2xl font-black text-gray-900 mb-4">{step.title}</h5>
                <p className="text-gray-500 leading-relaxed font-medium">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-gray-950 py-24 px-6 overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        <div className="mx-auto max-w-7xl text-center relative z-10">
          <div className="relative h-16 w-16 mx-auto mb-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <Image src="/logo.png" alt="BISU Logo" fill className="object-contain" />
          </div>
          <h5 className="text-white font-black text-xl tracking-tight mb-2">BISU Clarin Campus</h5>
          <p className="text-white/40 text-[10px] font-bold tracking-[0.5em] uppercase mb-12">
            Engineering a Smarter University
          </p>
          
          <div className="flex flex-wrap justify-center gap-10 mb-16">
            {navItems.map((item, i) => (
              <Link key={i} href={item.href} className="text-white/30 hover:text-purple-400 text-[10px] font-bold uppercase tracking-widest transition-colors">
                {item.title}
              </Link>
            ))}
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
             <p className="text-white/20 text-[10px] font-bold tracking-widest uppercase text-center md:text-left">
               © 2026 BISU Clarin Campus. All Rights Reserved.
             </p>
             <div className="flex gap-10">
               <Link href="#" className="text-white/20 hover:text-white text-[10px] uppercase font-black tracking-tighter transition-colors">Privacy</Link>
               <Link href="#" className="text-white/20 hover:text-white text-[10px] uppercase font-black tracking-tighter transition-colors">Terms</Link>
               <Link href="#" className="text-white/20 hover:text-white text-[10px] uppercase font-black tracking-tighter transition-colors">Support</Link>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}