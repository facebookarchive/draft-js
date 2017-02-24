/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule DraftInputHandler
 * @flow
 */

'use strict';
import type DraftEditor from 'DraftEditor.react';
var EditorState = require('EditorState');
var DraftModifier = require('DraftModifier');
var KeyBindingUtil = require('KeyBindingUtil');
var getEntityKeyForSelection = require('getEntityKeyForSelection');
var DraftOffsetKey = require('DraftOffsetKey');
var getTextContent = require('getTextContent');

/**
 * Remove dummy text that existing for placeholder.
 */
function removeDummyText(editor: DraftEditor) {
  let editorState = editor._latestEditorState;

  // While composition, changing textContent makes composition fail.
  if (!editorState.isInCompositionMode()) {
    let selectedElement = window.getSelection();
    let element = getDraftEditorTextNodeSpan(selectedElement.focusNode);
    if (!element) {
      return;
    }
    let textContent = getTextContent(element);

    // Do not remove dummy text if it exists alone.
    if (textContent === '') {
      return;
    }

    let selection = window.getSelection();
    let focusOffset = selection.focusOffset;
    element.textContent = textContent;

    // Restore caret to original position.
    if (element.firstChild) {
      focusOffset = Math.min(focusOffset, getTextContent(element.firstChild).length);
      selection.collapse(element.firstChild, focusOffset);
    }
  }
}

/**
 * Get DraftEditorTextNode's span from a element containing caret.
 */
function getDraftEditorTextNodeSpan(node: Node) {
  return (node.nodeType == Node.TEXT_NODE ? node.parentNode : node);
}

function handleInput(editor: DraftEditor) {
  let editorState = editor._latestEditorState;
  removeDummyText(editor);

  let windowSelection = window.getSelection();
  var element = getDraftEditorTextNodeSpan(windowSelection.anchorNode);
  if (element == null) {
    return;
  }
  let textContent = getTextContent(element);
  let leafNode = element.parentNode;
  if (leafNode == null) {
    return;
  }

  // any -> suppress flow error: property `getAttribute`. Property not found in
  let dataOffsetKey = (leafNode: any).getAttribute('data-offset-key');
  if (!dataOffsetKey) {
    return;
  }
  let offsetKey = DraftOffsetKey.decode(dataOffsetKey);
  let key = offsetKey.blockKey;
  let tree = editorState.getBlockTree(key);
  let leafSet = tree.get(offsetKey.decoratorKey);
  let leavesForLeafSet = leafSet.get('leaves');
  let leaf = leavesForLeafSet.get(offsetKey.leafKey);
  let start = leaf.get('start');
  let end = leaf.get('end');

  let selection = editorState.getSelection();

  let contentBlock = editorState.getCurrentContent().getBlockForKey(key);
  let prevText = contentBlock.getText().slice(start, end);

  // This method can be called multiple times for one change.
  // Filter same task out
  if (prevText === textContent) {
    return;
  }

  // Expand selection to contain whole focused line.
  let isBackward = selection.getIsBackward();
  if (selection.getAnchorKey() === key) {
    if (isBackward) {
      selection = selection
        .set('anchorOffset', end);
    } else {
      selection = selection
        .set('anchorOffset', start);
    }
  }
  if (selection.getFocusKey() === key) {
    if (isBackward) {
      selection = selection
        .set('focusOffset', start);
    } else {
      selection = selection
        .set('focusOffset', end);
    }
  }

  const currentStyle = editorState.getCurrentInlineStyle();
  const entityKey = getEntityKeyForSelection(
    editorState.getCurrentContent(),
    editorState.getSelection()
  );


  let newState = EditorState.push(
    editorState,
    DraftModifier.replaceText(
      editorState.getCurrentContent(),
      selection,
      textContent,
      currentStyle,
      entityKey,
    ),
    'insert-characters'
  );
  if (newState !== editorState) {
    editor.update(newState);
  }
}

const DraftInputHandler = {
  onInput(editor: DraftEditor, e: SyntheticKeyboardEvent): void {
    handleInput(editor, e);
  },

  // Some browser such as IE, input event may not occur.
  onKeyUp(editor: DraftEditor, e: SyntheticKeyboardEvent): void {
    if (KeyBindingUtil.hasCommandModifier(e) ||
      KeyBindingUtil.isCtrlKeyCommand(e) ||
      KeyBindingUtil.isOptionKeyCommand(e)
    ) {
      return;
    }
    const keycode = e.which;
    const command = editor.props.keyBindingFn(e);

    // Check if keyCode makes visible character.
    const valid =
      (keycode > 47 && keycode < 58) || // number keys
      keycode == 32 ||                  // spacebar
      (keycode > 64 && keycode < 91) || // letter keys
      (keycode > 95 && keycode < 112) || // numpad keys
      (keycode > 185 && keycode < 193) || // ;=,-./` (in order)
      (keycode > 218 && keycode < 223);   // [\]' (in order)

    // Backspace is command but should be handled
    if (keycode == 8 || valid && !command) {
      handleInput(editor, e);
    }
  },
  onCompositionStart(editor: DraftEditor): void {
    let editorState = editor._latestEditorState;
    let id = editorState.getCompositionEndTimeoutId();
    if (id) {
      clearTimeout(id);
    }
    editor.update(
      EditorState.set(editorState, {inCompositionMode: true, compositionEndTimeoutId: null}),
    );
  },
  onCompositionEnd(editor: DraftEditor): void {
    let editorState = editor._latestEditorState;
    let id = editorState.getCompositionEndTimeoutId();
    if (id) {
      clearTimeout(id);
    }

    // Composition can be start as soon as end.
    // For maintain composition state while the situation, use timeout
    id = setTimeout(() => {
      editor.update(
        EditorState.set(editor._latestEditorState, {inCompositionMode: false}),
      );
      // handleInput again for handling new character
      handleInput(editor);
    }, 30);

    editor.update(
      EditorState.set(editorState, {compositionEndTimeoutId: id}),
    );
  },
};

module.exports = DraftInputHandler;