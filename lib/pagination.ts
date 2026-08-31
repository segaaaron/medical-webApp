/**
 * Ventana de páginas a mostrar en un paginador, con `-1` como marcador de
 * elipsis. Hasta 7 páginas se listan todas; a partir de ahí se muestran la
 * primera, la última y las vecinas de la actual.
 *
 * Vive aquí porque la usan dos paginadores con medios de navegación distintos
 * —el público navega por URL, el panel sobre datos en memoria— y la regla de
 * cuántos números caben no depende de eso.
 */
export function pageWindow(current: number, total: number): number[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: number[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) pages.push(-1)
  for (let p = start; p <= end; p++) pages.push(p)
  if (end < total - 1) pages.push(-1)
  pages.push(total)
  return pages
}
