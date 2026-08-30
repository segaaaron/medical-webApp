"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.startsWith("/dashboard")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let rafId: number;

    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [pathname]);

  // Las secciones se cargan con dynamic(): al llegar con un hash desde otra ruta
  // el ancla todavía no existe y el navegador no hace scroll. Reintentamos hasta
  // que el elemento aparezca en el DOM.
  useEffect(() => {
    if (pathname?.startsWith("/dashboard")) return;

    const id = window.location.hash.slice(1);
    if (!id) return;

    let rafId: number;
    const deadline = performance.now() + 4000;

    function tryScroll() {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ block: "start" });
        return;
      }
      if (performance.now() < deadline) rafId = requestAnimationFrame(tryScroll);
    }

    rafId = requestAnimationFrame(tryScroll);
    return () => cancelAnimationFrame(rafId);
  }, [pathname]);

  return <>{children}</>;
}
