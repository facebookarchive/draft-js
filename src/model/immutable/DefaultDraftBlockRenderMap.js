/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 * @emails oncall+draft_js
 */

'use strict';

import type {DraftBlockRenderConfig} from 'DraftBlockRenderConfig';
import type {CoreDraftBlockType} from 'DraftBlockType';

const React = require('React');

const cx = require('cx');
const {Map} = require('immutable');

type DefaultCoreDraftBlockRenderMap = Map<
  CoreDraftBlockType,
  DraftBlockRenderConfig,
>;

const UL_WRAP = <ul className={cx('public/DraftStyleDefault/ul')} />;
const OL_WRAP = <ol className={cx('public/DraftStyleDefault/ol')} />;
const PRE_WRAP = <pre className={cx('public/DraftStyleDefault/pre')} />;

const DefaultDraftBlockRenderMap: DefaultCoreDraftBlockRenderMap = Map({
  'header-one': {
    element: 'h1',
  },
  'header-two': {
    element: 'h2',
  },
  'header-three': {
    element: 'h3',
  },
  'header-four': {
    element: 'h4',
  },
  'header-five': {
    element: 'h5',
  },
  'header-six': {
    element: 'h6',
  },
  'unordered-list-item': {
    element: 'li',
    wrapper: UL_WRAP,
  },
  'ordered-list-item': {
    element: 'li',
    wrapper: OL_WRAP,
  },
  blockquote: {
    element: 'blockquote',
  },
  atomic: {
    element: 'figure',
  },
  'code-block': {
    element: 'pre',
    wrapper: PRE_WRAP,
  },
  unstyled: {
    element: 'div',
    aliasedElements: ['p'],
  },
});

module.exports = DefaultDraftBlockRenderMap;
