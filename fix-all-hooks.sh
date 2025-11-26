#!/bin/bash

# Fix all remaining files with useState, useEffect, useRef, useCallback issues
# This script updates direct hook imports to use React namespace

files=(
  "src/pages/ChallengeDetail.tsx"
  "src/pages/Challenges.tsx"
  "src/pages/Editor.tsx"
  "src/pages/Friends.tsx"
  "src/pages/Messages.tsx"
  "src/pages/NearbySpots.tsx"
  "src/pages/NotFound.tsx"
  "src/pages/Notifications.tsx"
  "src/pages/ProfileSettings.tsx"
  "src/pages/Search.tsx"
  "src/pages/WeatherRecommendations.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing $file..."
    # Replace hook usages with React namespace
    sed -i 's/\buseState\b/React.useState/g' "$file"
    sed -i 's/\buseEffect\b/React.useEffect/g' "$file"
    sed -i 's/\buseRef\b/React.useRef/g' "$file"
    sed -i 's/\buseCallback\b/React.useCallback/g' "$file"
    sed -i 's/\buseMemo\b/React.useMemo/g' "$file"
    sed -i 's/\buseContext\b/React.useContext/g' "$file"
  fi
done

echo "All files fixed!"
