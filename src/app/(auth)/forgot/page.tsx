"use client";

import { useState } from "react";
import Link from "next/link";
// router not needed here
import { Button } from "@/components/ui/button";
import { forgotPassword } from "./actions";

export default function ForgotPage() {
  // router may be used for redirects in the future
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await forgotPassword(formData);
      if (!result.success) {
        setError(result.error || "Something went wrong");
      } else {
        setDone(true);
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
        <h1 className="text-2xl font-bold">Reset your password</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Enter your account email and we&apos;ll send a reset link.
        </p>
      </div>

      {done ? (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-300">
          If an account exists for that email, we&apos;ve sent a reset link.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Remembered your password?{" "}
        <Link
          href="/login"
          className="font-medium text-blue-600 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
