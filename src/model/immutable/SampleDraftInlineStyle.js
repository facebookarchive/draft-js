/**
 * Copyright (c) Facebook, Inc. and its affiliates. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 * @flow strict-local
 * @emails oncall+draft_js
 */

'use strict';

const {OrderedSet} = require('immutable');

module.exports = {
  BOLD: (OrderedSet.of('BOLD'): OrderedSet<string>),
  BOLD_ITALIC: (OrderedSet.of('BOLD', 'ITALIC'): OrderedSet<string>),
  BOLD_ITALIC_UNDERLINE: (OrderedSet.of(
    'BOLD',
    'ITALIC',
    'UNDERLINE',
  ): OrderedSet<string>),
  BOLD_UNDERLINE: (OrderedSet.of('BOLD', 'UNDERLINE'): OrderedSet<string>),
  CODE: (OrderedSet.of('CODE'): OrderedSet<string>),
  ITALIC: (OrderedSet.of('ITALIC'): OrderedSet<string>),
  ITALIC_UNDERLINE: (OrderedSet.of('ITALIC', 'UNDERLINE'): OrderedSet<string>),
  NONE: (OrderedSet(): OrderedSet<string>),
  STRIKETHROUGH: (OrderedSet.of('STRIKETHROUGH'): OrderedSet<string>),
  UNDERLINE: (OrderedSet.of('UNDERLINE'): OrderedSet<string>),
};
