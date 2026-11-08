import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Os casos ficam em src/dados e são lidos só no servidor.
  poweredByHeader: false,
};

export default nextConfig;
