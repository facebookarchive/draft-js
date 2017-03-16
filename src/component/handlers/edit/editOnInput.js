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

var DraftModifier = require('DraftModifier');
var DraftOffsetKey = require('DraftOffsetKey');
var EditorState = require('EditorState');
var UserAgent = require('UserAgent');

var editOnSelect = require('editOnSelect');
var EditorBidiService = require('EditorBidiService');

var findAncestorOffsetKey = require('findAncestorOffsetKey');
var nullthrows = require('nullthrows');

import type DraftEditor from 'DraftEditor.react';

var isGecko = UserAgent.isEngine('Gecko');

var DOUBLE_NEWLINE = '\n\n';

/**
 * This function is intended to handle spellcheck and autocorrect changes,
 * which occur in the DOM natively without any opportunity to observe or
 * interpret the changes before they occur.
 *
 * The `input` event fires in contentEditable elements reliably for non-IE
 * browsers, immediately after changes occur to the editor DOM. Since our other
 * handlers override or otherwise handle cover other varieties of text input,
 * the DOM state should match the model in all controlled input cases. Thus,
 * when an `input` change leads to a DOM/model mismatch, the change should be
 * due to a spellcheck change, and we can incorporate it into our model.
 */
function editOnInput(editor: DraftEditor): void {

  // We have already updated our internal state appropriately for this input
  // event. See editOnBeforeInput() for more info
  if (editor._updatedNativeInsertionBlock && !editor._renderNativeContent) {
    editor._updatedNativeInsertionBlock = null;
    return;
  }

  var selectionBeforeInput = editor._latestEditorState.getSelection();
  editOnSelect(editor);
  var editorState = editor._latestEditorState;
  var blockChangedSinceBeforeInput = false;

  if (editor._updatedNativeInsertionBlock) {
    const oldBlock = editor._updatedNativeInsertionBlock;
    if (editorState.getSelection().getFocusKey() !== oldBlock.getKey()) {

      blockChangedSinceBeforeInput = true;

      // The selection has changed between editOnBeforeInput and now, and our
      // optimistically updated block is no longer valid.
      // Replace it with the non-updated block and let the input fall through.
      const currentContent = editorState.getCurrentContent();
      const contentWithOldBlock = currentContent.merge({
        blockMap: currentContent.getBlockMap().set(oldBlock.getKey(), oldBlock),
        selectionBefore: currentContent.getSelectionBefore(),
        selectionAfter: currentContent.getSelectionAfter(),
      });

      var directionMap = EditorBidiService.getDirectionMap(
        contentWithOldBlock,
        editorState.getDirectionMap()
      );

      editor.update(
        EditorState.set(
          editorState,
          {
            currentContent: contentWithOldBlock,
            directionMap,
          }
        )
      );

      editorState = editor._latestEditorState;
    }
    editor._updatedNativeInsertionBlock = null;
  }

  var domSelection = global.getSelection();

  var {anchorNode, isCollapsed} = domSelection;
  if (anchorNode.nodeType !== Node.TEXT_NODE) {
    return;
  }

  var domText = anchorNode.textContent;
  var offsetKey = nullthrows(findAncestorOffsetKey(anchorNode));
  var {blockKey, decoratorKey, leafKey} = DraftOffsetKey.decode(offsetKey);

  var {start, end} = editorState
    .getBlockTree(blockKey)
    .getIn([decoratorKey, 'leaves', leafKey]);

  var content = editorState.getCurrentContent();
  var block = content.getBlockForKey(blockKey);
  var modelText = block.getText().slice(start, end);

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

  var selection = editorState.getSelection();

  // We'll replace the entire leaf with the text content of the target.
  var targetRange = selection.merge({
    anchorOffset: start,
    focusOffset: end,
    isBackward: false,
  });

  const entityKey = block.getEntityAt(start);
  const entity = entityKey && content.getEntity(entityKey);
  const entityType = entity && entity.getMutability();
  const preserveEntity = entityType === 'MUTABLE';

  // Immutable or segmented entities cannot properly be handled by the
  // default browser undo, so we have to use a different change type to
  // force using our internal undo method instead of falling through to the
  // native browser undo.
  const changeType = preserveEntity ? 'spellcheck-change' : 'apply-entity';

  // Replace the full text of the leaf and set the selection to the value calculated in editOnSelect() above,
  // because replacing the leaf will move the selection to the end of the leaf rather than the end of the
  // changed text
  const newContent = DraftModifier.replaceText(
    content,
    targetRange,
    domText,
    block.getInlineStyleAt(start),
    preserveEntity ? block.getEntityAt(start) : null,
  );

  let contentWithAdjustedDOMSelection;

  if (blockChangedSinceBeforeInput) {
    // Trust window.getSelection() because that's all we have

    contentWithAdjustedDOMSelection = newContent.merge({
      selectionBefore: content.getSelectionBefore(),
      selectionAfter: content.getSelectionAfter(),
    });
  } else {

    // Fix up the selection ourselves because that's more reliable that window.getSelection()
    var anchorOffset, focusOffset, startOffset, endOffset;

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
      var charDelta = domText.length - modelText.length;
      startOffset = selectionBeforeInput.getStartOffset();
      endOffset = selectionBeforeInput.getEndOffset();

      anchorOffset = isCollapsed ? endOffset + charDelta : startOffset;
      focusOffset = endOffset + charDelta;
    }

    // Segmented entities are completely or partially removed when their
    // text content changes. For this case we do not want any text to be selected
    // after the change, so we are not merging the selection.
    contentWithAdjustedDOMSelection = newContent.merge({
      selectionBefore: content.getSelectionAfter(),
      selectionAfter: selectionBeforeInput.merge({anchorOffset, focusOffset}),
    });
  }

  editor.update(
    EditorState.push(
      editorState,
      contentWithAdjustedDOMSelection,
      changeType
    )
  );
}

module.exports = editOnInput;
