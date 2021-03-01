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

var DOMObserver = require("./DOMObserver");

var DraftModifier = require("./DraftModifier");

var DraftOffsetKey = require("./DraftOffsetKey");

var EditorState = require("./EditorState");

var Keys = require("fbjs/lib/Keys");

var UserAgent = require("fbjs/lib/UserAgent");

var editOnSelect = require("./editOnSelect");

var getContentEditableContainer = require("./getContentEditableContainer");

var getDraftEditorSelection = require("./getDraftEditorSelection");

var getEntityKeyForSelection = require("./getEntityKeyForSelection");

var nullthrows = require("fbjs/lib/nullthrows");

var isIE = UserAgent.isBrowser('IE');
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

var RESOLVE_DELAY = 20;
/**
 * A handful of variables used to track the current composition and its
 * resolution status. These exist at the module level because it is not
 * possible to have compositions occurring in multiple editors simultaneously,
 * and it simplifies state management with respect to the DraftEditor component.
 */

var resolved = false;
var stillComposing = false;
var domObserver = null;
var isSelectionCrossBlock = false;
var offsetKeyList = [];
var observerKeyList = [];
var deleteKey = [];
var emptyKey = [];

function startDOMObserver(editor) {
  if (!domObserver) {
    domObserver = new DOMObserver(getContentEditableContainer(editor));
    domObserver.start();
  }
}

var DraftEditorCompositionHandler = {
  /**
   * A `compositionstart` event has fired while we're still in composition
   * mode. Continue the current composition session to prevent a re-render.
   */
  onCompositionStart: function onCompositionStart(editor) {
    stillComposing = true;
    var selection = getDraftEditorSelection(editor._latestEditorState, getContentEditableContainer(editor)).selectionState;
    isSelectionCrossBlock = selection.getAnchorKey() !== selection.getFocusKey();
    var lastKey = selection.getAnchorKey();

    var content = editor._latestEditorState.getCurrentContent();

    observerKeyList.push(lastKey);

    while (isSelectionCrossBlock && typeof lastKey === 'string') {
      lastKey = content.getKeyAfter(lastKey);
      console.log(lastKey);
      observerKeyList.push(lastKey);

      if (lastKey === selection.getFocusKey()) {
        lastKey = null;
      }
    }

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
  onCompositionEnd: function onCompositionEnd(editor) {
    resolved = false;
    stillComposing = false;
    setTimeout(function () {
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
  onKeyDown: function onKeyDown(editor, e) {
    if (!stillComposing) {
      // This check was added in D23734060. Seemingly, we should be checking
      // to see if the resolved flag is false here, otherwise the below
      // comment doesn't make sense. With this change, it should prevent
      // over-firing the resolveComposition() method, which might help fix
      // some existing IME issues.
      if (!resolved) {
        // If a keydown event is received after compositionend but before the
        // 20ms timer expires (ex: type option-E then backspace, or type A then
        // backspace in 2-Set Korean), we should immediately resolve the
        // composition and reinterpret the key press in edit mode.
        DraftEditorCompositionHandler.resolveComposition(editor);
        return;
      } else {
        resolved = false;
      }

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
  onKeyPress: function onKeyPress(_editor, e) {
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
  resolveComposition: function resolveComposition(editor) {
    console.log('resolve');

    if (stillComposing) {
      return;
    }

    var lastEditorState = editor._latestEditorState;
    var mutations = domObserver && nullthrows(domObserver).stopAndFlushMutations();
    domObserver = null;
    resolved = true;
    var editorState = EditorState.set(lastEditorState, {
      inCompositionMode: false,
      lastChangeType: null
    });
    editor.exitCurrentMode();

    if (!mutations || !mutations.size) {
      editor.update(editorState);
      return;
    } // TODO, check if Facebook still needs this flag or if it could be removed.
    // Since there can be multiple mutations providing a `composedChars` doesn't
    // apply well on this new model.
    // if (
    //   gkx('draft_handlebeforeinput_composed_text') &&
    //   editor.props.handleBeforeInput &&
    //   isEventHandled(
    //     editor.props.handleBeforeInput(
    //       composedChars,
    //       editorState,
    //       event.timeStamp,
    //     ),
    //   )
    // ) {
    //   return;
    // }


    var contentState = editorState.getCurrentContent();
    var selection = editorState.getSelection();
    var focusKey = selection.getFocusKey();
    mutations.forEach(function (composedChars, offsetKey) {
      var _DraftOffsetKey$decod = DraftOffsetKey.decode(offsetKey),
          blockKey = _DraftOffsetKey$decod.blockKey,
          decoratorKey = _DraftOffsetKey$decod.decoratorKey,
          leafKey = _DraftOffsetKey$decod.leafKey;

      var immuTableBlock = editorState.getBlockTree(blockKey);
      if (!immuTableBlock || !observerKeyList.includes(blockKey)) return;

      var _immuTableBlock$getIn = immuTableBlock.getIn([decoratorKey, 'leaves', leafKey]),
          start = _immuTableBlock$getIn.start,
          end = _immuTableBlock$getIn.end;

      var replacementRange = selection.merge({
        anchorKey: blockKey,
        focusKey: blockKey,
        anchorOffset: start,
        focusOffset: end,
        isBackward: false
      });
      var entityKey = getEntityKeyForSelection(contentState, replacementRange);
      var currentStyle = contentState.getBlockForKey(blockKey).getInlineStyleAt(start);
      var replaced = false;
      var block = contentState.getBlockForKey(blockKey); // 处理entity边缘问题

      if (!editorState.isInCompositionMode() && selection.isCollapsed() && entityKey) {
        if (block.getType() === 'atomic') return;
        var prevText = block.getText().substring(start, end);
        var diffChars = composedChars.substr(prevText.length);

        if (composedChars.startsWith(prevText) && composedChars.length > prevText.length && selection.getAnchorOffset() === end + diffChars.length // 避免 "测测" 中间输入 "测" 时误判
        ) {
            var nextReplacementRange = editorState.getSelection().merge({
              anchorKey: blockKey,
              focusKey: blockKey,
              anchorOffset: end,
              focusOffset: end,
              isBackward: false
            });
            contentState = DraftModifier.replaceText(contentState, nextReplacementRange, diffChars, currentStyle, null);
            replaced = true;
          } else if (composedChars.endsWith(prevText) && composedChars.length > prevText.length && start === 0 && selection.getAnchorOffset() === diffChars.length) {
          diffChars = composedChars.substr(0, diffChars.length);

          var _nextReplacementRange = editorState.getSelection().merge({
            anchorKey: blockKey,
            focusKey: blockKey,
            anchorOffset: start,
            focusOffset: start,
            isBackward: false
          });

          contentState = DraftModifier.replaceText(contentState, _nextReplacementRange, diffChars, currentStyle, null);
          replaced = true;
        }
      } // 判断是不是空段落插入


      if (block.getLength() === 0 && composedChars) {
        emptyKey.push(blockKey);
      } // 判断block是不是被删除


      if (start === 0 && end === block.getLength() && composedChars === '' && focusKey !== blockKey) {
        var _block = contentState.getBlockForKey(blockKey);

        var blockMap = contentState.getBlockMap()["delete"](_block.getKey());
        contentState = contentState.merge({
          blockMap: blockMap
        });
        deleteKey.push(blockKey);
        observerKeyList = observerKeyList.filter(function (key) {
          return key !== blockKey;
        });
      } else if (!replaced) {
        offsetKeyList.push(blockKey);
        contentState = DraftModifier.replaceText(contentState, replacementRange, composedChars, currentStyle, entityKey);
      } // We need to update the editorState so the leaf node ranges are properly
      // updated and multiple mutations are correctly applied.


      editorState = EditorState.set(editorState, {
        currentContent: contentState,
        lastChangeType: 'insert-characters'
      });
    }); // When we apply the text changes to the ContentState, the selection always
    // goes to the end of the field, but it should just stay where it is
    // after compositionEnd. We also apply this to the last editor state, rather
    // than the new editor state in order to avoid problems that might come from
    // race conditions around calculating ranges from mutations when processing
    // the mutations above. If the ranges are off, for example, using mentions
    // in IME mode, then the selection will move the cursor to an invalid range.
    // See D23905960 for more context:

    var documentSelection = getDraftEditorSelection(lastEditorState, getContentEditableContainer(editor));
    var compositionEndSelectionState = documentSelection.selectionState; // editor.restoreEditorDOM();
    // See:
    // - https://github.com/facebook/draft-js/issues/2093
    // - https://github.com/facebook/draft-js/pull/2094
    // Apply this fix only in IE for now. We can test it in
    // other browsers in the future to ensure no regressions

    var editorStateWithUpdatedSelection = isIE ? EditorState.forceSelection(editorState, compositionEndSelectionState) : EditorState.acceptSelection(editorState, compositionEndSelectionState);
    observerKeyList.forEach(function (key) {
      if (!offsetKeyList.includes(key)) {
        var block = contentState.getBlockForKey(key);
        var blockMap = contentState.getBlockMap()["delete"](block.getKey());
        contentState = contentState.merge({
          blockMap: blockMap
        });
        deleteKey.push(key);
      }
    });
    contentState = contentState.merge({
      selectionAfter: compositionEndSelectionState
    });
    editor.restoreBlockDOM(offsetKeyList, deleteKey, emptyKey);
    offsetKeyList = [];
    deleteKey = [];
    emptyKey = [];
    observerKeyList = [];
    editor.update(EditorState.push(editorStateWithUpdatedSelection, contentState, 'insert-characters'));
  }
};
module.exports = DraftEditorCompositionHandler;