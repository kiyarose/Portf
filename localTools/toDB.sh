## Place JSON fixtures into localTools/tempdata/ or update this path.
for f in ./localTools/tempdata/*.json; do
  npx wrangler r2 object put "pourdata/data/$(basename "$f")" \
    --file "$f" \
    --content-type "application/json" \
    --cache-control "public, max-age=86400"
done
