/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RichTextEditorUtil
 * @format
 * @flow
 */

'use strict';

import type ContentState from 'ContentState';
import type {DraftBlockType} from 'DraftBlockType';
import type {DraftEditorCommand} from 'DraftEditorCommand';
import type URI from 'URI';

const DraftModifier = require('DraftModifier');
const EditorState = require('EditorState');
const SelectionState = require('SelectionState');

const adjustBlockDepthForContentState = require('adjustBlockDepthForContentState');
const nullthrows = require('nullthrows');

const RichTextEditorUtil = {
  currentBlockContainsLink: function(editorState: EditorState): boolean {
    var selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const entityMap = contentState.getEntityMap();
    return contentState
      .getBlockForKey(selection.getAnchorKey())
      .getCharacterList()
      .slice(selection.getStartOffset(), selection.getEndOffset())
      .some(v => {
        var entity = v.getEntity();
        return !!entity && entityMap.__get(entity).getType() === 'LINK';
      });
  },

  getCurrentBlockType: function(editorState: EditorState): DraftBlockType {
    var selection = editorState.getSelection();
    return editorState
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey())
      .getType();
  },

  getDataObjectForLinkURL: function(uri: URI): Object {
    return {url: uri.toString()};
  },

  handleKeyCommand: function(
    editorState: EditorState,
    command: DraftEditorCommand | string,
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
    var contentState = DraftModifier.insertText(
      editorState.getCurrentContent(),
      editorState.getSelection(),
      '\n',
      editorState.getCurrentInlineStyle(),
      null,
    );

    var newEditorState = EditorState.push(
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
    var selection = editorState.getSelection();
    if (
      !selection.isCollapsed() ||
      selection.getAnchorOffset() ||
      selection.getFocusOffset()
    ) {
      return null;
    }

    // Try to use behaviour of text processors for backspace  
    // on empty list item block - remove it and replace to soft newline 
    // at preceding list item block. 
    var replacedToSoftLine = RichTextEditorUtil.tryToReplaceBlockToSoftLine( 
      editorState, 
    ); 
    if (replacedToSoftLine) { 
      let newState = EditorState.push( 
        editorState, 
        replacedToSoftLine, 
        'replace-block-to-softline', 
      ); 
      newState = EditorState.forceSelection( 
        newState, 
        replacedToSoftLine.getSelectionAfter(), 
      ); 
      return newState; 
    } 
 
    // Then, try to remove a preceding atomic block.
    var content = editorState.getCurrentContent();
    var startKey = selection.getStartKey();
    var blockBefore = content.getBlockBefore(startKey);

    if (blockBefore && blockBefore.getType() === 'atomic') {
      const blockMap = content.getBlockMap().delete(blockBefore.getKey());
      var withoutAtomicBlock = content.merge({
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
    var withoutBlockStyle = RichTextEditorUtil.tryToRemoveBlockStyle(
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
      maxDepth,
    );

    return EditorState.push(editorState, withAdjustment, 'adjust-depth');
  },

  toggleBlockType: function(
    editorState: EditorState,
    blockType: DraftBlockType,
  ): EditorState {
    var selection = editorState.getSelection();
    var startKey = selection.getStartKey();
    var endKey = selection.getEndKey();
    var content = editorState.getCurrentContent();
    var target = selection;

    // Triple-click can lead to a selection that includes offset 0 of the
    // following block. The `SelectionState` for this case is accurate, but
    // we should avoid toggling block type for the trailing block because it
    // is a confusing interaction.
    if (startKey !== endKey && selection.getEndOffset() === 0) {
      var blockBefore = nullthrows(content.getBlockBefore(endKey));
      endKey = blockBefore.getKey();
      target = target.merge({
        anchorKey: startKey,
        anchorOffset: selection.getStartOffset(),
        focusKey: endKey,
        focusOffset: blockBefore.getLength(),
        isBackward: false,
      });
    }

    var hasAtomicBlock = content
      .getBlockMap()
      .skipWhile((_, k) => k !== startKey)
      .reverse()
      .skipWhile((_, k) => k !== endKey)
      .some(v => v.getType() === 'atomic');

    if (hasAtomicBlock) {
      return editorState;
    }

    var typeToSet =
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
    inlineStyle: string,
  ): EditorState {
    var selection = editorState.getSelection();
    var currentStyle = editorState.getCurrentInlineStyle();

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

    return EditorState.push(editorState, newContent, 'change-inline-style');
  },

  toggleLink: function(
    editorState: EditorState,
    targetSelection: SelectionState,
    entityKey: ?string,
  ): EditorState {
    var withoutLink = DraftModifier.applyEntity(
      editorState.getCurrentContent(),
      targetSelection,
      entityKey,
    );

    return EditorState.push(editorState, withoutLink, 'apply-entity');
  },

  /** 
   * When a collapsed cursor is at the start of non-first empty list  
   * item then remove current block and insert soft newline at  
   * preceding list item block. 
   * Returns null if block or selection does not meet that criteria. 
   */ 
  tryToReplaceBlockToSoftLine: function(editorState: EditorState): ?ContentState { 
    var selection = editorState.getSelection(); 
    var offset = selection.getAnchorOffset(); 
    if (selection.isCollapsed() && offset === 0) { 
      var key = selection.getAnchorKey(); 
      var content = editorState.getCurrentContent(); 
      var block = content.getBlockForKey(key); 
      var type = block.getType(); 
      var depth = block.getDepth(); 
      var blockBefore = content.getBlockBefore(key); 
 
      if ((type == 'ordered-list-item' || type == 'unordered-list-item')   
        && blockBefore 
        && blockBefore.getType() === type 
      ) { 
        const blockMap = content.getBlockMap().delete(block.getKey()); 
        let selectionAtEndOfBlockBefore = SelectionState.createEmpty(blockBefore.getKey()).merge({ 
          anchorKey: blockBefore.getKey(), 
          anchorOffset: blockBefore.getLength(), 
          focusKey: blockBefore.getKey(), 
          focusOffset: blockBefore.getLength(), 
        }); 
        var withoutBlock = content.merge({ 
          blockMap, 
          selectionAfter: selectionAtEndOfBlockBefore, 
        }); 
 
        var newContentState = DraftModifier.insertText( 
          withoutBlock, 
          selectionAtEndOfBlockBefore, 
          '\n', 
          editorState.getCurrentInlineStyle(), 
          null, 
        ); 
 
        return newContentState; 
      } 
    } 
    return null; 
  },

  /**
   * When a collapsed cursor is at the start of the first styled block, or
   * an empty styled block, changes block to 'unstyled'. Returns null if
   * block or selection does not meet that criteria.
   */
  tryToRemoveBlockStyle: function(editorState: EditorState): ?ContentState {
    var selection = editorState.getSelection();
    var offset = selection.getAnchorOffset();
    if (selection.isCollapsed() && offset === 0) {
      var key = selection.getAnchorKey();
      var content = editorState.getCurrentContent();
      var block = content.getBlockForKey(key);

      var firstBlock = content.getFirstBlock();
      if (block.getLength() > 0 && block !== firstBlock) {
        return null;
      }

      var type = block.getType();
      var blockBefore = content.getBlockBefore(key);
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
