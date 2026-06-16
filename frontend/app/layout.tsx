import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getStoreThemeId } from "@/lib/store-theme";
import { STORE_NAME } from "@/lib/config";
import { AuthProvider } from "@/components/auth-provider";
import { CartProvider } from "@/components/cart-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const storeTheme = getStoreThemeId();

  return (
    <html lang="en" data-store-theme={storeTheme}>
      <body className={`${geistSans.variable} ${geistMono.variable} bg-brand-bg text-brand-text antialiased`}>
        <AuthProvider>
          <CartProvider>
            <div
              className={
                storeTheme === "mehfil_shereen"
                  ? "mehfil-store-shell flex min-h-screen min-w-0 max-w-full flex-col bg-brand-bg"
                  : "flex min-h-screen min-w-0 max-w-full flex-col bg-brand-bg"
              }
            >
              <Header />
              <main className="min-w-0 flex-1 max-w-full bg-brand-bg">{children}</main>
              <Footer />
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
