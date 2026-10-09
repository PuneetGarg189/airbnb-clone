"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  Menu,
  User as UserIcon,
  Heart,
  Luggage,
  MessageSquare,
  Sun,
  Moon,
  ArrowRightLeft,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import LoginModal from "@/components/auth/LoginModal";
import { useSearch } from "@/context/SearchContext";
import SearchModal from "./SearchModal";
import IdentityVerificationModal from "@/components/auth/IdentityVerificationModal";

export default function Navbar() {
  const { user, isHost, isLoggedIn, toggleHostMode, logout } = useAuth();
  const { filters, openSearchModal } = useSearch();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleToggleHostMode = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isHost) {
      // Switching to Host -> Go to create listing page
      await toggleHostMode();
      router.push("/host/create");
    } else {
      // Switching to Guest -> Go to trips
      await toggleHostMode();
      router.push("/");
    }
  };

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("airbnb_theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("airbnb_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("airbnb_theme", "light");
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getPillLabels = () => {
    const where = filters.search || filters.city || "Anywhere";
    let when = "Any week";
    if (filters.start_date) {
      const s = filters.start_date.split("-").slice(1).join("/");
      const e = filters.end_date ? filters.end_date.split("-").slice(1).join("/") : "";
      when = e ? `${s} - ${e}` : s;
    }
    const who = filters.guests ? `${filters.guests} guest${filters.guests > 1 ? "s" : ""}` : "Add guests";
    const hasActiveFilters = Boolean(filters.search || filters.city || filters.start_date || filters.guests);

    return { where, when, who, hasActiveFilters };
  };

  const pill = getPillLabels();

  return (
    <>
      <header className={`sticky top-0 z-40 w-full border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#111111] transition-all pt-4 ${pathname === "/login" ? "pb-4" : "pb-6"}`}>
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          
          {/* Top Row */}
          <div className="flex items-center justify-between">
            {/* Left: Logo */}
            <div className="flex-1">
              <Link href="/" className="flex items-center gap-2 group w-fit">
                <svg
                  viewBox="0 0 32 32"
                  aria-hidden="true"
                  role="presentation"
                  focusable="false"
                  className="h-8 w-8 fill-[#FF385C] transition-transform group-hover:scale-105"
                >
                  <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.479.96 3.397.086 1.587-.456 3.195-1.503 4.464-1.258 1.524-3.09 2.417-5.068 2.454-2.148.04-4.148-.962-5.419-2.731l-.499-.718-.499.718c-1.271 1.769-3.271 2.771-5.419 2.731-1.978-.037-3.81-.93-5.068-2.454-1.047-1.269-1.589-2.877-1.503-4.464.05-.918.293-1.806.96-3.397l.145-.353c.986-2.296 5.146-11.006 7.1-14.836l.533-1.025C12.537 1.963 13.992 1 16 1zm0 2c-1.241 0-2.28.625-3.391 2.617l-.547 1.053C10.15 10.428 6.046 19.034 5.093 21.258l-.133.326c-.536 1.278-.731 1.98-.769 2.693-.059 1.096.31 2.203 1.033 3.079.88 1.066 2.158 1.688 3.535 1.714 1.65.03 3.23-.748 4.22-2.091l1.02-1.428 1.02 1.428c.99 1.343 2.57 2.121 4.22 2.091 1.377-.026 2.655-.648 3.535-1.714.723-.876 1.092-1.983 1.033-3.079-.038-.713-.233-1.415-.769-2.693l-.133-.326c-.953-2.224-5.057-10.83-6.969-14.588l-.547-1.053C18.28 3.625 17.241 3 16 3zm0 13c2.209 0 4 1.791 4 4 0 1.258-.581 2.38-1.493 3.111l-.229.171-.278.18c-1.205.748-2.795.748-4 0l-.278-.18-.229-.171C12.581 22.38 12 21.258 12 20c0-2.209 1.791-4 4-4zm0 2c-1.105 0-2 .895-2 2 0 .524.202 1.002.535 1.363l.135.132.17.135c.697.492 1.623.492 2.32 0l.17-.135.135-.132C17.798 21.002 18 20.524 18 20c0-1.105-.895-2-2-2z" />
                </svg>
                <span className="text-xl font-black tracking-tight text-[#FF385C] dark:text-[#FF385C] hidden xl:inline-block">
                  airbnb
                </span>
              </Link>
            </div>

            {/* Center: Tabs */}
            {pathname !== "/login" && (
            <div className="hidden md:flex flex-none items-center justify-center gap-6">
              <Link href="/" className={`flex items-center gap-2 pb-2 border-b-2 transition ${pathname === '/' ? 'border-black dark:border-white text-gray-900 dark:text-white font-semibold' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}>
                <span className="text-xl">🌍</span>
                <span className="text-sm">All</span>
              </Link>
              <Link href="/homes" className={`flex items-center gap-2 pb-2 border-b-2 transition ${pathname === '/homes' ? 'border-black dark:border-white text-gray-900 dark:text-white font-semibold' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}>
                <span className="text-xl">🏡</span>
                <span className="text-sm">Homes</span>
              </Link>
              <Link href="/experiences" className={`flex items-center gap-2 pb-2 border-b-2 transition ${pathname === '/experiences' ? 'border-black dark:border-white text-gray-900 dark:text-white font-semibold' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}>
                <span className="text-xl">🎈</span>
                <span className="text-sm">Experiences</span>
              </Link>
              <Link href="/services" className={`flex items-center gap-2 pb-2 border-b-2 transition ${pathname === '/services' ? 'border-black dark:border-white text-gray-900 dark:text-white font-semibold' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}>
                <span className="text-xl">🛎️</span>
                <span className="text-sm">Services</span>
              </Link>
            </div>

            )}

            {/* Right: Actions */}
            <div className="flex-1 flex justify-end items-center gap-2" ref={menuRef}>
              <button
                onClick={handleToggleHostMode}
                className="hidden lg:block rounded-full px-4 py-2 text-sm font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
              >
                {isHost ? "Switch to traveling" : "Become a host"}
              </button>


              {/* Dark Mode Toggle — always visible in the navbar */}
              <button
                onClick={toggleDarkMode}
                title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
              >
                {isDarkMode
                  ? <Sun className="h-5 w-5 text-yellow-400" />
                  : <Moon className="h-5 w-5 text-gray-600" />
                }
              </button>

              <div className="flex items-center gap-2 relative">
                {/* Profile Icon Button */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
                >
                  {isLoggedIn && user?.avatar_url ? (
                    <img src={user.avatar_url} alt="Profile" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <UserIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  )}
                </button>

                {/* Hamburger Button */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
                >
                  <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 top-12 mt-2 w-64 rounded-2xl bg-white dark:bg-zinc-900 shadow-xl ring-1 ring-black/5 dark:ring-white/10 py-3 z-50 overflow-hidden">
                    {isLoggedIn ? (
                      <>
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-zinc-800 flex items-center gap-3">
                          <img
                            src={user?.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"}
                            alt="Avatar"
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {user?.name}
                            </p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                          </div>
                        </div>

                        <div className="py-2">
                          <Link
                            href="/messages"
                            className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <MessageSquare className="w-4 h-4" /> Messages
                          </Link>
                          <Link
                            href="/trips"
                            className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Luggage className="w-4 h-4" /> Trips
                          </Link>
                          <Link
                            href="/wishlists"
                            className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Heart className="w-4 h-4" /> Wishlists
                          </Link>
                        </div>

                        <div className="border-t border-gray-100 dark:border-zinc-800 py-2">
                          <button
                            onClick={(e) => {
                              setIsMenuOpen(false);
                              handleToggleHostMode(e);
                            }}
                            className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#FF385C] hover:bg-pink-50/50 dark:hover:bg-[#FF385C]/10 transition cursor-pointer"
                          >
                            <ArrowRightLeft className="w-4 h-4" />
                            {isHost ? "Switch to traveling" : "Host your home"}
                          </button>
                        </div>
                        
                        <div className="border-t border-gray-100 dark:border-zinc-800 py-2">
                          <button
                            onClick={toggleDarkMode}
                            className="w-full text-left flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
                          >
                            <span className="flex items-center gap-3">
                              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                              Dark mode
                            </span>
                            <div className="w-8 h-5 bg-gray-200 dark:bg-[#FF385C] rounded-full relative transition-colors">
                              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${isDarkMode ? "left-3.5" : "left-0.5"}`} />
                            </div>
                          </button>
                          <button
                            onClick={() => {
                              setIsMenuOpen(false);
                              logout();
                            }}
                            className="w-full text-left px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
                          >
                            Log out
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="py-2">
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            router.push("/login");
                          }}
                          className="w-full text-left px-4 py-3 text-sm font-bold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
                        >
                          Log in
                        </button>
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            router.push("/login");
                          }}
                          className="w-full text-left px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
                        >
                          Sign up
                        </button>
                        <div className="my-2 border-t border-gray-100 dark:border-zinc-800" />
                        <button
                          onClick={toggleDarkMode}
                          className="w-full text-left flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
                        >
                          <span className="flex items-center gap-3">
                            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            Dark mode
                          </span>
                          <div className="w-8 h-5 bg-gray-200 dark:bg-[#FF385C] rounded-full relative transition-colors">
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${isDarkMode ? "left-3.5" : "left-0.5"}`} />
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Row: Giant Search Bar */}
          {pathname !== "/login" && (
          <div className="mt-6 flex justify-center pb-2">
            <div
              onClick={() => openSearchModal("where")}
              className="flex items-center w-full max-w-4xl bg-white dark:bg-[#222] rounded-full border border-gray-200 dark:border-zinc-700 shadow-xl divide-x divide-gray-200 dark:divide-zinc-700 cursor-pointer"
            >
              {/* Where */}
              <div className="flex-1 px-8 py-3.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition">
                <div className="text-xs font-bold text-gray-800 dark:text-gray-200">Where</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {pill.where === "Anywhere" ? "Search destinations" : pill.where}
                </div>
              </div>

              {/* When */}
              <div className="flex-1 px-8 py-3.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition">
                <div className="text-xs font-bold text-gray-800 dark:text-gray-200">When</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {pill.when === "Any week" ? "Add dates" : pill.when}
                </div>
              </div>

              {/* Who & Search Button */}
              <div className="flex-1 pl-8 pr-2 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-gray-800 dark:text-gray-200">Who</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {pill.who === "Add guests" ? "Add guests" : pill.who}
                  </div>
                </div>
                <div className="h-12 w-12 bg-[#FF385C] rounded-full flex items-center justify-center text-white shrink-0 hover:bg-[#E31C5F] transition-colors">
                  <Search className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      </header>

      <SearchModal />
      <IdentityVerificationModal
        isOpen={isIdentityModalOpen}
        onClose={() => setIsIdentityModalOpen(false)}
      />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}
