import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";

import { PwaRegister } from "@/components/pwa/pwa-register";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "Draft Room",
  title: "Draft Room",
  description: "Draft Room: Songwriter Archive",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Draft Room"
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" }
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
  }
};

export const viewport: Viewport = {
  themeColor: "#0F4C81"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <PwaRegister />
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
