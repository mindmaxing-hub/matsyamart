import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { type ReactNode } from "react";

import appCss from "../styles.css?url";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { CartDrawer } from "../components/layout/CartDrawer";
import { WishlistDrawer } from "../components/layout/WishlistDrawer";
import { CookieConsentBanner } from "../components/site/CookieConsentBanner";
import { DataProvider } from "../context/DataContext";
import { CartProvider } from "../context/CartContext";
import { WishlistProvider } from "../context/WishlistContext";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#FAFAF9] px-4 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-7xl font-bold font-display text-slate-900">404</h1>
        <h2 className="text-xl font-bold text-slate-800">Shore Not Found</h2>
        <p className="text-xs text-slate-500">
          The coastal experience or artisan page you are looking for does not
          exist or has shifted with the tide.
        </p>
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-black transition-colors"
        >
          Return to Catalog
        </a>
      </div>
    </div>
  );
}

function ErrorComponent({ error }: { error: Error; reset: () => void }) {
  console.error("Root error boundary caught:", error);
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#FAFAF9] px-4 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-2xl font-bold font-display text-slate-900">
          Experience Failed to Load
        </h1>
        <p className="text-xs text-slate-500">
          A temporary network or rendering error occurred. Please refresh the
          page to retry.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-black transition-colors cursor-pointer"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    head: () => ({
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          title:
            "MatsyaMart | Direct-to-Community Coastal Experiences & Crafts",
        },
        {
          name: "description",
          content:
            "Curated community-led coastal walks, workshops, artisanal seafood feasts, and pantry goods from indigenous fishing villages.",
        },
      ],
      links: [
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..800;1,9..144,300..800&family=Inter:wght@300;400;500;600;700;800&display=swap",
        },
        {
          rel: "stylesheet",
          href: appCss,
        },
        {
          rel: "icon",
          href: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🐟</text></svg>",
        },
      ],
    }),
    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
  },
);

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-[#FAFAF9] text-slate-900 antialiased min-h-screen selection:bg-amber-100 selection:text-amber-900">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  let currentPath = "/";
  try {
    const routerState = useRouterState();
    currentPath = routerState?.location?.pathname || "/";
  } catch {
    if (typeof window !== "undefined") {
      currentPath = window.location.pathname;
    }
  }

  const isAdmin = currentPath.startsWith("/admin");

  if (isAdmin) {
    return (
      <QueryClientProvider client={queryClient}>
        <DataProvider>
          <CartProvider>
            <WishlistProvider>
              <Outlet />
            </WishlistProvider>
          </CartProvider>
        </DataProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <DataProvider>
        <CartProvider>
          <WishlistProvider>
            <div className="min-h-screen flex flex-col bg-[#FAFAF9] text-slate-900">
              <Navbar />
              <main className="flex-1">
                <Outlet />
              </main>
              <Footer />
              <CartDrawer />
              <WishlistDrawer />
              <CookieConsentBanner />
            </div>
          </WishlistProvider>
        </CartProvider>
      </DataProvider>
    </QueryClientProvider>
  );
}
