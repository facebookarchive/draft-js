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
'use strict';

var invariant = require("fbjs/lib/invariant");

var isHTMLElement = require("./isHTMLElement");

function getContentEditableContainer(editor) {
  var editorNode = editor.editorContainer;
  !editorNode ? process.env.NODE_ENV !== "production" ? invariant(false, 'Missing editorNode') : invariant(false) : void 0;
  !isHTMLElement(editorNode.firstChild) ? process.env.NODE_ENV !== "production" ? invariant(false, 'editorNode.firstChild is not an HTMLElement') : invariant(false) : void 0;
  var htmlElement = editorNode.firstChild;
  return htmlElement;
}

module.exports = getContentEditableContainer;