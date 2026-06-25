"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { navItems, isNavItemActive } from "./nav-items";

interface DashboardMobileNavProps {
  email?: string | null;
  trialDaysLeft?: number;
}

export function DashboardMobileNav({ email, trialDaysLeft }: DashboardMobileNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Lock body scroll and wire up Escape while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (pathname === "/onboarding") return null;

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[80%] flex-col bg-card shadow-xl">
            <div className="flex h-14 items-center justify-between border-b border-border/60 px-4">
              <span className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold shadow-sm">
                  K
                </span>
                Kalentr
              </span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-3">
              <ul className="space-y-1">
                {navItems.map((item) => {
                  const { href, label, icon: Icon } = item;
                  const isActive = isNavItemActive(item, pathname);
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {trialDaysLeft !== undefined && trialDaysLeft > 0 && (
                <Link
                  href="/dashboard/billing"
                  onClick={() => setOpen(false)}
                  className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs font-medium text-amber-700"
                >
                  {trialDaysLeft}d left in trial
                </Link>
              )}
            </nav>

            {email && (
              <div className="border-t border-border/60 px-4 py-3 text-sm text-muted-foreground truncate">
                {email}
              </div>
            )}
          </div>
        </div>,
          document.body
        )}
    </div>
  );
}
