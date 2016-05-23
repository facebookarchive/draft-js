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
var NESTED_BLOCK = [
  {text: 'Four score', key: 'd'},
  {text: 'and seven', key: 'e'},
  {text: 'Nested in e', key: 'e/f'},
  {text: 'Nested in e', key: 'e/g'},
  {text: 'Nested in e/g', key: 'e/g/h'},
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

  describe('nested block fetching', () => {
    it('must retrieve nested block for key', () => {
      var state = getSample(NESTED_BLOCK);
      var blocks = state.getBlockChildren('e');

      expect(blocks.size).toBe(2);
      expect(blocks.has('e/f')).toBe(true);
      expect(blocks.has('e/g')).toBe(true);
    });

    it('must retrieve nested block for a deeper key', () => {
      var state = getSample(NESTED_BLOCK);
      var blocks = state.getBlockChildren('e/g');

      expect(blocks.size).toBe(1);
      expect(blocks.has('e/g/h')).toBe(true);
    });

    it('must return an empty map if none', () => {
      var state = getSample(NESTED_BLOCK);
      var blocks = state.getBlockChildren('d');

      expect(blocks.size).toBe(0);
    });
  });

  describe('first level block fetching', () => {
    it('must retrieve first level block', () => {
      var state = getSample(NESTED_BLOCK);
      var blocks = state.getFirstLevelBlocks();

      expect(blocks.size).toBe(2);
      expect(blocks.has('d')).toBe(true);
      expect(blocks.has('e')).toBe(true);
    });
  });
});
