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
  .disableAutomock();

var Immutable = require('immutable');
var applyEntityToContentBlock = require('applyEntityToContentBlock');
var getSampleStateForTesting = require('getSampleStateForTesting');
var removeEntitiesAtEdges = require('removeEntitiesAtEdges');

describe('removeEntitiesAtEdges', () => {
  var {
    List,
    Repeat,
  } = Immutable;

  var {
    contentState,
    selectionState,
  } = getSampleStateForTesting();

  var selectionOnEntity = selectionState.merge({
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
    contentState.getEntityMap().__get = () => ({
      getMutability: () => mutability,
    });
  }

  describe('Within a single block', () => {
    it('must not affect blockMap if there are no entities', () => {
      var result = removeEntitiesAtEdges(contentState, selectionState);
      expectSameBlockMap(contentState, result);
    });

    describe('Handling different mutability types', () => {
      it('must not remove mutable entities', () => {
        setEntityMutability('MUTABLE');
        var result = removeEntitiesAtEdges(contentState, selectionOnEntity);
        expectSameBlockMap(contentState, result);
      });

      it('must remove immutable entities', () => {
        setEntityMutability('IMMUTABLE');
        var result = removeEntitiesAtEdges(contentState, selectionOnEntity);
        expect(result.getBlockMap()).not.toBe(contentState.getBlockMap());
        expectNullEntities(result.getBlockForKey('b'));
      });

      it('must remove segmented entities', () => {
        setEntityMutability('SEGMENTED');
        var result = removeEntitiesAtEdges(contentState, selectionOnEntity);
        expect(result.getBlockMap()).not.toBe(contentState.getBlockMap());
        expectNullEntities(result.getBlockForKey('b'));
      });
    });

    describe('Removal for a collapsed cursor', () => {
      setEntityMutability('IMMUTABLE');

      it('must not remove if cursor is at start of entity', () => {
        var selection = selectionOnEntity.merge({
          anchorOffset: 0,
          focusOffset: 0,
        });
        var result = removeEntitiesAtEdges(contentState, selection);
        expectSameBlockMap(contentState, result);
      });

      it('must remove if cursor is within entity', () => {
        var result = removeEntitiesAtEdges(contentState, selectionOnEntity);
        expectNullEntities(result.getBlockForKey('b'));
      });

      it('must not remove if cursor is at end of entity', () => {
        var length = contentState.getBlockForKey('b').getLength();
        var selection = selectionOnEntity.merge({
          anchorOffset: length,
          focusOffset: length,
        });
        var result = removeEntitiesAtEdges(contentState, selection);
        expectSameBlockMap(contentState, result);
      });
    });

    describe('Removal for a non-collapsed cursor', () => {
      setEntityMutability('IMMUTABLE');

      it('must remove for non-collapsed cursor within a single entity', () => {
        setEntityMutability('IMMUTABLE');
        var selection = selectionOnEntity.set('anchorOffset', 1);
        var result = removeEntitiesAtEdges(contentState, selection);
        expectNullEntities(result.getBlockForKey('b'));
      });

      it('must remove for non-collapsed cursor on multiple entities', () => {
        var block = contentState.getBlockForKey('b');
        var newBlock = applyEntityToContentBlock(block, 3, 5, '456');
        var newBlockMap = contentState.getBlockMap().set('b', newBlock);
        var newContent = contentState.set('blockMap', newBlockMap);
        var selection = selectionOnEntity.merge({
          anchorOffset: 1,
          focusOffset: 4,
        });
        var result = removeEntitiesAtEdges(newContent, selection);
        expectNullEntities(result.getBlockForKey('b'));
      });

      it('must ignore an entity that is entirely within the selection', () => {
        var block = contentState.getBlockForKey('b');

        // Remove entity from beginning and end of block.
        var newBlock = applyEntityToContentBlock(block, 0, 1, null);
        newBlock = applyEntityToContentBlock(newBlock, 4, 5, null);

        var newBlockMap = contentState.getBlockMap().set('b', newBlock);
        var newContent = contentState.set('blockMap', newBlockMap);
        var selection = selectionOnEntity.merge({
          anchorOffset: 0,
          focusOffset: 5,
        });
        var result = removeEntitiesAtEdges(newContent, selection);
        expectSameBlockMap(newContent, result);
      });
    });
  });

  describe('Across multiple blocks', () => {
    setEntityMutability('IMMUTABLE');

    it('must remove entity at start of selection', () => {
      var selection = selectionState.merge({
        anchorKey: 'b',
        anchorOffset: 3,
        focusKey: 'c',
        focusOffset: 3,
      });
      var result = removeEntitiesAtEdges(contentState, selection);
      expectNullEntities(result.getBlockForKey('b'));
      expectNullEntities(result.getBlockForKey('c'));
    });

    it('must remove entity at end of selection', () => {
      var selection = selectionState.merge({
        anchorKey: 'a',
        anchorOffset: 3,
        focusKey: 'b',
        focusOffset: 3,
      });
      var result = removeEntitiesAtEdges(contentState, selection);
      expectNullEntities(result.getBlockForKey('a'));
      expectNullEntities(result.getBlockForKey('b'));
    });

    it('must remove entities at both ends of selection', () => {
      var cBlock = contentState.getBlockForKey('c');
      var len = cBlock.getLength();
      var modifiedC = applyEntityToContentBlock(cBlock, 0, len, '456');
      var newBlockMap = contentState.getBlockMap().set('c', modifiedC);
      var newContent = contentState.set('blockMap', newBlockMap);
      var selection = selectionState.merge({
        anchorKey: 'b',
        anchorOffset: 3,
        focusKey: 'c',
        focusOffset: 3,
      });
      var result = removeEntitiesAtEdges(newContent, selection);
      expectNullEntities(result.getBlockForKey('b'));
      expectNullEntities(result.getBlockForKey('c'));
    });
  });
});
