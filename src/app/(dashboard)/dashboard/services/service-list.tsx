"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteService, updateService } from "./actions";
import type { Service } from "@prisma/client";

export function ServiceList({ services }: { services: Service[] }) {
  const categories = Array.from(new Set(services.map((s) => s.category).filter(Boolean))) as string[];
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory ? services.filter((s) => s.category === activeCategory) : services;

  if (services.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center dark:bg-gray-800 dark:border-gray-700">
        <p className="text-gray-500">No services yet. Add your first service to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              activeCategory === null
                ? "bg-emerald-600 text-white"
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
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}
      {filtered.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}

function ServiceCard({ service }: { service: Service }) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this service?")) return;
    
    setDeleting(true);
    try {
      const result = await deleteService(service.id);
      if (!result.success) {
        setError(result.error || "Failed to delete");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setDeleting(false);
    }
  }

  async function handleUpdate(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("isActive", service.isActive ? "true" : "false");

    try {
      const result = await updateService(service.id, formData);
      if (!result.success) {
        setError(result.error || "Failed to update");
      } else {
        setEditing(false);
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (editing) {
    return (
      <div className="rounded-lg border bg-white p-6 dark:bg-gray-800 dark:border-gray-700">
        <form onSubmit={handleUpdate} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              name="name"
              type="text"
              required
              defaultValue={service.name}
              className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              name="description"
              rows={2}
              defaultValue={service.description || ""}
              className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Category (optional)</label>
            <input
              name="category"
              type="text"
              defaultValue={service.category || ""}
              placeholder="e.g. Consultation, Treatment, Workshop"
              className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Duration (min)</label>
              <input
                name="duration"
                type="number"
                required
                min={5}
                step={5}
                defaultValue={service.duration}
                className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Price ($)</label>
              <input
                name="price"
                type="number"
                min={0}
                step={0.01}
                defaultValue={service.price ? service.price / 100 : ""}
                className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white p-6 dark:bg-gray-800 dark:border-gray-700">
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold">{service.name}</h3>
            {service.category && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                {service.category}
              </span>
            )}
            {!service.isActive && (
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                Inactive
              </span>
            )}
          </div>
          {service.description && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {service.description}
            </p>
          )}
          <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
            <span>{service.duration} min</span>
            {service.price && <span>${(service.price / 100).toFixed(2)}</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            {deleting ? "..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
