"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Real Supabase authentication next step mein connect karenge.
    console.log({
      mode,
      name,
      email,
      password,
    });
  }

  function continueAsGuest() {
    sessionStorage.setItem("msai_guest", "true");
    router.push("/");
  }

  return (
    <main className="min-h-screen bg-[#0d0d0d] text-white flex items-center justify-center px-5">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">✦</div>

          <h1 className="text-4xl font-bold">
            MSAI
          </h1>

          <p className="text-gray-400 mt-3">
            Your intelligent AI assistant
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#171717] border border-white/10 rounded-3xl p-7 shadow-2xl">

          {/* Login / Signup selector */}
          <div className="grid grid-cols-2 bg-[#222] rounded-xl p-1 mb-7">

            <button
              type="button"
              onClick={() => setMode("login")}
              className={`py-3 rounded-lg transition ${
                mode === "login"
                  ? "bg-white text-black"
                  : "text-gray-400"
              }`}
            >
              Log In
            </button>

            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`py-3 rounded-lg transition ${
                mode === "signup"
                  ? "bg-white text-black"
                  : "text-gray-400"
              }`}
            >
              Sign Up
            </button>

          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {mode === "signup" && (
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#222] border border-white/10 rounded-xl px-4 py-4 outline-none focus:border-white/40"
                required
              />
            )}

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#222] border border-white/10 rounded-xl px-4 py-4 outline-none focus:border-white/40"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#222] border border-white/10 rounded-xl px-4 py-4 outline-none focus:border-white/40"
              required
            />

            <button
              type="submit"
              className="w-full bg-white text-black font-semibold rounded-xl py-4 hover:bg-gray-200 transition"
            >
              {mode === "login"
                ? "Continue with MSAI"
                : "Create MSAI Account"}
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-gray-500 text-sm">
              OR
            </span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          {/* Guest */}
          <button
            type="button"
            onClick={continueAsGuest}
            className="w-full border border-white/15 rounded-xl py-4 hover:bg-white/5 transition"
          >
            Continue as Guest →
          </button>

          <p className="text-xs text-gray-500 text-center mt-6">
            Guest chats will not be saved to your account.
          </p>

        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          MSAI can make mistakes. Check important information.
        </p>

      </div>
    </main>
  );
}