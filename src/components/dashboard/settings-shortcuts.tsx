"use client";

import Link from "next/link";
import { Clock, Settings, Globe } from "lucide-react";

export function SettingsShortcuts() {
  const shortcuts = [
    {
      icon: Clock,
      label: "Availability",
      description: "Set your hours",
      href: "/dashboard/availability",
    },
    {
      icon: Globe,
      label: "Microsite",
      description: "Customize site",
      href: "/dashboard/settings",
    },
    {
      icon: Settings,
      label: "Settings",
      description: "Account & more",
      href: "/dashboard/settings",
    },
  ];

  return (
    <div className="rounded-lg border bg-white p-4 dark:bg-gray-800 dark:border-gray-700">
      <h3 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">
        Quick Links
      </h3>

      <div className="space-y-2">
        {shortcuts.map((shortcut) => {
          const Icon = shortcut.icon;
          return (
            <Link
              key={shortcut.label}
              href={shortcut.href}
              className="flex items-center gap-3 rounded border border-gray-200 bg-gray-50 p-3 transition hover:bg-gray-100 dark:bg-gray-700/50 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              <Icon className="h-5 w-5 shrink-0 text-gray-600 dark:text-gray-400" />
              <div className="text-sm">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {shortcut.label}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {shortcut.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
