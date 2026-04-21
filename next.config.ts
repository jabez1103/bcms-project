import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: false,
  allowedDevOrigins: ['10.31.103.218:3000','10.31.103.218','10.0.10.235', '10.104.47.218:3000', '10.104.47.218'],
};

export default nextConfig;
