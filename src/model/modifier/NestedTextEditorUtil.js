/**
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
const splitBlockInContentState = require('splitBlockInContentState');
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

const flatten = list => list.reduce(
  (a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []
);

const EMPTY_CHAR = '';
const EMPTY_CHAR_LIST = List(Repeat(CharacterMetadata.create(), EMPTY_CHAR.length));

const DefaultBlockRenderMap = new Immutable.Map(
  new Immutable.fromJS(
    DefaultDraftBlockRenderMap.toJS()
  ).mergeDeep(
    new Immutable.fromJS(
      {
        'blockquote': {
          nestingEnabled: true
        },
        'unordered-list-item':{
          nestingEnabled: true
        },
        'ordered-list-item': {
          nestingEnabled: true
        }
      }
    )
  ).toJS()
);

const NestedTextEditorUtil = {
  DefaultBlockRenderMap: DefaultBlockRenderMap,

  toggleBlockType: function(
    editorState: EditorState,
    blockType: DraftBlockType,
    blockRenderMap: DefaultDraftBlockRenderMap = NestedTextEditorUtil.DefaultBlockRenderMap
  ): EditorState {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
    const currentBlock = contentState.getBlockForKey(selectionState.getStartKey());
    const renderOpt = blockRenderMap.get(currentBlock.getType());
    const hasNestingEnabled = renderOpt && renderOpt.nestingEnabled;
    const blockMap = contentState.getBlockMap();

    // we want to move the current text to inside this block
    if (hasNestingEnabled && blockType !== currentBlock.getType()) {
      const targetKey = generateNestedKey(currentBlock.getKey());
      const newContentState = ContentState.createFromBlockArray(
        flatten(
          blockMap
          .filter(block => block !== null)
          .map((block, index) => {
            if (block === currentBlock) {
              return [
                new ContentBlock({
                  key: currentBlock.getKey(),
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
            return block;
          })
          .toArray()
        )
      );

      return EditorState.push(
        editorState,
        newContentState.merge({
          selectionBefore: selectionState,
          selectionAfter: selectionState.merge({
            anchorKey: targetKey,
            anchorOffset: selectionState.getAnchorOffset(),
            focusKey: targetKey,
            focusOffset: selectionState.getFocusOffset(),
            isBackward: false,
          })
        }),
        'change-block-type'
      );
    }

    // check if the current block has nesting prop enabled
    // create a new unstyled block and transfer the text to it
    // restore selection to this block

    return editorState;
  },

  handleKeyCommand: function(
    editorState: EditorState,
    command: DraftEditorCommand,
    blockRenderMap: DraftBlockRenderMap = DefaultBlockRenderMap
  ): ? EditorState {
    var selectionState = editorState.getSelection();
    var contentState = editorState.getCurrentContent();
    var key = selectionState.getAnchorKey();

    var currentBlock = contentState.getBlockForKey(key);
    var nestedBlocks = contentState.getBlockChildren(key);

    var parentKey = currentBlock.getParentKey();
    var parentBlock = parentKey ? contentState.getBlockForKey(parentKey) : null;
    var previousBlock = contentState.getBlockBefore(key);
    var nextBlock = contentState.getBlockAfter(key);
    var isCollapsed = selectionState.isCollapsed();

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
        (
          !hasNestingEnabled ||
          currentBlock.getLength() === 0
        ) &&
        (
          !nextBlock ||
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
    if (!hasNestingEnabled && command == 'split-nested-block') {
      command = 'split-block';
    }

    switch (command) {
      case 'backspace':
        if (
          isCollapsed &&
          selectionState.getEndOffset() === 0 &&
          previousBlock &&
          previousBlock.getKey() === currentBlock.getParentKey()
        ) {
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
            flatten(
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
              .toArray()
            )
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
        }
        break;
      case 'delete':
        // are pressing delete while being just befefore a block that has children
        // we want instead to move the block and all its children up to this block if it supports nesting
        // otherwise split the children right after in case it doesnt
        if (
          nextBlock &&
          isCollapsed &&
          selectionState.getEndOffset() === currentBlock.getLength() &&
          contentState.getBlockChildren(
            nextBlock.getKey()
          ).size
        ) {
          // find the first descendand from the nextElement
          const blockMap = contentState.getBlockMap();

          // the previous block is invalid so we need a new target
          const targetBlock = getFirstAvailableLeafAfterBlock(currentBlock, contentState);

          const newContentState = ContentState.createFromBlockArray(
            flatten(
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
              .toArray()
            )
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
        }
        break;
      case 'split-block':
        if (selectionState.isCollapsed()) {
          contentState = splitBlockInContentState(contentState, selectionState);
          return EditorState.push(editorState, contentState, 'split-block');
        }
        break;

      case 'split-nested-block':
        contentState = splitBlockWithNestingInContentState(contentState, selectionState);
        return EditorState.push(editorState, contentState, 'split-block');

      case 'split-parent-block':
        const blockMap = contentState.getBlockMap();
        const parentBlock = contentState.getBlockForKey(parentKey);

        const targetKey = (
          hasWrapper ?
            generateNestedKey(parentKey) :
            parentBlock.getParentKey() ?
              generateNestedKey(parentBlock.getParentKey()) :
              generateRandomKey()
        );

        const newContentState = ContentState.createFromBlockArray(
          flatten(
            blockMap
            .filter(block => block !== null)
            .map((block, index) => {
              if (block === currentBlock) {
                const splittedBlockType = (
                  !parentHasWrapper && (hasWrapper || !parentBlock.getParentKey()) ?
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
            .toArray()
          )
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

      default:
        return null;
    }
  },

  keyBinding: function(e: SyntheticKeyboardEvent) {
    if (e.keyCode === 13 /* `Enter` key */ && e.shiftKey) {
      return 'split-nested-block';
    }
  }
};

function getFirstAvailableLeafBeforeBlock(
  block: ContentBlock,
  contentState: ContentState,
  condition: Function = function() {}
): ContentBlock {
  let previousLeafBlock = contentState.getBlockBefore(block.getKey());

  while (
    !!previousLeafBlock &&
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

  while (
    !!nextLeafBlock &&
    contentState.getBlockChildren(nextLeafBlock.getKey()).size !== 0 &&
    contentState.getBlockAfter(nextLeafBlock.getKey()) &&
    !condition(nextLeafBlock)
  ) {
    nextLeafBlock = contentState.getBlockAfter(nextLeafBlock.getKey());
  }

  return nextLeafBlock || block;
}

module.exports = NestedTextEditorUtil;
