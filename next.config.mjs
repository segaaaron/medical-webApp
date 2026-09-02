/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * Direcciones que dejaron de existir. Se declaran aquí y no en el código de
   * cada página para que se resuelvan antes de renderizar nada: un 308 seco,
   * sin coste, y sin que nadie llegue a ver un 404.
   */
  async redirects() {
    return [
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
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-XSS-Protection", value: "1; mode=block" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
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
