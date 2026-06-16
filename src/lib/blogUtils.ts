// Shared helpers for blog content — used by both admin and public pages.

export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function excerpt(html: string, maxLength = 160): string {
  const text = stripHtml(html);
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, "") + "…";
}

export function wordCount(html: string) {
  const text = stripHtml(html);
  const words = text ? text.split(" ").length : 0;
  return { words, minutes: Math.max(1, Math.ceil(words / 200)) };
}

export function readingTime(html: string, wordsPerMinute = 200): number {
  const text = stripHtml(html);
  const words = text ? text.split(" ").length : 0;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
