/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule editOnPaste
 * @flow
 */

'use strict';

var BlockMapBuilder = require('BlockMapBuilder');
var CharacterMetadata = require('CharacterMetadata');
var DataTransfer = require('DataTransfer');
var DraftModifier = require('DraftModifier');
var DraftPasteProcessor = require('DraftPasteProcessor');
var EditorState = require('EditorState');

var getEntityKeyForSelection = require('getEntityKeyForSelection');
var getTextContentFromFiles = require('getTextContentFromFiles');
var nullthrows = require('nullthrows');
var splitTextIntoTextBlocks = require('splitTextIntoTextBlocks');

import type {BlockMap} from 'BlockMap';

/**
 * Paste content.
 */
function editOnPaste(e: SyntheticClipboardEvent): void {
  e.preventDefault();
  var data = new DataTransfer(e.clipboardData);

  // Get files, unless this is likely to be a string the user wants inline.
  if (!data.isRichText()) {
    var files = data.getFiles();
    var defaultFileText = data.getText();
    if (files.length > 0) {
      // Allow customized paste handling for images, etc. Otherwise, fall
      // through to insert text contents into the editor.
      if (
        this.props.handlePastedFiles &&
        this.props.handlePastedFiles(files)
      ) {
        return;
      }

      getTextContentFromFiles(files, (/*string*/ fileText) => {
        fileText = fileText || defaultFileText;
        if (!fileText) {
          return;
        }

        var {editorState} = this.props;
        var blocks = splitTextIntoTextBlocks(fileText);
        var character = CharacterMetadata.create({
          style: editorState.getCurrentInlineStyle(),
          entity: getEntityKeyForSelection(
            editorState.getCurrentContent(),
            editorState.getSelection()
          ),
        });

        var text = DraftPasteProcessor.processText(blocks, character);
        var fragment = BlockMapBuilder.createFromArray(text);

        var withInsertedText = DraftModifier.replaceWithFragment(
          editorState.getCurrentContent(),
          editorState.getSelection(),
          fragment
        );

        this.update(
          EditorState.push(
            editorState,
            withInsertedText,
            'insert-fragment'
          )
        );
      });

      return;
    }
  }

  var textBlocks: ?Array<string> = null;
  var text = data.getText();
  this.props.onPasteRawText && this.props.onPasteRawText(text);
  if (text) {
    textBlocks = splitTextIntoTextBlocks(text);
  }

  if (!this.props.stripPastedStyles) {
    // If the text from the paste event is rich content that matches what we
    // already have on the internal clipboard, assume that we should just use
    // the clipboard fragment for the paste. This will allow us to preserve
    // styling and entities, if any are present. Note that newlines are
    // stripped during comparison -- this is because copy/paste within the
    // editor in Firefox and IE will not include empty lines. The resulting
    // paste will preserve the newlines correctly.
    if (data.isRichText() && this.getClipboard()) {
      textBlocks = nullthrows(textBlocks);
      var textBlocksWithoutNewlines = textBlocks.filter(filterOutNewlines);
      var currentClipboard = this.getClipboard();
      var clipboardWithoutNewlines = currentClipboard
        .toSeq()
        .map(clipBlock => clipBlock.getText())
        .filter(filterOutNewlines)
        .toArray();

      var clipboardMatch = textBlocksWithoutNewlines.every(
        (line, ii) => line === clipboardWithoutNewlines[ii]
      );

      if (clipboardMatch) {
        this.update(
          insertFragment(this.props.editorState, currentClipboard)
        );
        return;
      }
    }

    // If there is html paste data, try to parse that.
    var htmlData = data.getHTML();
    if (htmlData) {
      var htmlFragment = DraftPasteProcessor.processHTML(
        htmlData,
      );

      if (htmlFragment) {
        var htmlMap = BlockMapBuilder.createFromArray(htmlFragment);
        this.update(insertFragment(this.props.editorState, htmlMap));
        return;
      }
    }
    // Otherwise, create a new fragment from our pasted text. Also
    // empty the internal clipboard, since it's no longer valid.
    this.setClipboard(null);
  }

  if (textBlocks) {
    var {editorState} = this.props;
    var character = CharacterMetadata.create({
      style: editorState.getCurrentInlineStyle(),
      entity: getEntityKeyForSelection(
        editorState.getCurrentContent(),
        editorState.getSelection()
      ),
    });

    var textFragment = DraftPasteProcessor.processText(
      textBlocks,
      character
    );

    var textMap = BlockMapBuilder.createFromArray(textFragment);
    this.update(insertFragment(this.props.editorState, textMap));
  }
}

function filterOutNewlines(str: string): boolean {
  return str.length > 0;
}

function insertFragment(
  editorState: EditorState,
  fragment: BlockMap
): EditorState {
  var newContent = DraftModifier.replaceWithFragment(
    editorState.getCurrentContent(),
    editorState.getSelection(),
    fragment
  );
  return EditorState.push(
    editorState,
    newContent,
    'insert-fragment'
  );
}

module.exports = editOnPaste;
