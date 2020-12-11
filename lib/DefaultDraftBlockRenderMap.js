/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * 
 * @emails oncall+draft_js
 */
'use strict';

var React = require("react");

var cx = require("fbjs/lib/cx");

var _require = require("immutable"),
    Map = _require.Map;

var UL_WRAP = React.createElement("ul", {
  className: cx('public/DraftStyleDefault/ul')
});
var OL_WRAP = React.createElement("ol", {
  className: cx('public/DraftStyleDefault/ol')
});
var PRE_WRAP = React.createElement("pre", {
  className: cx('public/DraftStyleDefault/pre')
});
var DefaultDraftBlockRenderMap = Map({
  'header-one': {
    element: 'h1'
  },
  'header-two': {
    element: 'h2'
  },
  'header-three': {
    element: 'h3'
  },
  'header-four': {
    element: 'h4'
  },
  'header-five': {
    element: 'h5'
  },
  'header-six': {
    element: 'h6'
  },
  section: {
    element: 'section'
  },
  article: {
    element: 'article'
  },
  'unordered-list-item': {
    element: 'li',
    wrapper: UL_WRAP
  },
  'ordered-list-item': {
    element: 'li',
    wrapper: OL_WRAP
  },
  blockquote: {
    element: 'blockquote'
  },
  atomic: {
    element: 'figure'
  },
  'code-block': {
    element: 'pre',
    wrapper: PRE_WRAP
  },
  unstyled: {
    element: 'div',
    aliasedElements: ['p']
  }
});
module.exports = DefaultDraftBlockRenderMap;