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

var _require = require("immutable"),
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