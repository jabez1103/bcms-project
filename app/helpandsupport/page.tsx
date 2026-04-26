"use client";

import React, { useState } from "react";
import { 
  Search, 
  BookOpen, 
  ShieldCheck, 
  ChevronRight,
  HelpCircle,
  FileText,
  MessageSquare,
  LifeBuoy,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  ClipboardCheck,
  UserCheck,
  Shield
} from "lucide-react";

const QUICK_ANSWERS: Record<string, string> = {
  "Requirement Checklist":
    "Open Signatories and complete each listed requirement. Upload only when allowed, then monitor status until all items are approved.",
  "Signatory Process":
    "Signatories create requirements, review submissions, and approve/reject with optional feedback. Students are notified after each decision.",
  "Digital Signatures":
    "BCMS tracks digital submission and approval flow. Ensure uploaded files are clear and complete before signatory review.",
  "Updating Profile":
    "Go to Profile or Settings > Account, update your email/contact number, then save. Changes sync to your account immediately.",
  "Password Recovery":
    "Use the forgot password flow on login or change your password from Settings > Security when already signed in.",
  "Privacy Settings":
    "Manage security and notification preferences in Settings. Enable only the alerts you want to receive.",
  "Dashboard Overview":
    "Use your role dashboard for current tasks, progress stats, and quick actions. Check notifications for real-time updates.",
  "Viewing Logs":
    "Open Activity Logs to review recent actions, submission events, and system history tied to your account.",
  "Signatory Directory":
    "Go to Signatories to find department requirements, office schedule, and requirement-specific instructions.",
  "Upload Failures":
    "Check file size/type, verify upload permission is enabled, then retry. If issue persists, contact support with screenshot details.",
  "Login Issues":
    "Verify credentials, check session validity, and clear stale browser sessions. If your session was replaced, log in again.",
  "Contact Admin":
    "Use the Contact Admin or Quick Chat actions below to send a support request directly to the MIS office.",
};

export default function HelpAndSupport() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const supportEmail = "mis.clarin@bisu.edu.ph";
  const quickChatHref = `mailto:${supportEmail}?subject=${encodeURIComponent("BCMS Quick Chat Request")}`;
  const guideSections = [
    {
      id: "student-guide",
      title: "Student Guide",
      icon: <UserCheck size={18} className="text-brand-500" />,
      steps: [
        "Sign in using your institutional account on the Login page.",
        "Open Signatories to view all active requirements for your year level.",
        "Open each requirement detail and review the submission rules.",
        "Upload your file if upload is enabled. Add comment only if comments are enabled.",
        "Track progress in Signatories and Activity Logs until all requirements are approved.",
      ],
    },
    {
      id: "signatory-guide",
      title: "Signatory Guide",
      icon: <ClipboardCheck size={18} className="text-sky-500" />,
      steps: [
        "Set up requirements in Manage Requirements for the active clearance period.",
        "Configure permission toggles (allow upload, allow comments) per requirement.",
        "Review student submissions in Review Submissions.",
        "Approve or reject submissions and provide optional feedback when needed.",
        "Monitor queue and status trends from the Signatory Home dashboard.",
      ],
    },
    {
      id: "admin-guide",
      title: "Admin Guide",
      icon: <Shield size={18} className="text-emerald-500" />,
      steps: [
        "Create and manage user accounts (student, signatory, admin) in User Accounts.",
        "Publish and manage active periods from Clearance Periods.",
        "Track institution-wide completion in Clearance Progress.",
        "Use filters (role, year, department) to identify bottlenecks quickly.",
        "Review logs and notifications to verify workflow health and user activity.",
      ],
    },
  ];

  const categories = [
    {
      title: "Clearance Guides",
      desc: "Step-by-step documentation on the student clearance workflow.",
      icon: <ShieldCheck className="text-brand-600" size={24} />,
      color: "hover:border-brand-200 hover:bg-brand-50/30",
      links: ["Requirement Checklist", "Signatory Process", "Digital Signatures"]
    },
    {
      title: "Account Management",
      desc: "How to update your profile and manage security settings.",
      icon: <FileText className="text-blue-600" size={24} />,
      color: "hover:border-blue-200 hover:bg-blue-50/30",
      links: ["Updating Profile", "Password Recovery", "Privacy Settings"]
    },
    {
      title: "System Navigation",
      desc: "A quick tour of the BCMS Student Dashboard features.",
      icon: <BookOpen className="text-emerald-600" size={24} />,
      color: "hover:border-emerald-200 hover:bg-emerald-50/30",
      links: ["Dashboard Overview", "Viewing Logs", "Signatory Directory"]
    },
    {
      title: "Technical Help",
      desc: "Troubleshooting common errors and platform issues.",
      icon: <LifeBuoy className="text-rose-600" size={24} />,
      color: "hover:border-rose-200 hover:bg-rose-50/30",
      links: ["Upload Failures", "Login Issues", "Contact Admin"]
    }
  ];

  // Simple filter logic for better UX
  const filteredCategories = (() => {
    if (!searchQuery) return categories;
    const query = searchQuery.toLowerCase();
    return categories.filter(cat => 
      cat.title.toLowerCase().includes(query) ||
      cat.desc.toLowerCase().includes(query) ||
      cat.links.some(link => {
        const answer = QUICK_ANSWERS[link] ?? "";
        return link.toLowerCase().includes(query) || answer.toLowerCase().includes(query);
      })
    );
  })();

  return (
    <div id="help-top" className="min-h-screen px-3 sm:px-4 lg:px-6 bg-[#fbfcff] dark:bg-slate-950 pb-20 font-sans transition-colors duration-300">
      {/* PREMIUM HEADER: High-contrast Navy with Glassmorphism */}
      <div className="relative bg-[#0f172a] dark:bg-slate-950 text-white pt-14 md:pt-20 pb-20 md:pb-32 px-2 sm:px-4 lg:px-6 overflow-hidden transition-colors">
        {/* Decorative elements to match your UI style */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-600/10 rounded-full blur-[120px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] -ml-24 -mb-24" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative bg-slate-900 p-3.5 md:p-5 rounded-2xl border border-white/10 backdrop-blur-xl">
                  <HelpCircle size={32} className="text-brand-400" />
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-gradient-to-r from-brand-600 to-brand-600 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow-lg shadow-brand-900/20">
                    Knowledge Base
                  </span>
                  <span className="flex items-center gap-1 text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                    <Sparkles size={12} className="text-amber-400" /> v2.4.0
                  </span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-2">
                  How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-blue-400">help you?</span>
                </h1>
                <p className="text-slate-400 text-sm md:text-lg max-w-xl leading-relaxed font-medium">
                  Search our documentation for the BISU Clearance Management System or browse categories below.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-0 -mt-10 md:-mt-14 relative z-20">
        {/* SEARCH BAR: Enhanced Shadow and Interaction */}
        <div className="relative mb-8 md:mb-12 group">
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-500/20 to-blue-500/20 rounded-[2.2rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
          <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-brand-500 dark:group-focus-within:text-brand-400 transition-colors" size={20} />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type your question (e.g., 'How to upload files?')..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] py-4 md:py-6 pl-12 md:pl-16 pr-5 md:pr-8 text-slate-900 dark:text-slate-100 shadow-2xl shadow-slate-200/60 dark:shadow-none outline-none focus:ring-0 focus:border-brand-500/50 transition-all text-base md:text-xl font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        {/* DOCUMENTATION CARDS: Grid with Hover Effects */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((item, idx) => (
              <div key={idx} className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-10 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/80 dark:hover:shadow-none group ${item.color}`}>
                <div className="flex items-start gap-4 md:gap-8">
                  <div className="p-3 md:p-5 bg-slate-50 dark:bg-slate-800 rounded-[1rem] md:rounded-[1.5rem] group-hover:scale-110 group-hover:bg-white dark:group-hover:bg-slate-700 transition-all duration-500 shadow-sm border border-slate-100 dark:border-slate-700">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{item.title}</h3>
                      <ArrowUpRight size={20} className="text-slate-300 dark:text-slate-600 group-hover:text-brand-500 dark:group-hover:text-brand-400 opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed mb-4 md:mb-8 font-medium italic opacity-80">{item.desc}</p>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {item.links.map((link, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setSearchQuery(link);
                            setSelectedTopic(link);
                            const answerSection = document.getElementById("quick-answers");
                            answerSection?.scrollIntoView({ behavior: "smooth", block: "start" });
                          }}
                          className="flex items-center justify-between w-full p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 font-bold text-sm transition-all group/link shadow-sm hover:shadow-md dark:hover:shadow-none"
                        >
                          <span className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 group-hover/link:bg-brand-500 dark:group-hover/link:bg-brand-400 transition-colors"></div>
                            {link}
                          </span>
                          <ChevronRight size={18} className="text-slate-300 dark:text-slate-600 group-hover/link:translate-x-1 group-hover/link:text-brand-500 dark:group-hover/link:text-brand-400 transition-all" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-300 dark:border-slate-700">
               <HelpCircle size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
               <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">No results found for "{searchQuery}"</p>
               <button onClick={() => setSearchQuery("")} className="mt-2 text-brand-600 dark:text-brand-400 font-bold hover:underline">Clear search</button>
            </div>
          )}
        </div>

        {/* USER GUIDE SECTION */}
        <div className="mt-14 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 md:p-10 shadow-xl shadow-slate-200/40 dark:shadow-none">
          <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-600 dark:text-brand-400 mb-2">
                User Guide
              </p>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                How to use the system
              </h2>
            </div>
            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-slate-200 transition-all active:scale-95"
            >
              Print Guide
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {guideSections.map((section) => (
              <article
                key={section.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  {section.icon}
                  <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    {section.title}
                  </h3>
                </div>
                <ol className="space-y-2.5">
                  {section.steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 size={14} className="mt-0.5 text-brand-500 shrink-0" />
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
        </div>

        {/* QUICK ANSWERS PANEL */}
        <div
          id="quick-answers"
          className="mt-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 md:p-10 shadow-xl shadow-slate-200/40 dark:shadow-none"
        >
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-600 dark:text-brand-400 mb-2">
                Quick Answers
              </p>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {selectedTopic ?? "Select a topic above"}
              </h2>
            </div>
            {selectedTopic && (
              <button
                type="button"
                onClick={() => setSelectedTopic(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Clear Topic
              </button>
            )}
          </div>
          <p className="mt-5 text-sm md:text-base font-medium leading-relaxed text-slate-600 dark:text-slate-300">
            {selectedTopic
              ? QUICK_ANSWERS[selectedTopic] ??
                "No detailed answer is available for this topic yet. Please use Contact Admin for direct assistance."
              : "Choose any topic card item to load a focused answer here. This helps users quickly resolve common issues without leaving the page."}
          </p>
        </div>

        {/* REFINED FOOTER CTA: High-performance Support Card */}
        <div className="mt-16 relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-slate-200/50 dark:shadow-none">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.05] text-slate-900 dark:text-slate-100 pointer-events-none">
            <MessageSquare size={200} />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-md">
              <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tighter mb-4">Still feeling stuck?</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                If our documentation didn't answer your question, please contact our support desk at the <span className="text-brand-600 dark:text-brand-400 font-bold">BISU-Clarin MIS Office</span>.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <a
                href={`mailto:${supportEmail}?subject=${encodeURIComponent("BCMS Support Request")}`}
                className="group flex items-center justify-center gap-3 bg-slate-900 dark:bg-brand-600 text-white px-10 py-5 rounded-[1.5rem] font-black hover:bg-slate-800 dark:hover:bg-brand-500 transition-all shadow-xl hover:-translate-y-1 active:scale-95"
              >
                <MessageSquare size={22} className="group-hover:rotate-12 transition-transform" />
                Contact Admin
              </a>
              <a href={quickChatHref} className="flex items-center justify-center gap-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-10 py-5 rounded-[1.5rem] font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95">
                Quick Chat
              </a>
              <button
                onClick={() => {
                  const top = document.getElementById("help-top");
                  if (top) top.scrollIntoView({ behavior: "smooth", block: "start" });
                  else window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex items-center justify-center gap-3 bg-brand-50 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 px-10 py-5 rounded-[1.5rem] font-black hover:bg-brand-100 dark:hover:bg-brand-500/30 transition-all active:scale-95"
              >
                Back to Top
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
            Bohol Island State University • Clarin Campus
          </p>
        </div>
      </div>
    </div>
  );
}
