/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall draft_js
 */

'use strict';

import type DraftEditor from 'DraftEditor.react';
import type {DraftInlineStyle} from 'DraftInlineStyle';

const DraftModifier = require('DraftModifier');
const EditorState = require('EditorState');
const UserAgent = require('UserAgent');

const editOnInput = require('editOnInput');
const getEntityKeyForSelection = require('getEntityKeyForSelection');
const isEventHandled = require('isEventHandled');
const isSelectionAtLeafStart = require('isSelectionAtLeafStart');
const nullthrows = require('nullthrows');
const setImmediate = require('setImmediate');

// When nothing is focused, Firefox regards two characters, `'` and `/`, as
// commands that should open and focus the "quickfind" search bar. This should
// *never* happen while a contenteditable is focused, but as of v28, it
// sometimes does, even when the keypress event target is the contenteditable.
// This breaks the input. Special case these characters to ensure that when
// they are typed, we prevent default on the event to make sure not to
// trigger quickfind.
const FF_QUICKFIND_CHAR = "'";
const FF_QUICKFIND_LINK_CHAR = '/';
const isFirefox = UserAgent.isBrowser('Firefox');
const isIE = UserAgent.isBrowser('IE');

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
  forceSelection: boolean,
): EditorState {
  const contentState = DraftModifier.replaceText(
    editorState.getCurrentContent(),
    editorState.getSelection(),
    text,
    inlineStyle,
    entityKey,
  );
  return EditorState.push(
    editorState,
    contentState,
    'insert-characters',
    forceSelection,
  );
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
  e: SyntheticInputEvent<HTMLElement>,
): void {
  // We need this here in case this beforeInput fires before our
  // immediate below had a chance to fire in IE (say, the user is
  // typing fast).
  if (isIE) {
    if (editor._pendingStateFromBeforeInput !== undefined) {
      editor.update(editor._pendingStateFromBeforeInput);
      editor._pendingStateFromBeforeInput = undefined;
    }
  }

  const editorState = editor._latestEditorState;

  const chars = e.data;

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
    isEventHandled(
      editor.props.handleBeforeInput(chars, editorState, e.timeStamp),
    )
  ) {
    e.preventDefault();
    return;
  }

  // If selection is collapsed, conditionally allow native behavior. This
  // reduces re-renders and preserves spellcheck highlighting. If the selection
  // is not collapsed, we will re-render.
  const selection = editorState.getSelection();
  const selectionStart = selection.getStartOffset();
  const anchorKey = selection.getAnchorKey();

  if (!selection.isCollapsed()) {
    e.preventDefault();
    editor.update(
      replaceText(
        editorState,
        chars,
        editorState.getCurrentInlineStyle(),
        getEntityKeyForSelection(
          editorState.getCurrentContent(),
          editorState.getSelection(),
        ),
        true,
      ),
    );
    return;
  }

  let newEditorState = replaceText(
    editorState,
    chars,
    editorState.getCurrentInlineStyle(),
    getEntityKeyForSelection(
      editorState.getCurrentContent(),
      editorState.getSelection(),
    ),
    false,
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
    // Let's say we have a decorator that highlights hashtags. In many cases
    // we need to prevent native behavior and rerender ourselves --
    // particularly, any case *except* where the inserted characters end up
    // anywhere except exactly where you put them.
    //
    // Using [] to denote a decorated leaf, some examples:
    //
    // 1. 'hi #' and append 'f'
    // desired rendering: 'hi [#f]'
    // native rendering would be: 'hi #f' (incorrect)
    //
    // 2. 'x [#foo]' and insert '#' before 'f'
    // desired rendering: 'x #[#foo]'
    // native rendering would be: 'x [##foo]' (incorrect)
    //
    // 3. '[#foobar]' and insert ' ' between 'foo' and 'bar'
    // desired rendering: '[#foo] bar'
    // native rendering would be: '[#foo bar]' (incorrect)
    //
    // 4. '[#foo]' and delete '#' [won't use this beforeinput codepath though]
    // desired rendering: 'foo'
    // native rendering would be: '[foo]' (incorrect)
    //
    // 5. '[#foo]' and append 'b'
    // desired rendering: '[#foob]'
    // native rendering would be: '[#foob]'
    // (native insertion here would be ok for decorators like simple spans,
    // but not more complex decorators. To be safe, we need to prevent it.)
    //
    // It is safe to allow native insertion if and only if the full list of
    // decorator ranges matches what we expect native insertion to give, and
    // the range lengths have not changed. We don't need to compare the content
    // because the only possible mutation to consider here is inserting plain
    // text and decorators can't affect text content.
    const oldBlockTree = editorState.getBlockTree(anchorKey);
    const newBlockTree = newEditorState.getBlockTree(anchorKey);
    mustPreventNative =
      oldBlockTree.size !== newBlockTree.size ||
      oldBlockTree.zip(newBlockTree).some(([oldLeafSet, newLeafSet]) => {
        // selectionStart is guaranteed to be selectionEnd here
        const oldStart = oldLeafSet.get('start');
        const adjustedStart =
          oldStart + (oldStart >= selectionStart ? chars.length : 0);
        const oldEnd = oldLeafSet.get('end');
        const adjustedEnd =
          oldEnd + (oldEnd >= selectionStart ? chars.length : 0);
        const newStart = newLeafSet.get('start');
        const newEnd = newLeafSet.get('end');
        const newDecoratorKey = newLeafSet.get('decoratorKey');
        return (
          // Different decorators
          oldLeafSet.get('decoratorKey') !== newDecoratorKey ||
          // Different number of inline styles
          oldLeafSet.get('leaves').size !== newLeafSet.get('leaves').size ||
          // Different effective decorator position
          adjustedStart !== newStart ||
          adjustedEnd !== newEnd ||
          // Decorator already existed and its length changed
          (newDecoratorKey != null && newEnd - newStart !== oldEnd - oldStart)
        );
      });
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
    newEditorState = EditorState.set(newEditorState, {
      forceSelection: true,
    });
    editor.update(newEditorState);
    return;
  }

  newEditorState = EditorState.set(newEditorState, {
    nativelyRenderedContent: newEditorState.getCurrentContent(),
  });

  // We have newEditorState, but we just don't want to call "editor.update"
  // just yet. So let's store this state updated with our change to be consumed
  // later, after the native event occurs and the browser inserts the char.
  // After that, when we rerender, the text we see in the DOM will already have
  // been inserted properly.
  //
  editor._pendingStateFromBeforeInput = newEditorState;
  //
  // Part of the reason to do this is because browsers seem to change their
  // behaviour if you preventDefault(). For example, on macOS the browser seems
  // to believe it's no longer in a contenteditable and will change the
  // Touch Bar on a MacBook to stop showing text suggestions.
  //
  // Later (presumably after we render), it realizes "hold up, I am in a content
  // editable, silly me" and shows the suggestions again. But in the meantime
  // what we get is flickering between suggestions and no suggestions. We
  // should probably report this to Apple.
  //
  // Anyway, above we update our editor state if we prevent the native event, since
  // there will be no input event after we preventDefault. Otherwise, we will
  // do so in the "input" event, which fires once the text is inserted.
  //
  // There is one exception however: IE (what a surprise!). IE doesn't fire
  // input events (and React doesn't polyfill them), so we never get to see
  // how the text changed and we never get to call editor.update (which triggers
  // onChange).
  //
  // To get around this, we schedule an immediate to call our usual input
  // handler. It's important that this be an immediate so that no other random
  // tasks from the web page get on the way (mimicking what would happen if the
  // browser fired both the beforeInput and input events). Calling our usual
  // input handler does the trick.
  if (isIE) {
    setImmediate(() => {
      editOnInput(editor, null);
    });
  }
}

module.exports = editOnBeforeInput;
