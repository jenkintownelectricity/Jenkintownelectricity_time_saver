import type { Metadata } from "next";
import "./globals.css";
import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "AppIo.AI - Construction AI Assistant",
  description: "Your expert AI assistant for all construction trades. Voice-powered, vision-enabled, and always learning.",
  keywords: ["construction", "AI assistant", "electrician", "contractor", "voice assistant", "photo analysis"],
  authors: [{ name: "AppIo.AI" }],
  creator: "AppIo.AI",
  publisher: "AppIo.AI",
  robots: "index, follow",
  openGraph: {
    type: "website",
    title: "AppIo.AI - Construction AI Assistant",
    description: "Your expert AI assistant for all construction trades. Voice-powered, vision-enabled, and always learning.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased">
        <LayoutWrapper>{children}</LayoutWrapper>
        <Toaster />
      </body>
    </html>
  );
}
