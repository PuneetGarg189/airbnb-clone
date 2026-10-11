"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

const DEMO_ACCOUNTS = [
  { label: "Demo guest (Alex)", username: "alex" },
  { label: "Demo host (Elena)", username: "elena" },
];

export default function AuthForm({ onSuccess }: { onSuccess: () => void }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async (action: () => Promise<unknown>, welcome: string) => {
    setBusy(true);
    setError("");
    try {
      await action();
      toast.success(welcome);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") return run(() => login(identifier.trim(), password), "Welcome back!");
    return run(() => register(name.trim(), identifier.trim(), password), "Account created. Welcome!");
  };

  const field =
    "w-full rounded-xl border border-gray-400 px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black bg-white";

  return (
    <div>
      <form onSubmit={submit} className="space-y-3">
        {mode === "signup" && (
          <input className={field} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
        )}
        <input
          className={field}
          type={mode === "signup" ? "email" : "text"}
          placeholder={mode === "signup" ? "Email" : "Email or username"}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          autoComplete="username"
          required
        />
        <input
          className={field}
          type="password"
          placeholder={mode === "signup" ? "Password (min 8 characters)" : "Password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          required
        />
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-[#E31C5F] py-3.5 font-bold text-white transition hover:bg-[#FF385C] disabled:opacity-60"
        >
          {busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "login" ? "signup" : "login");
          setError("");
        }}
        className="mt-3 w-full text-center text-sm font-semibold underline"
      >
        {mode === "login" ? "New here? Create an account" : "Already have an account? Log in"}
      </button>

      <div className="my-5 flex items-center">
        <div className="flex-1 border-t border-gray-200" />
        <span className="px-3 text-xs font-semibold uppercase text-gray-500">or try a demo account</span>
        <div className="flex-1 border-t border-gray-200" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {DEMO_ACCOUNTS.map((d) => (
          <button
            key={d.username}
            type="button"
            disabled={busy}
            onClick={() => run(() => login(d.username, "demo1234"), `Signed in as ${d.username}`)}
            className="rounded-xl border border-gray-300 px-3 py-3 text-sm font-semibold transition hover:border-black hover:bg-gray-50 disabled:opacity-60"
          >
            {d.label}
          </button>
        ))}
      </div>
    </div>
  );
}
