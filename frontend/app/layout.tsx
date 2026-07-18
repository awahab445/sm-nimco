import type { Metadata } from "next";
import { Geist, Jost, Poppins } from "next/font/google";
import "./globals.css";
import "../styles/chrome-enhancements.css";
import { fetchActiveTheme } from "@/lib/theme/theme.server";
import { toStoreThemePresetId } from "@/lib/theme/types";
import { AuthProvider } from "@/components/auth-provider";
import { CartProvider } from "@/components/cart-provider";
import { WishlistProvider } from "@/components/wishlist-provider";
import { AnalyticsProvider } from "@/components/analytics/analytics-provider";
import { fetchAnalyticsConfig } from "@/lib/analytics/analytics-config.server";
import { Header } from "@/components/layout/header";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Footer } from "@/components/layout/footer";
import { DeferredChrome } from "@/components/layout/deferred-chrome";
import { GoogleTagManager } from "@/components/analytics/google-tag-manager";
import { rootMetadata } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: true,
});

const jost = Jost({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: true,
});

const poppins = Poppins({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  adjustFontFallback: true,
});

export const metadata: Metadata = rootMetadata();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const activeTheme = await fetchActiveTheme();
  const storeTheme = toStoreThemePresetId(activeTheme);
  const analyticsConfig = await fetchAnalyticsConfig();
  const isEssa = storeTheme === "essa_chemicals";

  return (
    <html
      lang="en"
      data-store-theme={storeTheme}
      data-theme={activeTheme}
      suppressHydrationWarning
    >
      <body
        className={`${geistSans.variable}${isEssa ? ` ${jost.variable} ${poppins.variable}` : ""} bg-background text-foreground antialiased`}
      >
        <GoogleTagManager gtmId={analyticsConfig.gtmId} />
        <AnalyticsProvider config={analyticsConfig}>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <div
                  className={
                    storeTheme === "mehfil_shereen"
                      ? "mehfil-store-shell flex min-h-screen min-w-0 max-w-full flex-col bg-background"
                      : "flex min-h-screen min-w-0 max-w-full flex-col bg-background"
                  }
                >
                  <AnnouncementBar />
                  <Header />
                  <main className="min-w-0 max-w-full flex-1 overflow-x-clip bg-background pb-[calc(3.4375rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
                    {children}
                  </main>
                  <Footer theme={storeTheme} />
                </div>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </AnalyticsProvider>
        <DeferredChrome />
      </body>
    </html>
  );
}
