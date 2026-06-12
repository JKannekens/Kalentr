"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export function LandingNav() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How it works" },
    { href: "/pricing", label: "Pricing" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg tracking-tight">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white text-sm font-bold shadow-sm">
              K
            </span>
            Kalentr
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            {links.map(({ href, label }) => (
              <Link key={href} href={href} className="hover:text-gray-900 dark:hover:text-white transition-colors">
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden sm:block">
              <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm">
                Start free trial
              </Button>
            </Link>
            <button
              className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-3 space-y-1">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
          >
            Sign in
          </Link>
        </div>
      )}
    </header>
  );
}
