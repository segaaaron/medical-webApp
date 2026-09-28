/**
 * Antes: fade de opacidad 0 → 1 con Framer Motion envolviendo TODO el <main>
 * de la home. El HTML del servidor llegaba con `style="opacity:0"` y el
 * navegador no contaba nada del hero como pintado hasta hidratar (~3 s con CPU
 * lenta): el párrafo del hero era el LCP y Lighthouse le atribuía 5 s de
 * "render delay". El hero ya tiene su propia entrada CSS que no oculta nada
 * (clases `hero-in*` en globals.css) y el póster va precargado, así que este
 * envoltorio no aporta nada: se deja como paso directo, sin nodo extra.
 * ponytail: queda solo para no tocar app/page.tsx; borrar el import y este archivo.
 */
export function FadeIn({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
