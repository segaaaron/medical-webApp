/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  ...(process.env.NODE_ENV === "production" && {
    outputFileTracingRoot: "/app",
  }),
  images: {
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
