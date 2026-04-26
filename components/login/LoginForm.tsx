"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { roleHomePath, writeAuthTabSync } from "@/lib/authSync";

interface LoginFormProps {
  mobile?: boolean;
}

export default function LoginForm({ mobile = false }: LoginFormProps) {
  const searchParams = useSearchParams();
  const loginRequestInFlight = useRef(false);

  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // New state
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");
  const [sessionNotice, setSessionNotice] = useState("");

  useEffect(() => {
    const reason = searchParams.get("reason");
    if (reason === "session-replaced") {
      setSessionNotice(
        "Your session was closed because your account is active on another device"
      );
    }
  }, [searchParams]);

  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const validateSessionOnce = async (): Promise<{ ok: boolean; role?: string }> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    try {
      const res = await fetch("/api/session/validate", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        signal: controller.signal,
      });
      if (!res.ok) return { ok: false };
      const data = (await res.json()) as { ok?: boolean; role?: unknown };
      if (!data?.ok) return { ok: false };
      const role = typeof data.role === "string" ? data.role.trim() : "";
      return { ok: true, ...(role ? { role } : {}) };
    } catch {
      return { ok: false };
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const waitForSessionValidation = async (
    attempts = 5
  ): Promise<{ ok: boolean; role?: string }> => {
    for (let i = 0; i < attempts; i++) {
      const result = await validateSessionOnce();
      if (result.ok) return result;
      await wait(250);
    }
    return { ok: false };
  };

  const navigateToRoleHome = (role: string) => {
    const destination = roleHomePath(role);
    window.location.replace(destination);
    // Production fallback: force navigation if replace() is ignored/stalled.
    window.setTimeout(() => {
      if (window.location.pathname === "/login") {
        window.location.assign(destination);
      }
    }, 1500);
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (loginRequestInFlight.current || isLoading) return;
    loginRequestInFlight.current = true;
    setIsLoading(true);
    setError("");
    setSuccess("");
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const submittedEmail = String(formData.get("email") ?? email).trim();
    const submittedPassword = String(formData.get("password") ?? password);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: submittedEmail,
          password: submittedPassword,
          rememberMe,
        }),
      });

      const data = await res.json();

      if (data.success) {
        try {
          localStorage.setItem("user", JSON.stringify(data.user));
        } catch {
          // Some mobile/private browsing contexts may block storage writes.
          // Do not block login redirect when server authentication already succeeded.
        }
        setSuccess("Login successful! Redirecting...");
        writeAuthTabSync("login", data.user.role);
        const sessionValidation = await waitForSessionValidation();
        if (!sessionValidation.ok) {
          setSuccess("");
          setError(
            "Login succeeded but session validation failed on server. Please try again."
          );
          return;
        }
        const redirectRole =
          sessionValidation.role ||
          (typeof data.user?.role === "string" ? data.user.role : "");
        navigateToRoleHome(redirectRole);
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      loginRequestInFlight.current = false;
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setForgotMessage("");

    if (!forgotEmail) {
      setForgotMessage("Please enter your institutional email.");
      return;
    }
    if (!/^[a-z0-9._%+-]+@bisu\.edu\.ph$/i.test(forgotEmail.trim())) {
      setForgotMessage("Use your institutional @bisu.edu.ph email.");
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch("/api/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      setForgotMessage(
        data.message ||
          "Please contact an administrator to reset your password."
      );
      setEmail(forgotEmail);
    } catch {
      setForgotMessage("Unable to submit request. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
  <>
  <form
  onSubmit={handleLogin}
  className={`
    flex flex-col items-center font-body z-10 transition-all duration-700
    rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl
    p-4 sm:p-8 ${mobile ? "px-3.5 sm:px-6" : "sm:p-12"} shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)]          
    w-[94%] sm:w-full max-w-[460px] mx-auto animate-fade-in-up
    ${mobile ? "my-4" : "relative"}
  `}
>
  {/* Branding Logo */}
    <div className={`
      ${mobile ? "mb-3 h-12 w-12" : "mb-6 h-16 w-16"} 
      flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800 p-4 shadow-sm
    `}>
      <img src="/logo.png" className="h-full w-full object-contain grayscale hover:grayscale-0 transition-all duration-500" alt="BCMS Logo" />
    </div>

    <h2 className={`
      ${mobile ? "text-xl" : "text-3xl"} 
      font-heading font-black tracking-tighter text-slate-900 dark:text-white text-center
    `}>
      Portal Login
    </h2>
    
    <p className={`
      ${mobile ? "text-[10px]" : "text-[clamp(0.75rem,2vw,0.875rem)]"} 
      mt-1.5 px-1 text-center text-gray-500 dark:text-slate-400
    `}>
      Enter your credentials to access the Clearance System
    </p>

  {/* INPUTS */}
  <div className="mt-4 sm:mt-8 w-full space-y-3 sm:space-y-5">
    {/* Email */}
    <div className="flex flex-col gap-1.5">
      <label className="text-[clamp(10px,1.5vw,11px)] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500">
        Email Address
      </label>
      <input
        type="email"
        name="email"
        required
        placeholder="institutional-email@bisu.edu.ph"
        className="h-[42px] sm:h-12 w-full rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 px-4 sm:px-5 text-[13px] sm:text-sm text-slate-900 dark:text-white outline-none transition focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-brand-500/5 dark:focus:ring-brand-400/10"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (error) setError("");
        }}
      />
    </div>

    {/* Password */}
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500">
        Password
      </label>
      <div className="relative group">
        <input
          type={showPassword ? "text" : "password"} 
          name="password"
          required
          placeholder="•••••••••••••"
          className="h-[42px] sm:h-12 w-full rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 px-4 sm:px-5 pr-11 sm:pr-12 text-[13px] sm:text-sm text-slate-900 dark:text-white outline-none transition focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-brand-500/5 dark:focus:ring-brand-400/10"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (error) setError("");
          }}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </button>
      </div>
    </div>
  </div>

  {/* Remember Me & Forgot Password */}
  <div className="mt-4 flex w-full flex-wrap items-center justify-between gap-1.5 px-0.5">
    <label className="group flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        checked={rememberMe}
        onChange={(e) => setRememberMe(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 text-brand-600 focus:ring-brand-500"
      />
      <span className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-slate-400 transition-colors group-hover:text-gray-800 dark:group-hover:text-white">
        Remember me
      </span>
    </label>
    <button
      type="button"
      onClick={() => {
        setForgotEmail(email);
        setForgotMessage("");
        setShowForgotPassword((prev) => !prev);
      }}
      className="text-[10px] sm:text-xs font-semibold text-brand-600 dark:text-brand-400 transition-colors hover:text-brand-800 dark:hover:text-brand-300 hover:underline"
    >
      Forgot Password?
    </button>
  </div>

  {/* Status Messages */}
  <div className="mt-3 min-h-[18px] text-center">
    {sessionNotice && (
      <p className="text-xs sm:text-sm font-medium text-amber-600 dark:text-amber-400">
        {sessionNotice}
      </p>
    )}
    {success && <p className="text-xs sm:text-sm font-medium text-green-600">{success}</p>}
    {error && <p className="animate-bounce text-xs sm:text-sm font-medium text-red-500">{error}</p>}
  </div>

  {/* Sign In Button */}
  <button
    type="submit"
    disabled={isLoading}
    className="group relative mt-3 flex h-[46px] sm:h-12 w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold tracking-widest text-[9px] sm:text-[10px] uppercase transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70"
  >
    {isLoading ? (
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-400 border-t-slate-100" />
    ) : (
      <span>Sign In to System</span>
    )}
  </button>
</form>
{showForgotPassword && (
  <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm px-3 sm:px-4">
    <div className="w-full max-w-[520px] rounded-[1.75rem] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">
          Reset Password
        </p>
        <button
          type="button"
          onClick={() => setShowForgotPassword(false)}
          className="text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors uppercase tracking-widest"
        >
          Close
        </button>
      </div>

      <div className="space-y-3">
        <input
          type="email"
          value={forgotEmail}
          onChange={(e) => setForgotEmail(e.target.value)}
          placeholder="Institutional Email"
          className="h-11 w-full rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 px-4 text-sm text-slate-900 dark:text-white outline-none transition focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-brand-500/5"
        />
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          For security, password resets are handled by an administrator.
        </p>
      </div>

      {forgotMessage && (
        <p className={`mt-3 text-[11px] font-semibold text-center ${forgotMessage.includes("success") ? "text-emerald-500" : "text-red-500"}`}>
          {forgotMessage}
        </p>
      )}

      <button
        type="button"
        onClick={handleForgotPassword}
        disabled={forgotLoading}
        className="mt-4 w-full h-11 rounded-xl bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-500/20 hover:bg-brand-700 active:scale-95 transition-all disabled:opacity-50"
      >
        {forgotLoading ? "Processing..." : "Send Reset Request"}
      </button>
    </div>
  </div>
)}
  </>
  );
}
