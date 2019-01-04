/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 * @emails oncall+draft_js
 */

'use strict';

import type {BlockMap} from 'BlockMap';
import type DraftEditor from 'DraftEditor.react';
import type {EntityMap} from 'EntityMap';

const BlockMapBuilder = require('BlockMapBuilder');
const CharacterMetadata = require('CharacterMetadata');
const DataTransfer = require('DataTransfer');
const DraftModifier = require('DraftModifier');
const DraftPasteProcessor = require('DraftPasteProcessor');
const EditorState = require('EditorState');
const RichTextEditorUtil = require('RichTextEditorUtil');

const getEntityKeyForSelection = require('getEntityKeyForSelection');
const getTextContentFromFiles = require('getTextContentFromFiles');
const isEventHandled = require('isEventHandled');
const splitTextIntoTextBlocks = require('splitTextIntoTextBlocks');

/**
 * Paste content.
 */
function editOnPaste(editor: DraftEditor, e: SyntheticClipboardEvent<>): void {
  e.preventDefault();
  const data = new DataTransfer(e.clipboardData);

  // Get files, unless this is likely to be a string the user wants inline.
  if (!data.isRichText()) {
    const files = data.getFiles();
    const defaultFileText = data.getText();
    if (files.length > 0) {
      // Allow customized paste handling for images, etc. Otherwise, fall
      // through to insert text contents into the editor.
      if (
        editor.props.handlePastedFiles &&
        isEventHandled(editor.props.handlePastedFiles(files))
      ) {
        return;
      }

      getTextContentFromFiles(files, (/*string*/ fileText) => {
        fileText = fileText || defaultFileText;
        if (!fileText) {
          return;
        }

        const editorState = editor._latestEditorState;
        const blocks = splitTextIntoTextBlocks(fileText);
        const character = CharacterMetadata.create({
          style: editorState.getCurrentInlineStyle(),
          entity: getEntityKeyForSelection(
            editorState.getCurrentContent(),
            editorState.getSelection(),
          ),
        });
        const currentBlockType = RichTextEditorUtil.getCurrentBlockType(
          editorState,
        );

        const text = DraftPasteProcessor.processText(
          blocks,
          character,
          currentBlockType,
        );
        const fragment = BlockMapBuilder.createFromArray(text);

        const withInsertedText = DraftModifier.replaceWithFragment(
          editorState.getCurrentContent(),
          editorState.getSelection(),
          fragment,
        );

        editor.update(
          EditorState.push(editorState, withInsertedText, 'insert-fragment'),
        );
      });

      return;
    }
  }

  let textBlocks: Array<string> = [];
  const text = data.getText();
  const html = data.getHTML();
  const editorState = editor._latestEditorState;

  if (
    editor.props.handlePastedText &&
    isEventHandled(editor.props.handlePastedText(text, html, editorState))
  ) {
    return;
  }

  if (text) {
    textBlocks = splitTextIntoTextBlocks(text);
  }

  if (!editor.props.stripPastedStyles) {
    // If the text from the paste event is rich content that matches what we
    // already have on the internal clipboard, assume that we should just use
    // the clipboard fragment for the paste. This will allow us to preserve
    // styling and entities, if any are present. Note that newlines are
    // stripped during comparison -- this is because copy/paste within the
    // editor in Firefox and IE will not include empty lines. The resulting
    // paste will preserve the newlines correctly.
    const internalClipboard = editor.getClipboard();
    if (data.isRichText() && internalClipboard) {
      if (
        // If the editorKey is present in the pasted HTML, it should be safe to
        // assume this is an internal paste.
        html.indexOf(editor.getEditorKey()) !== -1 ||
        // The copy may have been made within a single block, in which case the
        // editor key won't be part of the paste. In this case, just check
        // whether the pasted text matches the internal clipboard.
        (textBlocks.length === 1 &&
          internalClipboard.size === 1 &&
          internalClipboard.first().getText() === text)
      ) {
        editor.update(
          insertFragment(editor._latestEditorState, internalClipboard),
        );
        return;
      }
    } else if (
      internalClipboard &&
      data.types.includes('com.apple.webarchive') &&
      !data.types.includes('text/html') &&
      areTextBlocksAndClipboardEqual(textBlocks, internalClipboard)
    ) {
      // Safari does not properly store text/html in some cases.
      // Use the internalClipboard if present and equal to what is on
      // the clipboard. See https://bugs.webkit.org/show_bug.cgi?id=19893.
      editor.update(
        insertFragment(editor._latestEditorState, internalClipboard),
      );
      return;
    }

    // If there is html paste data, try to parse that.
    if (html) {
      const htmlFragment = DraftPasteProcessor.processHTML(
        html,
        editor.props.blockRenderMap,
      );
      if (htmlFragment) {
        const {contentBlocks, entityMap} = htmlFragment;
        if (contentBlocks) {
          const htmlMap = BlockMapBuilder.createFromArray(contentBlocks);
          editor.update(
            insertFragment(editor._latestEditorState, htmlMap, entityMap),
          );
          return;
        }
      }
    }

    // Otherwise, create a new fragment from our pasted text. Also
    // empty the internal clipboard, since it's no longer valid.
    editor.setClipboard(null);
  }

  if (textBlocks.length) {
    const character = CharacterMetadata.create({
      style: editorState.getCurrentInlineStyle(),
      entity: getEntityKeyForSelection(
        editorState.getCurrentContent(),
        editorState.getSelection(),
      ),
    });

    const currentBlockType = RichTextEditorUtil.getCurrentBlockType(
      editorState,
    );

    const textFragment = DraftPasteProcessor.processText(
      textBlocks,
      character,
      currentBlockType,
    );

    const textMap = BlockMapBuilder.createFromArray(textFragment);
    editor.update(insertFragment(editor._latestEditorState, textMap));
  }
}

function insertFragment(
  editorState: EditorState,
  fragment: BlockMap,
  entityMap: ?EntityMap,
): EditorState {
  const newContent = DraftModifier.replaceWithFragment(
    editorState.getCurrentContent(),
    editorState.getSelection(),
    fragment,
  );
  // TODO: merge the entity map once we stop using DraftEntity
  // like this:
  // const mergedEntityMap = newContent.getEntityMap().merge(entityMap);

  return EditorState.push(
    editorState,
    newContent.set('entityMap', entityMap),
    'insert-fragment',
  );
}

function areTextBlocksAndClipboardEqual(
  textBlocks: Array<string>,
  blockMap: BlockMap,
): boolean {
  return (
    textBlocks.length === blockMap.size &&
    blockMap.valueSeq().every((block, ii) => block.getText() === textBlocks[ii])
  );
}

module.exports = editOnPaste;
