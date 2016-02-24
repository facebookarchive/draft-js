const babel = require('babel-core');
const assign = require('object-assign');
const babelOpts = require('../babel/default-options');
const babelInlineRequires = require('fbjs-scripts/babel/inline-requires');
const createCacheKeyFunction = require('fbjs-scripts/jest/createCacheKeyFunction');
const path = require('path');

// Modify babelOpts to account for our needs. Namely we want to retain line
// numbers for better stack traces in tests.
babelOpts.retainLines = true;
babelOpts._moduleMap = assign(babelOpts._moduleMap, {
  ReactTestUtils: 'react/lib/ReactTestUtils',
  reactComponentExpect: 'react/lib/reactComponentExpect',
});
babelOpts.plugins.push({
  position: 'after',
  transformer: babelInlineRequires,
});

const cacheKeyFunction = createCacheKeyFunction([
  __filename,
  path.join(__dirname, '..', '..', 'node_modules', 'fbjs', 'package.json'),
  path.join(__dirname, '..', '..', 'node_modules', 'fbjs-scripts', 'package.json'),
]);

module.exports = {
  process: function(src, path) {
    return babel.transform(src, assign({filename: path}, babelOpts)).code;
  },
  getCacheKey: cacheKeyFunction,
};
