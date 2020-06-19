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

const DOMObserver = require('DOMObserver');
const DraftModifier = require('DraftModifier');
const DraftOffsetKey = require('DraftOffsetKey');
const EditorState = require('EditorState');
const Keys = require('Keys');

const editOnSelect = require('editOnSelect');
const getContentEditableContainer = require('getContentEditableContainer');
const getDraftEditorSelection = require('getDraftEditorSelection');
const getEntityKeyForSelection = require('getEntityKeyForSelection');
const nullthrows = require('nullthrows');

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
let domObserver = null;
let startEditorState = null;
let isCollapsedAtBeginning = true;

function startDOMObserver(editor: DraftEditor) {
  if (!domObserver) {
    domObserver = new DOMObserver(getContentEditableContainer(editor));
    domObserver.start();
  }
}

const DraftEditorCompositionHandler = {
  /**
   * A `compositionstart` event has fired while we're still in composition
   * mode. Continue the current composition session to prevent a re-render.
   */
  onCompositionStart: function(editor: DraftEditor): void {
    startEditorState = editor._latestEditorState;

    const startSelection = startEditorState.getSelection();
    if (!startSelection.isCollapsed()) {
      const currentContent = startEditorState.getCurrentContent();

      const rmContentState = DraftModifier.removeRange(
        currentContent,
        startSelection,
        'backward',
      );

      // if selection is not collapsed, update startEditorstate
      startEditorState = EditorState.push(
        startEditorState,
        rmContentState,
        // use 'insert-fragment' rather than 'remove-range'
        // because later we will insert the content here
        // more semantically consistent with the description of 'insert-fragment'
        'insert-fragment',
      );

      editor.update(startEditorState);

      isCollapsedAtBeginning = false;
    } else {
      isCollapsedAtBeginning = true;
    }

    // keep dom sync with state before startDOMObserver
    editor.restoreEditorDOM();

    stillComposing = true;
    startDOMObserver(editor);
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
  onCompositionEnd: function(editor: DraftEditor): void {
    resolved = false;
    stillComposing = false;
    setTimeout(() => {
      if (!resolved) {
        DraftEditorCompositionHandler.resolveComposition(editor);
      }
    }, RESOLVE_DELAY);
  },

  onSelect: editOnSelect,

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
      DraftEditorCompositionHandler.resolveComposition(editor);
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
  resolveComposition: function(editor: DraftEditor): void {
    if (stillComposing) {
      return;
    }

    const mutations = nullthrows(domObserver).stopAndFlushMutations();
    domObserver = null;
    resolved = true;

    let endEditorState = EditorState.set(editor._latestEditorState, {
      inCompositionMode: false,
    });

    editor.exitCurrentMode();

    if (!mutations.size) {
      editor.update(endEditorState);
      return;
    }

    // contentState and selectionState of startEditorstate
    const startContentState = startEditorState.getCurrentContent();
    const startSelection = startEditorState.getSelection();

    mutations.forEach((composedChars, offsetKey) => {
      let mutatedContentState = endEditorState.getCurrentContent();
      const selectionState = endEditorState.getSelection();

      const {blockKey, decoratorKey, leafKey} = DraftOffsetKey.decode(
        offsetKey,
      );

      const {start, end} = endEditorState
        .getBlockTree(blockKey)
        .getIn([decoratorKey, 'leaves', leafKey]);

      const replacementRange = selectionState.merge({
        anchorKey: blockKey,
        focusKey: blockKey,
        anchorOffset: start,
        focusOffset: end,
        isBackward: false,
      });

      const entityKey = getEntityKeyForSelection(
        mutatedContentState,
        replacementRange,
      );

      const currentStyle = mutatedContentState
        .getBlockForKey(blockKey)
        .getInlineStyleAt(start);

      mutatedContentState = DraftModifier.replaceText(
        mutatedContentState,
        replacementRange,
        composedChars,
        currentStyle,
        entityKey,
      );

      // We need to update the editorState so the leaf node ranges are properly
      // updated and multiple mutations are correctly applied.
      endEditorState = EditorState.set(endEditorState, {
        currentContent: mutatedContentState,
      });
    });

    // Now, let's handle selection status

    // When we apply the text changes to the ContentState, the selection always
    // goes to the end of the field, but it should just stay where it is
    // after compositionEnd.
    const documentSelection = getDraftEditorSelection(
      endEditorState,
      getContentEditableContainer(editor),
    );
    const compositionEndSelectionState = documentSelection.selectionState;

    editor.restoreEditorDOM();

    let stateWillUpdate = endEditorState;
    let newContentState = endEditorState.getCurrentContent();

    if (isCollapsedAtBeginning) {
      // 'insert' behaviour
      // we'll use 'EditorState.push' to update state
      // so it may create a new item in undo-stack(that depends on 'push' logic)

      // recover currentContent(that will be updated with new contentState) with correct selection status(including selectionBefore and selectionAfter)
      const recoverContentState = EditorState.set(endEditorState, {
        currentContent: startContentState,
      });
      // recover selection
      const recoverSelectionState = EditorState.acceptSelection(
        recoverContentState,
        startSelection,
      );
      // recover selectionBefore & selectionAfter
      let withCorrectABSelectionContent = recoverSelectionState
        .getCurrentContent()
        .set('selectionBefore', startContentState.getSelectionBefore());
      withCorrectABSelectionContent = withCorrectABSelectionContent.set(
        'selectionAfter',
        startContentState.getSelectionAfter(),
      );
      // apply withCorrectABSelectionContent
      const withCorrectABSelectionState = EditorState.set(
        recoverSelectionState,
        {
          currentContent: withCorrectABSelectionContent,
        },
      );

      // recover inlineStyle(maybe override inlinestyle)
      const applyInlineStyleSelection = startSelection.merge({
        anchorKey: startSelection.getAnchorKey(),
        focusKey: compositionEndSelectionState.getFocusKey(),
        anchorOffset: startSelection.getAnchorOffset(),
        focusOffset: compositionEndSelectionState.getFocusOffset(),
        isBackward: false,
      });

      const startInlineStrings = startEditorState
        .getCurrentInlineStyle()
        .toArray();

      const startBlock = newContentState.getBlockForKey(
        startSelection.getAnchorKey(),
      );

      if (startBlock) {
        const currentInlineStrings = startBlock
          .getInlineStyleAt(startSelection.getAnchorOffset())
          .toArray();

        const rmInlineStrings = currentInlineStrings.filter(
          v => startInlineStrings.indexOf(v) === -1,
        );

        const addInlineStrings = startInlineStrings.filter(
          v => currentInlineStrings.indexOf(v) === -1,
        );

        addInlineStrings.forEach(inlineStr => {
          newContentState = DraftModifier.applyInlineStyle(
            newContentState,
            applyInlineStyleSelection,
            inlineStr,
          );
        });

        rmInlineStrings.forEach(inlineStr => {
          newContentState = DraftModifier.removeInlineStyle(
            newContentState,
            applyInlineStyleSelection,
            inlineStr,
          );
        });
      }

      // construct new contentState with correct selectionBefore & selectionAfter
      newContentState = newContentState.set(
        'selectionBefore',
        startContentState.getSelectionAfter(), // newContentState's selectionBefore is currentContentState's selectionAfter
      );
      newContentState = newContentState.set(
        'selectionAfter',
        compositionEndSelectionState, // ensure the latest selection correct(in 'EditorState.push' logic)
      );

      // push new state
      stateWillUpdate = EditorState.push(
        withCorrectABSelectionState,
        newContentState,
        'insert-characters',
      );
    } else {
      // 'replacement' behaviour
      // we'll use 'EditorState.set' to update state
      // so it won't create a new item in undo-stack
      // because we have done this before(in onCompositionStart)

      // update selectionState
      const withNewSelectionState = EditorState.acceptSelection(
        endEditorState,
        compositionEndSelectionState,
      );

      // construct new contentState with correct selectionBefore & selectionAfter
      newContentState = newContentState.set(
        'selectionBefore',
        startContentState.getSelectionBefore(), // inherit the previous selectionBefore
      );
      newContentState = newContentState.set(
        'selectionAfter',
        compositionEndSelectionState,
      );

      // set new state
      stateWillUpdate = EditorState.set(withNewSelectionState, {
        currentContent: newContentState,
      });
    }

    editor.update(stateWillUpdate);
  },
};

module.exports = DraftEditorCompositionHandler;
