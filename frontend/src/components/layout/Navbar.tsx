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
  ArrowRightLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import LoginModal from "@/components/auth/LoginModal";
import { useSearch } from "@/context/SearchContext";
import SearchModal from "./SearchModal";
import ThemeToggle from "./ThemeToggle";
import { GlobeIcon, HouseIcon, BalloonIcon, BellIcon } from "./NavIcons";

const NAV_TABS = [
  { href: "/", label: "All", Icon: GlobeIcon },
  { href: "/homes", label: "Homes", Icon: HouseIcon },
  { href: "/experiences", label: "Experiences", Icon: BalloonIcon },
  { href: "/services", label: "Services", Icon: BellIcon },
];

// Tried in order. The .jpg/.jpeg versions are square images with a lot of white
// margin, so they are cropped to the artwork with CSS (see below).
const LOGO_FILES = [
  { src: "/logo.svg", crop: false },
  { src: "/logo.png", crop: false },
  { src: "/logo.jpg", crop: true },
  { src: "/logo.jpeg", crop: true },
];

export default function Navbar() {
  const { user, isHost, isLoggedIn, becomeHost, logout } = useAuth();
  const [logoIdx, setLogoIdx] = useState(0); // tries /logo.svg, then /logo.png
  const logoOk = logoIdx < LOGO_FILES.length;
  const setLogoOk = () => setLogoIdx((i) => i + 1);
  const { filters, openSearchModal } = useSearch();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleHostClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    if (isHost) {
      router.push("/host/dashboard");
      return;
    }
    try {
      await becomeHost();
      toast.success("You're a host now. Add your first listing.");
      router.push("/host/create");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not switch to hosting.");
    }
  };

  const menuRef = useRef<HTMLDivElement>(null);

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

  // Header collapses to a compact pill once you scroll, like airbnb.com.
  // Clicking the pill re-opens the full search bar until the next scroll.
  const [scrolled, setScrolled] = useState(false);
  const [reopened, setReopened] = useState(false);
  const isHome = pathname !== "/login";
  const collapsed = scrolled && !reopened;

  const ignoreScrollUntil = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      // ignore scroll adjustments caused by the header resizing itself
      if (Date.now() > ignoreScrollUntil.current) setReopened(false);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full bg-white dark:bg-[#111111] pt-4 transition-[padding,box-shadow,border-color] duration-300 ease-out border-b ${
          scrolled ? "border-gray-200 dark:border-zinc-800 shadow-sm" : "border-transparent"
        } ${!isHome ? "pb-4" : collapsed ? "pb-4" : "pb-6"}`}
      >
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          
          {/* Top Row */}
          <div className="flex items-center justify-between">
            {/* Left: Logo */}
            <div className="flex-1">
              <Link href="/" className="flex items-center gap-2 group w-fit">
                {logoOk ? (
                  // Put your logo at frontend/public/logo.svg (or .png / .jpg)
                  // eslint-disable-next-line @next/next/no-img-element
                  <span
                    className={
                      LOGO_FILES[logoIdx].crop
                        ? "relative block h-8 w-[101px] overflow-hidden"
                        : "block"
                    }
                  >
                    <img
                      src={LOGO_FILES[logoIdx].src}
                      alt="airbnb"
                      ref={(el) => {
                        // The file may have failed before React attached onError.
                        if (el && el.complete && el.naturalWidth === 0) setLogoOk();
                      }}
                      className={
                        LOGO_FILES[logoIdx].crop
                          ? "absolute max-w-none"
                          : "h-8 w-auto"
                      }
                      style={
                        LOGO_FILES[logoIdx].crop
                          ? { width: 116, height: 53, left: -9, top: -11 }
                          : undefined
                      }
                      onError={() => setLogoOk()}
                    />
                  </span>
                ) : (
                  <span className="text-2xl font-bold tracking-tight text-[#FF385C]">airbnb</span>
                )}
              </Link>
            </div>

            {/* Center: category tabs, cross-fading into the compact search pill on scroll */}
            {isHome && (
              <div className="relative hidden h-[68px] flex-none md:block md:w-[520px] lg:w-[660px]">
                <nav
                  aria-label="Categories"
                  className={`nav-fade absolute inset-0 flex items-center justify-center gap-10 ${
                    collapsed ? "nav-fade-out" : ""
                  }`}
                >
                  {NAV_TABS.map((t) => {
                    const active = pathname === t.href;
                    return (
                      <Link
                        key={t.href}
                        href={t.href}
                        tabIndex={collapsed ? -1 : 0}
                        className={`nav-tab group relative flex items-center gap-3 px-1 pb-3 pt-1 text-base font-medium transition-colors ${
                          active
                            ? "text-gray-900 dark:text-white"
                            : "text-[#6a6a6a] hover:text-gray-900 dark:hover:text-gray-200"
                        }`}
                      >
                        <span className="nav-tab-icon block h-12 w-12 shrink-0">
                          <t.Icon className="h-full w-full drop-shadow-sm" />
                        </span>
                        <span>{t.label}</span>
                        <span
                          className={`absolute inset-x-0 bottom-0 h-1 origin-center rounded-full transition-transform duration-300 ${
                            active
                              ? "scale-x-100 bg-gray-900 dark:bg-white"
                              : "scale-x-0 bg-gray-300 group-hover:scale-x-100 dark:bg-zinc-600"
                          }`}
                        />
                      </Link>
                    );
                  })}
                </nav>

                <button
                  type="button"
                  onClick={() => {
                    ignoreScrollUntil.current = Date.now() + 700;
                    setReopened(true);
                  }}
                  tabIndex={collapsed ? 0 : -1}
                  aria-label="Open search"
                  className={`group nav-fade nav-compact absolute inset-0 m-auto flex h-14 w-full max-w-[470px] items-center rounded-full border border-gray-200 bg-white pl-3 pr-2 text-left shadow-[0_2px_10px_rgba(0,0,0,0.12)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.18)] dark:border-zinc-700 dark:bg-[#222] ${
                    collapsed ? "" : "nav-fade-out-reverse"
                  }`}
                >
                  <span className="mr-2 text-[28px] leading-none" aria-hidden="true">🏡</span>
                  <span className="flex-1 truncate px-2 text-base font-medium text-gray-900 dark:text-white">
                    {pill.where}
                  </span>
                  <span className="h-7 w-px bg-gray-300 dark:bg-zinc-600" />
                  <span className="flex-1 truncate px-4 text-center text-base font-medium text-gray-900 dark:text-white">
                    {pill.when === "Any week" ? "Anytime" : pill.when}
                  </span>
                  <span className="h-7 w-px bg-gray-300 dark:bg-zinc-600" />
                  <span className="flex-1 truncate px-4 text-center text-base font-medium text-gray-900 dark:text-white">
                    {pill.who}
                  </span>
                  <span className="ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#CF2B54] text-white transition-colors group-hover:bg-[#B8224A]">
                    <Search className="h-4 w-4 stroke-[3]" />
                  </span>
                </button>
              </div>
            )}

            {/* Right: Actions */}
            <div className="flex-1 flex justify-end items-center gap-2" ref={menuRef}>
              <ThemeToggle />
              <button
                onClick={handleHostClick}
                className="hidden lg:block rounded-full px-4 py-2 text-sm font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
              >
                {isHost ? "Host dashboard" : "Become a host"}
              </button>
              <div className="flex items-center gap-2 relative">
                {/* Profile Icon Button */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
                >
                  {isLoggedIn && user?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
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
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={user?.avatar_url ?? ""}
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
                              handleHostClick(e);
                            }}
                            className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#FF385C] hover:bg-pink-50/50 dark:hover:bg-[#FF385C]/10 transition cursor-pointer"
                          >
                            <ArrowRightLeft className="w-4 h-4" />
                            {isHost ? "Host dashboard" : "Host your home"}
                          </button>
                        </div>
                        
                        <div className="border-t border-gray-100 dark:border-zinc-800 py-2">
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
                        </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Row: Giant Search Bar */}
          {isHome && (
          <div
            className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-out ${
              collapsed ? "mt-0 grid-rows-[0fr] opacity-0 pointer-events-none" : "mt-6 grid-rows-[1fr] opacity-100"
            }`}
            aria-hidden={collapsed}
          >
          <div className="-mb-6 overflow-hidden px-4 pb-6 -mx-4"><div className={`flex justify-center pb-2 transition-transform duration-300 ${collapsed ? "scale-90 -translate-y-2" : ""}`}>
            <div
              onClick={() => openSearchModal("where")}
              className="nav-searchbar flex items-center w-full max-w-4xl bg-white dark:bg-[#222] rounded-full border border-gray-200 dark:border-zinc-700 shadow-xl hover:shadow-2xl transition-shadow duration-200 cursor-pointer"
            >
              {/* Where */}
              <div className="nav-seg flex-1 px-4 sm:px-8 py-3.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors duration-150">
                <div className="text-xs font-bold text-gray-800 dark:text-gray-200">Where</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {pill.where === "Anywhere" ? "Search destinations" : pill.where}
                </div>
              </div>

              {/* When */}
              <div className="nav-seg flex-1 px-4 sm:px-8 py-3.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors duration-150">
                <div className="text-xs font-bold text-gray-800 dark:text-gray-200">When</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {pill.when === "Any week" ? "Add dates" : pill.when}
                </div>
              </div>

              {/* Who & Search Button */}
              <div className="nav-seg flex-1 pl-4 sm:pl-8 pr-2 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors duration-150 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-gray-800 dark:text-gray-200">Who</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {pill.who === "Add guests" ? "Add guests" : pill.who}
                  </div>
                </div>
                <div className="nav-search-btn group/btn h-12 min-w-12 gap-0 bg-[#FF385C] rounded-full flex items-center justify-center text-white shrink-0 hover:bg-[#E31C5F] transition-all duration-300 hover:gap-2 hover:px-4">
                  <Search className="h-5 w-5" />
                  <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold opacity-0 transition-all duration-300 group-hover/btn:max-w-[60px] group-hover/btn:opacity-100">Search</span>
                </div>
              </div>
            </div>
          </div></div>
          </div>
          )}
        </div>
      </header>

      <SearchModal />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}
