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
