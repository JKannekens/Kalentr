"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, ArrowRight, Tag } from "lucide-react";
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
    <div className="space-y-6">
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            style={activeCategory === null ? { background: primaryColor } : {}}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              activeCategory === null
                ? "text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
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
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((service) => (
          <Link
            key={service.id}
            href={`/book/${service.id}`}
            className="group flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors leading-snug">
                {service.name}
              </h3>
              {service.category && (
                <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                  <Tag className="h-3 w-3" />
                  {service.category}
                </span>
              )}
            </div>

            {/* Description */}
            {service.description && (
              <p className="text-sm text-gray-500 leading-relaxed flex-1 mb-5">
                {service.description}
              </p>
            )}
            {!service.description && <div className="flex-1 mb-5" />}

            {/* Footer row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                  <Clock className="h-3.5 w-3.5" />
                  {service.duration} min
                </span>
                {service.price != null && service.price > 0 && (
                  <span className="text-sm font-semibold text-gray-900">
                    ${(service.price / 100).toFixed(2)}
                  </span>
                )}
              </div>
              <span
                style={{ color: primaryColor }}
                className="inline-flex items-center gap-1 text-sm font-medium transition-all group-hover:gap-2"
              >
                Book now
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
