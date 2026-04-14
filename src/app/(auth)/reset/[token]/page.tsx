"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { resetPassword } from "../actions";

export default function ResetPage() {
  const params = useParams() as Record<string, string>;
  const token = params.token;
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await resetPassword(formData, token);
      if (!result.success) {
        setError(result.error || "Could not reset password");
      } else {
        router.push("/login?reset=true");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border bg-white p-8 shadow-sm dark:bg-gray-800 dark:border-gray-700">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">Set a new password</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Enter a new password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <label htmlFor="confirm" className="block text-sm font-medium">
            Confirm password
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            required
            minLength={8}
            className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving..." : "Set password"}
        </Button>
      </form>
    </div>
  );
}
