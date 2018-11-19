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
  /* $FlowFixMe(>=0.85.0 site=www,mobile) This comment suppresses an error
   * found when Flow v0.85 was deployed. To see the error, delete this comment
   * and run Flow. */
  BOLD: OrderedSet.of('BOLD'),
  /* $FlowFixMe(>=0.85.0 site=www,mobile) This comment suppresses an error
   * found when Flow v0.85 was deployed. To see the error, delete this comment
   * and run Flow. */
  BOLD_ITALIC: OrderedSet.of('BOLD', 'ITALIC'),
  /* $FlowFixMe(>=0.85.0 site=www,mobile) This comment suppresses an error
   * found when Flow v0.85 was deployed. To see the error, delete this comment
   * and run Flow. */
  BOLD_ITALIC_UNDERLINE: OrderedSet.of('BOLD', 'ITALIC', 'UNDERLINE'),
  /* $FlowFixMe(>=0.85.0 site=www,mobile) This comment suppresses an error
   * found when Flow v0.85 was deployed. To see the error, delete this comment
   * and run Flow. */
  BOLD_UNDERLINE: OrderedSet.of('BOLD', 'UNDERLINE'),
  /* $FlowFixMe(>=0.85.0 site=www,mobile) This comment suppresses an error
   * found when Flow v0.85 was deployed. To see the error, delete this comment
   * and run Flow. */
  CODE: OrderedSet.of('CODE'),
  /* $FlowFixMe(>=0.85.0 site=www,mobile) This comment suppresses an error
   * found when Flow v0.85 was deployed. To see the error, delete this comment
   * and run Flow. */
  ITALIC: OrderedSet.of('ITALIC'),
  /* $FlowFixMe(>=0.85.0 site=www,mobile) This comment suppresses an error
   * found when Flow v0.85 was deployed. To see the error, delete this comment
   * and run Flow. */
  ITALIC_UNDERLINE: OrderedSet.of('ITALIC', 'UNDERLINE'),
  /* $FlowFixMe(>=0.85.0 site=www,mobile) This comment suppresses an error
   * found when Flow v0.85 was deployed. To see the error, delete this comment
   * and run Flow. */
  NONE: OrderedSet(),
  /* $FlowFixMe(>=0.85.0 site=www,mobile) This comment suppresses an error
   * found when Flow v0.85 was deployed. To see the error, delete this comment
   * and run Flow. */
  STRIKETHROUGH: OrderedSet.of('STRIKETHROUGH'),
  /* $FlowFixMe(>=0.85.0 site=www,mobile) This comment suppresses an error
   * found when Flow v0.85 was deployed. To see the error, delete this comment
   * and run Flow. */
  UNDERLINE: OrderedSet.of('UNDERLINE'),
};
