"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowRight, 
  Menu, X, ShieldCheck,
  Zap, Monitor, Moon, Sun 
  } from "lucide-react";
import { useTheme } from "next-themes";

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [typedHeadline, setTypedHeadline] = useState("");
  const [typedTagline, setTypedTagline] = useState("");
  const [isHeadlineDone, setIsHeadlineDone] = useState(false);
  const [isTaglineDone, setIsTaglineDone] = useState(false);

  const TYPEWRITER_SPEED: "slow" | "normal" | "fast" = "normal";
  const SPEED_MS = { slow: 90, normal: 55, fast: 35 } as const;
  const headlineTarget = "BISU'ans.";
  const taglineTarget =
    "Experience a streamlined, paperless clearance journey. Digitally managed and instantly delivered, engineered for the modern BISU community.";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const speed = SPEED_MS[TYPEWRITER_SPEED];
    let mainTimer: ReturnType<typeof setTimeout> | undefined;

    const startTyping = () => {
      setIsHeadlineDone(false);
      setIsTaglineDone(false);
      setTypedHeadline("");
      setTypedTagline("");

      let headlineIndex = 0;
      const typeHeadline = () => {
        if (headlineIndex <= headlineTarget.length) {
          setTypedHeadline(headlineTarget.slice(0, headlineIndex));
          headlineIndex += 1;
          mainTimer = setTimeout(typeHeadline, speed);
        } else {
          setIsHeadlineDone(true);
          let taglineIndex = 0;
          const typeTagline = () => {
            if (taglineIndex <= taglineTarget.length) {
              setTypedTagline(taglineTarget.slice(0, taglineIndex));
              taglineIndex += 1;
              mainTimer = setTimeout(typeTagline, Math.max(15, speed - 15));
            } else {
              setIsTaglineDone(true);
              // Wait for 10 seconds then restart
              mainTimer = setTimeout(startTyping, 10000);
            }
          };
          typeTagline();
        }
      };
      typeHeadline();
    };

    startTyping();
    return () => {
      if (mainTimer) clearTimeout(mainTimer);
    };
  }, []);

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

  const handleNavAction = (href: string) => {
    if (href.startsWith("#")) {
      const id = href.slice(1);
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      setMobileMenuOpen(false);
      return;
    }
    window.open(href, "_blank", "noopener,noreferrer");
  };

  const navItems = [
    { title: "Home", href: "#home" },
    { title: "Workflow", href: "#how-it-works" },
    { title: "Guidelines", href: "#policy" },
    { title: "Directory", href: "#directory" },
    { title: "Official Site", href: "https://bisu.edu.ph" },
  ];

  return (
    <div className="relative min-h-screen bg-white dark:bg-slate-950 font-body selection:bg-brand-600 selection:text-white scroll-smooth transition-colors duration-300">
      
      {/* --- MOBILE MENU OVERLAY (The Fix) --- */}
      <div className={`fixed inset-0 z-[150] lg:hidden transition-all duration-500 ${
        mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}>
        {/* Dark Glass Backdrop */}
        <div 
          className="absolute inset-0 bg-brand-950/95 backdrop-blur-2xl" 
          onClick={() => setMobileMenuOpen(false)} 
        />
        
        {/* Menu Content */}
        <div className="relative h-full flex flex-col p-5 sm:p-8">
          <div className="flex justify-end">
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 sm:p-4 rounded-2xl bg-white/10 text-white active:scale-90 transition-transform"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 flex flex-col justify-center items-start gap-5 sm:gap-8">
            {navItems.map((item, idx) => (
              <button
                key={idx} 
                onClick={() => handleNavAction(item.href)}
                className="text-3xl sm:text-5xl font-black text-white tracking-tighter hover:text-brand-400 transition-colors text-left"
              >
                {item.title}
              </button>
            ))}
            <Link 
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-3 sm:mt-4 inline-flex items-center gap-2.5 text-xl sm:text-2xl font-bold text-brand-400 underline decoration-2 underline-offset-8"
            >
              Sign in to Portal <ArrowRight />
            </Link>

            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="mt-5 sm:mt-8 self-start inline-flex items-center gap-2.5 px-4 py-2.5 sm:px-6 sm:py-3 rounded-2xl bg-white/10 text-white font-bold text-base sm:text-xl hover:bg-white/20 transition-all active:scale-95"
              >
                {theme === 'dark' ? (
                  <><Sun size={24} /> Light Mode</>
                ) : (
                  <><Moon size={24} /> Dark Mode</>
                )}
              </button>
            )}
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
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-3 sm:px-4 md:px-6 ${
          isScrolled 
            ? "py-2.5 sm:py-3 bg-white/70 dark:bg-slate-950/80 backdrop-blur-xl border-b border-brand-100 dark:border-slate-800 shadow-sm" 
            : "py-3.5 sm:py-6 bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3 group cursor-pointer">
            <div className="relative h-9 w-9 sm:h-11 sm:w-11 transition-transform group-hover:rotate-12">
              <Image src="/logo.png" alt="BISU Logo" fill className="object-contain" />
            </div>
            <div className="flex flex-col">
              <h1 className={`text-xs font-black tracking-tight leading-none transition-colors ${isScrolled ? "text-gray-900 dark:text-white" : "text-white"}`}>
                BISU CLEARANCE
              </h1>
              <p className={`text-[9px] font-bold tracking-[0.2em] transition-colors ${isScrolled ? "text-brand-600" : "text-white/70"}`}>
                MANAGEMENT SYSTEM
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-10">
            {navItems.map((item, idx) => (
              <button
                key={idx} 
                onClick={() => handleNavAction(item.href)}
                className={`group relative text-[10px] font-bold uppercase tracking-widest transition-colors ${
                  isScrolled ? "text-gray-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400" : "text-white/80 hover:text-white"
                }`}
              >
                {item.title}
                <span className="absolute -bottom-1 left-0 h-[1.5px] w-0 bg-brand-500 transition-all group-hover:w-full" />
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`p-2.5 rounded-xl transition-colors hidden sm:flex items-center justify-center ${
                  isScrolled 
                  ? "text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700" 
                  : "text-white bg-white/10 hover:bg-white/20"
                }`}
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}

            <Link 
              href="/login" 
              className="hidden sm:flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-brand-500/20 transition-all hover:bg-brand-700 hover:-translate-y-0.5 active:translate-y-0"
            >
              Sign In
              <ArrowRight size={12} />
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button 
              className={`lg:hidden p-2 rounded-xl transition-colors ${isScrolled ? "text-gray-900 bg-gray-100 dark:text-white dark:bg-slate-800" : "text-white bg-white/10"}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section id="home" className="relative h-[90vh] sm:h-[95vh] w-full flex items-center justify-center overflow-hidden scroll-mt-28">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/bisu.png" 
            alt="Campus Background" 
            fill 
            className="object-cover scale-105" 
            priority 
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-950 via-brand-950/40 to-transparent" />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="relative z-10 text-center px-3 sm:px-4 md:px-6 max-w-5xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[9px] sm:text-[10px] font-bold tracking-[0.25em] sm:tracking-[0.3em] uppercase mb-5 sm:mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
            </span>
            System Online: Clarin Campus
          </div>
          
          <h2
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] mb-5 sm:mb-8 drop-shadow-2xl min-h-[1.2em]"
            aria-live="polite"
          >
            Welcome,{" "}
            <span className="text-brand-400">{typedHeadline}</span>
            {!isHeadlineDone && (
              <span className="inline-block ml-1 text-brand-400 animate-pulse" aria-hidden="true">
                |
              </span>
            )}
            <span className="sr-only">Welcome {headlineTarget}</span>
          </h2>

          <div className="mx-auto max-w-3xl min-h-[4rem] sm:min-h-[5rem]">
            <p className="text-xs sm:text-sm md:text-lg text-white font-medium mx-auto leading-relaxed drop-shadow-lg opacity-90">
              {typedTagline}
              {!isTaglineDone && (
                <span className="inline-block ml-1 text-white/90 animate-pulse" aria-hidden="true">
                  |
                </span>
              )}
            </p>
          </div>

          <div className="mt-7 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5">
            <Link href="/login" className="group h-11 sm:h-14 px-7 sm:px-10 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-900 text-brand-900 dark:text-brand-100 font-black text-[11px] sm:text-sm uppercase tracking-widest shadow-[0_20px_40px_-10px_rgba(255,255,255,0.3)] dark:shadow-[0_20px_40px_-10px_rgba(124,58,237,0.3)] transition-all hover:scale-[1.02] hover:bg-brand-50 dark:hover:bg-slate-800 active:scale-95">
              Access Portal
              <ArrowRight size={16} className="ml-2 group-hover:translate-x-1.5 transition-transform" />
            </Link>
            <button
              onClick={() => handleNavAction("#policy")}
              className="h-11 sm:h-14 px-7 sm:px-10 flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/25 text-white font-black text-[11px] sm:text-sm uppercase tracking-widest hover:bg-white/15 transition-all active:scale-95"
            >
              System Guide
            </button>
          </div>
        </div>
      </section>

      {/* --- THE PROCESS --- */}
      <section id="how-it-works" className="py-14 md:py-32 px-3 sm:px-4 md:px-6 bg-[#FDFCFE] dark:bg-slate-950 transition-colors duration-300 scroll-mt-28">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-end justify-between mb-10 md:mb-20 gap-5 md:gap-8">
            <div className="max-w-2xl">
              <h3 className="text-[9px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-[0.4em] mb-4">Workflow</h3>
              <h4 className="text-xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                Complete clearance in three <br /> straightforward steps.
              </h4>
            </div>
            <p className="text-gray-500 dark:text-slate-400 max-w-xs text-sm font-medium leading-relaxed">
              A streamlined digital flow removes paperwork delays and manual sign-off bottlenecks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            {[
              { 
                icon: <Monitor className="w-8 h-8" />, 
                title: "Digital Initiation", 
                desc: "Start your clearance process online without the need for physical registrar forms.",
                color: "bg-blue-500"
              },
              { 
                icon: <Zap className="w-8 h-8" />, 
                title: "Real-Time Tracking", 
                desc: "Track your approval status across all departments with complete transparency.",
                color: "bg-brand-500"
              },
              { 
                icon: <ShieldCheck className="w-8 h-8" />, 
                title: "Instant Clearance", 
                desc: "Secure your official clearance certificate immediately upon final departmental sign-off.",
                color: "bg-emerald-500"
              }
            ].map((step, i) => (
              <div key={i} className="group relative p-5 md:p-10 rounded-2xl md:rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] dark:hover:shadow-none hover:-translate-y-2 hover:border-brand-100 dark:hover:border-brand-900">
                <div className={`mb-4 md:mb-8 inline-flex p-2.5 md:p-3.5 rounded-xl md:rounded-2xl text-white ${step.color} shadow-lg shadow-inherit transition-transform group-hover:rotate-12`}>
                  {step.icon}
                </div>
                <h5 className="text-base md:text-lg font-black text-gray-900 dark:text-white mb-2.5 md:mb-4 tracking-tight">{step.title}</h5>
                <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed font-medium">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- POLICY --- */}
      <section id="policy" className="py-14 md:py-28 px-3 sm:px-4 md:px-6 bg-white dark:bg-slate-950 transition-colors duration-300 scroll-mt-28">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 md:gap-8 mb-8 md:mb-14">
            <div className="max-w-3xl">
              <h3 className="text-[9px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-[0.35em] mb-4">
                Policy
              </h3>
              <h4 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                Clear policies for a faster clearance experience.
              </h4>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium max-w-md">
              Follow these core policies so each request is reviewed accurately and on time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {[
              {
                title: "One Account, One Session",
                desc: "Only one active account session is allowed for security. Logging in on a new device may replace the old session.",
              },
              {
                title: "Complete All Requirements",
                desc: "Every assigned office requirement must be fulfilled before final clearance can be approved and released.",
              },
              {
                title: "Use Official Credentials",
                desc: "Always use your institutional account information to prevent mismatched records and login errors.",
              },
            ].map((item, i) => (
              <article
                key={i}
                className="rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/70 p-5 md:p-8 hover:border-brand-200 dark:hover:border-brand-700 transition-all duration-300 hover:shadow-sm"
              >
                <p className="text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-3">
                  Rule {String(i + 1).padStart(2, "0")}
                </p>
                <h5 className="text-lg font-black text-slate-900 dark:text-white mb-3">{item.title}</h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* --- DIRECTORY --- */}
      <section id="directory" className="py-14 md:py-28 px-3 sm:px-4 md:px-6 bg-[#F8FAFC] dark:bg-slate-900/30 transition-colors duration-300 scroll-mt-28">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 md:gap-8 mb-8 md:mb-14">
            <div className="max-w-3xl">
              <h3 className="text-[9px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-[0.35em] mb-4">
                Directory
              </h3>
              <h4 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                Offices that handle each stage of your clearance.
              </h4>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium max-w-md">
              Contact the right office first to prevent repeated submissions and missed approvals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { office: "Registrar", role: "Records Verification", contact: "registrar@bisu.edu.ph" },
              { office: "Library", role: "Borrowed Material Clearance", contact: "library@bisu.edu.ph" },
              { office: "Student Affairs", role: "Conduct & Compliance", contact: "sas@bisu.edu.ph" },
              { office: "Cashier", role: "Financial Settlement", contact: "cashier@bisu.edu.ph" },
            ].map((item, i) => (
              <article
                key={i}
                className="rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 md:p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
                  Office
                </p>
                <h5 className="text-lg font-black text-slate-900 dark:text-white">{item.office}</h5>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">{item.role}</p>
                <p className="text-xs text-brand-600 dark:text-brand-400 mt-4 font-bold">{item.contact}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-gray-950 dark:bg-slate-950 py-20 md:py-24 px-3 sm:px-4 md:px-6 overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />
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
              <button
                key={i}
                onClick={() => handleNavAction(item.href)}
                className="text-white/30 hover:text-brand-400 text-[10px] font-bold uppercase tracking-widest transition-colors"
              >
                {item.title}
              </button>
            ))}
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
             <p className="text-white/20 text-[10px] font-bold tracking-widest uppercase text-center md:text-left">
               © 2026 BISU Clarin Campus. All Rights Reserved.
             </p>
             <div className="flex gap-10">
               <Link href="/helpandsupport" className="text-white/20 hover:text-white text-[10px] uppercase font-black tracking-tighter transition-colors">Privacy</Link>
               <Link href="/helpandsupport" className="text-white/20 hover:text-white text-[10px] uppercase font-black tracking-tighter transition-colors">Terms</Link>
               <Link href="/helpandsupport" className="text-white/20 hover:text-white text-[10px] uppercase font-black tracking-tighter transition-colors">Support</Link>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}