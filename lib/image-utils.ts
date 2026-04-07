const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ""

/**
 * Resolves a backend image path to a browser-safe URL.
 * Safe to use in both Client and Server Components.
 */
export function resolveImageUrl(raw: string | null | undefined): string {
  if (!raw) return ""
  const cleaned = raw
    .replace(/^\/+(https?:\/\/)/, "$1")
    .replace(/^\/+(https?\/\/)/, "https://")
  if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) return cleaned
  if (raw.startsWith("/uploads/")) return `/api${raw}`
  if (raw.startsWith("/")) return `${BACKEND_URL}${raw}`
  return raw
}
