#!/bin/bash
# Generates a blog post from the latest CHANGELOG.md entry using the claude CLI.
#
# Usage (run from the Luigi root folder):
#   ./scripts/tools/release-cli/generate-blog-post.sh

set -e

if ! command -v claude &> /dev/null; then
  echo "Warning: 'claude' CLI not found. Skipping blog post generation."
  echo "Install Claude Code to enable this feature: https://claude.ai/code"
  exit 0
fi

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

AUTHOR="${BLOG_AUTHOR:-}"
if [ -z "$AUTHOR" ]; then
  echo "Error: BLOG_AUTHOR environment variable is required." >&2
  exit 1
fi

echo "Found: v$VERSION ($DATE) — Author: $AUTHOR"

FILENAME="${DATE}-release-notes.md"
OUTPUT_PATH="$BLOG_DIR/$FILENAME"

if [ -f "$OUTPUT_PATH" ]; then
  echo "Warning: Blog post already exists at blog/$FILENAME"
  echo "Delete it first if you want to regenerate."
  exit 0
fi

# --- Fetch PR details from GitHub API ---
PR_DETAILS=""
PR_NUMBERS=$(echo "$CHANGELOG_ENTRY" | grep -oE '\[#[0-9]+\]' | grep -oE '[0-9]+')

if [ -n "$PR_NUMBERS" ]; then
  echo "Fetching PR details from GitHub..."
  for PR_NUM in $PR_NUMBERS; do
    AUTH_HEADER=""
    if [ -n "$GITHUB_AUTH" ]; then
      AUTH_HEADER="-H \"Authorization: Bearer $GITHUB_AUTH\""
    fi

    RESPONSE=$(curl -s \
      ${GITHUB_AUTH:+-H "Authorization: Bearer $GITHUB_AUTH"} \
      -H "Accept: application/vnd.github.v3+json" \
      "https://api.github.com/repos/luigi-project/luigi/pulls/$PR_NUM")

    TITLE=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('title',''))" 2>/dev/null || echo "")
    BODY=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print((d.get('body') or '')[:500])" 2>/dev/null || echo "")

    if [ -n "$TITLE" ]; then
      PR_DETAILS="${PR_DETAILS}
PR #${PR_NUM}:
  Title: ${TITLE}
  Description: ${BODY}
"
    fi
  done
fi

# --- Generate blog post via claude CLI ---
PROMPT="Generate a Luigi release blog post for v${VERSION} released on ${DATE}.

Output ONLY the raw markdown file content, nothing else (no code fences, no explanation).

Use this exact format:
---
title: Luigi v${VERSION}
seoMetaDescription: Release notes for Luigi v${VERSION}
author:
  - ${AUTHOR}
layout: blog
---

You can read about the new features in Luigi v${VERSION} in the release notes below.

<!-- Excerpt -->

#### <Feature Title>

<1-2 sentence description based on the PR title and description. Link to relevant docs at https://docs.luigi-project.io when appropriate.> See [#123](https://github.com/luigi-project/luigi/pull/123).

#### Bugfixes

For a full list of bugfixes in this release, see our [changelog](https://github.com/luigi-project/luigi/blob/main/CHANGELOG.md).

Rules:
- One section per significant enhancement (skip internal PRs)
- Only include the Bugfixes section if there were actual bug fixes
- Keep descriptions concise and technical
- Base the feature description on the PR title AND description provided below
- Always end the feature description with a link to the corresponding PR, e.g. See [#4880](https://github.com/luigi-project/luigi/pull/4880).

Here is the changelog entry:

${CHANGELOG_ENTRY}

Here are the PR details:

${PR_DETAILS}"

echo "Generating blog post with claude..."
BLOG_CONTENT=$(claude -p "$PROMPT" --output-format text)

if [ -z "$BLOG_CONTENT" ]; then
  echo "Error: claude returned an empty response." >&2
  exit 1
fi

echo "$BLOG_CONTENT" > "$OUTPUT_PATH"

echo "Blog post written to: blog/$FILENAME"
