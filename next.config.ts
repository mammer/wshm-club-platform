import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import withBundleAnalyzer from "@next/bundle-analyzer";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
const analyzeBundles = withBundleAnalyzer({ enabled: process.env.ANALYZE === "true" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://wshm.ma";

// Content-Security-Policy — tightened for production
// 'unsafe-inline' on style-src is required by Tiptap and SweetAlert2 (inline styles)
const CSP = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline' 'unsafe-eval'`,       // unsafe-eval needed by Next.js dev + some libs
  `style-src 'self' 'unsafe-inline'`,                       // Tiptap / SweetAlert2 use inline styles
  `img-src 'self' data: blob:`,
  `font-src 'self' data:`,                                  // next/font self-hosts — no external font CDN
  `connect-src 'self'`,
  `frame-src 'none'`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `upgrade-insecure-requests`,
].join("; ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
    formats: ["image/avif", "image/webp"],
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy",   value: CSP },
          { key: "X-Content-Type-Options",    value: "nosniff" },
          { key: "X-Frame-Options",           value: "SAMEORIGIN" },
          { key: "X-XSS-Protection",          value: "1; mode=block" },
          { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
      {
        // Immutable cache for timestamped uploads
        source: "/uploads/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

// CSRF origin check is enforced in src/lib/apiAuth.ts at the API layer
// (siteUrl is exported so apiAuth can import it)
export { siteUrl };
export default analyzeBundles(withNextIntl(nextConfig));
