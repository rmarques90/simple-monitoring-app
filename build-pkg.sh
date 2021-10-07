#!/bin/bash

echo 'Starting build...'
npm install &&
npm run build:npx &&
cd dist &&
chmod +x monitoring-notify-linux && chmod +x monitoring-notify-macos &&
echo 'Finished! :D'