/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall draft_js
 */

const isElement = require('isElement');

function isHTMLAnchorElement(node: ?Node): boolean {
  if (!node || !node.ownerDocument) {
    return false;
  }
  return isElement(node) && node.nodeName === 'A';
}

module.exports = isHTMLAnchorElement;
