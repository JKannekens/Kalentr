"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Service } from "@prisma/client";

interface ServicesSidebarProps {
  services: Service[];
}

export function ServicesSidebar({ services }: ServicesSidebarProps) {
  return (
    <div className="rounded-lg border bg-white p-4 dark:bg-gray-800 dark:border-gray-700">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          Services
        </h3>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
          {services.length}
        </span>
      </div>

      {services.length === 0 ? (
        <div className="mb-4 text-center py-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            No services yet
          </p>
          <Link href="/dashboard/services">
            <Button size="sm" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2 mb-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="rounded border border-gray-200 bg-gray-50 p-3 dark:bg-gray-700/50 dark:border-gray-600"
            >
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {service.name}
                </p>
                {service.category && (
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {service.category}
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <span>{service.duration} min</span>
                {service.price && (
                  <>
                    <span>•</span>
                    <span>${(service.price / 100).toFixed(2)}</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Link href="/dashboard/services" className="block">
        <Button variant="outline" size="sm" className="w-full">
          Manage Services
        </Button>
      </Link>
    </div>
  );
}
