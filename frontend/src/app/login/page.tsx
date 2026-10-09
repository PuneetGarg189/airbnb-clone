"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

// Travel poster background images (fallback to Unsplash)
const POSTERS = [
  { name: "PARIS", url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80" },
  { name: "MIAMI", url: "https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?w=400&q=80" },
  { name: "TOKYO", url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80" },
  { name: "SYDNEY", url: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400&q=80" },
  { name: "LONDON", url: "https://images.unsplash.com/photo-1513635269975-5969336cd182?w=400&q=80" },
  { name: "ROME", url: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&q=80" },
  { name: "NEW YORK", url: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80" },
  { name: "BALI", url: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80" },
  { name: "BARCELONA", url: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&q=80" },
  { name: "TORONTO", url: "https://images.unsplash.com/photo-1507992781348-310259076fe0?w=400&q=80" },
  { name: "MONTREAL", url: "https://images.unsplash.com/photo-1519121785383-3229633bb75b?w=400&q=80" },
  { name: "MEXICO", url: "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=400&q=80" },
  { name: "EDINBURGH", url: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400&q=80" },
  { name: "SAN DIEGO", url: "https://images.unsplash.com/photo-1514302638848-1db9e5781a8b?w=400&q=80" },
  { name: "BUDAPEST", url: "https://images.unsplash.com/photo-1549877452-9c387954fbc2?w=400&q=80" }
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter a valid phone number or email.");
      return;
    }
    try {
      // Mock login for frontend demonstration
      login();
      toast.success("Successfully logged in!");
      router.push("/");
    } catch (err) {
      toast.error("Failed to log in.");
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] w-full overflow-hidden bg-black flex items-center justify-center">
      {/* Background Poster Grid */}
      <div className="absolute inset-0 z-0 opacity-60 pointer-events-none">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4 h-full w-full object-cover">
          {POSTERS.map((poster, idx) => (
            <div
              key={idx}
              className="relative rounded-2xl overflow-hidden aspect-[3/4] shadow-2xl bg-gray-800"
            >
              <img
                src={poster.url}
                alt={poster.name}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-center p-6">
                <span className="text-white font-black text-2xl tracking-widest uppercase drop-shadow-lg text-center leading-tight">
                  {poster.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[500px] bg-white rounded-[2rem] shadow-2xl p-8 mx-4">
        {/* Airbnb Logo Logo */}
        <div className="flex justify-center mb-6">
          <svg
            viewBox="0 0 32 32"
            aria-hidden="true"
            role="presentation"
            focusable="false"
            className="h-10 w-10 fill-[#FF385C]"
          >
            <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.479.96 3.397.086 1.587-.456 3.195-1.503 4.464-1.258 1.524-3.09 2.417-5.068 2.454-2.148.04-4.148-.962-5.419-2.731l-.499-.718-.499.718c-1.271 1.769-3.271 2.771-5.419 2.731-1.978-.037-3.81-.93-5.068-2.454-1.047-1.269-1.589-2.877-1.503-4.464.05-.918.293-1.806.96-3.397l.145-.353c.986-2.296 5.146-11.006 7.1-14.836l.533-1.025C12.537 1.963 13.992 1 16 1zm0 2c-1.241 0-2.28.625-3.391 2.617l-.547 1.053C10.15 10.428 6.046 19.034 5.093 21.258l-.133.326c-.536 1.278-.731 1.98-.769 2.693-.059 1.096.31 2.203 1.033 3.079.88 1.066 2.158 1.688 3.535 1.714 1.65.03 3.23-.748 4.22-2.091l1.02-1.428 1.02 1.428c.99 1.343 2.57 2.121 4.22 2.091 1.377-.026 2.655-.648 3.535-1.714.723-.876 1.092-1.983 1.033-3.079-.038-.713-.233-1.415-.769-2.693l-.133-.326c-.953-2.224-5.057-10.83-6.969-14.588l-.547-1.053C18.28 3.625 17.241 3 16 3zm0 13c2.209 0 4 1.791 4 4 0 1.258-.581 2.38-1.493 3.111l-.229.171-.278.18c-1.205.748-2.795.748-4 0l-.278-.18-.229-.171C12.581 22.38 12 21.258 12 20c0-2.209 1.791-4 4-4zm0 2c-1.105 0-2 .895-2 2 0 .524.202 1.002.535 1.363l.135.132.17.135c.697.492 1.623.492 2.32 0l.17-.135.135-.132C17.798 21.002 18 20.524 18 20c0-1.105-.895-2-2-2z" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
          Log in or sign up
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <div className="relative border border-gray-400 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-black focus-within:border-black transition">
              <input
                type="text"
                placeholder="Phone number or email"
                className="w-full px-4 py-4 text-gray-900 placeholder-gray-500 focus:outline-none bg-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#E31C5F] hover:bg-[#FF385C] text-white font-bold py-3.5 px-4 rounded-xl transition-colors duration-200"
          >
            Continue
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="px-4 text-xs font-semibold text-gray-500 uppercase">or</span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={handleLogin}
            className="flex items-center justify-center p-3 w-16 h-16 border border-gray-300 rounded-2xl hover:border-black hover:bg-gray-50 transition"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          </button>
          
          <button
            onClick={handleLogin}
            className="flex items-center justify-center p-3 w-16 h-16 border border-gray-300 rounded-2xl hover:border-black hover:bg-gray-50 transition"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-black">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.19 2.31-.88 3.5-.8 1.49.07 2.82.72 3.65 1.95-3.22 1.83-2.66 6.32.55 7.64-.69 1.4-1.57 2.72-2.78 3.38zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
