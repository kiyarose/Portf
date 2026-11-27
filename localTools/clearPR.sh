## Replace TEMPLATE_FIREBASE_SITE with your Firebase Hosting site id.
firebase hosting:channel:list --site TEMPLATE_FIREBASE_SITE \
| sed '1,3d;$d' \
| awk -F'│' '{gsub(/^[ \t]+|[ \t]+$/, "", $2); if ($2 != "Channel ID" && $2 != "") print $2}' \
| sed 's/\x1B\[[0-9;]*[JKmsu]//g' \
| grep -v '^live$' \
| while read -r cid; do
  clean_id=$(echo "$cid" | xargs)
  echo "Deleting channel: $clean_id"
  firebase hosting:channel:delete "$clean_id" --site TEMPLATE_FIREBASE_SITE -f
done
