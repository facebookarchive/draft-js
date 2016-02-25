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
  .mock('SelectionState');

const BlockMapBuilder = require('BlockMapBuilder');
const ContentBlock = require('ContentBlock');
const ContentState = require('ContentState');

const SINGLE_BLOCK = [
  {text: 'Lorem ipsum', key: 'a'},
];
const MULTI_BLOCK = [
  {text: 'Four score', key: 'b'},
  {text: 'and seven', key: 'c'},
];

const SelectionState = require('SelectionState');

describe('ContentState', () => {
  function getContentBlocks(textBlocks) {
    return textBlocks.map(block => new ContentBlock(block));
  }

  function getConfigForText(textBlocks) {
    const contentBlocks = getContentBlocks(textBlocks);
    const blockMap = BlockMapBuilder.createFromArray(contentBlocks);
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
      const state = getSample(SINGLE_BLOCK);
      expect(state instanceof ContentState).toBe(true);
    });
  });

  describe('key fetching', () => {
    it('must succeed or fail properly', () => {
      const singleBlock = getSample(SINGLE_BLOCK);
      const key = SINGLE_BLOCK[0].key;
      expect(singleBlock.getKeyBefore(key)).toBe(undefined);
      expect(singleBlock.getKeyAfter(key)).toBe(undefined);

      const multiBlock = getSample(MULTI_BLOCK);
      const firstKey = MULTI_BLOCK[0].key;
      const secondKey = MULTI_BLOCK[1].key;

      expect(multiBlock.getKeyBefore(firstKey)).toBe(undefined);
      expect(multiBlock.getKeyAfter(firstKey)).toBe(secondKey);
      expect(multiBlock.getKeyBefore(secondKey)).toBe(firstKey);
      expect(multiBlock.getKeyAfter(secondKey)).toBe(undefined);
    });
  });

  describe('block fetching', () => {
    it('must retrieve or fail fetching block for key', () => {
      const state = getSample(SINGLE_BLOCK);
      const block = state.getBlockForKey('a');
      expect(block instanceof ContentBlock).toBe(true);
      expect(block.getText()).toBe(SINGLE_BLOCK[0].text);
      expect(state.getBlockForKey('x')).toBe(undefined);
    });
  });
});
