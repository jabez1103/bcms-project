"use client";

import React, { useState, useMemo } from "react";
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
  Sparkles
} from "lucide-react";

export default function HelpAndSupport() {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      title: "Clearance Guides",
      desc: "Step-by-step documentation on the student clearance workflow.",
      icon: <ShieldCheck className="text-purple-600" size={24} />,
      color: "hover:border-purple-200 hover:bg-purple-50/30",
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
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    return categories.filter(cat => 
      cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.links.some(link => link.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 pb-20 font-sans transition-colors duration-300">
      {/* PREMIUM HEADER: High-contrast Navy with Glassmorphism */}
      <div className="relative bg-[#0f172a] dark:bg-slate-950 text-white pt-20 pb-32 px-4 md:px-8 overflow-hidden transition-colors">
        {/* Decorative elements to match your UI style */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] -ml-24 -mb-24" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative bg-slate-900 p-5 rounded-2xl border border-white/10 backdrop-blur-xl">
                  <HelpCircle size={44} className="text-purple-400" />
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow-lg shadow-purple-900/20">
                    Knowledge Base
                  </span>
                  <span className="flex items-center gap-1 text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                    <Sparkles size={12} className="text-amber-400" /> v2.4.0
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">
                  How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">help you?</span>
                </h1>
                <p className="text-slate-400 text-lg max-w-xl leading-relaxed font-medium">
                  Search our documentation for the BISU Clearance Management System or browse categories below.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-14 relative z-20">
        {/* SEARCH BAR: Enhanced Shadow and Interaction */}
        <div className="relative mb-12 group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-[2.2rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-purple-500 dark:group-focus-within:text-purple-400 transition-colors" size={24} />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type your question (e.g., 'How to upload files?')..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] py-6 pl-16 pr-8 text-slate-900 dark:text-slate-100 shadow-2xl shadow-slate-200/60 dark:shadow-none outline-none focus:ring-0 focus:border-purple-500/50 transition-all text-xl font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        {/* DOCUMENTATION CARDS: Grid with Hover Effects */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((item, idx) => (
              <div key={idx} className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/80 dark:hover:shadow-none group ${item.color}`}>
                <div className="flex items-start gap-8">
                  <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] group-hover:scale-110 group-hover:bg-white dark:group-hover:bg-slate-700 transition-all duration-500 shadow-sm border border-slate-100 dark:border-slate-700">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{item.title}</h3>
                      <ArrowUpRight size={20} className="text-slate-300 dark:text-slate-600 group-hover:text-purple-500 dark:group-hover:text-purple-400 opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 font-medium italic opacity-80">{item.desc}</p>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {item.links.map((link, i) => (
                        <button key={i} className="flex items-center justify-between w-full p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 font-bold text-sm transition-all group/link shadow-sm hover:shadow-md dark:hover:shadow-none">
                          <span className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 group-hover/link:bg-purple-500 dark:group-hover/link:bg-purple-400 transition-colors"></div>
                            {link}
                          </span>
                          <ChevronRight size={18} className="text-slate-300 dark:text-slate-600 group-hover/link:translate-x-1 group-hover/link:text-purple-500 dark:group-hover/link:text-purple-400 transition-all" />
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
               <button onClick={() => setSearchQuery("")} className="mt-2 text-purple-600 dark:text-purple-400 font-bold hover:underline">Clear search</button>
            </div>
          )}
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
                If our documentation didn't answer your question, please contact our support desk at the <span className="text-purple-600 dark:text-purple-400 font-bold">BISU-Clarin MIS Office</span>.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <button className="group flex items-center justify-center gap-3 bg-slate-900 dark:bg-indigo-600 text-white px-10 py-5 rounded-[1.5rem] font-black hover:bg-slate-800 dark:hover:bg-indigo-500 transition-all shadow-xl hover:-translate-y-1 active:scale-95">
                <MessageSquare size={22} className="group-hover:rotate-12 transition-transform" />
                Contact Admin
              </button>
              <button className="flex items-center justify-center gap-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-10 py-5 rounded-[1.5rem] font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95">
                Quick Chat
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