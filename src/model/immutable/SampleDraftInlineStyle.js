/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
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
  BOLD: (OrderedSet.of('BOLD'): OrderedSet<$FlowFixMe>),
  BOLD_ITALIC: (OrderedSet.of('BOLD', 'ITALIC'): OrderedSet<$FlowFixMe>),
  BOLD_ITALIC_UNDERLINE: (OrderedSet.of(
    'BOLD',
    'ITALIC',
    'UNDERLINE',
  ): OrderedSet<$FlowFixMe>),
  BOLD_UNDERLINE: (OrderedSet.of('BOLD', 'UNDERLINE'): OrderedSet<$FlowFixMe>),
  CODE: (OrderedSet.of('CODE'): OrderedSet<$FlowFixMe>),
  ITALIC: (OrderedSet.of('ITALIC'): OrderedSet<$FlowFixMe>),
  ITALIC_UNDERLINE: (OrderedSet.of('ITALIC', 'UNDERLINE'): OrderedSet<
    $FlowFixMe,
  >),
  NONE: (OrderedSet(): OrderedSet<$FlowFixMe>),
  STRIKETHROUGH: (OrderedSet.of('STRIKETHROUGH'): OrderedSet<$FlowFixMe>),
  UNDERLINE: (OrderedSet.of('UNDERLINE'): OrderedSet<$FlowFixMe>),
};
