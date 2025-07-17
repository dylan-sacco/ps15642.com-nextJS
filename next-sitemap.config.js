/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://ps15642.com',
  generateRobotsTxt: true,
  sitemapSize: 5000,
  exclude: ['/**'], // exclude all auto-routes if you're manually listing

  additionalPaths: async () => {
    const now = new Date().toISOString();

    return [
      {
        loc: 'https://ps15642.com',
        lastmod: now,
        changefreq: 'yearly',
        priority: 1,
      },
      {
        loc: 'https://ps15642.com/about',
        lastmod: now,
        changefreq: 'monthly',
        priority: 0.8,
      },
      {
        loc: 'https://ps15642.com/contact',
        lastmod: now,
        changefreq: 'monthly',
        priority: 0.8,
      },
      {
        loc: 'https://ps15642.com/gallery',
        lastmod: now,
        changefreq: 'yearly',
        priority: 0.8,
      },
      {
        loc: 'https://ps15642.com/services',
        lastmod: now,
        changefreq: 'weekly',
        priority: 0.8,
      },
    ];
  },
};
