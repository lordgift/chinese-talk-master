import type { NextConfig } from "next";
import packageJson from "./package.json";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['192.168.1.127'],
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
  },
};

export default nextConfig;
