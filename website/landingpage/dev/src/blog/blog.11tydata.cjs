// Directory data file for src/blog/ — uses .cjs extension so it loads as CommonJS
// regardless of the package's "type": "module" setting.
//
// Computes slug + date + excerpt from each post's filename and content.
// 11ty's default permalink (`/blog/<full filename>/`) keeps the date prefix in
// the URL, matching legacy /blog/2024-07-10-release-notes/ exactly.
//
// Excerpt: legacy splits the markdown body at `<!-- Excerpt -->` and shows
// only the first half on the overview, with a "Read more" link. We replicate
// that here.

const { marked } = require('marked');

module.exports = {
  tags: ['blog'],
  eleventyComputed: {
    date: (data) => {
      const m = (data.page.inputPath || '').match(/(\d{4}-\d{2}-\d{2})/);
      return m ? new Date(m[1]) : data.page.date;
    },
    slug: (data) => {
      // Slug = filename without extension, including the date prefix.
      // Used by overview/index templates to link to the post.
      const m = (data.page.inputPath || '').match(/([^/\\]+)\.md$/);
      return m ? m[1] : data.page.fileSlug;
    },
    excerpt: (data) => {
      // Read the source markdown, split at the excerpt marker, render the front half.
      // Done synchronously so it's available before the template renders.
      const fs = require('fs');
      try {
        const raw = fs.readFileSync(data.page.inputPath, 'utf8');
        // Strip the YAML frontmatter so it doesn't end up in the rendered HTML.
        const body = raw.replace(/^---[\s\S]*?\n---\s*/, '');
        const head = body.split('<!-- Excerpt -->')[0].trim();
        return marked.parse(head);
      } catch (e) {
        return '';
      }
    },
  },
};
