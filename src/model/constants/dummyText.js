/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule dummyText
 * @flow
 */

'use strict';
const UserAgent = require('UserAgent');

// By rendering a span with only a newline character, we can be sure to render a single line.
const isIE = UserAgent.isBrowser('IE <= 11');

let dummyText = isIE ? '\n' : '\u0001';

/**
 *
 * @see {DraftEditorTextNode}
 */
module.exports = dummyText;