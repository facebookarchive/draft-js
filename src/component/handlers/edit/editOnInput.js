/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule editOnInput
 * @flow
 */

'use strict';

const DraftModifier = require('DraftModifier');
const DraftOffsetKey = require('DraftOffsetKey');
const EditorState = require('EditorState');
const UserAgent = require('UserAgent');

const findAncestorOffsetKey = require('findAncestorOffsetKey');
const nullthrows = require('nullthrows');

const isGecko = UserAgent.isEngine('Gecko');

const DOUBLE_NEWLINE = '\n\n';

/**
 * This function is intended to handle spellcheck and autocorrect changes,
 * which occur in the DOM natively without any opportunity to observe or
 * interpret the changes before they occur.
 *
 * The `input` event fires in contentEditable elements reliably for non-IE
 * browsers, immediately after changes occur to the editor DOM. Since our other
 * handlers override or otherwise handle cover other constieties of text input,
 * the DOM state should match the model in all controlled input cases. Thus,
 * when an `input` change leads to a DOM/model mismatch, the change should be
 * due to a spellcheck change, and we can incorporate it into our model.
 */
function editOnInput(): void {
  const domSelection = global.getSelection();

  const {anchorNode, isCollapsed} = domSelection;
  if (anchorNode.nodeType !== Node.TEXT_NODE) {
    return;
  }

  let domText = anchorNode.textContent;
  const {editorState} = this.props;
  const offsetKey = nullthrows(findAncestorOffsetKey(anchorNode));
  const {blockKey, decoratorKey, leafKey} = DraftOffsetKey.decode(offsetKey);

  const {start, end} = editorState
    .getBlockTree(blockKey)
    .getIn([decoratorKey, 'leaves', leafKey]);

  const content = editorState.getCurrentContent();
  const block = content.getBlockForKey(blockKey);
  const modelText = block.getText().slice(start, end);

  // Special-case soft newlines here. If the DOM text ends in a soft newline,
  // we will have manually inserted an extra soft newline in DraftEditorLeaf.
  // We want to remove this extra newline for the purpose of our comparison
  // of DOM and model text.
  if (domText.endsWith(DOUBLE_NEWLINE)) {
    domText = domText.slice(0, -1);
  }

  // No change -- the DOM is up to date. Nothing to do here.
  if (domText === modelText) {
    return;
  }

  const selection = editorState.getSelection();

  // We'll replace the entire leaf with the text content of the target.
  const targetRange = selection.merge({
    anchorOffset: start,
    focusOffset: end,
    isBackward: false,
  });

  const newContent = DraftModifier.replaceText(
    content,
    targetRange,
    domText,
    block.getInlineStyleAt(start)
  );

  let anchorOffset, focusOffset, startOffset, endOffset;

  if (isGecko) {
    // Firefox selection does not change while the context menu is open, so
    // we preserve the anchor and focus values of the DOM selection.
    anchorOffset = domSelection.anchorOffset;
    focusOffset = domSelection.focusOffset;
    startOffset = start + Math.min(anchorOffset, focusOffset);
    endOffset = startOffset + Math.abs(anchorOffset - focusOffset);
    anchorOffset = startOffset;
    focusOffset = endOffset;
  } else {
    // Browsers other than Firefox may adjust DOM selection while the context
    // menu is open, and Safari autocorrect is prone to providing an inaccurate
    // DOM selection. Don't trust it. Instead, use our existing SelectionState
    // and adjust it based on the number of characters changed during the
    // mutation.
    const charDelta = domText.length - modelText.length;
    startOffset = selection.getStartOffset();
    endOffset = selection.getEndOffset();

    anchorOffset = isCollapsed ? endOffset + charDelta : startOffset;
    focusOffset = endOffset + charDelta;
  }

  const contentWithAdjustedDOMSelection = newContent.merge({
    selectionBefore: content.getSelectionAfter(),
    selectionAfter: selection.merge({anchorOffset, focusOffset}),
  });

  this.update(
    EditorState.push(
      editorState,
      contentWithAdjustedDOMSelection,
      'spellcheck-change'
    )
  );
}

module.exports = editOnInput;
