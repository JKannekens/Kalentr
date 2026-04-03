"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createService } from "./actions";

export function ServiceForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("isActive", "true");

    try {
      const result = await createService(formData);
      if (!result.success) {
        setError(result.error || "Failed to create service");
      } else {
        setSuccess(true);
        e.currentTarget.reset();
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border bg-white p-6 dark:bg-gray-800 dark:border-gray-700">
      <h2 className="text-lg font-semibold mb-4">Add Service</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-600 dark:bg-green-900/20 dark:text-green-400">
            Service created successfully!
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Service Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="e.g. 30-Minute Consultation"
            className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium">
            Description (optional)
          </label>
          <textarea
            id="description"
            name="description"
            rows={2}
            placeholder="What does this service include?"
            className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-medium">
            Duration (minutes)
          </label>
          <input
            id="duration"
            name="duration"
            type="number"
            required
            min={5}
            step={5}
            defaultValue={30}
            className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium">
            Price (optional)
          </label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              id="price"
              name="price"
              type="number"
              min={0}
              step={0.01}
              placeholder="0.00"
              className="block w-full rounded-md border pl-7 pr-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Payment processing coming soon
          </p>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating..." : "Add Service"}
        </Button>
      </form>
    </div>
  );
}
