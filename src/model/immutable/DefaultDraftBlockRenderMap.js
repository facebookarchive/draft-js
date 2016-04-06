/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule DefaultDraftBlockRenderMap
 * @flow
 */

'use strict';

const React = require('React');

const Immutable = require('immutable');

const cx = require('cx');

const UL_WRAP = <ul className={cx('public/DraftStyleDefault/ul')} />;
const OL_WRAP = <ol className={cx('public/DraftStyleDefault/ol')} />;
const PRE_WRAP = <pre className={cx('public/DraftStyleDefault/pre')} />;

module.exports = Immutable.Map({
  'header-one': Immutable.Map({
    element: 'h1',
    wrapper: null
  }),
  'header-two': Immutable.Map({
    element: 'h2',
    wrapper: null
  }),
  'header-three': Immutable.Map({
    element: 'h3',
    wrapper: null
  }),
  'header-four': Immutable.Map({
    element: 'h4',
    wrapper: null
  }),
  'header-five': Immutable.Map({
    element: 'h5',
    wrapper: null
  }),
  'header-six': Immutable.Map({
    element: 'h6',
    wrapper: null
  }),
  'unordered-list-item': Immutable.Map({
    element: 'li',
    wrapper: UL_WRAP
  }),
  'ordered-list-item': Immutable.Map({
    element: 'li',
    wrapper: OL_WRAP
  }),
  'blockquote': Immutable.Map({
    element: 'blockquote',
    wrapper: null
  }),
  'media': Immutable.Map({
    element: 'figure',
    wrapper: null
  }),
  'code-block': Immutable.Map({
    element: 'pre',
    wrapper: PRE_WRAP
  }),
  'unstyled': Immutable.Map({
    element: 'div',
    wrapper: null
  })
});
