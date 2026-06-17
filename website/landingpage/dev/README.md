# Luigi landingpage

Source for [https://luigi-project.io](https://luigi-project.io). Built with [Eleventy](https://www.11ty.dev/) and deployed to Netlify from `../public/` on every push that touches this directory or `/blog/`.

[![Netlify Status](https://api.netlify.com/api/v1/badges/bc94a377-3681-456e-9318-a915b71038b9/deploy-status)](https://app.netlify.com/sites/dazzling-roentgen-7c50f8/deploys)

## Quick start

```bash
npm install            # one time
npm run build          # one-shot build → ../public/
npm start              # local dev server with watch on css/js/templates
```

The `npm start` server is on `http://localhost:8080` by default (Eleventy's default). The build outputs to `../public/` (i.e. `website/landingpage/public/`); that's the directory Netlify deploys.

## Adding a blog post

Blog posts live at the **repo root in `/blog/`**, not in this directory. To add one:

1. Create `/blog/YYYY-MM-DD-some-slug.md` with this frontmatter:
   ```markdown
   ---
   title: Your post title
   seoMetaDescription: One-line description for SEO + the overview page
   author:
     - First Author
     - Second Author
   layout: blog
   ---

   The first paragraph or two — used as the excerpt on the overview page.
   <!-- Excerpt -->

   The rest of the post body here. Standard Markdown.
   ```

2. Run `npm run build`. The `prebuild` step (`scripts/copy-blog.js`) copies every `/blog/*.md` into `src/blog/` (gitignored — these are build artifacts), then Eleventy renders each one as `../public/blog/YYYY-MM-DD-some-slug/index.html`.

3. Commit your `/blog/*.md` and the regenerated `../public/` files. The pre-commit hook (`scripts/hooks/generate-website-blog.sh` at the repo root) will run the build and stage `../public/` automatically when blog or website changes are staged.

The overview page (`/blog/overview/`) shows the 5 most recent posts inline; the rest are loaded into the page via a "Load more entries" button (a hidden `<template>` element holds them, populated by `scripts/copy-blog.js` → eleventy → DOM).

## Where things live

```
landingpage/dev/
├── eleventy.config.js          # Eleventy config: layout aliases, helpers, filters, blog collection
├── package.json                # Build scripts (sass + esbuild + eleventy)
├── scripts/
│   └── copy-blog.js            # `prebuild` step: copies /blog/*.md into src/blog/
└── src/
    ├── _includes/
    │   ├── layouts/
    │   │   ├── default.hbs     # Used by index.hbs, about.hbs
    │   │   └── blog.hbs        # Used by blog overview + every individual post
    │   └── partials/
    │       ├── header.hbs
    │       ├── footer.hbs
    │       ├── global-nav.hbs  # Top nav, includes theme switcher
    │       ├── features.hbs    # "Out of the Box Features" grid (used on /about/)
    │       └── whoisusingluigi.hbs   # Client logos (used on / and /about/)
    ├── assets/
    │   ├── img/                # All site images (passed through unchanged)
    │   ├── fonts/              # Icon font for github/slack social icons
    │   ├── js/app.js           # Vanilla-JS: menu toggle, theme switcher, load-more, etc.
    │   └── scss/
    │       ├── app.scss        # Top-level imports
    │       ├── _grid-shim.scss # Foundation 6 replacement: grid, breakpoints, type reset
    │       ├── _settings.scss  # Brand colors and theme variables
    │       ├── _general.scss   # Global typography and theme classes
    │       ├── _fonts.scss     # @font-face for the icon font
    │       └── components/     # Page-specific styles (header, footer, home, blog, about, error)
    ├── assets-extra/
    │   └── img/eu-support.png  # EU funding logo (lives outside src/assets/img/ for legacy reasons)
    ├── blog/
    │   └── blog.11tydata.cjs   # Per-blog-post computed data (slug, date, excerpt)
    │                           # *.md files are copied here at build time, gitignored
    ├── root-assets/            # Files copied to the public root (robots.txt, etc.)
    ├── about.hbs               # About page
    ├── blog-overview.hbs       # /blog/overview/
    └── index.hbs               # Home page
```

## Templating notes

Templates use **Handlebars** via [`@11ty/eleventy-plugin-handlebars`](https://github.com/11ty/eleventy-plugin-handlebars). The legacy build also used Handlebars (via panini), so most of the syntax carried over directly. Three custom paired shortcodes are defined in `eleventy.config.js`:

- `{{#ifpage 'name1' 'name2'}}…{{/ifpage}}` — render only on the named page(s)
- `{{#unlesspage 'name'}}…{{/unlesspage}}` — render except on the named page(s)
- `{{#ifpagewildcard 'pattern*'}}…{{/ifpagewildcard}}` — wildcard match on the page slug

Page "name" comes from the input file's basename (see `pageSlug()` in `eleventy.config.js`). For the overview page it's mapped to `'overview'`; for blog posts it's the full date-prefixed filename (e.g. `2024-07-10-release-notes`).

Two filters are available in templates:

- `{{ formatDate someDate }}` — renders e.g. `Jul 10, 2024`
- `{{ joinAuthors authorList }}` — joins an array of author names with `and`

## Build pipeline

```
npm run build
├── prebuild     → node scripts/copy-blog.js          (copy /blog/*.md → src/blog/)
├── build:css    → sass + postcss/autoprefixer        (src/assets/scss/app.scss → ../public/assets/css/app.css)
├── build:js     → esbuild --minify                   (src/assets/js/app.js → ../public/assets/js/app.js)
└── build:11ty   → eleventy                           (src/**/*.{hbs,md} → ../public/**)
```

## Trivia

The site dropped Foundation 6, jQuery, motion-ui, and the panini static-site generator in the migration from the legacy Gulp build. Foundation's grid, typography, breakpoints, visibility helpers, and button reset were replicated in `_grid-shim.scss` (~250 lines) — only what this site actually uses. Read the comments in that file before editing.
