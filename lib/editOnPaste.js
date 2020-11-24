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

var BlockMapBuilder = require("./BlockMapBuilder");

var CharacterMetadata = require("./CharacterMetadata");

var DataTransfer = require("fbjs/lib/DataTransfer");

var DraftModifier = require("./DraftModifier");

var DraftPasteProcessor = require("./DraftPasteProcessor");

var EditorState = require("./EditorState");

var RichTextEditorUtil = require("./RichTextEditorUtil");

var getEntityKeyForSelection = require("./getEntityKeyForSelection");

var getTextContentFromFiles = require("./getTextContentFromFiles");

var isEventHandled = require("./isEventHandled");

var splitTextIntoTextBlocks = require("./splitTextIntoTextBlocks");
/**
 * Paste content.
 */


function editOnPaste(editor, e) {
  e.preventDefault();
  var data = new DataTransfer(e.clipboardData); // Get files, unless this is likely to be a string the user wants inline.

  if (!data.isRichText()) {
    var files = data.getFiles();
    var defaultFileText = data.getText();

    if (files.length > 0) {
      // Allow customized paste handling for images, etc. Otherwise, fall
      // through to insert text contents into the editor.
      if (editor.props.handlePastedFiles && isEventHandled(editor.props.handlePastedFiles(files))) {
        return;
      }
      /* $FlowFixMe[incompatible-call] This comment suppresses an error found
       * DataTransfer was typed. getFiles() returns an array of <Files extends
       * Blob>, not Blob */


      getTextContentFromFiles(files, function (
      /*string*/
      fileText) {
        fileText = fileText || defaultFileText;

        if (!fileText) {
          return;
        }

        var editorState = editor._latestEditorState;
        var blocks = splitTextIntoTextBlocks(fileText);
        var character = CharacterMetadata.create({
          style: editorState.getCurrentInlineStyle(),
          entity: getEntityKeyForSelection(editorState.getCurrentContent(), editorState.getSelection())
        });
        var currentBlockType = RichTextEditorUtil.getCurrentBlockType(editorState);
        var text = DraftPasteProcessor.processText(blocks, character, currentBlockType);
        var fragment = BlockMapBuilder.createFromArray(text);
        var withInsertedText = DraftModifier.replaceWithFragment(editorState.getCurrentContent(), editorState.getSelection(), fragment);
        editor.update(EditorState.push(editorState, withInsertedText, 'insert-fragment'));
      });
      return;
    }
  }

  var textBlocks = [];
  var text = data.getText();
  var html = data.getHTML();
  var editorState = editor._latestEditorState;

  if (editor.props.formatPastedText) {
    var _editor$props$formatP = editor.props.formatPastedText(text, html),
        formattedText = _editor$props$formatP.text,
        formattedHtml = _editor$props$formatP.html;

    text = formattedText;
    html = formattedHtml;
  }

  if (editor.props.handlePastedText && isEventHandled(editor.props.handlePastedText(text, html, editorState))) {
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
    var internalClipboard = editor.getClipboard();

    if (!editor.props.formatPastedText && data.isRichText() && internalClipboard) {
      var _html;

      if ( // If the editorKey is present in the pasted HTML, it should be safe to
      // assume this is an internal paste.
      ((_html = html) === null || _html === void 0 ? void 0 : _html.indexOf(editor.getEditorKey())) !== -1 || // The copy may have been made within a single block, in which case the
      // editor key won't be part of the paste. In this case, just check
      // whether the pasted text matches the internal clipboard.
      textBlocks.length === 1 && internalClipboard.size === 1 && internalClipboard.first().getText() === text) {
        editor.update(insertFragment(editor._latestEditorState, internalClipboard));
        return;
      }
    } else if (internalClipboard && data.types.includes('com.apple.webarchive') && !data.types.includes('text/html') && areTextBlocksAndClipboardEqual(textBlocks, internalClipboard)) {
      // Safari does not properly store text/html in some cases.
      // Use the internalClipboard if present and equal to what is on
      // the clipboard. See https://bugs.webkit.org/show_bug.cgi?id=19893.
      editor.update(insertFragment(editor._latestEditorState, internalClipboard));
      return;
    } // If there is html paste data, try to parse that.


    if (html) {
      var htmlFragment = DraftPasteProcessor.processHTML(html, editor.props.blockRenderMap);

      if (htmlFragment) {
        var contentBlocks = htmlFragment.contentBlocks,
            entityMap = htmlFragment.entityMap;

        if (contentBlocks) {
          var htmlMap = BlockMapBuilder.createFromArray(contentBlocks);
          editor.update(insertFragment(editor._latestEditorState, htmlMap, entityMap));
          return;
        }
      }
    } // Otherwise, create a new fragment from our pasted text. Also
    // empty the internal clipboard, since it's no longer valid.


    editor.setClipboard(null);
  }

  if (textBlocks.length) {
    var character = CharacterMetadata.create({
      style: editorState.getCurrentInlineStyle(),
      entity: getEntityKeyForSelection(editorState.getCurrentContent(), editorState.getSelection())
    });
    var currentBlockType = RichTextEditorUtil.getCurrentBlockType(editorState);
    var textFragment = DraftPasteProcessor.processText(textBlocks, character, currentBlockType);
    var textMap = BlockMapBuilder.createFromArray(textFragment);
    editor.update(insertFragment(editor._latestEditorState, textMap));
  }
}

function insertFragment(editorState, fragment, entityMap) {
  var newContent = DraftModifier.replaceWithFragment(editorState.getCurrentContent(), editorState.getSelection(), fragment); // TODO: merge the entity map once we stop using DraftEntity
  // like this:
  // const mergedEntityMap = newContent.getEntityMap().merge(entityMap);

  return EditorState.push(editorState, newContent.set('entityMap', entityMap), 'insert-fragment');
}

function areTextBlocksAndClipboardEqual(textBlocks, blockMap) {
  return textBlocks.length === blockMap.size && blockMap.valueSeq().every(function (block, ii) {
    return block.getText() === textBlocks[ii];
  });
}

module.exports = editOnPaste;