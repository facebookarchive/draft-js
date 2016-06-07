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

jest.disableAutomock();

const getSampleStateForTesting = require('getSampleStateForTesting');
const getSampleStateForTestingNestedBlocks = require('getSampleStateForTestingNestedBlocks');

const randomizeBlockMapKeys = require('randomizeBlockMapKeys');

describe('randomizeBlockMapKeys', () => {
  it('must randomize blockMap keys', () => {
    const {
      contentState
    } = getSampleStateForTesting();

    const blockMap = contentState.getBlockMap();
    const blockKeys = blockMap.keySeq().toArray();

    const newBlockMap = randomizeBlockMapKeys(blockMap);
    const newKeys = newBlockMap.keySeq().toArray();

    expect(blockKeys).not.toBe(newKeys);
    expect(blockMap.first().getText()).toBe(newBlockMap.first().getText());
    expect(blockMap.first().getKey()).not.toBe(newBlockMap.first().getKey());
    expect(blockKeys.length).toBe(newKeys.length);
  });

  it('must randomize blockMap keys with nesting enabled', () => {
    const {
      contentState
    } = getSampleStateForTestingNestedBlocks();

    const blockMap = contentState.getBlockMap();
    const blockKeys = blockMap.keySeq().toArray();

    const blockWithParent = blockMap.skip(2).first();
    const blockWithParentKeyArr = blockWithParent.getKey().split('/');

    const newBlockMap = randomizeBlockMapKeys(blockMap);
    const newKeys = newBlockMap.keySeq().toArray();

    const newBlockWithParent = newBlockMap.skip(2).first();
    const newBlockWithParentKeyArr = newBlockWithParent.getKey().split('/');

    expect(blockKeys).not.toBe(newKeys);
    expect(blockMap.first().getText()).toBe(newBlockMap.first().getText());
    expect(blockMap.first().getKey()).not.toBe(newBlockMap.first().getKey());
    expect(blockWithParent.getKey()).not.toBe(newBlockWithParent.getKey());
    expect(blockWithParentKeyArr.length).toBe(newBlockWithParentKeyArr.length);
    expect(blockKeys.length).toBe(newKeys.length);
  });

  it('must retain parent key from fragment that has not supplied a parent block', () => {
    const {
      contentState
    } = getSampleStateForTestingNestedBlocks();

    const blockMap = contentState.getBlockMap().skip(2); // not including 'a' and root block 'b'
    const blockKeys = blockMap.keySeq().toArray();

    const blockWithParent = blockMap.first();
    const blockWithParentKeyArr = blockWithParent.getKey().split('/');

    const newBlockMap = randomizeBlockMapKeys(blockMap);
    const newKeys = newBlockMap.keySeq().toArray();

    const newBlockWithParent = newBlockMap.first();
    const newBlockWithParentKeyArr = newBlockWithParent.getKey().split('/');

    expect(blockKeys).not.toBe(newKeys);
    expect(blockMap.first().getText()).toBe(newBlockMap.first().getText());
    expect(blockMap.first().getKey()).not.toBe(newBlockMap.first().getKey());
    expect(blockWithParent.getKey()).not.toBe(newBlockWithParent.getKey());
    expect(blockWithParentKeyArr.length).toBe(newBlockWithParentKeyArr.length);
    expect(blockKeys.length).toBe(newKeys.length);
  });
});
