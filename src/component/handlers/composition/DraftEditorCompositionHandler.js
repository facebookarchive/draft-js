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
const EditorState = require('EditorState');
const Keys = require('Keys');
const invariant = require('invariant');
const ReactDOM = require('ReactDOM');

const getEntityKeyForSelection = require('getEntityKeyForSelection');
const gkx = require('gkx');
const isEventHandled = require('isEventHandled');
const isSelectionAtLeafStart = require('isSelectionAtLeafStart');
// const onInput = require('editOnInput');
const editOnSelect = require('editOnSelect');
const getDraftEditorSelectionWithNodes = require('getDraftEditorSelectionWithNodes');

/**
 * Millisecond delay to allow `compositionstart` to fire again upon
 * `compositionend`.
 *
 * This is used for Korean input to ensure that typing can continue without
 * the editor trying to render too quickly. More specifically, Safari 7.1+
 * triggers `compositionstart` a little slower than Chrome/FF, which
 * leads to composed characters being resolved and re-render occurring
 * sooner than we want.
 */
const RESOLVE_DELAY = 20;

/**
 * A handful of variables used to track the current composition and its
 * resolution status. These exist at the module level because it is not
 * possible to have compositions occurring in multiple editors simultaneously,
 * and it simplifies state management with respect to the DraftEditor component.
 */
let resolved = false;
let stillComposing = false;
let beforeInputData = null;
let compositionEndData = null;
let compositionUpdateData = null;
let selectionStart = null;

var DraftEditorCompositionHandler = {
  /**
   * Some IMEs (Firefox Mobile, notably) fire multiple `beforeinput` events
   * which include the text so far typed, in addition to (broken)
   * `compositionend` events. In these cases, we construct beforeInputData from
   * the `beforeinput` and consider that to be the definitive version of what
   * was actually typed.
   *
   * Proper, compliant browsers will not do this and will instead include the
   * entire resolved composition result in the `data` member of the
   * `compositionend` events that they fire.
   */
  onBeforeInput: function(editor: DraftEditor, e: SyntheticInputEvent<>): void {
    beforeInputData = (beforeInputData || '') + e.data;
  },

  /**
   * A `compositionstart` event has fired while we're still in composition
   * mode. Continue the current composition session to prevent a re-render.
   */
  onCompositionStart: function(editor: DraftEditor): void {
    const selection = global.getSelection();
    selectionStart = {
      anchorOffset: selection.anchorOffset,
      anchorNode: selection.anchorNode,
      focusOffset: selection.focusOffset,
    };
    stillComposing = true;
  },

  /**
   * A `compositionupdate` event has fired. Update the current composition
   * session.
   */
  onCompositionUpdate: function(
    editor: DraftEditor,
    e: SyntheticInputEvent<>,
  ): void {
    compositionUpdateData = e.data;
  },

  /**
   * Attempt to end the current composition session.
   *
   * Defer handling because browser will still insert the chars into active
   * element after `compositionend`. If a `compositionstart` event fires
   * before `resolveComposition` executes, our composition session will
   * continue.
   *
   * The `resolved` flag is useful because certain IME interfaces fire the
   * `compositionend` event multiple times, thus queueing up multiple attempts
   * at handling the composition. Since handling the same composition event
   * twice could break the DOM, we only use the first event. Example: Arabic
   * Google Input Tools on Windows 8.1 fires `compositionend` three times.
   */
  onCompositionEnd: function(
    editor: DraftEditor,
    e: SyntheticCompositionEvent<>,
  ): void {
    resolved = false;
    stillComposing = false;
    // Use e.data from the first compositionend event seen
    compositionEndData = compositionEndData || e.data;
    setTimeout(() => {
      if (!resolved) {
        DraftEditorCompositionHandler.resolveComposition(editor, e);
      }
    }, RESOLVE_DELAY);
  },

  /**
   * In Safari, keydown events may fire when committing compositions. If
   * the arrow keys are used to commit, prevent default so that the cursor
   * doesn't move, otherwise it will jump back noticeably on re-render.
   */
  onKeyDown: function(editor: DraftEditor, e: SyntheticKeyboardEvent<>): void {
    if (!stillComposing) {
      // If a keydown event is received after compositionend but before the
      // 20ms timer expires (ex: type option-E then backspace, or type A then
      // backspace in 2-Set Korean), we should immediately resolve the
      // composition and reinterpret the key press in edit mode.
      DraftEditorCompositionHandler.resolveComposition(editor, e);
      editor._onKeyDown(e);
      return;
    }
    if (e.which === Keys.RIGHT || e.which === Keys.LEFT) {
      e.preventDefault();
    }
  },

  /**
   * Keypress events may fire when committing compositions. In Firefox,
   * pressing RETURN commits the composition and inserts extra newline
   * characters that we do not want. `preventDefault` allows the composition
   * to be committed while preventing the extra characters.
   */
  onKeyPress: function(editor: DraftEditor, e: SyntheticKeyboardEvent<>): void {
    if (e.which === Keys.RETURN) {
      e.preventDefault();
    }
  },

  /**
   * Normalizes platform inconsistencies with input event data.
   *
   * When beforeInputData is present, it is only preferred if its length
   * is greater than that of the last compositionUpdate event data. This is
   * meant to resolve IME incosistencies where compositionUpdate may contain
   * only the last character or the entire composition depending on language
   * (e.g. Korean vs. Japanese).
   *
   * When beforeInputData is not present, compositionUpdate data is preferred.
   * This resolves issues with some platforms where beforeInput is never fired
   * (e.g. Android with certain keyboard and browser combinations).
   *
   * Lastly, if neither beforeInput nor compositionUpdate events are fired, use
   * the data in the compositionEnd event
   */
  normalizeCompositionInput: function(): ?string {
    const beforeInputDataLength = beforeInputData ? beforeInputData.length : 0;
    const compositionUpdateDataLength = compositionUpdateData
      ? compositionUpdateData.length
      : 0;
    const updateData =
      beforeInputDataLength > compositionUpdateDataLength
        ? beforeInputData
        : compositionUpdateData;
    return updateData || compositionEndData;
  },

  /**
   * Attempt to insert composed characters into the document.
   *
   * If we are still in a composition session, do nothing. Otherwise, insert
   * the characters into the document and terminate the composition session.
   *
   * If no characters were composed -- for instance, the user
   * deleted all composed characters and committed nothing new --
   * force a re-render. We also re-render when the composition occurs
   * at the beginning of a leaf, to ensure that if the browser has
   * created a new text node for the composition, we will discard it.
   *
   * Resetting innerHTML will move focus to the beginning of the editor,
   * so we update to force it back to the correct place.
   */
  resolveComposition: function(
    editor: DraftEditor,
    event: SyntheticEvent<>,
  ): void {
    if (stillComposing) {
      return;
    }

    resolved = true;

    const composedChars = this.normalizeCompositionInput();
    beforeInputData = null;
    compositionUpdateData = null;
    compositionEndData = null;

    const editorState = EditorState.set(editor._latestEditorState, {
      inCompositionMode: false,
    });

    const currentStyle = editorState.getCurrentInlineStyle();
    const entityKey = getEntityKeyForSelection(
      editorState.getCurrentContent(),
      editorState.getSelection(),
    );

    const mustReset =
      isSelectionAtLeafStart(editorState) ||
      currentStyle.size > 0 ||
      entityKey !== null;

    if (mustReset) {
      editor.restoreEditorDOM();
    }

    editor.exitCurrentMode();

    const currentSelection = global.getSelection();
    console.log(
      selectionStart.anchorOffset,
      selectionStart.focusOffset,
      currentSelection.anchorOffset,
      currentSelection.focusOffset,
      composedChars,
    );

    if (selectionStart.anchorOffset >= currentSelection.focusOffset) {
      return;
    }

    const editorNode = ReactDOM.findDOMNode(editor.editorContainer);
    invariant(editorNode, 'Missing editorNode');
    invariant(
      editorNode.firstChild instanceof HTMLElement,
      'editorNode.firstChild is not an HTMLElement',
    );
    const selection = getDraftEditorSelectionWithNodes(
      editorState,
      editorNode.firstChild,
      selectionStart.anchorNode,
      selectionStart.anchorOffset,
      currentSelection.focusNode,
      currentSelection.focusOffset,
    );

    // If characters have been composed, re-rendering with the update
    // is sufficient to reset the editor.
    const contentState = DraftModifier.replaceText(
      editorState.getCurrentContent(),
      selection.selectionState,
      composedChars,
      currentStyle,
      entityKey,
    );
    editor.update(
      EditorState.push(editorState, contentState, 'insert-characters'),
    );
  },
};

module.exports = DraftEditorCompositionHandler;
