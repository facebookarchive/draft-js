/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 * @flow
 * @emails oncall+draft_js
 */

function isInstanceOfNode(target: ?EventTarget): boolean {
  // we changed the name because of having duplicate module provider (fbjs)
  if (!target || !('ownerDocument' in target)) {
    return false;
  }
  if ('ownerDocument' in target) {
    const node: Node = (target: any);
    if (!node.ownerDocument.defaultView) {
      return node instanceof Node;
    }
    // $FlowFixMe https://github.com/DefinitelyTyped/DefinitelyTyped/issues/11508#issuecomment-256045682
    if (node instanceof node.ownerDocument.defaultView.Node) {
      return true;
    }
  }
  return false;
}

module.exports = isInstanceOfNode;
