import type { NextConfig } from "next";
const config: NextConfig = {
  devIndicators: false,
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg", "bcryptjs"],
  async headers() { return [{ source: "/:path*", headers: [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Permissions-Policy", value: "camera=(self), microphone=()" },
  ] }]; },
};
export default config;
