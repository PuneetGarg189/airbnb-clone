"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

// The class on <html> is the source of truth. A tiny inline script in
// app/layout.tsx sets it before first paint, so there is no light flash.
export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* private mode: the toggle still works for this visit */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      className="flex h-10 w-10 items-center justify-center rounded-full text-gray-800 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-zinc-800 cursor-pointer"
    >
      {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
