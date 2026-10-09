import React from "react";
import Link from "next/link";
import { Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 text-xs text-gray-600 mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-bold text-gray-900 mb-3">Support</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:underline">Help Centre</Link></li>
              <li><Link href="/" className="hover:underline">AirCover</Link></li>
              <li><Link href="/" className="hover:underline">Anti-discrimination</Link></li>
              <li><Link href="/" className="hover:underline">Disability support</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-3">Hosting</h4>
            <ul className="space-y-2">
              <li><Link href="/host/create" className="hover:underline">Airbnb your home</Link></li>
              <li><Link href="/host/dashboard" className="hover:underline">Host Dashboard</Link></li>
              <li><Link href="/" className="hover:underline">AirCover for Hosts</Link></li>
              <li><Link href="/" className="hover:underline">Hosting resources</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-3">Airbnb Clone</h4>
            <ul className="space-y-2">
              <li><span className="text-gray-400">Next.js 16 + TypeScript</span></li>
              <li><span className="text-gray-400">Tailwind CSS + Lucide Icons</span></li>
              <li><span className="text-gray-400">Python FastAPI + SQLite</span></li>
              <li><span className="text-gray-400">Leaflet Maps + React</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-3">Settings</h4>
            <div className="flex items-center gap-4 text-gray-800 font-semibold mb-3">
              <span className="flex items-center gap-1.5 hover:underline cursor-pointer">
                <Globe className="w-4 h-4" /> English (US)
              </span>
              <span className="hover:underline cursor-pointer">$ USD</span>
            </div>
            <p className="text-gray-400 text-[11px]">
              Fullstack SDE Airbnb clone built with modern web best practices.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-[11px]">
            <span>© 2026 Airbnb, Inc. Clone</span>
            <span>·</span>
            <Link href="/" className="hover:underline">Privacy</Link>
            <span>·</span>
            <Link href="/" className="hover:underline">Terms</Link>
            <span>·</span>
            <Link href="/" className="hover:underline">Sitemap</Link>
          </div>
          <div className="text-[11px] text-gray-500">
            For demonstration and assignment evaluation
          </div>
        </div>
      </div>
    </footer>
  );
}
