import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { BLOGS_DIR, PAGES_DIR, LOCATIONS_DIR } from './paths.js';

const SITE_URL = 'https://ps15642.com';
const PUBLIC_DIR = path.join(process.cwd(), 'public');

function tagToSlug(tag) {
  return tag.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function urlset(urls) {
  const entries = urls.map(({ loc, lastmod, changefreq, priority }) => [
    '  <url>',
    `    <loc>${loc}</loc>`,
    lastmod     ? `    <lastmod>${lastmod}</lastmod>`         : null,
    changefreq  ? `    <changefreq>${changefreq}</changefreq>` : null,
    priority != null ? `    <priority>${priority}</priority>` : null,
    '  </url>',
  ].filter(Boolean).join('\n')).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
}

function sitemapIndex(sitemaps) {
  const entries = sitemaps.map(({ loc, lastmod }) => [
    '  <sitemap>',
    `    <loc>${loc}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    '  </sitemap>',
  ].filter(Boolean).join('\n')).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>`;
}

export function generatePagesSitemap() {
  const now = new Date().toISOString();

  const staticRoutes = [
    { loc: `${SITE_URL}/`,          lastmod: now, changefreq: 'yearly',  priority: 1.0 },
    { loc: `${SITE_URL}/about`,     lastmod: now, changefreq: 'monthly', priority: 0.8 },
    { loc: `${SITE_URL}/services`,  lastmod: now, changefreq: 'monthly', priority: 0.8 },
    { loc: `${SITE_URL}/locations`, lastmod: now, changefreq: 'monthly', priority: 0.8 },
    { loc: `${SITE_URL}/gallery`,   lastmod: now, changefreq: 'weekly',  priority: 0.7 },
    { loc: `${SITE_URL}/contact`,   lastmod: now, changefreq: 'monthly', priority: 0.8 },
    { loc: `${SITE_URL}/blog`,      lastmod: now, changefreq: 'weekly',  priority: 0.8 },
  ];

  // content/pages/*.md (top-level) → /<slug>
  let serviceRoutes = [];
  try {
    serviceRoutes = fs.readdirSync(PAGES_DIR)
      .filter(f => f.endsWith('.md'))
      .map(f => ({
        loc: `${SITE_URL}/${f.replace(/\.md$/, '')}`,
        lastmod: now,
        changefreq: 'monthly',
        priority: 0.8,
      }));
  } catch { /* no pages yet */ }

  fs.writeFileSync(
    path.join(PUBLIC_DIR, 'sitemap-pages.xml'),
    urlset([...staticRoutes, ...serviceRoutes]),
    'utf8',
  );
}

export function generateLocationsSitemap() {
  const now = new Date().toISOString();
  let locationRoutes = [];
  try {
    locationRoutes = fs.readdirSync(LOCATIONS_DIR)
      .filter(f => f.endsWith('.md'))
      .map(f => ({
        loc: `${SITE_URL}/locations/${f.replace(/\.md$/, '')}`,
        lastmod: now,
        changefreq: 'monthly',
        priority: 0.8,
      }));
  } catch { /* no locations yet */ }

  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-locations.xml'), urlset(locationRoutes), 'utf8');
}

export function generateBlogSitemaps() {
  const now = new Date().toISOString();
  const blogRoutes = [];
  const tagMap = new Map();

  try {
    const files = fs.readdirSync(BLOGS_DIR).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const raw = fs.readFileSync(path.join(BLOGS_DIR, file), 'utf8');
      const { data } = matter(raw);
      if (!data.published) continue;

      const slug = file.replace(/\.md$/, '');
      blogRoutes.push({
        loc: `${SITE_URL}/blog/${slug}`,
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
  } catch { /* no articles yet */ }

  const tagRoutes = [...tagMap.keys()].map(ts => ({
    loc: `${SITE_URL}/blog/tag/${ts}`,
    lastmod: now,
    changefreq: 'weekly',
    priority: 0.5,
  }));

  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-blogs.xml'),     urlset(blogRoutes), 'utf8');
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-blog-tags.xml'), urlset(tagRoutes),  'utf8');
}

export function generateSitemapIndex() {
  const now = new Date().toISOString();
  fs.writeFileSync(
    path.join(PUBLIC_DIR, 'sitemap.xml'),
    sitemapIndex([
      { loc: `${SITE_URL}/sitemap-pages.xml`,     lastmod: now },
      { loc: `${SITE_URL}/sitemap-locations.xml`, lastmod: now },
      { loc: `${SITE_URL}/sitemap-blogs.xml`,     lastmod: now },
      { loc: `${SITE_URL}/sitemap-blog-tags.xml`, lastmod: now },
    ]),
    'utf8',
  );
}

export function generateAllSitemaps() {
  generatePagesSitemap();
  generateLocationsSitemap();
  generateBlogSitemaps();
  generateSitemapIndex();
}
