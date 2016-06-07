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

const getContentStateFragment = require('getContentStateFragment');
const getSampleStateForTesting = require('getSampleStateForTesting');
const getSampleStateForTestingNestedBlocks = require('getSampleStateForTestingNestedBlocks');

describe('getContentStateFragment', () => {
  it('must return a new blockMap with randomized block keys', () => {
    const {
      contentState,
      selectionState,
    } = getSampleStateForTesting();

    const selection = selectionState.merge({
      focusKey: 'c'
    });

    const blockMap = contentState.getBlockMap();
    const blockKeys = blockMap.keySeq().toArray();

    const newBlockMap = getContentStateFragment(contentState, selection);
    const newKeys = newBlockMap.keySeq().toArray();

    expect(blockKeys).not.toBe(newKeys);
    expect(blockMap.first().getText()).toBe(newBlockMap.first().getText());
    expect(blockMap.skip(1).first().getText()).toBe(newBlockMap.skip(1).first().getText());
    expect(blockMap.last().getText()).toBe(newBlockMap.last().getText());
    expect(blockKeys.length).toBe(newKeys.length);
  });

  it('must return a new blockMap with randomized block keys with nesting enabled', () => {
    const {
      contentState,
      selectionState,
    } = getSampleStateForTestingNestedBlocks();

    const selection = selectionState.merge({
      focusKey: 'f'
    });

    const blockMap = contentState.getBlockMap();
    const blockKeys = blockMap.keySeq().toArray();

    const newBlockMap = getContentStateFragment(contentState, selection);
    const newKeys = newBlockMap.keySeq().toArray();

    expect(blockKeys).not.toBe(newKeys);
    expect(blockMap.first().getText()).toBe(newBlockMap.first().getText());
    expect(blockMap.skip(1).first().getText()).toBe(newBlockMap.skip(1).first().getText());
    expect(blockMap.last().getText()).toBe(newBlockMap.last().getText());
    expect(blockKeys.length).toBe(newKeys.length);
  });
});
