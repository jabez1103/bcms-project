"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ShieldCheck, Lock, UserIcon, MapPin, Mail, Phone, Check, Sidebar, Maximize, Languages, Eye, Moon, Sun, Type } from "lucide-react";

export default function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [fontSize, setFontSize] = useState(1); // 0: Small, 1: Standard, 2: Large
  const [language, setLanguage] = useState('en');
  const [layout, setLayout] = useState('standard');
  const [highContrast, setHighContrast] = useState(false);

  const fontSizes = ["Small", "Standard", "Large"];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* --- VISUAL THEME & CONTRAST --- */}
      <section className="space-y-3">
        <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-4">Visual Style</h4>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">
          
          {/* Theme Switcher */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl transition-colors ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-amber-50 text-amber-500'}`}>
                {theme === 'dark' ? <Moon size={22} /> : <Sun size={22} />}
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-200">Interface Theme</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Light or Dark preference</p>
              </div>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
              {['light', 'dark', 'system'].map((t) => (
                <button 
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all capitalize ${theme === t ? 'bg-white dark:bg-slate-700 shadow-md text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* High Contrast */}
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl transition-colors ${highContrast ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                <Eye size={22} />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-200">High Contrast</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Enhance visibility</p>
              </div>
            </div>
            <button 
              onClick={() => setHighContrast(!highContrast)}
              className={`w-12 h-6 rounded-full transition-all relative ${highContrast ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${highContrast ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </section>

      {/* --- TYPOGRAPHY & REGIONAL --- */}
      <section className="space-y-3">
        <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-4">Accessibility & Language</h4>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">
          
          {/* Font Size Stepper */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                <Type size={22} />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-200">Font Size</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{fontSizes[fontSize]} view</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-100 dark:border-slate-800">
              <button 
                disabled={fontSize === 0}
                onClick={() => setFontSize(fontSize - 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-700 dark:text-white shadow-sm disabled:opacity-30 font-bold"
              >–</button>
              <span className="text-xs font-bold w-4 text-center">{fontSize + 1}</span>
              <button 
                disabled={fontSize === 2}
                onClick={() => setFontSize(fontSize + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-700 dark:text-white shadow-sm disabled:opacity-30 font-bold"
              >+</button>
            </div>
          </div>

          {/* Language Selection */}
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                <Languages size={22} />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-200">Language</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{language === 'en' ? 'English (US)' : 'Filipino (PH)'}</p>
              </div>
            </div>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 dark:text-white border-none text-xs font-bold py-2 px-4 rounded-xl outline-none appearance-none cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <option value="en">English</option>
              <option value="fil">Filipino</option>
            </select>
          </div>
        </div>
      </section>

      {/* --- DASHBOARD PREFERENCE --- */}
      <section className="space-y-3">
        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] px-4">Dashboard Layout</h4>
        <div className="grid grid-cols-2 gap-4">
          {[
            { id: 'standard', label: 'Sidebar', icon: <Sidebar size={20} />, desc: 'Classic navigation' },
            { id: 'compact', label: 'Expanded', icon: <Maximize size={20} />, desc: 'Focus on content' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setLayout(item.id)}
              className={`p-5 rounded-[2rem] text-left border-2 transition-all space-y-3 relative overflow-hidden ${
                layout === item.id 
                ? 'border-purple-500 bg-white dark:bg-slate-800 shadow-md' 
                : 'border-transparent bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 opacity-70'
              }`}
            >
              <div className={`p-2 w-fit rounded-lg ${layout === item.id ? 'bg-purple-500 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                {item.icon}
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-200 text-sm">{item.label}</p>
                <p className="text-[10px] text-slate-500">{item.desc}</p>
              </div>
              {layout === item.id && (
                <div className="absolute top-4 right-4 text-purple-500">
                  <Check size={16} strokeWidth={3} />
                </div>
              )}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}