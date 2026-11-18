#!/bin/sh
# Optional: builds dist/ with esbuild only (no Vite). "npm run build" is the normal way.
set -e
rm -rf dist && mkdir -p dist/assets
esbuild src/main.tsx --bundle --minify --jsx=automatic --target=es2020 --define:process.env.NODE_ENV='"production"' --outfile=dist/assets/app.js
sed -e 's#<script type="module" src="/src/main.tsx"></script>#<script src="assets/app.js" defer></script>#' -e 's#</head>#<link rel="stylesheet" href="assets/app.css">\n</head>#' index.html > dist/index.html
