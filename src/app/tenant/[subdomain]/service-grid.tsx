"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import type { Service } from "@prisma/client";

interface ServiceGridProps {
  services: Service[];
  primaryColor: string;
}

export function ServiceGrid({ services, primaryColor }: ServiceGridProps) {
  const categories = Array.from(
    new Set(services.map((s) => s.category).filter(Boolean))
  ) as string[];
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? services.filter((s) => s.category === activeCategory)
    : services;

  return (
    <div className="space-y-4">
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            style={activeCategory === null ? { background: primaryColor } : {}}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              activeCategory === null
                ? "text-white shadow-sm"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              style={activeCategory === cat ? { background: primaryColor } : {}}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "text-white shadow-sm"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((service) => (
          <Link
            key={service.id}
            href={`/book/${service.id}`}
            className="group flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white p-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-md"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">
                {service.name}
              </p>
              <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-gray-400">
                <Clock className="h-3 w-3" />
                {service.duration} min
                {service.category ? ` · ${service.category}` : ""}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2.5">
              {service.price != null && service.price > 0 && (
                <span
                  className="text-sm font-semibold"
                  style={{ color: primaryColor }}
                >
                  ${(service.price / 100).toFixed(2)}
                </span>
              )}
              <span
                style={{ background: primaryColor }}
                className="rounded-lg px-3 py-1 text-xs font-medium text-white shadow-sm transition-transform group-hover:scale-105"
              >
                Book
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
