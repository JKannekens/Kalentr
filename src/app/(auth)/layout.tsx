import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-emerald-50/60 to-white dark:from-gray-900 dark:to-gray-950 px-4 py-12">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2.5 group"
      >
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-sm group-hover:opacity-90 transition-opacity">
          K
        </span>
        <span className="text-xl font-semibold tracking-tight">Kalentr</span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
