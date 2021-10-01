/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 * @emails oncall+draft_js
 */

'use strict';

const UserAgent = require('UserAgent');

const invariant = require('invariant');

const isChrome = UserAgent.isBrowser('Chrome');

// In Chrome, the client rects will include the entire bounds of all nodes that
// begin (have a start tag) within the selection, even if the selection does
// not overlap the entire node. To resolve this, we split the range at each
// start tag and join the client rects together.
// https://code.google.com/p/chromium/issues/detail?id=324437
function getRangeClientRectsChrome(range: Range): Array<ClientRect> {
  const tempRange = range.cloneRange();
  const clientRects = [];

  for (
    let ancestor = range.endContainer;
    ancestor != null;
    ancestor = ancestor.parentNode
  ) {
    // If we've climbed up to the common ancestor, we can now use the
    // original start point and stop climbing the tree.
    const atCommonAncestor = ancestor === range.commonAncestorContainer;
    if (atCommonAncestor) {
      tempRange.setStart(range.startContainer, range.startOffset);
    } else {
      tempRange.setStart(tempRange.endContainer, 0);
    }
    const rects = Array.from(tempRange.getClientRects());
    clientRects.push(rects);
    if (atCommonAncestor) {
      clientRects.reverse();
      return [].concat(...clientRects);
    }
    tempRange.setEndBefore(ancestor);
  }

  invariant(
    false,
    'Found an unexpected detached subtree when getting range client rects.',
  );
}
/* eslint-enable consistent-return */

/**
 * Like range.getClientRects() but normalizes for browser bugs.
 */
const getRangeClientRects = ((isChrome
  ? getRangeClientRectsChrome
  : function(range: Range): Array<ClientRect> {
      return Array.from(range.getClientRects());
    }): (range: Range) => Array<ClientRect>);

module.exports = getRangeClientRects;
