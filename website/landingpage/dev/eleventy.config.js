import path from 'node:path';
import { fileURLToPath } from 'node:url';
import handlebarsPlugin from '@11ty/eleventy-plugin-handlebars';
import { generateFeeds } from './scripts/generate-feeds.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(handlebarsPlugin);

  // Generate RSS / Atom / JSON feeds after every build. Replaces the legacy
  // build's separate feeds.service.js step.
  eleventyConfig.on('eleventy.after', ({ results }) => {
    generateFeeds(results);
  });

  // Don't use .gitignore for 11ty's input filtering. The build copies
  // /blog/*.md from the repo root into src/blog/ via the prebuild step;
  // those files are gitignored as build artifacts, but 11ty still needs
  // to render them.
  eleventyConfig.setUseGitIgnore(false);

  // Pass-through: copy these directories to the build output as-is.
  eleventyConfig.addPassthroughCopy({ 'src/root-assets': '/' });
  eleventyConfig.addPassthroughCopy({ 'src/assets/img': 'assets/img' });
  eleventyConfig.addPassthroughCopy({ 'src/assets/fonts': 'assets/fonts' });
  // Extra images that exist in the deployed /public/ but were never committed
  // to the legacy `dev/src/`. eu-support.png is the EU/NextGenerationEU funding logo
  // referenced by the footer.
  eleventyConfig.addPassthroughCopy({ 'src/assets-extra/img': 'assets/img' });
  // CSS/JS are produced by sass/esbuild scripts and copied straight to public/.
  // 11ty leaves them alone because public/ is the output dir.

  // Layout aliases so blog post frontmatter (`layout: blog`) resolves to a real file.
  eleventyConfig.addLayoutAlias('blog', 'layouts/blog.hbs');
  eleventyConfig.addLayoutAlias('default', 'layouts/default.hbs');
  eleventyConfig.addLayoutAlias('error-pages', 'layouts/error-pages.hbs');

  // ---------------------------------------------------------------------------
  // Helpers (Handlebars-compatible)
  //
  // The plugin wraps paired shortcodes by calling `callback(this, content, ...args)`
  // where the last `args` entry is the Handlebars options object. We accept a rest
  // arg and filter out non-strings so the plugin and a hypothetical Liquid/Nunjucks
  // engine both work.
  // ---------------------------------------------------------------------------

  // {{#ifpage 'index'}}...{{/ifpage}}
  eleventyConfig.addPairedShortcode('ifpage', function (content, ...args) {
    const names = args.filter((a) => typeof a === 'string');
    return names.includes(pageSlug(this.page)) ? content : '';
  });

  // {{#unlesspage 'overview'}}...{{/unlesspage}}
  eleventyConfig.addPairedShortcode('unlesspage', function (content, ...args) {
    const names = args.filter((a) => typeof a === 'string');
    return names.includes(pageSlug(this.page)) ? '' : content;
  });

  // {{#ifpagewildcard 'over*' '*ervie*'}}...{{/ifpagewildcard}}
  eleventyConfig.addPairedShortcode('ifpagewildcard', function (content, ...args) {
    const patterns = args.filter((a) => typeof a === 'string');
    const current = pageSlug(this.page);
    const match = patterns.some((p) => {
      const re = new RegExp('^' + p.replace(/\*/g, '.*') + '$');
      return re.test(current);
    });
    return match ? content : '';
  });

  // ---------------------------------------------------------------------------
  // Filters used by templates
  // ---------------------------------------------------------------------------

  eleventyConfig.addFilter('formatDate', (value) => {
    const d = value instanceof Date ? value : new Date(value);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  });

  eleventyConfig.addFilter('joinAuthors', (authors) => {
    if (!authors) return '';
    return Array.isArray(authors) ? authors.join(' and ') : String(authors);
  });

  // Array slicing helpers for Handlebars (which lacks native slice support).
  // Used by blog-overview.hbs to split the post list into the inline 5 +
  // the load-more remainder.
  eleventyConfig.addShortcode('sliceFirst', (arr, n) => arr.slice(0, n));
  eleventyConfig.addShortcode('sliceFrom', (arr, n) => arr.slice(n));

  // ---------------------------------------------------------------------------
  // Blog collection -- sourced from /blog/*.md at the repo root
  // ---------------------------------------------------------------------------

  eleventyConfig.addCollection('blog', function (collectionApi) {
    return collectionApi
      .getFilteredByGlob('src/blog/*.md')
      .map((item) => {
        const m = item.fileSlug.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
        if (m) {
          item.data.date = new Date(m[1]);
          item.data.slug = m[2];
        }
        return item;
      })
      .sort((a, b) => b.data.date - a.data.date);
  });

  return {
    dir: {
      input: 'src',
      output: '../public',
      includes: '_includes',
      data: '_data',
    },
    // Use Handlebars for HTML to keep partials/syntax close to the original.
    htmlTemplateEngine: 'hbs',
    markdownTemplateEngine: 'hbs',
    templateFormats: ['hbs', 'html', 'md', '11ty.js'],
  };
}

function pageSlug(page) {
  // We want a slug that matches the SOURCE filename (without extension),
  // matching the legacy build's behaviour where the slug came from the
  // input file's basename. Both 11ty's `fileSlug` AND `filePathStem` strip
  // recognized date prefixes (`2024-07-10-release-notes` -> `release-notes`),
  // which breaks the global-nav's `ifpagewildcard 'overview' '20*'` rule that
  // highlights the Blog link when on a dated post. We derive the slug from
  // `inputPath` instead, which preserves the full filename verbatim.
  //
  // Examples:
  //   src/index.hbs              -> 'index'
  //   src/about.hbs              -> 'about'
  //   src/blog-overview.hbs      -> 'blog-overview', mapped to 'overview' below
  //   src/blog/2024-07-10-...md  -> '2024-07-10-...'
  const ip = page?.inputPath || '';
  const m = ip.match(/([^/\\]+)\.[a-zA-Z0-9]+$/);
  const leaf = m ? m[1] : 'index';
  // Map our overview source name to the slug the legacy templates expect.
  if (leaf === 'blog-overview') return 'overview';
  return leaf;
}
