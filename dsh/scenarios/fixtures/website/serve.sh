# Stands in for `next start`: serves until stopped, keeping a dev cache.
mkdir -p .next/cache
echo '{}' > .next/cache/dev.json
echo "ready on http://localhost:3000"
exec sleep 600
