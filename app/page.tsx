"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  return (
    <div className="relative w-full h-screen flex">
      {/* LEFT SIDE */}
      <div className="relative w-1/2 h-full overflow-hidden">
        {/* Background */}
        <img
          src="/bisu.png"
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-purple-900/70 backdrop-brightness-75" />

        {/* CONTENT */}
        <div className="relative z-10 w-full h-full text-white">
          <img
            src="/left_logo.png"
            alt="Logo"
            className="absolute top-[2vh] left-[1vw] w-[4vw] h-[8vh]"
          />

          <a href="/" className="absolute top-[3vh] right-[1vw]">
            <img
              src="/menu.png"
              alt="Menu"
              className="w-[3vw] h-[5vh] hover:scale-110 transition duration-300"
            />
          </a>

          {/* System Name */}
          <h1 className="absolute top-[3vh] left-[6vw] font-heading font-semibold tracking-wide text-[1vh]">
            <p>BISU Clearance</p>
            <p>Management System</p>
          </h1>

          {/* Greeting */}
          <h1 className="absolute top-[32vh] left-[18vw] font-heading font-bold tracking-tight text-[4.5vh]">
            Hello BISU'ans!
          </h1>

          <p className="absolute top-[39vh] left-[20vw] font-body text-white/90 text-[2vh]">
            Welcome to BCMS
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="relative w-1/2 h-full bg-white">
        <p className="absolute bottom-[3vh] left-1/2 -translate-x-1/2 text-gray-500 text-sm font-body">
          ©2026 BISU Clarin Campus — All rights reserved
        </p>
      </div>

      <LoginForm />
    </div>
  );
}

/* ================= LOGIN FORM ================= */

export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (e: any) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess("Login successful! Redirecting...");

        localStorage.setItem("user", JSON.stringify(data.user));

        setTimeout(() => {
          if (data.user.role === "admin") router.push("/admin");
          else if (data.user.role === "signatory") router.push("/signatory");
          else router.push("/student");
        }, 2000);
      }
      if (!data.success) {
        setError(data.message);
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "admin") router.push("/admin");
      else if (data.user.role === "signatory") router.push("/signatory");
      else router.push("/student");
    } catch (err) {
      console.log(err);
      setError("Login failed");
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="absolute top-1/2 left-3/4 -translate-x-1/2 -translate-y-1/2
      w-[28vw] h-[60vh]
      bg-white/70 backdrop-blur-lg
      border border-purple-300
      rounded-2xl shadow-xl
      flex flex-col items-center
      font-body"
    >
      {/* Logo */}
      <img src="/logo.png" alt="Logo" className="w-[4vw] mt-8" />

      <h2 className="font-heading text-black font-semibold text-xl">
        Welcome Back
      </h2>

      <p className="text-gray-600 text-sm mt-2">
        Login to continue to your BCMS account
      </p>

      {/* EMAIL */}
      <div className="w-[80%] mt-8">
        <label className="font-medium text-sm text-gray-700">Email</label>

        <input
          type="email"
          placeholder="Enter your BISU email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);

            if (e.target.value === "") {
              setError("");
            }
          }}
          className="w-full h-12 mt-1 px-4
          border border-purple-300 rounded-lg
          outline-none
          focus:border-purple-600
          focus:ring-1 focus:ring-purple-400
          transition text-gray-900"
        />
      </div>

      {/* PASSWORD */}
      <div className="w-[80%] mt-5">
        <label className="font-medium text-sm text-gray-700">Password</label>

        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);

            if (e.target.value === "") {
              setError("");
            }
          }}
          className="w-full h-12 mt-1 px-4
          border border-purple-300 rounded-lg
          outline-none
          focus:border-purple-600
          focus:ring-1 focus:ring-purple-400
          transition text-gray-900"
        />

        {/* Forgot Password */}
        <button className="self-end mr-[10%] mt-3 text-sm text-purple-700 hover:underline">
          Forgot Password?
        </button>
      </div>
      {success && (
        <p className="text-green-600 font-semibold mt-3 animate-fade">
          {success}
        </p>
      )}

      {error && <p className="text-black font-semibold mt-3">{error}</p>}

      {/* LOGIN BUTTON */}
      <button
        type="submit"
        className="mt-6 w-[80%] h-12 rounded-lg
        bg-gradient-to-b from-[#995DF9] to-[#CCA6FF]
        text-white font-heading font-semibold tracking-wide
        hover:scale-105 transition"
      >
        Login
      </button>
    </form>
  );
}
