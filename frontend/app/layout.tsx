import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/chrome-enhancements.css";
import { fetchActiveTheme } from "@/lib/theme/theme.server";
import { toStoreThemePresetId } from "@/lib/theme/types";
import { STORE_NAME } from "@/lib/config";
import { AuthProvider } from "@/components/auth-provider";
import { CartProvider } from "@/components/cart-provider";
import { AnalyticsProvider } from "@/components/analytics/analytics-provider";
import { fetchAnalyticsConfig } from "@/lib/analytics/analytics-config.server";
import { Header } from "@/components/layout/header";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { WhatsAppWidget } from "@/components/whatsapp-widget";
import { StorefrontToast } from "@/components/storefront-toast";
import { GoogleTagManager } from "@/components/analytics/google-tag-manager";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: STORE_NAME,
  description: `${STORE_NAME} — shop quality products with secure checkout and order tracking.`,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const activeTheme = await fetchActiveTheme();
  const storeTheme = toStoreThemePresetId(activeTheme);
  const analyticsConfig = await fetchAnalyticsConfig();

  return (
    <html lang="en" data-store-theme={storeTheme} data-theme={activeTheme}>
      <body className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased`}>
        <GoogleTagManager gtmId={analyticsConfig.gtmId} />
        <AnalyticsProvider config={analyticsConfig}>
          <AuthProvider>
            <CartProvider>
            <div
              className={
                storeTheme === "mehfil_shereen"
                  ? "mehfil-store-shell flex min-h-screen min-w-0 max-w-full flex-col bg-background"
                  : "flex min-h-screen min-w-0 max-w-full flex-col bg-background"
              }
            >
              <AnnouncementBar />
              <Header />
              <main className="min-w-0 flex-1 max-w-full bg-background pb-16 lg:pb-0">{children}</main>
              <Footer />
            </div>
            </CartProvider>
          </AuthProvider>
        </AnalyticsProvider>
        <MobileBottomNav />
        <WhatsAppWidget />
        <StorefrontToast />
      </body>
    </html>
  );
}
