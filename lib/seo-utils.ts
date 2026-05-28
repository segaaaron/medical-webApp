/**
 * Safely serialize an object for inline JSON-LD.
 * Escapes <, >, & to prevent script injection via injected backend strings.
 */
export function safeJsonLd(obj: unknown): string {
  return JSON.stringify(obj)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
}
