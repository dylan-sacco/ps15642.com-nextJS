import { getPublishedPosts } from '@/lib/blog';

const SITE_URL = 'https://ps15642.com';
const FEED_TITLE = 'P&S Contracting and Landscape — Blog';
const FEED_DESCRIPTION = 'Landscaping tips, project spotlights, and seasonal advice from P&S Contracting and Landscape in Westmoreland County, PA.';

function escapeXml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const posts = getPublishedPosts();

  const items = posts.map(post => {
    const url = `${SITE_URL}/blog/${post.slug}`;
    const pubDate = post.date ? new Date(post.date).toUTCString() : '';
    return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.excerpt)}</description>
      ${pubDate ? `<pubDate>${pubDate}</pubDate>` : ''}
      ${post.tags.length ? `<category>${escapeXml(post.tags[0])}</category>` : ''}
    </item>`;
  }).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(FEED_DESCRIPTION)}</description>
    <language>en-us</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
