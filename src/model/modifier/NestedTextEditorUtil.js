/*
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule NestedTextEditorUtil
 * @typechecks
 * @flow
 */
const CharacterMetadata = require('CharacterMetadata');
const ContentBlock = require('ContentBlock');
const ContentState = require('ContentState');
const DefaultDraftBlockRenderMap = require('DefaultDraftBlockRenderMap');
const EditorState = require('EditorState');
const Immutable = require('immutable');
const generateNestedKey = require('generateNestedKey');
const generateRandomKey = require('generateRandomKey');
const splitBlockWithNestingInContentState = require('splitBlockWithNestingInContentState');

import type {
  DraftBlockType
} from 'DraftBlockType';
import type {
  DraftEditorCommand
} from 'DraftEditorCommand';
import type {
  DraftBlockRenderMap
} from 'DraftBlockRenderMap';

const {
  List,
  Repeat,
} = Immutable;

const EMPTY_CHAR = '';
const EMPTY_CHAR_LIST = List(Repeat(CharacterMetadata.create(), EMPTY_CHAR.length));

const DefaultBlockRenderMap = new Immutable.Map(
  new Immutable.fromJS(
    DefaultDraftBlockRenderMap.toJS()
  ).mergeDeep(
    new Immutable.fromJS({
      'blockquote': {
        nestingEnabled: true
      },
      'unordered-list-item': {
        nestingEnabled: true
      },
      'ordered-list-item': {
        nestingEnabled: true
      }
    })
  ).toJS()
);

const NestedTextEditorUtil = {
  DefaultBlockRenderMap: DefaultBlockRenderMap,

  toggleBlockType: function(
    editorState: EditorState,
    blockType: DraftBlockType,
    blockRenderMap: DefaultDraftBlockRenderMap = NestedTextEditorUtil.DefaultBlockRenderMap
  ): Object {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
    const currentBlock = contentState.getBlockForKey(selectionState.getStartKey());
    const key = currentBlock.getKey();
    const renderOpt = blockRenderMap.get(currentBlock.getType());
    const hasNestingEnabled = renderOpt && renderOpt.nestingEnabled;
    const targetTypeRenderOpt = blockRenderMap.get(blockType);
    const parentKey = currentBlock.getParentKey();
    const parentBlock = contentState.getBlockForKey(parentKey);
    const parentRenderOpt = parentBlock && blockRenderMap.get(parentBlock.getType());
    const isCousinType = (
      renderOpt &&
      targetTypeRenderOpt &&
      renderOpt.element === targetTypeRenderOpt.element
    );
    const isParentCousinType = (
      parentRenderOpt &&
      targetTypeRenderOpt &&
      parentRenderOpt.element === targetTypeRenderOpt.element
    );

    const canHandleCommand = (
      (
        hasNestingEnabled ||
        targetTypeRenderOpt.nestingEnabled
      ) &&
      blockType !== currentBlock.getType()
    );

    if (!canHandleCommand) {
      return {
        editorState,
        blockType
      };
    }

    const blockMap = contentState.getBlockMap();

    if (isParentCousinType) {
      const toggleCousinBlockContentState = ContentState.createFromBlockArray(
        blockMap
        .map((block, index) => {
          if (block === parentBlock) {
            return new ContentBlock({
              key: block.getKey(),
              type: blockType,
              depth: block.getDepth(),
              text: block.getText(),
              characterList: block.getCharacterList()
            });
          }
          if (block === currentBlock) {
            return new ContentBlock({
              key: block.getKey(),
              // since we use the toggleUtils together with RichUtils we
              // need to update this type to something else so that it does not get
              // toggled and instead just get restored
              // this is a temporary hack while nesting tree is not a first customer
              type: 'unstyled',
              depth: block.getDepth(),
              text: block.getText(),
              characterList: block.getCharacterList()
            });
          }
          return block;
        })
        .toArray()
      );

      return {
        editorState: EditorState.push(
          editorState,
          toggleCousinBlockContentState.merge({
            selectionBefore: selectionState,
            selectionAfter: selectionState.merge({
              anchorKey: key,
              anchorOffset: selectionState.getAnchorOffset(),
              focusKey: key,
              focusOffset: selectionState.getFocusOffset(),
              isBackward: false,
            })
          }),
          'change-block-type'
        ),
        blockType: currentBlock.getType() // we then send the original type to be restored
      };
    }

    // we want to move the current text to inside this block
    const targetKey = generateNestedKey(key);

    const newContentState = ContentState.createFromBlockArray(
      blockMap
      .map((block, index) => {
        if (block === currentBlock) {
          if (isCousinType) {
            return new ContentBlock({
              key: key,
              type: 'unstyled',
              depth: currentBlock.getDepth(),
              text: currentBlock.getText(),
              characterList: currentBlock.getCharacterList()
            });
          } else {
            return [
              new ContentBlock({
                key: key,
                type: currentBlock.getType(),
                depth: currentBlock.getDepth(),
                text: EMPTY_CHAR,
                characterList: EMPTY_CHAR_LIST
              }),
              new ContentBlock({
                key: targetKey,
                type: 'unstyled',
                depth: 0,
                text: currentBlock.getText(),
                characterList: currentBlock.getCharacterList()
              })
            ];
          }
        }
        return block;
      })
      .reduce((a, b) => a.concat(b), [])
    );

    return {
      editorState: EditorState.push(
        editorState,
        newContentState.merge({
          selectionBefore: selectionState,
          selectionAfter: selectionState.merge({
            anchorKey: isCousinType ? key : targetKey,
            anchorOffset: selectionState.getAnchorOffset(),
            focusKey: isCousinType ? key : targetKey,
            focusOffset: selectionState.getFocusOffset(),
            isBackward: false,
          })
        }),
        'change-block-type'
      ),
      blockType
    };
  },

  handleKeyCommand: function(
    editorState: EditorState,
    command: DraftEditorCommand,
    blockRenderMap: DraftBlockRenderMap = DefaultBlockRenderMap
  ): ? EditorState {
    const selectionState = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const key = selectionState.getAnchorKey();

    const currentBlock = contentState.getBlockForKey(key);
    const nestedBlocks = contentState.getBlockChildren(key);

    const parentKey = currentBlock.getParentKey();
    const parentBlock = contentState.getBlockForKey(parentKey);
    const nextBlock = contentState.getBlockAfter(key);

    // Option of rendering for the current block
    const renderOpt = blockRenderMap.get(currentBlock.getType());
    const parentRenderOpt = parentBlock && blockRenderMap.get(parentBlock.getType());

    const hasNestingEnabled = renderOpt && renderOpt.nestingEnabled;
    const hasWrapper = renderOpt && renderOpt.wrapper;

    const parentHasWrapper = parentRenderOpt && parentRenderOpt.wrapper;

    // Press enter
    if (command === 'split-block') {
      if (
        currentBlock.hasParent() &&
        (!hasNestingEnabled ||
          currentBlock.getLength() === 0
        ) &&
        (!nextBlock ||
          (
            hasWrapper &&
            nextBlock.getType() !== currentBlock.getType()
          ) ||
          (
            nextBlock.getParentKey() !== currentBlock.getParentKey() &&
            (currentBlock.getLength() === 0 || parentHasWrapper)
          )
        )
      ) {
        command = 'split-parent-block';
      }

      // In a block that already have some nested blocks
      if (command === 'split-block' && nestedBlocks.size > 0) {
        command = 'split-nested-block';
      }
    }

    // Prevent creation of nested blocks
    if (!hasNestingEnabled && command === 'split-nested-block') {
      command = 'split-block';
    }

    switch (command) {
      case 'backspace':
        return NestedTextEditorUtil.onBackspace(editorState, blockRenderMap);
      case 'delete':
        return NestedTextEditorUtil.onDelete(editorState, blockRenderMap);
      case 'split-nested-block':
        return NestedTextEditorUtil.onSplitNestedBlock(editorState, blockRenderMap);
      case 'split-parent-block':
        return NestedTextEditorUtil.onSplitParent(editorState, blockRenderMap);
      default:
        return null;
    }
  },

  keyBinding: function(e: SyntheticKeyboardEvent) {
    if (e.keyCode === 13 /* `Enter` key */ && e.shiftKey) {
      return 'split-nested-block';
    }
  },

  onBackspace: function(
    editorState: EditorState,
    blockRenderMap: DraftBlockRenderMap = DefaultBlockRenderMap
  ): ? EditorState {
    const selectionState = editorState.getSelection();
    const isCollapsed = selectionState.isCollapsed();
    const contentState = editorState.getCurrentContent();
    const key = selectionState.getAnchorKey();

    const currentBlock = contentState.getBlockForKey(key);
    const previousBlock = contentState.getBlockBefore(key);

    const canHandleCommand = (
      isCollapsed &&
      selectionState.getEndOffset() === 0 &&
      previousBlock &&
      previousBlock.getKey() === currentBlock.getParentKey()
    );

    if (!canHandleCommand) {
      return null;
    }

    const targetBlock = getFirstAvailableLeafBeforeBlock(
      currentBlock,
      contentState
    );

    if (targetBlock === currentBlock) {
      return null;
    }

    const blockMap = contentState.getBlockMap();

    const targetKey = targetBlock.getKey();

    const newContentState = ContentState.createFromBlockArray(
      blockMap
      .filter(block => block !== null)
      .map((block, index) => {
        if (!targetBlock && previousBlock === block) {
          return [
            new ContentBlock({
              key: targetKey,
              type: currentBlock.getType(),
              depth: currentBlock.getDepth(),
              text: currentBlock.getText(),
              characterList: currentBlock.getCharacterList()
            }),
            block
          ];
        } else if (targetBlock && block === targetBlock) {
          return new ContentBlock({
            key: targetKey,
            type: targetBlock.getType(),
            depth: targetBlock.getDepth(),
            text: targetBlock.getText() + currentBlock.getText(),
            characterList: targetBlock.getCharacterList().concat(currentBlock.getCharacterList())
          });
        }
        return block;
      })
      .filter(block => block !== currentBlock)
      .reduce((a, b) => a.concat(b), [])
    );

    const selectionOffset = newContentState.getBlockForKey(targetKey).getLength();

    return EditorState.push(
      editorState,
      newContentState.merge({
        selectionBefore: selectionState,
        selectionAfter: selectionState.merge({
          anchorKey: targetKey,
          anchorOffset: selectionOffset,
          focusKey: targetKey,
          focusOffset: selectionOffset,
          isBackward: false,
        })
      }),
      'backspace-character'
    );
  },

  onDelete: function(
    editorState: EditorState,
    blockRenderMap: DraftBlockRenderMap = DefaultBlockRenderMap
  ): ? EditorState {
    const selectionState = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const key = selectionState.getAnchorKey();

    const currentBlock = contentState.getBlockForKey(key);

    const nextBlock = contentState.getBlockAfter(key);
    const isCollapsed = selectionState.isCollapsed();

    const canHandleCommand = (
      nextBlock &&
      isCollapsed &&
      selectionState.getEndOffset() === currentBlock.getLength() &&
      contentState.getBlockChildren(
        nextBlock.getKey()
      ).size
    );

    if (!canHandleCommand) {
      return null;
    }

    // are pressing delete while being just befefore a block that has children
    // we want instead to move the block and all its children up to this block if it supports nesting
    // otherwise split the children right after in case it doesnt
    // find the first descendand from the nextElement
    const blockMap = contentState.getBlockMap();

    // the previous block is invalid so we need a new target
    const targetBlock = getFirstAvailableLeafAfterBlock(currentBlock, contentState);

    const newContentState = ContentState.createFromBlockArray(
      blockMap
      .filter(block => block !== null)
      .map((block, index) => {
        if (block === currentBlock) {
          return new ContentBlock({
            key: key,
            type: currentBlock.getType(),
            depth: currentBlock.getDepth(),
            text: currentBlock.getText() + targetBlock.getText(),
            characterList: currentBlock.getCharacterList().concat(targetBlock.getCharacterList())
          });
        }
        return block;
      })
      .filter(block => block !== targetBlock)
      .reduce((a, b) => a.concat(b), [])
    );

    const selectionOffset = currentBlock.getLength();

    return EditorState.push(
      editorState,
      newContentState.merge({
        selectionBefore: selectionState,
        selectionAfter: selectionState.merge({
          anchorKey: key,
          anchorOffset: selectionOffset,
          focusKey: key,
          focusOffset: selectionOffset,
          isBackward: false,
        })
      }),
      'delete-character'
    );

  },

  onSplitNestedBlock: function(
    editorState: EditorState,
    blockRenderMap: DraftBlockRenderMap = DefaultBlockRenderMap
  ): ? EditorState {
    const selectionState = editorState.getSelection();
    const contentState = editorState.getCurrentContent();

    return EditorState.push(
      editorState,
      splitBlockWithNestingInContentState(contentState, selectionState),
      'split-block'
    );
  },

  onSplitParent: function(
    editorState: EditorState,
    blockRenderMap: DraftBlockRenderMap = DefaultBlockRenderMap
  ): ? EditorState {
    const selectionState = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const key = selectionState.getAnchorKey();

    const currentBlock = contentState.getBlockForKey(key);

    const parentKey = currentBlock.getParentKey();
    const parentBlock = contentState.getBlockForKey(parentKey);

    // Option of rendering for the current block
    const renderOpt = blockRenderMap.get(currentBlock.getType());
    const parentRenderOpt = parentBlock && blockRenderMap.get(parentBlock.getType());

    const hasWrapper = renderOpt && renderOpt.wrapper;

    const parentHasWrapper = parentRenderOpt && parentRenderOpt.wrapper;

    const blockMap = contentState.getBlockMap();

    const targetKey = (
      hasWrapper ?
      generateNestedKey(parentKey) :
      parentBlock && parentBlock.getParentKey() ?
      generateNestedKey(parentBlock.getParentKey()) :
      generateRandomKey()
    );

    const newContentState = ContentState.createFromBlockArray(
      blockMap
      .filter(block => block !== null)
      .map((block, index) => {
        if (block === currentBlock) {
          const splittedBlockType = (!parentHasWrapper && (hasWrapper || !parentBlock.getParentKey()) ?
            'unstyled' :
            parentBlock.getType()
          );
          const splittedBlock = new ContentBlock({
            key: targetKey,
            type: splittedBlockType,
            depth: parentBlock ? parentBlock.getDepth() : 0,
            text: currentBlock.getText().slice(selectionState.getEndOffset()),
            characterList: currentBlock.getCharacterList().slice(selectionState.getEndOffset())
          });

          // if we are on an empty block when we split we should remove it
          // therefore we only return the splitted block
          if (
            currentBlock.getLength() === 0 &&
            contentState.getBlockChildren(key).size === 0
          ) {
            return splittedBlock;
          }

          return [
            new ContentBlock({
              key: block.getKey(),
              type: block.getType(),
              depth: block.getDepth(),
              text: currentBlock.getText().slice(0, selectionState.getStartOffset()),
              characterList: currentBlock.getCharacterList().slice(0, selectionState.getStartOffset())
            }),
            splittedBlock
          ];
        }
        return block;
      })
      .filter(block => block !== null)
      .reduce((a, b) => a.concat(b), [])
    );

    return EditorState.push(
      editorState,
      newContentState.merge({
        selectionBefore: selectionState,
        selectionAfter: selectionState.merge({
          anchorKey: targetKey,
          anchorOffset: 0,
          focusKey: targetKey,
          focusOffset: 0,
          isBackward: false,
        })
      }),
      'split-block'
    );

  }
};

function getFirstAvailableLeafBeforeBlock(
  block: ContentBlock,
  contentState: ContentState,
  condition: Function = function() {}
): ContentBlock {
  let previousLeafBlock = contentState.getBlockBefore(block.getKey());

  while (!!previousLeafBlock &&
    contentState.getBlockChildren(previousLeafBlock.getKey()).size !== 0 &&
    !condition(previousLeafBlock)
  ) {
    previousLeafBlock = contentState.getBlockBefore(previousLeafBlock.getKey());
  }

  return previousLeafBlock || block;
}

function getFirstAvailableLeafAfterBlock(
  block: ContentBlock,
  contentState: ContentState,
  condition: Function = function() {}
): ContentBlock {
  let nextLeafBlock = contentState.getBlockAfter(block.getKey());

  while (!!nextLeafBlock &&
    contentState.getBlockChildren(nextLeafBlock.getKey()).size !== 0 &&
    contentState.getBlockAfter(nextLeafBlock.getKey()) &&
    !condition(nextLeafBlock)
  ) {
    nextLeafBlock = contentState.getBlockAfter(nextLeafBlock.getKey());
  }

  return nextLeafBlock || block;
}

module.exports = NestedTextEditorUtil;
