import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // App pessoal single-user: nada de configuração exótica.
  experimental: {
    // Server Actions já são estáveis no Next 15; sem flags extras.
  },
};

export default nextConfig;
