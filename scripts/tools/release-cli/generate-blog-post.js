/**
 * Generates a blog post from the latest CHANGELOG.md entry using Claude AI.
 *
 * Usage:
 * cd scripts
 * npm run generate-blog-post
 *
 * Requires: ANTHROPIC_API_KEY environment variable
 */

import fs from 'fs';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';
import color from 'cli-color';

const logHeadline = (str) => console.log(color.bold.cyan(str));
const logStep = (str) => console.log(color.cyan(str));
const logWarning = (str) => console.log(color.yellow.bold(str));
const logError = (str) => console.log(color.redBright.bold(str));

const base = path.resolve(__dirname, '..', '..', '..');
const changelogPath = path.resolve(base, 'CHANGELOG.md');
const blogDir = path.resolve(base, 'blog');

/**
 * Parses the latest release entry from CHANGELOG.md.
 * Returns { version, date, content } or null if not found.
 */
function parseLatestChangelogEntry() {
  const md = fs.readFileSync(changelogPath, 'utf-8');

  // Match pattern: ## [v2.x.x] (YYYY-MM-DD)
  const headerRegex = /^## \[v(\d+\.\d+\.\d+)\] \((\d{4}-\d{2}-\d{2})\)/m;
  const match = md.match(headerRegex);
  if (!match) return null;

  const version = match[1];
  const date = match[2];
  const startIndex = match.index;

  // Find the next release header to determine end of this entry
  const rest = md.slice(startIndex + match[0].length);
  const nextHeaderMatch = rest.match(/^## \[v/m);
  const entryContent = nextHeaderMatch
    ? rest.slice(0, nextHeaderMatch.index).trim()
    : rest.trim();

  return { version, date, content: entryContent };
}

/**
 * Generates a blog post markdown string using Claude.
 */
async function generateBlogPost(version, date, changelogContent) {
  const client = new Anthropic();

  const systemPrompt = `You are a technical writer for the Luigi micro-frontend framework project.
Your task is to generate release blog posts based on changelog entries.

The blog posts follow this exact format:
---
title: Luigi vX.Y
seoMetaDescription: Release notes for Luigi vX.Y
author:
  - Johannes Doberer
layout: blog
---

You can read about the new features in Luigi vX.Y in the release notes below.

<!-- Excerpt -->

#### Feature Title

Feature description in 1-2 sentences. Link to relevant documentation using [docu](https://docs.luigi-project.io/docs/...) when appropriate.

#### Bugfixes

For a full list of bugfixes in this release, see our [changelog](https://github.com/luigi-project/luigi/blob/main/CHANGELOG.md).

Rules:
- Write exactly one section per significant enhancement/feature (skip internal/minor PRs)
- Keep descriptions concise (1-3 sentences max per feature)
- Only link to docs when you can reasonably infer the relevant section from the PR title
- Always end with the Bugfixes section if there were any bug fixes
- Do not include the Bugfixes section if there were no bug fixes
- Write in a neutral, technical tone
- Do not add any text before the frontmatter or after the last line
- Return only the raw markdown, no code fences`;

  const userMessage = `Generate a blog post for Luigi v${version} released on ${date}.

Here is the changelog entry:

${changelogContent}`;

  logStep(`Calling Claude API for v${version}...`);

  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 2048,
    thinking: { type: 'adaptive' },
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }]
  });

  // Stream output to console for visibility
  process.stdout.write(color.cyan('\n--- Generated Blog Post ---\n'));
  stream.on('text', (delta) => process.stdout.write(delta));

  const finalMessage = await stream.finalMessage();
  process.stdout.write('\n');

  const textBlock = finalMessage.content.find((b) => b.type === 'text');
  return textBlock ? textBlock.text.trim() : null;
}

/**
 * Derives the blog post filename from version and date.
 * Format: YYYY-MM-DD-release-notes.md
 */
function getBlogFilename(date) {
  return `${date}-release-notes.md`;
}

(async () => {
  logHeadline('Luigi Blog Post Generator');

  if (!process.env.ANTHROPIC_API_KEY) {
    logError('Error: ANTHROPIC_API_KEY environment variable is not set.');
    process.exit(1);
  }

  logStep('Parsing latest changelog entry...');
  const entry = parseLatestChangelogEntry();

  if (!entry) {
    logError('Could not find a release entry in CHANGELOG.md.');
    process.exit(1);
  }

  logHeadline(`\nFound: v${entry.version} (${entry.date})`);
  logStep('\nChangelog content:');
  console.log(entry.content);

  const filename = getBlogFilename(entry.date);
  const outputPath = path.join(blogDir, filename);

  if (fs.existsSync(outputPath)) {
    logWarning(`\nWarning: Blog post already exists at blog/${filename}`);
    logWarning('Delete it first if you want to regenerate.');
    process.exit(0);
  }

  let blogPost;
  try {
    blogPost = await generateBlogPost(entry.version, entry.date, entry.content);
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      logError('Authentication failed. Check your ANTHROPIC_API_KEY.');
    } else if (err instanceof Anthropic.RateLimitError) {
      logError('Rate limit exceeded. Please try again later.');
    } else if (err instanceof Anthropic.APIError) {
      logError(`API error (${err.status}): ${err.message}`);
    } else {
      logError(`Unexpected error: ${err.message}`);
    }
    process.exit(1);
  }

  if (!blogPost) {
    logError('Claude returned an empty response.');
    process.exit(1);
  }

  fs.writeFileSync(outputPath, blogPost + '\n');

  logHeadline(`\nBlog post written to: blog/${filename}`);
  logStep('\nNext steps:');
  logStep('  1. Review the generated blog post');
  logStep('  2. Adjust descriptions and documentation links as needed');
  logStep('  3. Commit the file');
})();
