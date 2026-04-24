"use client";
import { useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  ShieldCheck,
  Smartphone,
  LogOut,
  Clock,
  KeyRound,
  Monitor,
  Fingerprint,
  Bell,
  History,
  ChevronRight,
  X,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

/* ── Change-Password sub-panel ───────────────────────────────── */
function ChangePasswordPanel({ onClose }: { onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(onClose, 1800);
      } else {
        setError(data.message || "Failed to change password.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-4 animate-in fade-in duration-300">
        <div className="p-4 bg-emerald-100 dark:bg-emerald-500/10 rounded-full">
          <CheckCircle2 size={32} className="text-emerald-500" />
        </div>
        <p className="font-bold text-slate-900 dark:text-white text-center">Password changed successfully!</p>
        <p className="text-xs text-slate-500 text-center">Closing in a moment…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-black text-slate-900 dark:text-white text-sm">Change Password</h4>
        <button type="button" onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
          <X size={16} className="text-slate-400" />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 px-4 py-3 rounded-2xl text-xs font-bold border border-rose-100 dark:border-rose-500/20">
          <AlertCircle size={14} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Current password */}
      {[
        { label: "Current Password",  value: currentPassword, setter: setCurrentPassword, show: showCurrent, toggle: () => setShowCurrent(p => !p) },
        { label: "New Password",      value: newPassword,     setter: setNewPassword,     show: showNew,     toggle: () => setShowNew(p => !p) },
        { label: "Confirm New",       value: confirmPassword, setter: setConfirmPassword, show: showConfirm, toggle: () => setShowConfirm(p => !p) },
      ].map(({ label, value, setter, show, toggle }) => (
        <div key={label} className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</label>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={value}
              onChange={e => setter(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pr-10 pl-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-400 transition-all"
            />
            <button
              type="button"
              onClick={toggle}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
      ))}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-black rounded-2xl text-sm uppercase tracking-wider transition-all active:scale-[0.98]"
      >
        {loading ? "Saving…" : "Update Password"}
      </button>
    </form>
  );
}

/* ── Main Security Settings ──────────────────────────────────── */
export default function SecuritySettings() {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [autoLogout, setAutoLogout] = useState("30m");
  const [showPasswordPanel, setShowPasswordPanel] = useState(false);

  return (
    <div className="max-w-2xl mx-auto py-4 px-2 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* 1. STATUS HEADER */}
      <div className="bg-slate-900 dark:bg-slate-950 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-emerald-500/10 rounded-full border border-emerald-500/20">
            <ShieldCheck size={32} className="text-emerald-400" />
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight">Security Score: 85%</h2>
            <p className="text-slate-400 text-sm max-w-xs">Your account is almost fully protected. Just one more step to go!</p>
          </div>
          <button className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-[0.98]">
            Complete Security Audit
          </button>
        </div>
      </div>

      {/* 2. SETTING GROUPS */}
      <div className="space-y-8">

        {/* ACCESS & AUTHENTICATION */}
        <section className="space-y-3">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] px-4">Access &amp; Authentication</h4>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">

            {/* Password row — expands into inline panel */}
            <div className="border-b border-slate-100 dark:border-slate-800">
              {showPasswordPanel ? (
                <div className="p-6">
                  <ChangePasswordPanel onClose={() => setShowPasswordPanel(false)} />
                </div>
              ) : (
                <button
                  onClick={() => setShowPasswordPanel(true)}
                  className="w-full flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                      <KeyRound size={22} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-900 dark:text-slate-200">Account Password</p>
                      <p className="text-xs text-slate-500">Click to change your password</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300" />
                </button>
              )}
            </div>

            {/* 2FA */}
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl transition-colors ${is2FAEnabled ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"}`}>
                  <Fingerprint size={22} />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-200">Two-Factor Auth</p>
                  <p className="text-xs text-slate-500">Highly recommended</p>
                </div>
              </div>
              <button
                onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                className={`w-12 h-6 rounded-full transition-all relative ${is2FAEnabled ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${is2FAEnabled ? "left-7" : "left-1"}`} />
              </button>
            </div>
          </div>
        </section>

        {/* PREFERENCES */}
        <section className="space-y-3">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] px-4">Preferences</h4>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">

            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl">
                  <Clock size={22} />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-200">Auto Logout</p>
                  <p className="text-xs text-slate-500">Inactivity period</p>
                </div>
              </div>
              <select
                value={autoLogout}
                onChange={(e) => setAutoLogout(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 dark:text-white border-none text-xs font-bold py-2 px-3 rounded-xl outline-none"
              >
                <option value="15m">15m</option>
                <option value="30m">30m</option>
                <option value="1h">1h</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                  <Bell size={22} />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-200">Security Alerts</p>
                  <p className="text-xs text-slate-500">Email &amp; Push notifications</p>
                </div>
              </div>
              <button className="text-xs font-bold uppercase text-purple-600 dark:text-purple-400 px-4 py-2 bg-purple-50 dark:bg-purple-900/30 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors">
                Setup
              </button>
            </div>
          </div>
        </section>

        {/* ACTIVE DEVICES */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-4">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Active Devices</h4>
            <button className="text-rose-500 text-[10px] font-bold uppercase tracking-wider hover:underline">Logout All</button>
          </div>

          <div className="space-y-2">
            {[
              { device: "Asus Vivobook",    location: "Clarin, Bohol",  status: "Current", icon: <Monitor size={20} /> },
              { device: "iPhone 15 Pro",    location: "Tagbilaran",     status: "4h ago",  icon: <Smartphone size={20} /> },
              { device: "Chrome Windows",   location: "Cebu City",      status: "2d ago",  icon: <History size={20} /> },
            ].map((session, i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl group transition-all">
                <div className="flex items-center gap-4">
                  <div className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                    {session.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{session.device}</p>
                    <p className="text-[11px] text-slate-400 font-medium">{session.location} • {session.status}</p>
                  </div>
                </div>
                {i !== 0 && (
                  <button className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                    <LogOut size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}