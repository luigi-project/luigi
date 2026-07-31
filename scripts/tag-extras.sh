#!/usr/bin/env bash
#
# Run locally after a stable release to add the vX-Y dist-tag alias
# (e.g. v2-31 → @luigi-project/core@2.31.0). CI used to do this
# automatically, but npm's dist-tag operations are not covered by
# trusted publishing OIDC, so it moved to a maintainer step.
#
# Prerequisites:
#   - `npm login` completed (interactive, 2FA)
#   - working tree at the tag whose versions you want to alias
#
# Usage:
#   bash scripts/tag-extras.sh
#
# Skips RCs, dev builds and nightly (`next.*`) versions.

set -e
BASE_DIR="$( cd "$(dirname "$0")" ; pwd -P )"

PKG_FOLDERS=(
  "core/public"
  "client/public"
  "plugins/auth/public/auth-oauth2"
  "plugins/auth/public/auth-oidc"
  "plugins/auth/public/auth-oidc-pkce"
  "container/public"
  "core-modular/public"
  "client-frameworks-support/testing-utilities/dist"
  "client-frameworks-support/client-support-angular/dist/client-support-angular"
  "client-frameworks-support/client-support-ui5/dist"
)

for folder in "${PKG_FOLDERS[@]}"; do
  pkg_json="$BASE_DIR/../$folder/package.json"
  if [ ! -f "$pkg_json" ]; then
    echo "Skipping $folder (no package.json — not built?)"
    continue
  fi

  NAME=$(node -p "require('$pkg_json').name")
  VERSION=$(node -p "require('$pkg_json').version")

  if [[ $VERSION == *"rc"* ]] || [[ $VERSION == *"dev."* ]] || [[ $VERSION == *"next."* ]]; then
    echo "Skipping $NAME@$VERSION (pre-release)"
    continue
  fi

  M_TAG=$(echo "$VERSION" | cut -d "." -f 1,2 | tr . -)
  echo "Adding dist-tag v$M_TAG → $NAME@$VERSION"
  npm dist-tag add "$NAME@$VERSION" "v$M_TAG"
done
