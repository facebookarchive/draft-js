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

import type ContentState from 'ContentState';
import type {DraftBlockType} from 'DraftBlockType';
import type {DraftEditorCommand} from 'DraftEditorCommand';
import type {DataObjectForLink, RichTextUtils} from 'RichTextUtils';
import type SelectionState from 'SelectionState';
import type URI from 'URI';

const DraftModifier = require('DraftModifier');
const EditorState = require('EditorState');

const adjustBlockDepthForContentState = require('adjustBlockDepthForContentState');
const nullthrows = require('nullthrows');

const RichTextEditorUtil: RichTextUtils = {
  currentBlockContainsLink: function(editorState: EditorState): boolean {
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const entityMap = contentState.getEntityMap();
    return contentState
      .getBlockForKey(selection.getAnchorKey())
      .getCharacterList()
      .slice(selection.getStartOffset(), selection.getEndOffset())
      .some(v => {
        const entity = v.getEntity();
        return !!entity && entityMap.__get(entity).getType() === 'LINK';
      });
  },

  getCurrentBlockType: function(editorState: EditorState): DraftBlockType {
    const selection = editorState.getSelection();
    return editorState
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey())
      .getType();
  },

  getDataObjectForLinkURL: function(uri: URI): DataObjectForLink {
    return {url: uri.toString()};
  },

  handleKeyCommand: function(
    editorState: EditorState,
    command: DraftEditorCommand | string,
    eventTimeStamp: ?number,
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
        // they may have custom editor commands; ignore those
        return null;
    }
  },

  insertSoftNewline: function(editorState: EditorState): EditorState {
    const contentState = DraftModifier.insertText(
      editorState.getCurrentContent(),
      editorState.getSelection(),
      '\n',
      editorState.getCurrentInlineStyle(),
      null,
    );

    const newEditorState = EditorState.push(
      editorState,
      contentState,
      'insert-characters',
    );

    return EditorState.forceSelection(
      newEditorState,
      contentState.getSelectionAfter(),
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

    // First, try to remove a preceding atomic block.
    const content = editorState.getCurrentContent();
    const startKey = selection.getStartKey();
    const blockBefore = content.getBlockBefore(startKey);

    if (blockBefore && blockBefore.getType() === 'atomic') {
      const blockMap = content.getBlockMap().delete(blockBefore.getKey());
      const withoutAtomicBlock = content.merge({
        blockMap,
        selectionAfter: selection,
      });
      if (withoutAtomicBlock !== content) {
        return EditorState.push(
          editorState,
          withoutAtomicBlock,
          'remove-range',
        );
      }
    }

    // If that doesn't succeed, try to remove the current block style.
    const withoutBlockStyle = RichTextEditorUtil.tryToRemoveBlockStyle(
      editorState,
    );

    if (withoutBlockStyle) {
      return EditorState.push(
        editorState,
        withoutBlockStyle,
        'change-block-type',
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

    if (!blockAfter || blockAfter.getType() !== 'atomic') {
      return null;
    }

    const atomicBlockTarget = selection.merge({
      focusKey: blockAfter.getKey(),
      focusOffset: blockAfter.getLength(),
    });

    const withoutAtomicBlock = DraftModifier.removeRange(
      content,
      atomicBlockTarget,
      'forward',
    );

    if (withoutAtomicBlock !== content) {
      return EditorState.push(editorState, withoutAtomicBlock, 'remove-range');
    }

    return null;
  },

  onTab: function(
    event: SyntheticKeyboardEvent<>,
    editorState: EditorState,
    maxDepth: number,
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

    const depth = block.getDepth();
    if (!event.shiftKey && depth === maxDepth) {
      return editorState;
    }

    const withAdjustment = adjustBlockDepthForContentState(
      content,
      selection,
      event.shiftKey ? -1 : 1,
      maxDepth,
    );

    return EditorState.push(editorState, withAdjustment, 'adjust-depth');
  },

  toggleBlockType: function(
    editorState: EditorState,
    blockType: DraftBlockType,
  ): EditorState {
    const selection = editorState.getSelection();
    const startKey = selection.getStartKey();
    let endKey = selection.getEndKey();
    const content = editorState.getCurrentContent();
    let target = selection;

    // Triple-click can lead to a selection that includes offset 0 of the
    // following block. The `SelectionState` for this case is accurate, but
    // we should avoid toggling block type for the trailing block because it
    // is a confusing interaction.
    if (startKey !== endKey && selection.getEndOffset() === 0) {
      const blockBefore = nullthrows(content.getBlockBefore(endKey));
      endKey = blockBefore.getKey();
      target = target.merge({
        anchorKey: startKey,
        anchorOffset: selection.getStartOffset(),
        focusKey: endKey,
        focusOffset: blockBefore.getLength(),
        isBackward: false,
      });
    }

    const hasAtomicBlock = content
      .getBlockMap()
      .skipWhile((_, k) => k !== startKey)
      .reverse()
      .skipWhile((_, k) => k !== endKey)
      .some(v => v.getType() === 'atomic');

    if (hasAtomicBlock) {
      return editorState;
    }

    const typeToSet =
      content.getBlockForKey(startKey).getType() === blockType
        ? 'unstyled'
        : blockType;

    return EditorState.push(
      editorState,
      DraftModifier.setBlockType(content, target, typeToSet),
      'change-block-type',
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
    inlineStyle: string,
  ): EditorState {
    const selection = editorState.getSelection();
    const currentStyle = editorState.getCurrentInlineStyle();

    // If the selection is collapsed, toggle the specified style on or off and
    // set the result as the new inline style override. This will then be
    // used as the inline style for the next character to be inserted.
    if (selection.isCollapsed()) {
      return EditorState.setInlineStyleOverride(
        editorState,
        currentStyle.has(inlineStyle)
          ? currentStyle.remove(inlineStyle)
          : currentStyle.add(inlineStyle),
      );
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

    return EditorState.push(editorState, newContent, 'change-inline-style');
  },

  toggleLink: function(
    editorState: EditorState,
    targetSelection: SelectionState,
    entityKey: ?string,
  ): EditorState {
    const withoutLink = DraftModifier.applyEntity(
      editorState.getCurrentContent(),
      targetSelection,
      entityKey,
    );

    return EditorState.push(editorState, withoutLink, 'apply-entity');
  },

  /**
   * When a collapsed cursor is at the start of a styled block, changes block
   * type to 'unstyled'. Returns null if selection does not meet that criteria.
   */
  tryToRemoveBlockStyle: function(editorState: EditorState): ?ContentState {
    const selection = editorState.getSelection();
    const offset = selection.getAnchorOffset();
    if (selection.isCollapsed() && offset === 0) {
      const key = selection.getAnchorKey();
      const content = editorState.getCurrentContent();
      const block = content.getBlockForKey(key);

      const type = block.getType();
      const blockBefore = content.getBlockBefore(key);
      if (
        type === 'code-block' &&
        blockBefore &&
        blockBefore.getType() === 'code-block' &&
        blockBefore.getLength() !== 0
      ) {
        return null;
      }

      if (type !== 'unstyled') {
        return DraftModifier.setBlockType(content, selection, 'unstyled');
      }
    }
    return null;
  },
};

module.exports = RichTextEditorUtil;
