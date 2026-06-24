"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems, isNavItemActive } from "./nav-items";

export function DashboardNav() {
  const pathname = usePathname();

  if (pathname === "/onboarding") return null;

  return (
    <nav className="hidden md:flex items-center gap-0.5">
      {navItems.map((item) => {
        const { href, label, icon: Icon } = item;
        const isActive = isNavItemActive(item, pathname);
        return (
          <Link
            key={href}
            href={href}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
