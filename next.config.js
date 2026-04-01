const packageJson = require('./package.json');

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
  },
  // Increase body size limit for route handlers (e.g. video uploads up to 500 MB)
  // Default is 10 MB. Value is in bytes.
  middlewareClientMaxBodySize: 500 * 1024 * 1024,
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb',
    },
  },
};

module.exports = nextConfig;
