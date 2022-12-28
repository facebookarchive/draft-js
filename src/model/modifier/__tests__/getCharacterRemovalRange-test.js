/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+draft_js
 * @flow strict-local
 * @format
 */

'use strict';

const getCharacterRemovalRange = require('getCharacterRemovalRange');
const DraftRemovableWord = require('DraftRemovableWord');
const SelectionState = require('SelectionState');
const convertFromRawToDraftState = require('convertFromRawToDraftState');

const BLOCK_TYPE = {
  IMMUTABLE: 'IMMUTABLE',
  MUTABLE: 'MUTABLE',
  SEGMENTED: 'SEGMENTED',
};

const rawContent = {
  IMMUTABLE: {
    blocks: [
      {
        key: 'firstBlock',
        text: `This is an "immutable" entity: Superman. 
        Deleting any characters will delete the entire entity. 
        Adding characters will remove the entity from the range.`,
        type: 'unstyled',
        entityRanges: [{offset: 31, length: 8, key: 0}],
      },
    ],
    entityMap: {
      0: {
        type: 'TOKEN',
        mutability: 'IMMUTABLE',
      },
    },
  },
  MUTABLE: {
    blocks: [
      {
        key: 'secondBlock',
        text: `This is a "mutable" entity: Batman. 
        Characters may be added and removed.`,
        type: 'unstyled',
        entityRanges: [{offset: 28, length: 6, key: 1}],
      },
    ],
    entityMap: {
      1: {
        type: 'TOKEN',
        mutability: 'MUTABLE',
      },
    },
  },
  SEGMENTED: {
    blocks: [
      {
        key: 'thirdBlock',
        text: `This is a "segmented" entity: Green Lantern. 
        Deleting any characters will delete the current "segment" from the range. 
        Adding characters will remove the entire entity from the range.`,
        type: 'unstyled',
        entityRanges: [{offset: 30, length: 13, key: 2}],
      },
    ],
    entityMap: {
      2: {
        type: 'TOKEN',
        mutability: 'SEGMENTED',
      },
    },
  },
};

const results = {
  IMMUTABLE: {
    anchorKey: 'firstBlock',
    anchorOffset: 31,
    focusKey: 'firstBlock',
    focusOffset: 39,
    hasFocus: true,
    isBackward: false,
  },
  MUTABLE: {
    anchorKey: 'secondBlock',
    anchorOffset: 33,
    focusKey: 'secondBlock',
    focusOffset: 34,
    isBackward: false,
    hasFocus: true,
  },
  SEGMENTED: {
    anchorKey: 'thirdBlock',
    anchorOffset: 30,
    focusKey: 'thirdBlock',
    focusOffset: 43,
    isBackward: false,
    hasFocus: true,
  },
};

const assertCharacterRemovalRange = (
  result,
  selection,
  mutability,
  content = convertFromRawToDraftState(rawContent[mutability]),
  backward = DraftRemovableWord.getBackward,
) => {
  const actualResult = getCharacterRemovalRange(
    content.getEntityMap(),
    content.getBlockMap().first(), //startBlock
    content.getBlockMap().last(), //endBlock
    selection, //rangeToRemove
    backward, //removalDirection
  );
  expect(actualResult.toJS()).toStrictEqual(result);
};

/**
 * Go-to draft-js/examples/draft-0-10-0/entity/entity.html
 *
 * Remove Superman from immutable block using back space
 */
test('must remove "Superman" from immutable entity', () => {
  assertCharacterRemovalRange(
    results[BLOCK_TYPE.IMMUTABLE],
    new SelectionState(results[BLOCK_TYPE.IMMUTABLE]),
    BLOCK_TYPE.IMMUTABLE,
  );
});

/**
 * Go-to draft-js/examples/draft-0-10-0/entity/entity.html
 *
 * Remove Batman from mutable block using back space
 */
test('must remove "Batman" from mutable entity', () => {
  assertCharacterRemovalRange(
    results[BLOCK_TYPE.MUTABLE],
    new SelectionState(results[BLOCK_TYPE.MUTABLE]),
    BLOCK_TYPE.MUTABLE,
  );
});

/**
 * Go-to draft-js/examples/draft-0-10-0/entity/entity.html
 *
 * Remove GREEN from segmented block using back space
 */
test('must remove "Green" from segmented entity', () => {
  assertCharacterRemovalRange(
    results[BLOCK_TYPE.SEGMENTED],
    new SelectionState(results[BLOCK_TYPE.SEGMENTED]),
    BLOCK_TYPE.SEGMENTED,
  );
});
