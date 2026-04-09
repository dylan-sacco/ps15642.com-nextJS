const packageJson = require('./package.json');

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb',
    },
    // Increase body size limit for route handlers (default 10 MB)
    proxyClientMaxBodySize: '500mb',
  },
  allowedDevOrigins: ['172.22.64.1', '192.168.0.104'],
};

module.exports = nextConfig;
