import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AppIo.AI - Construction AI Assistant",
  description: "Your expert AI assistant for all construction trades. Voice-powered, vision-enabled, and always learning.",
  icons: {
    icon: [
      { url: '/icon.png', sizes: '1024x1024', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '1024x1024', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
