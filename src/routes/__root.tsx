import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { type ReactNode } from "react";

import appCss from "../styles.css?url";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { CartDrawer } from "../components/layout/CartDrawer";
import { DataProvider } from "../context/DataContext";
import { CartProvider } from "../context/CartContext";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#F8FAFC] px-4 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-7xl font-bold font-display text-ocean-950">404</h1>
        <h2 className="text-xl font-bold text-slate-800">Shore Not Found</h2>
        <p className="text-xs text-slate-500">
          The coastal experience or artisan page you are looking for does not
          exist or has shifted with the tide.
        </p>
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-xl bg-ocean-800 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-ocean-900 transition-colors"
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
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#F8FAFC] px-4 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-2xl font-bold font-display text-ocean-950">
          Experience Failed to Load
        </h1>
        <p className="text-xs text-slate-500">
          A temporary network or rendering error occurred. Please refresh the
          page to retry.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center rounded-xl bg-ocean-800 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-ocean-900 transition-colors cursor-pointer"
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
        {
          name: "viewport",
          content:
            "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
        },
        {
          title:
            "MatsyaMart | Coastal Experiences & Indigenous Community Marketplace",
        },
        {
          name: "description",
          content:
            "Authentic coastal walks, boat safaris, hands-on workshops, and artisanal goods curated with indigenous coastal communities.",
        },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossOrigin: "anonymous",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400&family=Inter:wght@300;400;500;600;700&display=swap",
        },
      ],
      scripts: [
        { src: "https://checkout.razorpay.com/v1/checkout.js", async: true },
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
      <body className="bg-[#29100b] text-[#f5edeb] antialiased min-h-screen">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <DataProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col bg-[#29100b] text-[#f5edeb]">
            <Navbar />
            <div className="flex-1">
              <Outlet />
            </div>
            <Footer />
            <CartDrawer />
          </div>
        </CartProvider>
      </DataProvider>
    </QueryClientProvider>
  );
}
