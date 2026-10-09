"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ExperiencesPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6 bg-gray-50/50 dark:bg-[#111111]">
      <div className="max-w-lg w-full bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-gray-100 dark:border-zinc-800 p-10 text-center relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-100 dark:bg-purple-900/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-yellow-100 dark:bg-yellow-900/20 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <div className="relative z-10">
          <div className="text-6xl mb-6 select-none animate-bounce">🎈</div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Experiences</h1>
          <div className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-bold shadow-md mb-6 transform rotate-2">
            Coming Soon
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
            Get ready for unique activities hosted by locals. From cooking classes to mountain expeditions, your next adventure is just around the corner!
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold hover:scale-[1.02] active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Explore
          </Link>
        </div>
      </div>
    </div>
  );
}
