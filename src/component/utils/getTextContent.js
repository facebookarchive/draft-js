/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getTextContent
 * @flow
 */

'use strict';
const dummyText = require('dummyText');

/**
 * DummyText can be exists while composing.
 * It exist in front of string or end of string.
 */
function getTextContent(node: Node) {
  let textContent = node.textContent;
  if (textContent === null || textContent === undefined) {
    return textContent;
  }
  let start = 0;
  let end = textContent.length;

  while (textContent.charAt(start) === dummyText) {
    start++;
  }
  while (textContent.charAt(end - 1) === dummyText) {
    end--;
  }
  if (start > end) {
    return '';
  }
  return textContent.substring(start, end);
}

module.exports = getTextContent;