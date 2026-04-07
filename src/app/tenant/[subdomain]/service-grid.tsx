"use client";

import { useState } from "react";
import Link from "next/link";
import type { Service } from "@prisma/client";

export function ServiceGrid({ services }: { services: Service[] }) {
  const categories = Array.from(new Set(services.map((s) => s.category).filter(Boolean))) as string[];
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory ? services.filter((s) => s.category === activeCategory) : services;

  return (
    <div className="space-y-6">
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === null
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((service) => (
          <Link
            key={service.id}
            href={`/book/${service.id}`}
            className="block rounded-lg border bg-white p-6 shadow-sm transition hover:shadow-md dark:bg-gray-800 dark:border-gray-700"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-lg font-semibold">{service.name}</h3>
              {service.category && (
                <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  {service.category}
                </span>
              )}
            </div>
            {service.description && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {service.description}
              </p>
            )}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">{service.duration} minutes</span>
              {service.price && (
                <span className="font-medium">${(service.price / 100).toFixed(2)}</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
