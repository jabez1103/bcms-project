import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: false,
  allowedDevOrigins: ['10.31.103.218:3000', '10.31.103.218', '10.104.47.218:3000', 
    '10.104.47.218', '10.0.10.235:3000', '10.0.10.235',
    '192.168.1.11:3000', '192.168.1.11',
     'localhost:3000', 'localhost'],
};

export default nextConfig;
