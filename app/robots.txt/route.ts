import { NextResponse } from "next/server";

export function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://wshm.ma";
  const body = `User-agent: *
Allow: /

Disallow: /admin/
Disallow: /api/

Sitemap: ${siteUrl}/sitemap.xml
`;
  return new NextResponse(body, { headers: { "Content-Type": "text/plain" } });
}
