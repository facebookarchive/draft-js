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

const DraftEntity = require('DraftEntity');
const DraftModifier = require('DraftModifier');
const EditorState = require('EditorState');

const adjustBlockDepthForContentState = require('adjustBlockDepthForContentState');

import type ContentState from 'ContentState';
import type {DraftBlockType} from 'DraftBlockType';
import type {DraftEditorCommand} from 'DraftEditorCommand';
import type SelectionState from 'SelectionState';
import type URI from 'URI';

const RichTextEditorUtil = {
  currentBlockContainsLink: function(
    editorState: EditorState
  ): boolean {
    const selection = editorState.getSelection();
    return editorState.getCurrentContent()
      .getBlockForKey(selection.getAnchorKey())
      .getCharacterList()
      .slice(selection.getStartOffset(), selection.getEndOffset())
      .some(v => {
        const entity = v.getEntity();
        return !!entity && DraftEntity.get(entity).getType() === 'LINK';
      });
  },

  getCurrentBlockType: function(editorState: EditorState): DraftBlockType {
    const selection = editorState.getSelection();
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
    const contentState = DraftModifier.insertText(
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
    const selection = editorState.getSelection();
    if (
      !selection.isCollapsed() ||
      selection.getAnchorOffset() ||
      selection.getFocusOffset()
    ) {
      return null;
    }

    // First, try to remove a preceding media block.
    const content = editorState.getCurrentContent();
    const startKey = selection.getStartKey();
    const blockAfter = content.getBlockAfter(startKey);

    // If the current block is empty, just delete it.
    if (blockAfter && content.getBlockForKey(startKey).getLength() === 0) {
      return null;
    }

    const blockBefore = content.getBlockBefore(startKey);

    if (blockBefore && blockBefore.getType() === 'media') {
      const mediaBlockTarget = selection.merge({
        anchorKey: blockBefore.getKey(),
        anchorOffset: 0,
      });
      const asCurrentStyle = DraftModifier.setBlockType(
        content,
        mediaBlockTarget,
        content.getBlockForKey(startKey).getType()
      );
      const withoutMedia = DraftModifier.removeRange(
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
    const withoutBlockStyle = RichTextEditorUtil.tryToRemoveBlockStyle(
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
    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      return null;
    }

    const content = editorState.getCurrentContent();
    const startKey = selection.getStartKey();
    const block = content.getBlockForKey(startKey);
    const length = block.getLength();

    // The cursor is somewhere within the text. Behave normally.
    if (selection.getStartOffset() < length) {
      return null;
    }

    const blockAfter = content.getBlockAfter(startKey);

    if (!blockAfter || blockAfter.getType() !== 'media') {
      return null;
    }

    // If the current block is empty, delete it.
    if (length === 0) {
      const target = selection.merge({
        focusKey: blockAfter.getKey(),
        focusOffset: 0,
      });

      const withoutEmptyBlock = DraftModifier.removeRange(
        content,
        target,
        'forward'
      );

      const preserveMedia = DraftModifier.setBlockType(
        withoutEmptyBlock,
        withoutEmptyBlock.getSelectionAfter(),
        'media'
      );

      return EditorState.push(editorState, preserveMedia, 'remove-range');
    }

    // Otherwise, delete the media block.
    const mediaBlockTarget = selection.merge({
      focusKey: blockAfter.getKey(),
      focusOffset: blockAfter.getLength(),
    });

    const withoutMedia = DraftModifier.removeRange(
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
    const selection = editorState.getSelection();
    const key = selection.getAnchorKey();
    if (key !== selection.getFocusKey()) {
      return editorState;
    }

    const content = editorState.getCurrentContent();
    const block = content.getBlockForKey(key);
    const type = block.getType();
    if (type !== 'unordered-list-item' && type !== 'ordered-list-item') {
      return editorState;
    }

    event.preventDefault();

    // Only allow indenting one level beyond the block above, and only if
    // the block above is a list item as well.
    const blockAbove = content.getBlockBefore(key);
    if (!blockAbove) {
      return editorState;
    }

    const typeAbove = blockAbove.getType();
    if (
      typeAbove !== 'unordered-list-item' &&
      typeAbove !== 'ordered-list-item'
    ) {
      return editorState;
    }

    const depth = block.getDepth();
    if (!event.shiftKey && depth === maxDepth) {
      return editorState;
    }

    maxDepth = Math.min(blockAbove.getDepth() + 1, maxDepth);

    const withAdjustment = adjustBlockDepthForContentState(
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
    const selection = editorState.getSelection();
    const startKey = selection.getStartKey();
    const endKey = selection.getEndKey();
    const content = editorState.getCurrentContent();

    const hasMedia = content.getBlockMap()
      .skipWhile((_, k) => k !== startKey)
      .takeWhile((_, k) => k !== endKey)
      .some(v => v.getType() === 'media');

    if (hasMedia) {
      return editorState;
    }

    const typeToSet = content.getBlockForKey(startKey).getType() === blockType ?
      'unstyled' :
      blockType;

    return EditorState.push(
      editorState,
      DraftModifier.setBlockType(content, selection, typeToSet),
      'change-block-type'
    );
  },

  toggleCode: function(editorState: EditorState): EditorState {
    const selection = editorState.getSelection();
    const anchorKey = selection.getAnchorKey();
    const focusKey = selection.getFocusKey();

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
    const selection = editorState.getSelection();
    const currentStyle = editorState.getCurrentInlineStyle();

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
    const content = editorState.getCurrentContent();
    let newContent;

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
    const withoutLink = DraftModifier.applyEntity(
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
    const selection = editorState.getSelection();
    const offset = selection.getAnchorOffset();
    if (selection.isCollapsed() && offset === 0) {
      const key = selection.getAnchorKey();
      const content = editorState.getCurrentContent();
      const block = content.getBlockForKey(key);
      if (block.getLength() > 0) {
        return null;
      }

      const type = block.getType();
      if (type !== 'unstyled' && type !== 'code-block') {
        return DraftModifier.setBlockType(content, selection, 'unstyled');
      }
    }
    return null;
  },
};

module.exports = RichTextEditorUtil;
