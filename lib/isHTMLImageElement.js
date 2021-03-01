"use strict";

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * 
 * @emails oncall+draft_js
 */
var isElement = require("./isElement");

function isHTMLImageElement(node) {
  if (!node || !node.ownerDocument) {
    return false;
  }

  return isElement(node) && node.nodeName === 'IMG';
}

module.exports = isHTMLImageElement;