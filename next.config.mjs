/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  ...(process.env.NODE_ENV === "production" && {
    outputFileTracingRoot: "/app",
  }),
};

export default nextConfig;
