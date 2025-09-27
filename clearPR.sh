#!/bin/bash

SITE_ID="kiyaverse"

firebase hosting:channel:list --site "$SITE_ID" --json \
  | jq -r '.result[] | select(.channelId!="live") | .channelId' \
  | xargs -n1 -I{} firebase hosting:channel:delete "{}" --site "$SITE_ID" -f
