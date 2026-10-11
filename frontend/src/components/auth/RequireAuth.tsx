"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

/** Wrap a page that needs a signed-in user (and optionally a host). */
export default function RequireAuth({
  children,
  host = false,
  what = "this page",
}: {
  children: React.ReactNode;
  host?: boolean;
  what?: string;
}) {
  const { user, loading, becomeHost } = useAuth();

  if (loading) {
    return <div className="mx-auto max-w-5xl animate-pulse px-4 py-16"><div className="h-40 rounded-3xl bg-gray-100" /></div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Log in to see {what}</h1>
        <p className="mb-6 text-sm text-gray-500">You need an account for this. It only takes a moment.</p>
        <Link href="/login" className="rounded-xl bg-black px-6 py-3 text-sm font-bold text-white hover:bg-gray-800">
          Log in or sign up
        </Link>
      </div>
    );
  }

  if (host && !user.is_host) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Become a host</h1>
        <p className="mb-6 text-sm text-gray-500">Turn on hosting for your account to list places and see bookings.</p>
        <button onClick={() => becomeHost()} className="cursor-pointer rounded-xl bg-[#E31C5F] px-6 py-3 text-sm font-bold text-white hover:bg-[#FF385C]">
          Start hosting
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
