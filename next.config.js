const path = require('path');
const fs = require('fs');
const packageJson = require('./package.json');

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
  },

  async rewrites() {
    return [
      {
        source: '/gallery/:path*',
        destination: '/_gallery/:path*',
      },
    ];
  },

  webpack: (config, { isServer }) => {
    if (isServer && process.env.NODE_ENV === 'production') {
      const prodGalleryPath = '/home/ubuntu/public/ps15642.com-nextJS/public/gallery';
      const staticTarget = path.join(__dirname, 'public/_gallery');

      try {
        if (fs.existsSync(staticTarget)) {
          fs.rmSync(staticTarget, { recursive: true });
        }

        fs.mkdirSync(staticTarget, { recursive: true });
        fs.cpSync(prodGalleryPath, staticTarget, { recursive: true });
        console.log('✅ Copied production gallery to public/_gallery');
      } catch (err) {
        console.warn('⚠️ Failed to copy production gallery:', err);
      }
    }

    return config;
  },
};

module.exports = nextConfig;
