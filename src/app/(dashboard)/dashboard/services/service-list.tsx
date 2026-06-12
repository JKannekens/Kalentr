"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteService, updateService } from "./actions";
import { Clock, Pencil, Trash2, Briefcase } from "lucide-react";
import type { Service } from "@prisma/client";

export function ServiceList({ services }: { services: Service[] }) {
  const categories = Array.from(
    new Set(services.map((s) => s.category).filter(Boolean))
  ) as string[];
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? services.filter((s) => s.category === activeCategory)
    : services;

  if (services.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-10 text-center">
        <Briefcase className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
        <p className="font-medium text-foreground mb-1">No services yet</p>
        <p className="text-sm text-muted-foreground">Add your first service using the form on the right.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setActiveCategory(null)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              activeCategory === null
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}>
            All
          </button>
          {categories.map((cat) => (
            <button key={cat} type="button" onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}>
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
    if (!confirm("Delete this service? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const result = await deleteService(service.id);
      if (!result.success) setError(result.error || "Failed to delete");
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
      if (!result.success) setError(result.error || "Failed to update");
      else setEditing(false);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "block w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:bg-gray-800 dark:border-gray-700";

  if (editing) {
    return (
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <form onSubmit={handleUpdate} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">{error}</div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Name</label>
              <input name="name" type="text" required defaultValue={service.name} className={inputClass} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea name="description" rows={2} defaultValue={service.description || ""} className={inputClass} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Category</label>
              <input name="category" type="text" defaultValue={service.category || ""} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Duration (min)</label>
              <input name="duration" type="number" required min={5} step={5} defaultValue={service.duration} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price ($)</label>
              <input name="price" type="number" min={0} step={0.01} defaultValue={service.price ? service.price / 100 : ""} className={inputClass} />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="submit" size="sm" disabled={loading}>{loading ? "Saving…" : "Save"}</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      {error && (
        <div className="mb-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">{error}</div>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground">{service.name}</h3>
            {service.category && (
              <span className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium">
                {service.category}
              </span>
            )}
            {!service.isActive && (
              <span className="rounded-full bg-muted text-muted-foreground px-2.5 py-0.5 text-xs">
                Inactive
              </span>
            )}
          </div>
          {service.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{service.description}</p>
          )}
          <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {service.duration} min
            </span>
            {service.price != null && service.price > 0 && (
              <span className="font-semibold text-foreground">${(service.price / 100).toFixed(2)}</span>
            )}
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDelete} disabled={deleting}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
