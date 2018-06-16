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
 */

'use strict';

import type DraftEditor from 'DraftEditor.react';

const DraftModifier = require('DraftModifier');
const DraftOffsetKey = require('DraftOffsetKey');
const EditorState = require('EditorState');

const editOnSelect = require('editOnSelect');
const EditorBidiService = require('EditorBidiService');

const findAncestorOffsetKey = require('findAncestorOffsetKey');
const gkx = require('gkx');
const nullthrows = require('nullthrows');

const DOUBLE_NEWLINE = '\n\n';

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

  editOnSelect(editor);
  let editorState = editor._latestEditorState;

  if (editor._updatedNativeInsertionBlock) {
    const oldBlock = editor._updatedNativeInsertionBlock;
    if (editorState.getSelection().getFocusKey() !== oldBlock.getKey()) {
      // The selection has changed between editOnBeforeInput and now, and our
      // optimistically updated block is no longer valid.
      // Replace it with the non-updated block and let the input fall through.
      const currentContent = editorState.getCurrentContent();
      const contentWithOldBlock = currentContent.merge({
        blockMap: currentContent.getBlockMap().set(oldBlock.getKey(), oldBlock),
        selectionBefore: currentContent.getSelectionBefore(),
        selectionAfter: currentContent.getSelectionAfter(),
      });

      const directionMap = EditorBidiService.getDirectionMap(
        contentWithOldBlock,
        editorState.getDirectionMap(),
      );

      editor.update(
        EditorState.set(editorState, {
          currentContent: contentWithOldBlock,
          directionMap,
        }),
      );

      editorState = editor._latestEditorState;
    }
    editor._updatedNativeInsertionBlock = null;
  }

  const domSelection = global.getSelection();

  const {anchorNode} = domSelection;
  const isNotTextNode = anchorNode.nodeType !== Node.TEXT_NODE;
  const isNotTextOrElementNode =
    anchorNode.nodeType !== Node.TEXT_NODE &&
    anchorNode.nodeType !== Node.ELEMENT_NODE;

  if (gkx('draft_killswitch_allow_nontextnodes')) {
    if (isNotTextNode) {
      return;
    }
  } else {
    if (isNotTextOrElementNode) {
      // TODO: (t16149272) figure out context for this change
      return;
    }
  }

  if (
    anchorNode.nodeType === Node.TEXT_NODE &&
    (anchorNode.previousSibling !== null || anchorNode.nextSibling !== null)
  ) {
    // When typing at the beginning of a visual line, Chrome splits the text
    // nodes into two. Why? No one knows. This commit is suspicious:
    // https://chromium.googlesource.com/chromium/src/+/a3b600981286b135632371477f902214c55a1724
    // To work around, we'll merge the sibling text nodes back into this one.
    const span = anchorNode.parentNode;
    anchorNode.nodeValue = span.textContent;
    for (
      let child = span.firstChild;
      child !== null;
      child = child.nextSibling
    ) {
      if (child !== anchorNode) {
        span.removeChild(child);
      }
    }
  }

  let domText = anchorNode.textContent;
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
    // This can be buggy for some Android keyboards because they don't fire
    // standard onkeydown/pressed events and only fired editOnInput
    // so domText is already changed by the browser and ends up being equal
    // to modelText unexpectedly
    return;
  }

  const selection = editorState.getSelection();

  // We'll replace the entire leaf with the text content of the target.
  const targetRange = selection.merge({
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

  // Replace the full text of the leaf and set the selection to the value
  // calculated in editOnSelect() above, because replacing the leaf will move
  // the selection to the end of the leaf rather than the end of the changed
  // text.
  const newContent = DraftModifier.replaceText(
    content,
    targetRange,
    domText,
    block.getInlineStyleAt(start),
    preserveEntity ? block.getEntityAt(start) : null,
  )
    .set('selectionBefore', content.getSelectionBefore())
    .set('selectionAfter', content.getSelectionAfter());

  editor.update(EditorState.push(editorState, newContent, changeType));
}

module.exports = editOnInput;
