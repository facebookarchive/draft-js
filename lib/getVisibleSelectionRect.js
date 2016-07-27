/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getVisibleSelectionRect
 * @typechecks
 * 
 */

'use strict';

var getRangeBoundingClientRect = require('./getRangeBoundingClientRect');

/**
 * Return the bounding ClientRect for the visible DOM selection, if any.
 * In cases where there are no selected ranges or the bounding rect is
 * temporarily invalid, return null.
 */
function getVisibleSelectionRect(global) {
  var selection = global.getSelection();
  if (!selection.rangeCount) {
    return null;
  }

  var range = selection.getRangeAt(0);
  var boundingRect = getRangeBoundingClientRect(range);
  var top = boundingRect.top;
  var right = boundingRect.right;
  var bottom = boundingRect.bottom;
  var left = boundingRect.left;

  // When a re-render leads to a node being removed, the DOM selection will
  // temporarily be placed on an ancestor node, which leads to an invalid
  // bounding rect. Discard this state.

  if (top === 0 && right === 0 && bottom === 0 && left === 0) {
    return null;
  }

  return boundingRect;
}

module.exports = getVisibleSelectionRect;