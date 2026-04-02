const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

function tagToSlug(tag) {
  return tag.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://ps15642.com',
  generateRobotsTxt: true,
  sitemapSize: 5000,
  exclude: ['/**'], // all routes listed manually below

  additionalPaths: async () => {
    const now = new Date().toISOString();

    // --- Static routes ---
    const staticRoutes = [
      { loc: 'https://ps15642.com',          changefreq: 'yearly',  priority: 1.0 },
      { loc: 'https://ps15642.com/about',     changefreq: 'monthly', priority: 0.8 },
      { loc: 'https://ps15642.com/services',  changefreq: 'monthly', priority: 0.8 },
      { loc: 'https://ps15642.com/gallery',   changefreq: 'weekly',  priority: 0.7 },
      { loc: 'https://ps15642.com/contact',   changefreq: 'monthly', priority: 0.8 },
      { loc: 'https://ps15642.com/blog',  changefreq: 'weekly',  priority: 0.8 },
    ].map(r => ({ ...r, lastmod: now }));

    // --- content/pages/*.md → service pages ---
    const pagesDir = path.join(process.cwd(), 'content/pages');
    let serviceRoutes = [];
    try {
      serviceRoutes = fs
        .readdirSync(pagesDir)
        .filter(f => f.endsWith('.md'))
        .map(file => ({
          loc: `https://ps15642.com/${file.replace(/\.md$/, '')}`,
          lastmod: now,
          changefreq: 'monthly',
          priority: 0.8,
        }));
    } catch { /* no pages yet */ }

    // --- content/blog/*.md → article + tag pages ---
    const blogDir = path.join(process.cwd(), 'content/blog');
    let blogRoutes = [];
    let tagRoutes = [];
    try {
      const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));
      const tagMap = new Map(); // slug → first seen display name

      for (const file of files) {
        const raw = fs.readFileSync(path.join(blogDir, file), 'utf8');
        const { data } = matter(raw);
        if (!data.published) continue;

        const slug = file.replace(/\.md$/, '');
        blogRoutes.push({
          loc: `https://ps15642.com/blog/${slug}`,
          lastmod: data.date ? new Date(data.date).toISOString() : now,
          changefreq: 'monthly',
          priority: 0.7,
        });

        const tags = Array.isArray(data.tags)
          ? data.tags
          : data.tags ? String(data.tags).split(',').map(t => t.trim()).filter(Boolean) : [];

        for (const tag of tags) {
          const ts = tagToSlug(tag);
          if (!tagMap.has(ts)) tagMap.set(ts, tag);
        }
      }

      tagRoutes = [...tagMap.keys()].map(ts => ({
        loc: `https://ps15642.com/blog/tag/${ts}`,
        lastmod: now,
        changefreq: 'weekly',
        priority: 0.5,
      }));
    } catch { /* no articles yet */ }

    return [...staticRoutes, ...serviceRoutes, ...blogRoutes, ...tagRoutes];
  },
};
