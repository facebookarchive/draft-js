/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 * @oncall draft_js
 */

'use strict';

const NEWLINE_REGEX = /\r\n?|\n/g;

function splitTextIntoTextBlocks(text: string): Array<string> {
  return text.split(NEWLINE_REGEX);
}

module.exports = splitTextIntoTextBlocks;
