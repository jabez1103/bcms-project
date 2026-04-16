"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react"; // Install with: npm install lucide-react

interface LoginFormProps {
  mobile?: boolean;
}

export default function LoginForm({ mobile = false }: LoginFormProps) {
  const router = useRouter();

  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // New state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess("Login successful! Redirecting...");
        localStorage.setItem("user", JSON.stringify(data.user));

        setTimeout(() => {
          const routes: Record<string, string> = {
            admin: "/admin/home",
            signatory: "/signatory/home",
            student: "/student/home",
          };
          router.push(routes[data.user.role] || "/student");
        }, 1200);
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <form
  onSubmit={handleLogin}
  className={`
    flex flex-col items-center font-body z-10 transition-all duration-500
    rounded-2xl border border-purple-100 bg-white 
    p-6 sm:p-10 shadow-2xl          
    w-[92%] sm:w-full max-w-[440px] mx-auto  
    ${mobile ? "my-6" : "relative"}
  `}
>
  {/* Branding Logo */}
  <div className="mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-purple-50 p-3">
    <img src="/logo.png" className="h-full w-full object-contain" alt="BCMS Logo" />
  </div>

  <h2 className="font-heading text-[clamp(1.5rem,3vw,1.875rem)] font-bold tracking-tight text-gray-900 text-center">
    Welcome Back
  </h2>
  
  <p className="mt-2 px-2 text-center text-[clamp(0.75rem,2vw,0.875rem)] text-gray-500">
    Enter your credentials to access the Clearance System
  </p>

  {/* INPUTS */}
  <div className="mt-6 sm:mt-8 w-full space-y-4 sm:space-y-5">
    {/* Email */}
    <div className="flex flex-col gap-1.5">
      <label className="text-[clamp(10px,1.5vw,11px)] font-bold uppercase tracking-widest text-gray-400">
        Email Address
      </label>
      <input
        type="email"
        required
        placeholder="name@bisu.edu.ph"
        className="h-11 sm:h-12 w-full rounded-xl border border-gray-200 px-4 text-sm sm:text-base text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (error) setError("");
        }}
      />
    </div>

    {/* Password */}
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-gray-400">
        Password
      </label>
      <div className="relative group">
        <input
          type={showPassword ? "text" : "password"} 
          required
          placeholder="•••••••••••••"
          className="h-11 sm:h-12 w-full rounded-xl border border-gray-200 px-4 pr-12 text-sm sm:text-base text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (error) setError("");
          }}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-purple-600 transition-colors"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  </div>

  {/* Remember Me & Forgot Password */}
  <div className="mt-5 flex w-full flex-wrap items-center justify-between gap-2 px-1">
    <label className="group flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
      />
      <span className="text-[11px] sm:text-xs font-medium text-gray-500 transition-colors group-hover:text-gray-800">
        Remember me
      </span>
    </label>
    <button
      type="button"
      className="text-[11px] sm:text-xs font-semibold text-purple-600 transition-colors hover:text-purple-800 hover:underline"
    >
      Forgot Password?
    </button>
  </div>

  {/* Status Messages */}
  <div className="mt-4 min-h-[20px] text-center  ">
    {success && <p className="text-xs sm:text-sm font-medium text-green-600">{success}</p>}
    {error && <p className="animate-bounce text-xs sm:text-sm font-medium text-red-500">{error}</p>}
  </div>

  {/* Sign In Button */}
  <button
    type="submit"
    disabled={isLoading}
    className="group relative mt-2 flex h-11 sm:h-13 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-purple-600 to-indigo-500 p-3 font-heading font-bold tracking-wide text-white shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70"
  >
    {isLoading ? (
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
    ) : (
      <span className="text-sm sm:text-base">Sign In</span>
    )}
  </button>
</form>
  );
}