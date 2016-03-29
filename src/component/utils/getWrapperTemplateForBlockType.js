/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getWrapperTemplateForBlockType
 * @flow
 */

'use strict';

const React = require('React');

const cx = require('cx');

import type {DraftBlockType} from 'DraftBlockType';

/**
 * Create these elements once and cache them so they're reference-equal.
 */
const UL_WRAP = <ul className={cx('public/DraftStyleDefault/ul')} />;
const OL_WRAP = <ol className={cx('public/DraftStyleDefault/ol')} />;
const PRE_WRAP = <pre className={cx('public/DraftStyleDefault/pre')} />;

function getWrapperTemplateForBlockType(
  blockType: DraftBlockType
): ?React.Element {
  switch (blockType) {
    case 'unordered-list-item':
      return UL_WRAP;
    case 'ordered-list-item':
      return OL_WRAP;
    case 'code-block':
      return PRE_WRAP;
    default:
      return null;
  }
}

module.exports = getWrapperTemplateForBlockType;
