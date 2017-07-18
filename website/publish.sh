#!/bin/bash

set -e

# Start in website/ even if run from root directory
cd "$(dirname "$0")"

cd ../../draft-js-gh-pages
git checkout -- .
git clean -dfx
git fetch
git rebase
rm -Rf *
cd ../draft-js/website
rm -Rf build/
node server/generate.js
cp -R build/* ../../draft-js-gh-pages/
rm -Rf build/
cd ../../draft-js-gh-pages
git status
git add -A .
if ! git diff-index --quiet HEAD --; then
  git commit -m "update website"
  git push origin gh-pages
fi
cd ../draft-js/website
