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

const cx = require('cx');

const UL_WRAP = <ul className={cx('public/DraftStyleDefault/ul')} />;
const OL_WRAP = <ol className={cx('public/DraftStyleDefault/ol')} />;
const PRE_WRAP = <pre className={cx('public/DraftStyleDefault/pre')} />;

module.exports = {
  'header-one': {
    wrapper: null,
    element: 'h1'
  },
  'header-two': {
    wrapper: null,
    element: 'h2'
  },
  'header-three': {
    wrapper: null,
    element: 'h3'
  },
  'header-four': {
    wrapper: null,
    element: 'h4'
  },
  'header-five': {
    wrapper: null,
    element: 'h5'
  },
  'header-six': {
    wrapper: null,
    element: 'h6'
  },
  'unordered-list-item': {
    wrapper: UL_WRAP,
    element: 'li'
  },
  'ordered-list-item': {
    wrapper: OL_WRAP,
    element: 'li'
  },
  'blockquote': {
    wrapper: null,
    element: 'blockquote'
  },
  'media': {
    wrapper: null,
    element: 'figure'
  },
  'code-block': {
    wrapper: PRE_WRAP,
    element: 'pre'
  },
  'unstyled': {
    wrapper: null,
    element: 'div'
  }
};
