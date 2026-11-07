import { aliasRedirects } from "./lib/seo/treatment-aliases.mjs"

/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * Direcciones que dejaron de existir. Se declaran aquí y no en el código de
   * cada página para que se resuelvan antes de renderizar nada: un 308 seco,
   * sin coste, y sin que nadie llegue a ver un 404.
   */
  async redirects() {
    return [
      /**
       * URLs cortas de palabra clave: `/botox` → la ficha real.
       *
       * El slug del panel es un nombre clínico largo que nadie teclea ni puede
       * dictar por teléfono. Estos alias dan una dirección memorizable para la
       * bio de Instagram, un flyer o el boca a boca, y consolidan en la ficha
       * la autoridad de cualquier enlace entrante. Ver
       * `lib/seo/treatment-aliases.mjs`.
       */
      ...(await aliasRedirects()),
      {
        /**
         * www → apex, permanente.
         *
         * Hasta que se añadió `www` en Dokploy, ese nombre servía el
         * certificado por defecto de Traefik (autofirmado) y el navegador
         * mostraba «Tu conexión no es privada» — justo a quien llegaba desde
         * Google, que tenía indexada la variante www. Con el certificado ya
         * emitido, www responde 200… con el MISMO contenido que el apex: dos
         * URLs gemelas compitiendo entre sí.
         *
         * El `canonical` ya apunta al apex, pero eso es una sugerencia que
         * Google puede ignorar. Un 301 no: consolida toda la autoridad en una
         * sola dirección y no deja lugar a interpretación.
         */
        source: "/:path*",
        has: [{ type: "host", value: "www.yasminmedrano.com" }],
        destination: "https://yasminmedrano.com/:path*",
        permanent: true,
      },
      {
        // El panel de Citas se retiró: no existía backend que lo alimentara.
        // Lo más cercano en propósito —quién escribió pidiendo hora— son los
        // contactos del formulario web.
        source: "/dashboard/citas",
        destination: "/dashboard/contactos",
        permanent: true,
      },
      {
        // El editor del home vivía en /dashboard, que ahora es el Resumen.
        source: "/dashboard/home",
        destination: "/dashboard/inicio",
        permanent: true,
      },
    ]
  },

  /**
   * El tracker de Umami se sirve desde nuestro dominio: los bloqueadores que
   * filtran hosts `analytics.*` no lo ven. El script es un archivo estático y
   * basta el rewrite; el recolector (`/api/send`) es un Route Handler porque
   * tiene que pasarle a Umami la IP real del visitante.
   *
   * beforeFiles: se resuelve antes que `public/` y las rutas de la app.
   * NEXT_PUBLIC_UMAMI_URL llega en build (ARG del Dockerfile), que es cuando
   * se congelan los rewrites.
   */
  async rewrites() {
    const umami = process.env.NEXT_PUBLIC_UMAMI_URL
    return {
      beforeFiles: umami ? [{ source: "/script.js", destination: `${umami}/script.js` }] : [],
    }
  },

  output: "standalone",

  /**
   * Techo de obsolescencia del contenido público.
   *
   * Por defecto Next sirve `stale-while-revalidate` de ~1 año: si por lo que
   * sea la invalidación on-demand no llega (proceso reiniciado a mitad, varias
   * réplicas del contenedor donde solo una atiende la escritura), esa página
   * puede quedarse servida en su versión vieja indefinidamente. Fue justo lo
   * que pasó con las reseñas aprobadas.
   *
   * Con esto el peor caso absoluto son 5 minutos, no un año. La invalidación
   * explícita sigue siendo el camino normal — esto es solo la red debajo.
   */
  expireTime: 300,
  async headers() {
    const isProd = process.env.NODE_ENV === "production"

    /**
     * CSP de las páginas públicas, en modo SOLO REPORTE.
     *
     * ────────────────────────────────────────────────────────────────────────
     * POR QUÉ ESTABA FALTANDO
     *
     * `middleware.ts` aplica HSTS y CSP, pero su `matcher` es
     * `["/dashboard/:path*"]`. O sea: el panel iba protegido y el sitio
     * público —las 37 URLs que ve un paciente y rastrea Google— no recibía
     * ninguna de las dos. Medido en producción: `/` y las fichas de
     * tratamiento devolvían `X-Frame-Options` y `Referrer-Policy`, pero ni
     * `Strict-Transport-Security` ni `Content-Security-Policy`.
     *
     * ────────────────────────────────────────────────────────────────────────
     * POR QUÉ `Report-Only` Y NO BLOQUEANTE
     *
     * La política del middleware NO se puede copiar tal cual: lleva
     * `frame-src 'none'`, y `/contacto` incrusta el mapa de Google. Una CSP
     * bloqueante con esa línea deja la página de contacto sin mapa, que es
     * justo donde el paciente mira cómo llegar.
     *
     * Aquí va con el mapa permitido y en modo reporte: el navegador avisa de
     * lo que habría bloqueado sin romper nada. Cuando los informes salgan
     * limpios durante unos días, se cambia la clave a
     * `Content-Security-Policy` y pasa a bloquear de verdad.
     *
     * Las fuentes externas son las que el sitio carga de hecho: los tres
     * píxeles (Meta, TikTok, Google Ads) y Google Fonts. Si se quitan los
     * píxeles —ver el informe de privacidad— esta lista se reduce con ellos.
     */
    const publicCsp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net https://analytics.tiktok.com https://www.googleadservices.com https://googleads.g.doubleclick.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "media-src 'self'",
      "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://www.facebook.com https://analytics.tiktok.com https://*.tiktok.com https://*.byteoversea.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://www.google.com",
      // El mapa de `/contacto`. `'none'` lo dejaría en blanco.
      "frame-src 'self' https://www.google.com https://maps.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")

    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-XSS-Protection", value: "1; mode=block" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "Content-Security-Policy-Report-Only", value: publicCsp },
      // HSTS solo en producción: en desarrollo se sirve por http y fijaría el
      // navegador a https contra localhost.
      //
      // Sin `preload` a propósito. El middleware lo manda para `/dashboard`,
      // pero entrar en la lista de precarga requiere darse de alta a mano en
      // hstspreload.org y es MUY difícil de revertir: hasta que no esté
      // confirmado que todos los subdominios sirven https, el valor seguro es
      // este. Dos años de `max-age` ya es la recomendación habitual.
      ...(isProd
        ? [
            {
              key: "Strict-Transport-Security",
              value: "max-age=63072000; includeSubDomains",
            },
          ]
        : []),
    ]

    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/videos/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    /**
     * Cuánto guarda Next una imagen YA optimizada antes de volver a pedir el
     * original al backend.
     *
     * Por defecto son 60 segundos, así que el optimizador reconstruía las
     * variantes AVIF/WebP y volvía a leer del origen constantemente. Un año,
     * porque la clave de caché incluye la URL de origen y los nombres del
     * backend llevan marca de tiempo: una imagen nueva es una URL nueva y
     * entra por su propia puerta.
     *
     * No se tocan `deviceSizes` ni `quality`: recortar los anchos ablandaría
     * las fotos a pantalla completa en retina, que es exactamente lo que no se
     * quiere perder.
     */
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "service.drayasminmedrano-services.cloud",
        pathname: "/uploads/**",
      },
      {
        // Local Next.js upload proxy — serves uploads through /api/uploads/*
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/api/uploads/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
