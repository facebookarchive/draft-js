/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule SampleDraftInlineStyle
 * 
 */

'use strict';

var _require = require('immutable'),
    OrderedSet = _require.OrderedSet;

module.exports = {
  BOLD: OrderedSet.of('BOLD'),
  BOLD_ITALIC: OrderedSet.of('BOLD', 'ITALIC'),
  BOLD_ITALIC_UNDERLINE: OrderedSet.of('BOLD', 'ITALIC', 'UNDERLINE'),
  BOLD_UNDERLINE: OrderedSet.of('BOLD', 'UNDERLINE'),
  CODE: OrderedSet.of('CODE'),
  ITALIC: OrderedSet.of('ITALIC'),
  ITALIC_UNDERLINE: OrderedSet.of('ITALIC', 'UNDERLINE'),
  NONE: OrderedSet(),
  STRIKETHROUGH: OrderedSet.of('STRIKETHROUGH'),
  UNDERLINE: OrderedSet.of('UNDERLINE')
};