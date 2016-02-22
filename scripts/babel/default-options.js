var assign = require('object-assign');
var babelPluginModules = require('fbjs-scripts/babel/rewrite-modules');

module.exports = {
  blacklist: [
    'es6.regex.unicode',
  ],
  nonStandard: true,
  optional: [
    'es7.trailingFunctionCommas',
    'es7.classProperties',
  ],
  stage: 1,
  plugins: [babelPluginModules],
  _moduleMap: assign({}, require('fbjs/module-map'), {
    immutable: 'immutable',
    React: 'react',
    ReactDOM: 'react-dom',
  }),
};
