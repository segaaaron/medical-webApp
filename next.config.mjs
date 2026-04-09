/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  ...(process.env.NODE_ENV === "production" && {
    outputFileTracingRoot: "/app",
  }),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
