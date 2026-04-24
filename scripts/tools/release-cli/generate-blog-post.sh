#!/bin/bash
# Generates a blog post from the latest CHANGELOG.md entry using the claude CLI.
#
# Usage (run from the Luigi root folder):
#   ./scripts/tools/release-cli/generate-blog-post.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE="$SCRIPT_DIR/../../.."
CHANGELOG="$BASE/CHANGELOG.md"
BLOG_DIR="$BASE/blog"

# --- Parse latest changelog entry ---
# Extracts everything between the first and second "## [v" header
CHANGELOG_ENTRY=$(awk '/^## \[v/{count++; if(count==2) exit} count==1' "$CHANGELOG")

if [ -z "$CHANGELOG_ENTRY" ]; then
  echo "Error: Could not find a release entry in CHANGELOG.md." >&2
  exit 1
fi

# Extract version and date from the first line, e.g.: ## [v2.29.0] (2026-03-19)
FIRST_LINE=$(echo "$CHANGELOG_ENTRY" | head -1)
VERSION=$(echo "$FIRST_LINE" | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')
DATE=$(echo "$FIRST_LINE" | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}')

if [ -z "$VERSION" ] || [ -z "$DATE" ]; then
  echo "Error: Could not parse version or date from changelog." >&2
  exit 1
fi

echo "Found: v$VERSION ($DATE)"

FILENAME="${DATE}-release-notes.md"
OUTPUT_PATH="$BLOG_DIR/$FILENAME"

if [ -f "$OUTPUT_PATH" ]; then
  echo "Warning: Blog post already exists at blog/$FILENAME"
  echo "Delete it first if you want to regenerate."
  exit 0
fi

# --- Generate blog post via claude CLI ---
PROMPT="Generate a Luigi release blog post for v${VERSION} released on ${DATE}.

Output ONLY the raw markdown file content, nothing else (no code fences, no explanation).

Use this exact format:
---
title: Luigi v${VERSION}
seoMetaDescription: Release notes for Luigi v${VERSION}
author:
  - Johannes Doberer
layout: blog
---

You can read about the new features in Luigi v${VERSION} in the release notes below.

<!-- Excerpt -->

#### <Feature Title>

<1-2 sentence description. Link to relevant docs at https://docs.luigi-project.io when appropriate.>

#### Bugfixes

For a full list of bugfixes in this release, see our [changelog](https://github.com/luigi-project/luigi/blob/main/CHANGELOG.md).

Rules:
- One section per significant enhancement (skip internal PRs)
- Only include the Bugfixes section if there were actual bug fixes
- Keep descriptions concise and technical

Here is the changelog entry:

${CHANGELOG_ENTRY}"

echo "Generating blog post with claude..."
BLOG_CONTENT=$(claude -p "$PROMPT" --output-format text)

if [ -z "$BLOG_CONTENT" ]; then
  echo "Error: claude returned an empty response." >&2
  exit 1
fi

echo "$BLOG_CONTENT" > "$OUTPUT_PATH"

echo ""
echo "Blog post written to: blog/$FILENAME"
echo ""
echo "Next steps:"
echo "  1. Review the generated blog post"
echo "  2. Adjust descriptions and documentation links as needed"
echo "  3. Commit the file"
