#!/bin/sh

msg=$(cat "$1")
sob_count=$(echo "$msg" | grep -c "^Signed-off-by: .* <.*>$")

if [ "$sob_count" -eq 0 ]; then
  echo "ERROR: Commit message must contain a Signed-off-by line."
  echo "Use 'git commit --signoff' or add manually."
  exit 1
fi

if [ "$sob_count" -gt 1 ]; then
  echo "ERROR: Commit message must contain exactly one Signed-off-by line."
  exit 1
fi

exit 0
