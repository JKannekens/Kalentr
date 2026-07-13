"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SsoButtons } from "@/components/auth/sso-buttons";
import type { SsoProviderId } from "@/lib/sso";
import { MailCheck } from "lucide-react";
import { register } from "./actions";

interface RegisterFormProps {
  ssoProviders: SsoProviderId[];
}

export function RegisterForm({ ssoProviders }: RegisterFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const result = await register(formData);
      if (!result.success) {
        setError(result.error || "Registration failed");
      } else {
        setSubmittedEmail(formData.get("email") as string);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submittedEmail) {
    return (
      <div className="rounded-2xl border bg-white shadow-sm dark:bg-gray-900 dark:border-gray-800 px-8 py-10 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/30">
          <MailCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a verification link to{" "}
          <span className="font-medium text-foreground">{submittedEmail}</span>.
          Click the link to activate your account.
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          The link expires in 24 hours. Don&apos;t forget to check your spam folder.
        </p>
        <div className="mt-6 text-sm text-muted-foreground">
          Already verified?{" "}
          <Link href="/login" className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white shadow-sm dark:bg-gray-900 dark:border-gray-800">
      <div className="px-8 pt-8 pb-6 border-b dark:border-gray-800">
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Start accepting bookings in minutes</p>
      </div>

      <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="name" className="block text-sm font-medium">Full name</label>
          <input
            id="name" name="name" type="text" required autoComplete="name"
            className="block w-full rounded-lg border bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium">Email</label>
          <input
            id="email" name="email" type="email" required autoComplete="email"
            className="block w-full rounded-lg border bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium">Password</label>
          <input
            id="password" name="password" type="password" required minLength={8}
            autoComplete="new-password"
            className="block w-full rounded-lg border bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:bg-gray-800 dark:border-gray-700"
          />
          <p className="text-xs text-muted-foreground">At least 8 characters with a number</p>
        </div>

        <Button type="submit" className="w-full mt-2" size="lg" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      {ssoProviders.length > 0 && (
        <div className="px-8 pb-6 -mt-2">
          <SsoButtons providers={ssoProviders} label="Sign up" />
        </div>
      )}

      <div className="px-8 pb-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
          Sign in
        </Link>
      </div>
    </div>
  );
}
