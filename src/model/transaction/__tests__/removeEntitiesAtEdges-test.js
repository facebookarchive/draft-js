/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+ui_infra
 */

'use strict';

jest
  .autoMockOff()
  .mock('DraftEntity');

const DraftEntity = require('DraftEntity');
const Immutable = require('immutable');
const applyEntityToContentBlock = require('applyEntityToContentBlock');
const getSampleStateForTesting = require('getSampleStateForTesting');
const removeEntitiesAtEdges = require('removeEntitiesAtEdges');

describe('removeEntitiesAtEdges', () => {
  const {
    List,
    Repeat,
  } = Immutable;

  const {
    contentState,
    selectionState,
  } = getSampleStateForTesting();

  const selectionOnEntity = selectionState.merge({
    anchorKey: 'b',
    anchorOffset: 2,
    focusKey: 'b',
    focusOffset: 2,
  });

  function getEntities(block) {
    return block.getCharacterList().map(c => c.getEntity()).toJS();
  }

  function expectSameBlockMap(before, after) {
    expect(before.getBlockMap()).toBe(after.getBlockMap());
  }

  function expectNullEntities(block) {
    expect(
      getEntities(block)
    ).toEqual(
      List(Repeat(null, block.getLength())).toJS()
    );
  }

  function setEntityMutability(mutability) {
    DraftEntity.get.mockReturnValue({
      getMutability: () => mutability,
    });
  }

  describe('Within a single block', () => {
    it('must not affect blockMap if there are no entities', () => {
      const result = removeEntitiesAtEdges(contentState, selectionState);
      expectSameBlockMap(contentState, result);
    });

    describe('Handling different mutability types', () => {
      it('must not remove mutable entities', () => {
        setEntityMutability('MUTABLE');
        const result = removeEntitiesAtEdges(contentState, selectionOnEntity);
        expectSameBlockMap(contentState, result);
      });

      it('must remove immutable entities', () => {
        setEntityMutability('IMMUTABLE');
        const result = removeEntitiesAtEdges(contentState, selectionOnEntity);
        expect(result.getBlockMap()).not.toBe(contentState.getBlockMap());
        expectNullEntities(result.getBlockForKey('b'));
      });

      it('must remove segmented entities', () => {
        setEntityMutability('SEGMENTED');
        const result = removeEntitiesAtEdges(contentState, selectionOnEntity);
        expect(result.getBlockMap()).not.toBe(contentState.getBlockMap());
        expectNullEntities(result.getBlockForKey('b'));
      });
    });

    describe('Removal for a collapsed cursor', () => {
      setEntityMutability('IMMUTABLE');

      it('must not remove if cursor is at start of entity', () => {
        const selection = selectionOnEntity.merge({
          anchorOffset: 0,
          focusOffset: 0,
        });
        const result = removeEntitiesAtEdges(contentState, selection);
        expectSameBlockMap(contentState, result);
      });

      it('must remove if cursor is within entity', () => {
        const result = removeEntitiesAtEdges(contentState, selectionOnEntity);
        expectNullEntities(result.getBlockForKey('b'));
      });

      it('must not remove if cursor is at end of entity', () => {
        const length = contentState.getBlockForKey('b').getLength();
        const selection = selectionOnEntity.merge({
          anchorOffset: length,
          focusOffset: length,
        });
        const result = removeEntitiesAtEdges(contentState, selection);
        expectSameBlockMap(contentState, result);
      });
    });

    describe('Removal for a non-collapsed cursor', () => {
      setEntityMutability('IMMUTABLE');

      it('must remove for non-collapsed cursor within a single entity', () => {
        setEntityMutability('IMMUTABLE');
        const selection = selectionOnEntity.set('anchorOffset', 1);
        const result = removeEntitiesAtEdges(contentState, selection);
        expectNullEntities(result.getBlockForKey('b'));
      });

      it('must remove for non-collapsed cursor on multiple entities', () => {
        const block = contentState.getBlockForKey('b');
        const newBlock = applyEntityToContentBlock(block, 3, 5, '456');
        const newBlockMap = contentState.getBlockMap().set('b', newBlock);
        const newContent = contentState.set('blockMap', newBlockMap);
        const selection = selectionOnEntity.merge({
          anchorOffset: 1,
          focusOffset: 4,
        });
        const result = removeEntitiesAtEdges(newContent, selection);
        expectNullEntities(result.getBlockForKey('b'));
      });

      it('must ignore an entity that is entirely within the selection', () => {
        const block = contentState.getBlockForKey('b');

        // Remove entity from beginning and end of block.
        let newBlock = applyEntityToContentBlock(block, 0, 1, null);
        newBlock = applyEntityToContentBlock(newBlock, 4, 5, null);

        const newBlockMap = contentState.getBlockMap().set('b', newBlock);
        const newContent = contentState.set('blockMap', newBlockMap);
        const selection = selectionOnEntity.merge({
          anchorOffset: 0,
          focusOffset: 5,
        });
        const result = removeEntitiesAtEdges(newContent, selection);
        expectSameBlockMap(newContent, result);
      });
    });
  });

  describe('Across multiple blocks', () => {
    setEntityMutability('IMMUTABLE');

    it('must remove entity at start of selection', () => {
      const selection = selectionState.merge({
        anchorKey: 'b',
        anchorOffset: 3,
        focusKey: 'c',
        focusOffset: 3,
      });
      const result = removeEntitiesAtEdges(contentState, selection);
      expectNullEntities(result.getBlockForKey('b'));
      expectNullEntities(result.getBlockForKey('c'));
    });

    it('must remove entity at end of selection', () => {
      const selection = selectionState.merge({
        anchorKey: 'a',
        anchorOffset: 3,
        focusKey: 'b',
        focusOffset: 3,
      });
      const result = removeEntitiesAtEdges(contentState, selection);
      expectNullEntities(result.getBlockForKey('a'));
      expectNullEntities(result.getBlockForKey('b'));
    });

    it('must remove entities at both ends of selection', () => {
      const cBlock = contentState.getBlockForKey('c');
      const len = cBlock.getLength();
      const modifiedC = applyEntityToContentBlock(cBlock, 0, len, '456');
      const newBlockMap = contentState.getBlockMap().set('c', modifiedC);
      const newContent = contentState.set('blockMap', newBlockMap);
      const selection = selectionState.merge({
        anchorKey: 'b',
        anchorOffset: 3,
        focusKey: 'c',
        focusOffset: 3,
      });
      const result = removeEntitiesAtEdges(newContent, selection);
      expectNullEntities(result.getBlockForKey('b'));
      expectNullEntities(result.getBlockForKey('c'));
    });
  });
});
