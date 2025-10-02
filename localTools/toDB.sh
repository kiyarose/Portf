for f in /Users/kiyarose/localTools/tempdata/*.json; do
  npx wrangler r2 object put "pourdata/data/$(basename "$f")" \
    --file "$f" \
    --content-type "application/json" \
    --cache-control "public, max-age=86400"
done
