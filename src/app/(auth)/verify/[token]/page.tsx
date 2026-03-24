"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { verifyEmail } from "../actions";

export default function VerifyPage() {
  const params = useParams() as Record<string, string>;
  const token = params.token;
  const router = useRouter();
  const [status, setStatus] = useState<"pending" | "success" | "error">(
    "pending",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      const result = await verifyEmail(token);
      if (result.success) {
        setStatus("success");
        setTimeout(() => router.push("/login?verified=true"), 2000);
      } else {
        setStatus("error");
        setError(result.error || "Verification failed");
      }
    }
    run();
  }, [token, router]);

  return (
    <div className="rounded-lg border bg-white p-8 shadow-sm dark:bg-gray-800 dark:border-gray-700 text-center">
      {status === "pending" && <p>Verifying your email...</p>}
      {status === "success" && (
        <p className="text-green-600">
          Email verified! Redirecting to login...
        </p>
      )}
      {status === "error" && <p className="text-red-600">{error}</p>}
    </div>
  );
}
