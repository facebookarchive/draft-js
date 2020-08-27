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
import type ContentState from 'ContentState';
import type {DraftBlockType} from 'DraftBlockType';
import type {DraftInlineStyle} from 'DraftInlineStyle';
import type {DraftRemovalDirection} from 'DraftRemovalDirection';
import type SelectionState from 'SelectionState';
import type {Map} from 'immutable';
import type {BlockDataMergeBehavior} from 'insertFragmentIntoContentState';

import CharacterMetadata from 'CharacterMetadata';
import * as ContentStateInlineStyle from 'ContentStateInlineStyle';

import applyEntityToContentState from 'applyEntityToContentState';
import getCharacterRemovalRange from 'getCharacterRemovalRange';
import getContentStateFragment from 'getContentStateFragment';
import Immutable from 'immutable';
import insertFragmentIntoContentState from 'insertFragmentIntoContentState';
import insertTextIntoContentState from 'insertTextIntoContentState';
import invariant from 'invariant';
import modifyBlockForContentState from 'modifyBlockForContentState';
import removeEntitiesAtEdges from 'removeEntitiesAtEdges';
import removeRangeFromContentState from 'removeRangeFromContentState';
import splitBlockInContentState from 'splitBlockInContentState';

const {OrderedSet} = Immutable;

export function replaceText(
  contentState: ContentState,
  rangeToReplace: SelectionState,
  text: string,
  inlineStyle?: DraftInlineStyle,
  entityKey?: ?string,
): ContentState {
  const withoutEntities = removeEntitiesAtEdges(contentState, rangeToReplace);
  const withoutText = removeRangeFromContentState(
    withoutEntities,
    rangeToReplace,
  );

  const character = CharacterMetadata.create({
    style: inlineStyle || OrderedSet(),
    entity: entityKey || null,
  });

  return insertTextIntoContentState(
    withoutText,
    withoutText.getSelectionAfter(),
    text,
    character,
  );
}

export function insertText(
  contentState: ContentState,
  targetRange: SelectionState,
  text: string,
  inlineStyle?: DraftInlineStyle,
  entityKey?: ?string,
): ContentState {
  invariant(
    targetRange.isCollapsed(),
    'Target range must be collapsed for `insertText`.',
  );
  return replaceText(contentState, targetRange, text, inlineStyle, entityKey);
}

export function moveText(
  contentState: ContentState,
  removalRange: SelectionState,
  targetRange: SelectionState,
): ContentState {
  const movedFragment = getContentStateFragment(contentState, removalRange);

  const afterRemoval = removeRange(contentState, removalRange, 'backward');

  return replaceWithFragment(afterRemoval, targetRange, movedFragment);
}

export function replaceWithFragment(
  contentState: ContentState,
  targetRange: SelectionState,
  fragment: BlockMap,
  mergeBlockData?: BlockDataMergeBehavior = 'REPLACE_WITH_NEW_DATA',
): ContentState {
  const withoutEntities = removeEntitiesAtEdges(contentState, targetRange);
  const withoutText = removeRangeFromContentState(withoutEntities, targetRange);

  return insertFragmentIntoContentState(
    withoutText,
    withoutText.getSelectionAfter(),
    fragment,
    mergeBlockData,
  );
}

export function removeRange(
  contentState: ContentState,
  rangeToRemove: SelectionState,
  removalDirection: DraftRemovalDirection,
): ContentState {
  let startKey, endKey, startBlock, endBlock;
  if (rangeToRemove.getIsBackward()) {
    rangeToRemove = rangeToRemove.merge({
      anchorKey: rangeToRemove.getFocusKey(),
      anchorOffset: rangeToRemove.getFocusOffset(),
      focusKey: rangeToRemove.getAnchorKey(),
      focusOffset: rangeToRemove.getAnchorOffset(),
      isBackward: false,
    });
  }
  startKey = rangeToRemove.getAnchorKey();
  endKey = rangeToRemove.getFocusKey();
  startBlock = contentState.getBlockForKey(startKey);
  endBlock = contentState.getBlockForKey(endKey);
  const startOffset = rangeToRemove.getStartOffset();
  const endOffset = rangeToRemove.getEndOffset();

  const startEntityKey = startBlock.getEntityAt(startOffset);
  const endEntityKey = endBlock.getEntityAt(endOffset - 1);

  // Check whether the selection state overlaps with a single entity.
  // If so, try to remove the appropriate substring of the entity text.
  if (startKey === endKey) {
    if (startEntityKey && startEntityKey === endEntityKey) {
      const adjustedRemovalRange = getCharacterRemovalRange(
        contentState.getEntityMap(),
        startBlock,
        endBlock,
        rangeToRemove,
        removalDirection,
      );
      return removeRangeFromContentState(contentState, adjustedRemovalRange);
    }
  }

  const withoutEntities = removeEntitiesAtEdges(contentState, rangeToRemove);
  return removeRangeFromContentState(withoutEntities, rangeToRemove);
}

export function splitBlock(
  contentState: ContentState,
  selectionState: SelectionState,
): ContentState {
  const withoutEntities = removeEntitiesAtEdges(contentState, selectionState);
  const withoutText = removeRangeFromContentState(
    withoutEntities,
    selectionState,
  );

  return splitBlockInContentState(withoutText, withoutText.getSelectionAfter());
}

export function applyInlineStyle(
  contentState: ContentState,
  selectionState: SelectionState,
  inlineStyle: string,
): ContentState {
  return ContentStateInlineStyle.add(contentState, selectionState, inlineStyle);
}

export function removeInlineStyle(
  contentState: ContentState,
  selectionState: SelectionState,
  inlineStyle: string,
): ContentState {
  return ContentStateInlineStyle.remove(
    contentState,
    selectionState,
    inlineStyle,
  );
}

export function setBlockType(
  contentState: ContentState,
  selectionState: SelectionState,
  blockType: DraftBlockType,
): ContentState {
  return modifyBlockForContentState(contentState, selectionState, block =>
    block.merge({type: blockType, depth: 0}),
  );
}

export function setBlockData(
  contentState: ContentState,
  selectionState: SelectionState,
  blockData: Map<any, any>,
): ContentState {
  return modifyBlockForContentState(contentState, selectionState, block =>
    block.merge({data: blockData}),
  );
}

export function mergeBlockData(
  contentState: ContentState,
  selectionState: SelectionState,
  blockData: Map<any, any>,
): ContentState {
  return modifyBlockForContentState(contentState, selectionState, block =>
    block.merge({data: block.getData().merge(blockData)}),
  );
}

export function applyEntity(
  contentState: ContentState,
  selectionState: SelectionState,
  entityKey: ?string,
): ContentState {
  const withoutEntities = removeEntitiesAtEdges(contentState, selectionState);
  return applyEntityToContentState(withoutEntities, selectionState, entityKey);
}
