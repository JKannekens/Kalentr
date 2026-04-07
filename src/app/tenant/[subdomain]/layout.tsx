import { getTenant } from "@/lib/tenant";
import { notFound } from "next/navigation";
import Image from "next/image";

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const tenant = await getTenant(subdomain);
  
  if (!tenant) {
    notFound();
  }

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ "--primary-color": tenant.primaryColor } as React.CSSProperties}
    >
      <header className="border-b bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <div className="flex items-center gap-4">
            {tenant.logo && (
              <Image
                src={tenant.logo}
                alt={tenant.businessName}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
            )}
            <div>
              <h1 className="text-xl font-bold">{tenant.businessName}</h1>
              {tenant.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {tenant.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        {children}
      </main>
      <footer className="border-t bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl px-4 py-6 text-center text-sm text-gray-500">
          Powered by Kalentr
        </div>
      </footer>
    </div>
  );
}
