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
  .disableAutomock()
  .mock('SelectionState');

var BlockMapBuilder = require('BlockMapBuilder');
var ContentBlock = require('ContentBlock');
var ContentState = require('ContentState');

var SINGLE_BLOCK = [
  {text: 'Lorem ipsum', key: 'a'},
];
var MULTI_BLOCK = [
  {text: 'Four score', key: 'b'},
  {text: 'and seven', key: 'c'},
];

var SelectionState = require('SelectionState');

describe('ContentState', () => {
  function getContentBlocks(textBlocks) {
    return textBlocks.map(block => new ContentBlock(block));
  }

  function getConfigForText(textBlocks) {
    var contentBlocks = getContentBlocks(textBlocks);
    var blockMap = BlockMapBuilder.createFromArray(contentBlocks);
    return {
      blockMap,
      selectionBefore: new SelectionState(),
      selectionAfter: new SelectionState(),
    };
  }

  function getSampleFromConfig(config) {
    return new ContentState(config);
  }

  function getSample(textBlocks) {
    return getSampleFromConfig(
      getConfigForText(textBlocks)
    );
  }

  describe('creation and retrieval', () => {
    it('must create a new instance', () => {
      var state = getSample(SINGLE_BLOCK);
      expect(state instanceof ContentState).toBe(true);
    });

    it('must create properly with an empty block array', () => {
      var state = ContentState.createFromBlockArray([]);
      expect(state instanceof ContentState).toBe(true);
    });
  });

  describe('key fetching', () => {
    it('must succeed or fail properly', () => {
      var singleBlock = getSample(SINGLE_BLOCK);
      var key = SINGLE_BLOCK[0].key;
      expect(singleBlock.getKeyBefore(key)).toBe(undefined);
      expect(singleBlock.getKeyAfter(key)).toBe(undefined);

      var multiBlock = getSample(MULTI_BLOCK);
      var firstKey = MULTI_BLOCK[0].key;
      var secondKey = MULTI_BLOCK[1].key;

      expect(multiBlock.getKeyBefore(firstKey)).toBe(undefined);
      expect(multiBlock.getKeyAfter(firstKey)).toBe(secondKey);
      expect(multiBlock.getKeyBefore(secondKey)).toBe(firstKey);
      expect(multiBlock.getKeyAfter(secondKey)).toBe(undefined);
    });
  });

  describe('block fetching', () => {
    it('must retrieve or fail fetching block for key', () => {
      var state = getSample(SINGLE_BLOCK);
      var block = state.getBlockForKey('a');
      expect(block instanceof ContentBlock).toBe(true);
      expect(block.getText()).toBe(SINGLE_BLOCK[0].text);
      expect(state.getBlockForKey('x')).toBe(undefined);
    });
  });

  describe('entities', () => {

    let contentState;
    beforeEach(() => {
      contentState = ContentState.createFromText('');
      jest.resetModuleRegistry();
    });

    function createLink() {
      return contentState.createEntity('LINK', 'MUTABLE', {uri: 'zombo.com'});
    }

    it('must create instances', () => {
      const contentState = createLink();
      expect(typeof contentState.getLastCreatedEntityKey()).toBe('string');
    });

    it('must retrieve an instance given a key', () => {
      const contentState = createLink();
      const retrieved = contentState.getEntity(contentState.getLastCreatedEntityKey());
      expect(retrieved.getType()).toBe('LINK');
      expect(retrieved.getMutability()).toBe('MUTABLE');
      expect(retrieved.getData()).toEqual({uri: 'zombo.com'});
    });

    it('must throw when retrieving for an invalid key', () => {
      const contentState = createLink();
      expect(() => contentState.getEntity('asdfzxcvqweriuop')).toThrow();
      expect(() => contentState.getEntity(null)).toThrow();
    });

    it('must merge data', () => {
      const contentState = createLink();

      // Merge new property.
      const newData = {foo: 'bar'};
      const key = contentState.getLastCreatedEntityKey();
      const contentStateWithNewProp = contentState.mergeEntityData(key, newData);
      const updatedEntity = contentStateWithNewProp.getEntity(key);
      expect(updatedEntity.getData()).toEqual({
        uri: 'zombo.com',
        foo: 'bar',
      });
      // Replace existing property.
      const withNewURI = {uri: 'homestarrunner.com'};
      const contentStateWithUpdatedProp = contentStateWithNewProp.mergeEntityData(key, withNewURI);
      const entityWithNewURI = contentStateWithUpdatedProp.getEntity(key);
      expect(entityWithNewURI.getData()).toEqual({
        uri: 'homestarrunner.com',
        foo: 'bar',
      });
    });

    it('must replace data', () => {
      const contentState = createLink();
      const key = contentState.getLastCreatedEntityKey();
      const replacedData = {
        uri: 'something.com',
        newProp: 'baz',
      };
      const updatedContentState = contentState.replaceEntityData(key, replacedData);
      const entityWithReplacedData = updatedContentState.getEntity(key);
      expect(entityWithReplacedData.getData()).toEqual(replacedData);
    });

  });
});
