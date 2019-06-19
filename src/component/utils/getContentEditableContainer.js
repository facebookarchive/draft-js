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

import type DraftEditor from 'DraftEditor.react';

const ReactDOM = require('ReactDOM');

const invariant = require('invariant');

function getContentEditableContainer(editor: DraftEditor): HTMLElement {
  const editorNode = ReactDOM.findDOMNode(editor.editorContainer);
  invariant(editorNode, 'Missing editorNode');
  invariant(
    editorNode.firstChild instanceof HTMLElement,
    'editorNode.firstChild is not an HTMLElement',
  );
  return editorNode.firstChild;
}

module.exports = getContentEditableContainer;
