import "./globals.css";
import { Inter, Cairo } from "next/font/google";

// Self-hosted via next/font — no render-blocking CDN request
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
  preload: true,
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning className={`${inter.variable} ${cairo.variable}`}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
