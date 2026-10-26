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
import { WhatsAppChat } from "../components/site/WhatsAppChat";
import { DataProvider } from "../context/DataContext";
import { CartProvider } from "../context/CartContext";
import { WishlistProvider } from "../context/WishlistContext";
import { CartRestoreListener } from "../components/cart/CartRestoreListener";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#29100b] px-4 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-7xl font-bold font-display text-[#e3a157]">404</h1>
        <h2 className="text-xl font-bold text-[#f5edeb]">Shore Not Found</h2>
        <p className="text-xs text-[#dab38c]">
          The coastal experience or artisan page you are looking for does not
          exist or has shifted with the tide.
        </p>
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-xl bg-[#e3a157] px-5 py-2.5 text-xs font-bold text-[#29100b] shadow-md hover:bg-[#dab38c] transition-colors"
        >
          Return to Catalog
        </a>
      </div>
    </div>
  );
}

function ErrorComponent({ error }: { error: unknown; reset: () => void }) {
  console.error("Root error boundary caught:", error);
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#29100b] px-4 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-2xl font-bold font-display text-[#f5edeb]">
          Experience Failed to Load
        </h1>
        <p className="text-xs text-[#dab38c]">
          A temporary network or rendering error occurred. Please refresh the
          page to retry.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center rounded-xl bg-[#e3a157] px-5 py-2.5 text-xs font-bold text-[#29100b] shadow-md hover:bg-[#dab38c] transition-colors cursor-pointer"
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
          rel: "preconnect",
          href: "https://fonts.googleapis.com",
        },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossOrigin: "anonymous",
        },
        {
          rel: "preconnect",
          href: "https://images.unsplash.com",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600..700&family=Inter:wght@400;500;600;700&display=swap",
        },
        {
          rel: "stylesheet",
          href: appCss,
        },
        {
          rel: "icon",
          type: "image/png",
          href: "/favicon.png",
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
        {/* Meta Pixel Code (ID: 1795293538302324) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1795293538302324');
fbq('track', 'PageView');`,
          }}
        />
      </head>
      <body className="bg-[#29100b] text-[#f5edeb] antialiased min-h-screen selection:bg-[#e3a157] selection:text-[#29100b]">
        {/* Meta Pixel NoScript Fallback */}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1795293538302324&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
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
              <CartRestoreListener />
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
            <div className="min-h-screen flex flex-col bg-[#29100b] text-[#f5edeb]">
              <CartRestoreListener />
              <Navbar />
              <main className="flex-1">
                <Outlet />
              </main>
              <Footer />
              <CartDrawer />
              <WishlistDrawer />
              <CookieConsentBanner />
              <WhatsAppChat />
            </div>
          </WishlistProvider>
        </CartProvider>
      </DataProvider>
    </QueryClientProvider>
  );
}
