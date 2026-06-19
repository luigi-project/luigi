// Generate RSS, Atom, and JSON feeds for blog posts.
// Called by an `eleventy.after` hook in eleventy.config.js — at that point every
// blog post has been rendered to HTML, so we have the full content to embed.
//
// Replaces landingpage/dev/src/services/feeds.service.js from the legacy build.

import { Feed } from 'feed';
import matter from 'gray-matter';
import { marked } from 'marked';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SITE_URL = 'https://luigi-project.io';

// Match the legacy feed output, which used marked v4 with default options.
// marked v18 (current) tightened a few defaults; explicitly enable the bits
// the legacy feed had:
//  - GitHub-style heading IDs (e.g. <h4 id="category-selection-indicator">)
const renderer = new marked.Renderer();
const slugger = new Map();
function makeSlug(text) {
  // Match marked v4 / GitHub-flavored-markdown slugify rules:
  //   lowercase, drop HTML-ish delimiters + entities, replace non-word chars with '-',
  //   collapse, strip leading/trailing '-'
  const base = text
    .toLowerCase()
    .replace(/[<>]/g, '') // strip HTML tag delimiters safely (single-char sanitization)
    .replace(/[&;]/g, '') // strip entity delimiters safely (single-char sanitization)
    .replace(/[^\w\s-]/g, '') // drop punctuation
    .trim()
    .replace(/\s+/g, '-');
  // De-duplicate within a single document.
  const count = slugger.get(base) || 0;
  slugger.set(base, count + 1);
  return count === 0 ? base : `${base}-${count}`;
}
renderer.heading = function ({ tokens, depth }) {
  const text = this.parser.parseInline(tokens);
  const id = makeSlug(text);
  return `<h${depth} id="${id}">${text}</h${depth}>\n`;
};

function renderMarkdown(body) {
  slugger.clear(); // reset per-document
  // Match the legacy feed's whitespace around the <!-- Excerpt --> marker.
  // marked v4 left a blank line between the comment and the following heading;
  // marked v18 collapses it. Restore the blank line for byte-for-byte parity
  // with the existing live feed.
  return marked.parse(body, { renderer }).replace(/<!-- Excerpt -->/g, '<!-- Excerpt -->\n');
}

export function generateFeeds(results) {
  // Pull the rendered blog posts out of the build results.
  // We don't actually use r.content because that's the fully-laid-out page
  // (header, footer, sticky nav included). Feed readers want just the post
  // body, so we re-render the post's markdown via `marked` from the source
  // file. Cheap (~50 small files); avoids parsing the laid-out HTML.
  //
  // The legacy feeds.service.js kept the `<!-- Excerpt -->` marker in feed
  // content (because it never split on it), so we do too -- some feed readers
  // strip HTML comments anyway, and dropping it here would change the wire
  // format relative to the existing live feed.
  const posts = results
    .filter((r) => r.inputPath && /\/blog\/\d{4}-\d{2}-\d{2}-/.test(r.inputPath))
    .map((r) => {
      const slugMatch = r.inputPath.match(/([^/\\]+)\.md$/);
      const slug = slugMatch ? slugMatch[1] : '';
      const dateMatch = r.inputPath.match(/(\d{4}-\d{2}-\d{2})/);
      const date = dateMatch ? new Date(dateMatch[1]) : new Date();

      const raw = readFileSync(r.inputPath, 'utf8');
      const parsed = matter(raw);
      const fm = parsed.data;

      return {
        slug,
        date,
        title: fm.title || '',
        description: fm.seoMetaDescription || '',
        authors: Array.isArray(fm.author) ? fm.author : fm.author ? [fm.author] : [],
        htmlContent: renderMarkdown(parsed.content)
      };
    })
    // Match the legacy blogprocessor.js ordering: sort by filename descending,
    // not by Date. For two posts on the same day this orders alphabetically by
    // the slug part (after the date prefix), reversed.
    .sort((a, b) => b.slug.localeCompare(a.slug));

  if (posts.length === 0) return;

  const feed = new Feed({
    title: 'Luigi Blog',
    description: 'The Enterprise-Ready Micro Frontend Framework',
    id: `${SITE_URL}/blog`,
    link: `${SITE_URL}/blog/overview`,
    language: 'en',
    image: `${SITE_URL}/assets/img/luigi_diagramm.png`,
    favicon: `${SITE_URL}/assets/img/favicon.png`,
    copyright: 'Copyright 2021. The Luigi project authors',
    generator: 'Luigi Project',
    feedLinks: {
      json: `${SITE_URL}/blog/feeds/feed.json`,
      atom: `${SITE_URL}/blog/feeds/atom.xml`
    },
    author: {
      name: 'Luigi project authors',
      email: 'luigi-project@sap.com',
      link: SITE_URL
    }
  });

  feed.addCategory('Technology');

  for (const post of posts) {
    feed.addItem({
      title: post.title,
      id: `${SITE_URL}/blog/${post.slug}`,
      link: `${SITE_URL}/blog/${post.slug}`,
      description: post.description,
      content: post.htmlContent,
      author: post.authors.map((name) => ({ name })),
      date: post.date
    });
  }

  // Write to landingpage/public/blog/feeds/. The output directory is two levels
  // up from this file (scripts/ -> dev/ -> landingpage/) plus public/blog/feeds.
  const feedsDir = join(__dirname, '..', '..', 'public', 'blog', 'feeds');
  mkdirSync(feedsDir, { recursive: true });
  writeFileSync(join(feedsDir, 'rss.xml'), feed.rss2());
  writeFileSync(join(feedsDir, 'atom.xml'), feed.atom1());
  writeFileSync(join(feedsDir, 'feed.json'), feed.json1());

  console.log(`feeds: wrote rss.xml + atom.xml + feed.json (${posts.length} posts)`);
}
