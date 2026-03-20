import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api routes (handled separately)
     * - _next (Next.js internals)
     * - static files (favicon, images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";
  
  // Get the root domain from environment
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
  
  // Check if we're on localhost for development
  const isLocalhost = hostname.includes("localhost") || hostname.includes("127.0.0.1");
  
  // Extract subdomain
  let subdomain: string | null = null;
  let isCustomDomain = false;
  
  if (isLocalhost) {
    // In development: subdomain.localhost:3000
    const parts = hostname.split(".");
    if (parts.length > 1 && parts[0] !== "www") {
      subdomain = parts[0];
    }
  } else {
    // In production
    const parts = hostname.split(".");
    
    if (hostname === rootDomain || hostname === `www.${rootDomain}`) {
      // Main app domain - no subdomain
      subdomain = null;
    } else if (hostname.endsWith(`.${rootDomain}`)) {
      // Subdomain of root domain (e.g., tenant.kalentr.com)
      subdomain = parts[0];
    } else {
      // Custom domain (e.g., bookings.mybusiness.com)
      isCustomDomain = true;
      subdomain = hostname; // We'll resolve this to a tenant via custom domain lookup
    }
  }
  
  // Store tenant info in headers for downstream use
  const requestHeaders = new Headers(req.headers);
  
  if (subdomain) {
    requestHeaders.set("x-tenant-subdomain", subdomain);
    requestHeaders.set("x-is-custom-domain", isCustomDomain.toString());
  }
  
  // If no subdomain, serve the main marketing/dashboard site
  if (!subdomain) {
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }
  
  // Rewrite to tenant-specific routes
  // /book/[slug] on subdomain -> /_tenant/[subdomain]/book/[slug]
  const newUrl = new URL(`/_tenant/${subdomain}${url.pathname}`, req.url);
  newUrl.search = url.search;
  
  return NextResponse.rewrite(newUrl, {
    request: { headers: requestHeaders },
  });
}
