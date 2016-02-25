/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule DraftModifier
 * @typechecks
 * @flow
 */

'use strict';

const CharacterMetadata = require('CharacterMetadata');
const ContentStateInlineStyle = require('ContentStateInlineStyle');
const {OrderedSet} = require('immutable');

const applyEntityToContentState = require('applyEntityToContentState');
const getCharacterRemovalRange = require('getCharacterRemovalRange');
const getContentStateFragment = require('getContentStateFragment');
const insertFragmentIntoContentState = require('insertFragmentIntoContentState');
const insertTextIntoContentState = require('insertTextIntoContentState');
const invariant = require('invariant');
const removeEntitiesAtEdges = require('removeEntitiesAtEdges');
const removeRangeFromContentState = require('removeRangeFromContentState');
const setBlockTypeForContentState = require('setBlockTypeForContentState');
const splitBlockInContentState = require('splitBlockInContentState');

import type {BlockMap} from 'BlockMap';
import type ContentState from 'ContentState';
import type {DraftBlockType} from 'DraftBlockType';
import type {DraftInlineStyle} from 'DraftInlineStyle';
import type {DraftRemovalDirection} from 'DraftRemovalDirection';
import type SelectionState from 'SelectionState';

/**
 * `DraftModifier` provides a set of convenience methods that apply
 * modifications to a `ContentState` object based on a target `SelectionState`.
 *
 * Any change to a `ContentState` should be decomposable into a series of
 * transaction functions that apply the required changes and return output
 * `ContentState` objects.
 *
 * These functions encapsulate some of the most common transaction sequences.
 */
const DraftModifier = {
  replaceText: function(
    contentState: ContentState,
    rangeToReplace: SelectionState,
    text: string,
    inlineStyle?: DraftInlineStyle,
    entityKey?: ?string
  ): ContentState {
    const withoutEntities = removeEntitiesAtEdges(contentState, rangeToReplace);
    const withoutText = removeRangeFromContentState(
      withoutEntities,
      rangeToReplace
    );

    const character = CharacterMetadata.create({
      style: inlineStyle || OrderedSet(),
      entity: entityKey || null,
    });

    return insertTextIntoContentState(
      withoutText,
      withoutText.getSelectionAfter(),
      text,
      character
    );
  },

  insertText: function(
    contentState: ContentState,
    targetRange: SelectionState,
    text: string,
    inlineStyle?: DraftInlineStyle,
    entityKey?: ?string
  ): ContentState {
    invariant(
      targetRange.isCollapsed(),
      'Target range must be collapsed for `insertText`.'
    );
    return DraftModifier.replaceText(
      contentState,
      targetRange,
      text,
      inlineStyle,
      entityKey
    );
  },

  moveText: function(
    contentState: ContentState,
    removalRange: SelectionState,
    targetRange: SelectionState
  ): ContentState {
    const movedFragment = getContentStateFragment(contentState, removalRange);

    const afterRemoval = DraftModifier.removeRange(
      contentState,
      removalRange,
      'backward'
    );

    return DraftModifier.replaceWithFragment(
      afterRemoval,
      targetRange,
      movedFragment
    );
  },

  replaceWithFragment: function(
    contentState: ContentState,
    targetRange: SelectionState,
    fragment: BlockMap
  ): ContentState {
    const withoutEntities = removeEntitiesAtEdges(contentState, targetRange);
    const withoutText = removeRangeFromContentState(
      withoutEntities,
      targetRange
    );

    return insertFragmentIntoContentState(
      withoutText,
      withoutText.getSelectionAfter(),
      fragment
    );
  },

  removeRange: function(
    contentState: ContentState,
    rangeToRemove: SelectionState,
    removalDirection: DraftRemovalDirection
  ): ContentState {
    // Check whether the selection state overlaps with a single entity.
    // If so, try to remove the appropriate substring of the entity text.
    if (rangeToRemove.getAnchorKey() === rangeToRemove.getFocusKey()) {
      const key = rangeToRemove.getAnchorKey();
      const startOffset = rangeToRemove.getStartOffset();
      const endOffset = rangeToRemove.getEndOffset();
      const block = contentState.getBlockForKey(key);

      const startEntity = block.getEntityAt(startOffset);
      const endEntity = block.getEntityAt(endOffset - 1);
      if (startEntity && startEntity === endEntity) {
        const adjustedRemovalRange = getCharacterRemovalRange(
          block,
          rangeToRemove,
          removalDirection
        );
        return removeRangeFromContentState(contentState, adjustedRemovalRange);
      }
    }

    const withoutEntities = removeEntitiesAtEdges(contentState, rangeToRemove);
    return removeRangeFromContentState(withoutEntities, rangeToRemove);
  },

  splitBlock: function(
    contentState: ContentState,
    selectionState: SelectionState
  ): ContentState {
    const withoutEntities = removeEntitiesAtEdges(contentState, selectionState);
    const withoutText = removeRangeFromContentState(
      withoutEntities,
      selectionState
    );

    return splitBlockInContentState(
      withoutText,
      withoutText.getSelectionAfter()
    );
  },

  applyInlineStyle: function(
    contentState: ContentState,
    selectionState: SelectionState,
    inlineStyle: string
  ): ContentState {
    return ContentStateInlineStyle.add(
      contentState,
      selectionState,
      inlineStyle
    );
  },

  removeInlineStyle: function(
    contentState: ContentState,
    selectionState: SelectionState,
    inlineStyle: string
  ): ContentState {
    return ContentStateInlineStyle.remove(
      contentState,
      selectionState,
      inlineStyle
    );
  },

  setBlockType: function(
    contentState: ContentState,
    selectionState: SelectionState,
    blockType: DraftBlockType
  ): ContentState {
    return setBlockTypeForContentState(
      contentState,
      selectionState,
      blockType
    );
  },

  applyEntity: function(
    contentState: ContentState,
    selectionState: SelectionState,
    entityKey: ?string
  ): ContentState {
    const withoutEntities = removeEntitiesAtEdges(contentState, selectionState);
    return applyEntityToContentState(
      withoutEntities,
      selectionState,
      entityKey
    );
  },
};

module.exports = DraftModifier;
