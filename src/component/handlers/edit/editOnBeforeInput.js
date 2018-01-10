/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule editOnBeforeInput
 * @format
 * @flow
 */

'use strict';

import type DraftEditor from 'DraftEditor.react';
import type {DraftInlineStyle} from 'DraftInlineStyle';

var BlockTree = require('BlockTree');
var DraftModifier = require('DraftModifier');
var EditorState = require('EditorState');
var UserAgent = require('UserAgent');

var getEntityKeyForSelection = require('getEntityKeyForSelection');
const isEventHandled = require('isEventHandled');
var isSelectionAtLeafStart = require('isSelectionAtLeafStart');
var nullthrows = require('nullthrows');
var setImmediate = require('setImmediate');
var editOnInput = require('editOnInput');
var editOnSelect = require('editOnSelect');

// When nothing is focused, Firefox regards two characters, `'` and `/`, as
// commands that should open and focus the "quickfind" search bar. This should
// *never* happen while a contenteditable is focused, but as of v28, it
// sometimes does, even when the keypress event target is the contenteditable.
// This breaks the input. Special case these characters to ensure that when
// they are typed, we prevent default on the event to make sure not to
// trigger quickfind.
var FF_QUICKFIND_CHAR = "'";
var FF_QUICKFIND_LINK_CHAR = '/';
var isFirefox = UserAgent.isBrowser('Firefox');
var isIE = UserAgent.isBrowser('IE');

function mustPreventDefaultForCharacter(character: string): boolean {
  return (
    isFirefox &&
    (character == FF_QUICKFIND_CHAR || character == FF_QUICKFIND_LINK_CHAR)
  );
}

/**
 * Replace the current selection with the specified text string, with the
 * inline style and entity key applied to the newly inserted text.
 */
function replaceText(
  editorState: EditorState,
  text: string,
  inlineStyle: DraftInlineStyle,
  entityKey: ?string,
): EditorState {
  var contentState = DraftModifier.replaceText(
    editorState.getCurrentContent(),
    editorState.getSelection(),
    text,
    inlineStyle,
    entityKey,
  );
  return EditorState.push(editorState, contentState, 'insert-characters');
}

/**
 * When `onBeforeInput` executes, the browser is attempting to insert a
 * character into the editor. Apply this character data to the document,
 * allowing native insertion if possible.
 *
 * Native insertion is encouraged in order to limit re-rendering and to
 * preserve spellcheck highlighting, which disappears or flashes if re-render
 * occurs on the relevant text nodes.
 */
function editOnBeforeInput(
  editor: DraftEditor,
  e: SyntheticInputEvent<>,
): void {
  // React doesn't fire a selection event until mouseUp, so it's possible to
  // click to change selection, hold the mouse down, and type a character
  // without React registering it. Let's sync the selection manually now.
  editOnSelect(editor);

  const editorState = editor._latestEditorState;

  var chars = e.data;

  // In some cases (ex: IE ideographic space insertion) no character data
  // is provided. There's nothing to do when this happens.
  if (!chars) {
    return;
  }

  // Allow the top-level component to handle the insertion manually. This is
  // useful when triggering interesting behaviors for a character insertion,
  // Simple examples: replacing a raw text ':)' with a smile emoji or image
  // decorator, or setting a block to be a list item after typing '- ' at the
  // start of the block.
  if (
    editor.props.handleBeforeInput &&
    isEventHandled(editor.props.handleBeforeInput(chars, editorState))
  ) {
    e.preventDefault();
    return;
  }

  // If selection is collapsed, conditionally allow native behavior. This
  // reduces re-renders and preserves spellcheck highlighting. If the selection
  // is not collapsed, we will re-render.
  var selection = editorState.getSelection();
  var selectionStart = selection.getStartOffset();
  var selectionEnd = selection.getEndOffset();
  var anchorKey = selection.getAnchorKey();

  if (!selection.isCollapsed()) {
    e.preventDefault();

    // If the currently selected text matches what the user is trying to
    // replace it with, let's just update the `SelectionState`. If not, update
    // the `ContentState` with the new text.
    var currentlySelectedChars = editorState
      .getCurrentContent()
      .getPlainText()
      .slice(selectionStart, selectionEnd);
    if (chars === currentlySelectedChars) {
      editor.update(
        EditorState.forceSelection(
          editorState,
          selection.merge({
            focusOffset: selectionEnd,
          }),
        ),
      );
    } else {
      editor.update(
        replaceText(
          editorState,
          chars,
          editorState.getCurrentInlineStyle(),
          getEntityKeyForSelection(
            editorState.getCurrentContent(),
            editorState.getSelection(),
          ),
        ),
      );
    }
    return;
  }

  var newEditorState = replaceText(
    editorState,
    chars,
    editorState.getCurrentInlineStyle(),
    getEntityKeyForSelection(
      editorState.getCurrentContent(),
      editorState.getSelection(),
    ),
  );

  // Bunch of different cases follow where we need to prevent native insertion.
  let mustPreventNative = false;
  if (!mustPreventNative) {
    // Browsers tend to insert text in weird places in the DOM when typing at
    // the start of a leaf, so we'll handle it ourselves.
    mustPreventNative = isSelectionAtLeafStart(
      editor._latestCommittedEditorState,
    );
  }
  if (!mustPreventNative) {
    // Chrome will also split up a node into two pieces if it contains a Tab
    // char, for no explicable reason. Seemingly caused by this commit:
    // https://chromium.googlesource.com/chromium/src/+/013ac5eaf3%5E%21/
    const nativeSelection = global.getSelection();
    // Selection is necessarily collapsed at this point due to earlier check.
    if (
      nativeSelection.anchorNode &&
      nativeSelection.anchorNode.nodeType === Node.TEXT_NODE
    ) {
      // See isTabHTMLSpanElement in chromium EditingUtilities.cpp.
      const parentNode = nativeSelection.anchorNode.parentNode;
      mustPreventNative =
        parentNode.nodeName === 'SPAN' &&
        parentNode.firstChild.nodeType === Node.TEXT_NODE &&
        parentNode.firstChild.nodeValue.indexOf('\t') !== -1;
    }
  }
  if (!mustPreventNative) {
    // Check the old and new "fingerprints" of the current block to determine
    // whether this insertion requires any addition or removal of text nodes,
    // in which case we would prevent the native character insertion.
    var originalFingerprint = BlockTree.getFingerprint(
      editorState.getBlockTree(anchorKey),
    );
    var newFingerprint = BlockTree.getFingerprint(
      newEditorState.getBlockTree(anchorKey),
    );
    mustPreventNative = originalFingerprint !== newFingerprint;
  }
  if (!mustPreventNative) {
    mustPreventNative = mustPreventDefaultForCharacter(chars);
  }
  if (!mustPreventNative) {
    mustPreventNative =
      nullthrows(newEditorState.getDirectionMap()).get(anchorKey) !==
      nullthrows(editorState.getDirectionMap()).get(anchorKey);
  }

  if (mustPreventNative) {
    e.preventDefault();
    editor.update(newEditorState);
    return;
  }

  // We made it all the way! Let the browser do its thing and insert the char.
  newEditorState = EditorState.set(newEditorState, {
    nativelyRenderedContent: newEditorState.getCurrentContent(),
  });

  editor._updatedNativeInsertionBlock = editorState
    .getCurrentContent()
    .getBlockForKey(editorState.getSelection().getAnchorKey());

  // Allow the native insertion to occur and update our internal state to match.
  // If editor.update() does something like changing a typed 'x' to 'abc' in an
  // onChange() handler, we don't want our editOnInput() logic to squash that
  // change in favor of the typed 'x'. Set a flag to ignore the next
  // editOnInput() event in favor of what's in our internal state.
  editor.update(newEditorState, true);

  var editorStateAfterUpdate = editor._latestEditorState;
  var contentStateAfterUpdate = editorStateAfterUpdate.getCurrentContent();
  var expectedContentStateAfterUpdate = editorStateAfterUpdate.getNativelyRenderedContent();

  if (
    expectedContentStateAfterUpdate &&
    expectedContentStateAfterUpdate === contentStateAfterUpdate
  ) {
    if (isIE) {
      setImmediate(() => {
        editOnInput(editor);
      });
    }
  } else {
    // Outside callers (via the editor.onChange prop) have changed the
    // editorState. No longer allow native insertion.
    e.preventDefault();
    editor._updatedNativeInsertionBlock = null;
    editor._renderNativeContent = false;
  }
}

module.exports = editOnBeforeInput;
