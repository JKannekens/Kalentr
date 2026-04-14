import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/ui/LogoutButton";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-40 border-b border-border/60 bg-card/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-xl font-semibold tracking-tight hover:opacity-80 transition-opacity"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                  K
                </span>
                Kalentr
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline text-sm text-muted-foreground">
                {session.user.email}
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
