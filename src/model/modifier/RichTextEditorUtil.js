/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RichTextEditorUtil
 * @typechecks
 * @flow
 */

'use strict';

var DraftEntity = require('DraftEntity');
var DraftModifier = require('DraftModifier');
var EditorState = require('EditorState');

var adjustBlockDepthForContentState = require('adjustBlockDepthForContentState');

import type ContentState from 'ContentState';
import type {DraftBlockType} from 'DraftBlockType';
import type {DraftEditorCommand} from 'DraftEditorCommand';
import type SelectionState from 'SelectionState';
import type URI from 'URI';

var RichTextEditorUtil = {
  currentBlockContainsLink: function(
    editorState: EditorState
  ): boolean {
    var selection = editorState.getSelection();
    return editorState.getCurrentContent()
      .getBlockForKey(selection.getAnchorKey())
      .getCharacterList()
      .slice(selection.getStartOffset(), selection.getEndOffset())
      .some(v => {
        var entity = v.getEntity();
        return !!entity && DraftEntity.get(entity).getType() === 'LINK';
      });
  },

  getCurrentBlockType: function(editorState: EditorState): DraftBlockType {
    var selection = editorState.getSelection();
    return editorState.getCurrentContent()
      .getBlockForKey(selection.getStartKey())
      .getType();
  },

  getDataObjectForLinkURL: function(uri: URI): Object {
    return {url: uri.toString()};
  },

  handleKeyCommand: function(
    editorState: EditorState,
    command: DraftEditorCommand
  ): ?EditorState {
    switch (command) {
      case 'bold':
        return RichTextEditorUtil.toggleInlineStyle(editorState, 'BOLD');
      case 'italic':
        return RichTextEditorUtil.toggleInlineStyle(editorState, 'ITALIC');
      case 'underline':
        return RichTextEditorUtil.toggleInlineStyle(editorState, 'UNDERLINE');
      case 'code':
        return RichTextEditorUtil.toggleCode(editorState);
      case 'backspace':
      case 'backspace-word':
      case 'backspace-to-start-of-line':
        return RichTextEditorUtil.onBackspace(editorState);
      case 'delete':
      case 'delete-word':
      case 'delete-to-end-of-block':
        return RichTextEditorUtil.onDelete(editorState);
      default:
        return null;
    }
  },

  insertSoftNewline: function(editorState: EditorState): EditorState {
    var contentState = DraftModifier.insertText(
      editorState.getCurrentContent(),
      editorState.getSelection(),
      '\n',
      editorState.getCurrentInlineStyle(),
      null
    );

    return EditorState.push(
      editorState,
      contentState,
      'insert-characters'
    );
  },

  /**
   * For collapsed selections at the start of styled blocks, backspace should
   * just remove the existing style.
   */
  onBackspace: function(editorState: EditorState): ?EditorState {
    var selection = editorState.getSelection();
    if (
      !selection.isCollapsed() ||
      selection.getAnchorOffset() ||
      selection.getFocusOffset()
    ) {
      return null;
    }

    // First, try to remove a preceding media block.
    var content = editorState.getCurrentContent();
    var startKey = selection.getStartKey();
    var blockAfter = content.getBlockAfter(startKey);

    // If the current block is empty, just delete it.
    if (blockAfter && content.getBlockForKey(startKey).getLength() === 0) {
      return null;
    }

    var blockBefore = content.getBlockBefore(startKey);

    if (blockBefore && blockBefore.getType() === 'media') {
      var mediaBlockTarget = selection.merge({
        anchorKey: blockBefore.getKey(),
        anchorOffset: 0,
      });
      var asCurrentStyle = DraftModifier.setBlockType(
        content,
        mediaBlockTarget,
        content.getBlockForKey(startKey).getType()
      );
      var withoutMedia = DraftModifier.removeRange(
        asCurrentStyle,
        mediaBlockTarget,
        'backward'
      );
      if (withoutMedia !== content) {
        return EditorState.push(
          editorState,
          withoutMedia,
          'remove-range'
        );
      }
    }

    // If that doesn't succeed, try to remove the current block style.
    var withoutBlockStyle = RichTextEditorUtil.tryToRemoveBlockStyle(
      editorState
    );

    if (withoutBlockStyle) {
      return EditorState.push(
        editorState,
        withoutBlockStyle,
        'change-block-type'
      );
    }

    return null;
  },

  onDelete: function(editorState: EditorState): ?EditorState {
    var selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      return null;
    }

    var content = editorState.getCurrentContent();
    var startKey = selection.getStartKey();
    var block = content.getBlockForKey(startKey);
    var length = block.getLength();

    // The cursor is somewhere within the text. Behave normally.
    if (selection.getStartOffset() < length) {
      return null;
    }

    var blockAfter = content.getBlockAfter(startKey);

    if (!blockAfter || blockAfter.getType() !== 'media') {
      return null;
    }

    // If the current block is empty, delete it.
    if (length === 0) {
      var target = selection.merge({
        focusKey: blockAfter.getKey(),
        focusOffset: 0,
      });

      var withoutEmptyBlock = DraftModifier.removeRange(
        content,
        target,
        'forward'
      );

      var preserveMedia = DraftModifier.setBlockType(
        withoutEmptyBlock,
        withoutEmptyBlock.getSelectionAfter(),
        'media'
      );

      return EditorState.push(editorState, preserveMedia, 'remove-range');
    }

    // Otherwise, delete the media block.
    var mediaBlockTarget = selection.merge({
      focusKey: blockAfter.getKey(),
      focusOffset: blockAfter.getLength(),
    });

    var withoutMedia = DraftModifier.removeRange(
      content,
      mediaBlockTarget,
      'forward'
    );

    if (withoutMedia !== content) {
      return EditorState.push(
        editorState,
        withoutMedia,
        'remove-range'
      );
    }

    return null;
  },

  onTab: function(
    event: SyntheticKeyboardEvent,
    editorState: EditorState,
    maxDepth: number
  ): EditorState {
    var selection = editorState.getSelection();
    var key = selection.getAnchorKey();
    if (key !== selection.getFocusKey()) {
      return editorState;
    }

    var content = editorState.getCurrentContent();
    var block = content.getBlockForKey(key);
    var type = block.getType();
    if (type !== 'unordered-list-item' && type !== 'ordered-list-item') {
      return editorState;
    }

    event.preventDefault();

    // Only allow indenting one level beyond the block above, and only if
    // the block above is a list item as well.
    var blockAbove = content.getBlockBefore(key);
    if (!blockAbove) {
      return editorState;
    }

    var typeAbove = blockAbove.getType();
    if (
      typeAbove !== 'unordered-list-item' &&
      typeAbove !== 'ordered-list-item'
    ) {
      return editorState;
    }

    var depth = block.getDepth();
    if (!event.shiftKey && depth === maxDepth) {
      return editorState;
    }

    maxDepth = Math.min(blockAbove.getDepth() + 1, maxDepth);

    var withAdjustment = adjustBlockDepthForContentState(
      content,
      selection,
      event.shiftKey ? -1 : 1,
      maxDepth
    );

    return EditorState.push(
      editorState,
      withAdjustment,
      'adjust-depth'
    );
  },

  toggleBlockType: function(
    editorState: EditorState,
    blockType: DraftBlockType
  ): EditorState {
    var selection = editorState.getSelection();
    var startKey = selection.getStartKey();
    var endKey = selection.getEndKey();
    var content = editorState.getCurrentContent();

    var hasMedia = content.getBlockMap()
      .skipWhile((_, k) => k !== startKey)
      .takeWhile((_, k) => k !== endKey)
      .some(v => v.getType() === 'media');

    if (hasMedia) {
      return editorState;
    }

    var typeToSet = content.getBlockForKey(startKey).getType() === blockType ?
      'unstyled' :
      blockType;

    return EditorState.push(
      editorState,
      DraftModifier.setBlockType(content, selection, typeToSet),
      'change-block-type'
    );
  },

  toggleCode: function(editorState: EditorState): EditorState {
    var selection = editorState.getSelection();
    var anchorKey = selection.getAnchorKey();
    var focusKey = selection.getFocusKey();

    if (selection.isCollapsed() || anchorKey !== focusKey) {
      return RichTextEditorUtil.toggleBlockType(editorState, 'code-block');
    }

    return RichTextEditorUtil.toggleInlineStyle(editorState, 'CODE');
  },

  /**
   * Toggle the specified inline style for the selection. If the
   * user's selection is collapsed, apply or remove the style for the
   * internal state. If it is not collapsed, apply the change directly
   * to the document state.
   */
  toggleInlineStyle: function(
    editorState: EditorState,
    inlineStyle: string
  ): EditorState {
    var selection = editorState.getSelection();
    var currentStyle = editorState.getCurrentInlineStyle();

    // If the selection is collapsed, toggle the specified style on or off and
    // set the result as the new inline style override. This will then be
    // used as the inline style for the next character to be inserted.
    if (selection.isCollapsed()) {
      return EditorState.set(editorState, {
        inlineStyleOverride:
          currentStyle.has(inlineStyle)
            ? currentStyle.remove(inlineStyle)
            : currentStyle.add(inlineStyle),
      });
    }

    // If characters are selected, immediately apply or remove the
    // inline style on the document state itself.
    var content = editorState.getCurrentContent();
    var newContent;

    // If the style is already present for the selection range, remove it.
    // Otherwise, apply it.
    if (currentStyle.has(inlineStyle)) {
      newContent = DraftModifier.removeInlineStyle(
        content,
        selection,
        inlineStyle,
      );
    } else {
      newContent = DraftModifier.applyInlineStyle(
        content,
        selection,
        inlineStyle,
      );
    }

    return EditorState.push(
      editorState,
      newContent,
      'change-inline-style'
    );
  },

  toggleLink: function(
    editorState: EditorState,
    targetSelection: SelectionState,
    entityKey: ?string
  ): EditorState {
    var withoutLink = DraftModifier.applyEntity(
      editorState.getCurrentContent(),
      targetSelection,
      entityKey
    );

    return EditorState.push(
      editorState,
      withoutLink,
      'apply-entity'
    );
  },

  /**
   * When a collapsed cursor is at the start of an empty styled block, allow
   * certain key commands (newline, backspace) to simply change the
   * style of the block instead of the default behavior.
   */
  tryToRemoveBlockStyle: function(editorState: EditorState): ?ContentState {
    var selection = editorState.getSelection();
    var offset = selection.getAnchorOffset();
    if (selection.isCollapsed() && offset === 0) {
      var key = selection.getAnchorKey();
      var content = editorState.getCurrentContent();
      var block = content.getBlockForKey(key);
      if (block.getLength() > 0) {
        return null;
      }

      var type = block.getType();
      if (type !== 'unstyled' && type !== 'code-block') {
        return DraftModifier.setBlockType(content, selection, 'unstyled');
      }
    }
    return null;
  },
};

module.exports = RichTextEditorUtil;
