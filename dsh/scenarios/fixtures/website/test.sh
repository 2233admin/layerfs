# Stands in for `npm test`: every page renders a heading.
set -e
for f in app/page.tsx app/*/page.tsx; do
  [ -f "$f" ] || continue
  grep -q "<h1>" "$f" || { echo "FAIL $f has no heading"; exit 1; }
  echo "ok $f"
done
echo "tests passed"
