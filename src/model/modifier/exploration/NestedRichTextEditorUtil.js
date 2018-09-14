/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 * @flow
 * @emails oncall+draft_js
 *
 * This is unstable and not part of the public API and should not be used by
 * production systems. This file may be update/removed without notice.
 */
import type ContentState from 'ContentState';
import type {DraftBlockType} from 'DraftBlockType';
import type {DraftEditorCommand} from 'DraftEditorCommand';
import type {DataObjectForLink, RichTextUtils} from 'RichTextUtils';
import type SelectionState from 'SelectionState';
import type URI from 'URI';

const ContentBlockNode = require('ContentBlockNode');
const DraftModifier = require('DraftModifier');
const DraftTreeOperations = require('DraftTreeOperations');
const EditorState = require('EditorState');
const RichTextEditorUtil = require('RichTextEditorUtil');

const adjustBlockDepthForContentState = require('adjustBlockDepthForContentState');
const generateRandomKey = require('generateRandomKey');
const invariant = require('invariant');

// Eventually we could allow to control this list by either allowing user configuration
// and/or a schema in conjunction to DraftBlockRenderMap
const NESTING_DISABLED_TYPES = ['code-block', 'atomic'];

const NestedRichTextEditorUtil: RichTextUtils = {
  handleKeyCommand: (
    editorState: EditorState,
    command: DraftEditorCommand | string,
  ): ?EditorState => {
    switch (command) {
      case 'bold':
        return NestedRichTextEditorUtil.toggleInlineStyle(editorState, 'BOLD');
      case 'italic':
        return NestedRichTextEditorUtil.toggleInlineStyle(
          editorState,
          'ITALIC',
        );
      case 'underline':
        return NestedRichTextEditorUtil.toggleInlineStyle(
          editorState,
          'UNDERLINE',
        );
      case 'code':
        return NestedRichTextEditorUtil.toggleCode(editorState);
      case 'backspace':
      case 'backspace-word':
      case 'backspace-to-start-of-line':
        return NestedRichTextEditorUtil.onBackspace(editorState);
      case 'delete':
      case 'delete-word':
      case 'delete-to-end-of-block':
        return NestedRichTextEditorUtil.onDelete(editorState);
      default:
        // they may have custom editor commands; ignore those
        return null;
    }
  },

  onDelete: (editorState: EditorState): ?EditorState => {
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

  /**
   * Ensures that if on the beginning of unstyled block and first child of
   * a nested parent we add its text to the neareast previous leaf node
   */
  onBackspace: (editorState: EditorState): ?EditorState => {
    const selection = editorState.getSelection();
    const content = editorState.getCurrentContent();
    const currentBlock = content.getBlockForKey(selection.getStartKey());
    const previousBlockKey = currentBlock.getPrevSiblingKey();

    if (
      !selection.isCollapsed() ||
      selection.getAnchorOffset() ||
      selection.getFocusOffset() ||
      (currentBlock.getType() === 'unstyled' &&
        (previousBlockKey &&
          content.getBlockForKey(previousBlockKey).getType() !== 'atomic'))
    ) {
      return null;
    }

    const startKey = selection.getStartKey();
    const blockBefore = content.getBlockBefore(startKey);

    // we want to delete that block completely
    if (blockBefore && blockBefore.getType() === 'atomic') {
      const withoutAtomicBlock = DraftModifier.removeRange(
        content,
        selection.merge({
          focusKey: blockBefore.getKey(),
          focusOffset: blockBefore.getText().length,
          anchorKey: startKey,
          anchorOffset: content.getBlockForKey(startKey).getText().length,
          isBackward: false,
        }),
        'forward',
      ).merge({
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

    // if we have a next sibbling we should not allow the normal backspace
    // behaviour of moving this text into its parent
    // if (currentBlock.getPrevSiblingKey()) {
    //  return editorState;
    // }

    // If that doesn't succeed, try to remove the current block style.
    const withoutBlockStyle = NestedRichTextEditorUtil.tryToRemoveBlockStyle(
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

  // Todo (T32099101)
  // onSplitNestedBlock() {},

  // Todo (T32099101)
  // onSplitParent() {},

  /**
   * Ensures that we can create nested blocks by changing the block type of
   * a ranged selection
   */
  toggleBlockType: (
    editorState: EditorState,
    blockType: DraftBlockType,
  ): EditorState => {
    const selection = editorState.getSelection();
    const content = editorState.getCurrentContent();
    const currentBlock = content.getBlockForKey(selection.getStartKey());
    const haveChildren = !currentBlock.getChildKeys().isEmpty();
    const isSelectionCollapsed = selection.isCollapsed();
    const isMultiBlockSelection =
      selection.getAnchorKey() !== selection.getFocusKey();
    const isUnsupportedNestingBlockType = NESTING_DISABLED_TYPES.includes(
      blockType,
    );
    const isCurrentBlockOfUnsupportedNestingBlockType = NESTING_DISABLED_TYPES.includes(
      currentBlock.getType(),
    );

    // we don't allow this operations to avoid corrupting the document data model
    // to make sure that non nested blockTypes wont inherit children
    if (
      (isMultiBlockSelection || haveChildren) &&
      isUnsupportedNestingBlockType
    ) {
      return editorState;
    }

    // we can treat this operations the same way as we would for flat data structures
    if (
      isCurrentBlockOfUnsupportedNestingBlockType ||
      isSelectionCollapsed ||
      isUnsupportedNestingBlockType ||
      isMultiBlockSelection ||
      currentBlock.getType() === blockType ||
      !currentBlock.getChildKeys().isEmpty()
    ) {
      return RichTextEditorUtil.toggleBlockType(editorState, blockType);
    }

    // TODO
    // if we have full range selection on the block:
    //   extract text and insert a block after it with the text as its content
    // else
    //   split the block into before range and after unstyled blocks
    //
    return editorState;
  },

  currentBlockContainsLink: (editorState: EditorState): boolean => {
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

  getCurrentBlockType: (editorState: EditorState): DraftBlockType => {
    const selection = editorState.getSelection();
    return editorState
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey())
      .getType();
  },

  getDataObjectForLinkURL: (uri: URI): DataObjectForLink => {
    return {url: uri.toString()};
  },

  insertSoftNewline: (editorState: EditorState): EditorState => {
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

  onTab: (
    event: SyntheticKeyboardEvent<>,
    editorState: EditorState,
    maxDepth: number,
  ): EditorState => {
    const selection = editorState.getSelection();
    const key = selection.getAnchorKey();
    if (key !== selection.getFocusKey()) {
      return editorState;
    }

    let content = editorState.getCurrentContent();
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

    // implement nested tree behaviour for onTab
    let blockMap = editorState.getCurrentContent().getBlockMap();
    const prevSiblingKey = block.getPrevSiblingKey();
    const nextSiblingKey = block.getNextSiblingKey();
    if (!event.shiftKey) {
      // if there is no previous sibling, we do nothing
      if (prevSiblingKey == null) {
        return editorState;
      }
      // if previous sibling is a non-leaf move node as child of previous sibling
      const prevSibling = blockMap.get(prevSiblingKey);
      const nextSibling =
        nextSiblingKey != null ? blockMap.get(nextSiblingKey) : null;
      if (
        prevSibling != null &&
        prevSibling.getText() === '' &&
        prevSibling.getChildKeys().count() > 0
      ) {
        blockMap = DraftTreeOperations.updateAsSiblingsChild(
          blockMap,
          key,
          'previous',
        );
        // else, if next sibling is a non-leaf move node as child of next sibling
      } else if (
        nextSibling != null &&
        nextSibling.getText() === '' &&
        nextSibling.getChildKeys().count() > 0
      ) {
        blockMap = DraftTreeOperations.updateAsSiblingsChild(
          blockMap,
          key,
          'next',
        );
        // if none of the siblings are non-leaf, we need to create a new parent
      } else {
        blockMap = DraftTreeOperations.createNewParent(blockMap, key);
      }
      // on un-tab
    } else {
      // if the block isn't nested, do nothing
      const parentKey = block.getParentKey();
      if (parentKey == null) {
        return editorState;
      }
      const parent = blockMap.get(parentKey);
      const existingChildren = parent.getChildKeys();
      const blockIndex = existingChildren.indexOf(key);
      if (blockIndex === 0 || blockIndex === existingChildren.count() - 1) {
        blockMap = DraftTreeOperations.moveChildUp(blockMap, key);
      } else {
        // split the block into [0, blockIndex] in parent & the rest in a new block
        const prevChildren = existingChildren.slice(0, blockIndex + 1);
        const nextChildren = existingChildren.slice(blockIndex + 1);
        blockMap = blockMap.set(
          parentKey,
          parent.merge({children: prevChildren}),
        );
        const newBlock = new ContentBlockNode({
          key: generateRandomKey(),
          text: '',
          depth: parent.getDepth(),
          type: parent.getType(),
          children: nextChildren,
          parent: parent.getParentKey(),
        });
        // add new block just before its the original next sibling in the block map
        // TODO(T33894878): Remove the map reordering code & fix converter after launch
        invariant(
          nextSiblingKey != null,
          'block must have a next sibling here',
        );
        const blocks = blockMap.toSeq();
        blockMap = blocks
          .takeUntil(block => block.getKey() === nextSiblingKey)
          .concat(
            [[newBlock.getKey(), newBlock]],
            blocks.skipUntil(block => block.getKey() === nextSiblingKey),
          )
          .toOrderedMap();

        // set the nextChildren's parent to the new block
        blockMap = blockMap.map(
          block =>
            nextChildren.includes(block.getKey())
              ? block.merge({parent: newBlock.getKey()})
              : block,
        );
        // update the next/previous pointers for the children at the split
        blockMap = blockMap
          .set(key, block.merge({nextSibling: null}))
          .set(
            nextSiblingKey,
            blockMap.get(nextSiblingKey).merge({prevSibling: null}),
          );
        const parentNextSiblingKey = parent.getNextSiblingKey();
        if (parentNextSiblingKey != null) {
          blockMap = DraftTreeOperations.updateSibling(
            blockMap,
            newBlock.getKey(),
            parentNextSiblingKey,
          );
        }
        blockMap = DraftTreeOperations.updateSibling(
          blockMap,
          parentKey,
          newBlock.getKey(),
        );
        blockMap = DraftTreeOperations.moveChildUp(blockMap, key);
      }
    }
    content = editorState.getCurrentContent().merge({
      blockMap: blockMap,
    });

    const withAdjustment = adjustBlockDepthForContentState(
      content,
      selection,
      event.shiftKey ? -1 : 1,
      maxDepth,
    );

    return EditorState.push(editorState, withAdjustment, 'adjust-depth');
  },

  toggleCode: (editorState: EditorState): EditorState => {
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
  toggleInlineStyle: (
    editorState: EditorState,
    inlineStyle: string,
  ): EditorState => {
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

  toggleLink: (
    editorState: EditorState,
    targetSelection: SelectionState,
    entityKey: ?string,
  ): EditorState => {
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
  tryToRemoveBlockStyle: (editorState: EditorState): ?ContentState => {
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

module.exports = NestedRichTextEditorUtil;
