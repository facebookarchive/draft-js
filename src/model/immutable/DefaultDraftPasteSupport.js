/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule DefaultDraftPasteSupport
 * @flow
 */

'use strict';

import type {DraftPasteSupport} from 'DraftPasteSupport';

const {List} = require('immutable');

const DefaultDraftPasteSupport: DraftPasteSupport = {
  inlineStyles: List(
    'BOLD',
    'CODE',
    'ITALIC',
    'STRIKETHROUGH',
    'UNDERLINE',
  ),
  blockTypes: List(
    'header-one',
    'header-two',
    'header-three',
    'header-four',
    'header-five',
    'header-six',
    'unordered-list-item',
    'ordered-list-item',
    'blockquote',
    'atomic',
    'code-block',
    'unstyled',
  ),
  links: true,
};

module.exports = DefaultDraftPasteSupport;
