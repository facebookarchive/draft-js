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

const insertFragmentIntoContentState = require('insertFragmentIntoContentState');

const getSampleStateForTesting = require('getSampleStateForTesting');
const getSampleStateForTestingNestedBlocks = require('getSampleStateForTestingNestedBlocks');

describe('insertFragmentIntoContentState+', () => {
  it('must randomize fragment keys and insert blocks at the end of last block text', () => {
    const {
      contentState,
      selectionState,
    } = getSampleStateForTesting();

    const blockMap = contentState.getBlockMap();
    const blockKeys = blockMap.keySeq().toArray();

    const fisrtBlock = blockMap.first();
    const lastBlock = blockMap.last();

    const selection = selectionState.merge({
      focusKey: lastBlock.getKey(),
      anchorKey: lastBlock.getKey(),
      focusOffset: lastBlock.getLength(),
      anchorOffset:  lastBlock.getLength()
    });

    // we are trying to use the current blockMap to insert and replace the existing one
    const fragmentBlockMap = contentState.getBlockMap();
    const newKeys = fragmentBlockMap.keySeq().toArray();

    const newContentState = insertFragmentIntoContentState(
      contentState,
      selection,
      fragmentBlockMap
    );

    const newBlockMap = newContentState.getBlockMap();

    expect(blockKeys).not.toBe(newKeys);
    expect(lastBlock.getText() + fisrtBlock.getText()).toBe(newBlockMap.skip(2).first().getText());
    expect(blockMap.last().getText()).toBe(newBlockMap.last().getText());
  });

  it('must randomize fragment keys and insert blocks at the end of last block text with nesting enabled', () => {
    const {
      contentState,
      selectionState,
    } = getSampleStateForTestingNestedBlocks();

    const blockMap = contentState.getBlockMap();
    const blockKeys = blockMap.keySeq().toArray();

    const fisrtBlock = blockMap.first();
    const lastBlock = blockMap.last();

    const selection = selectionState.merge({
      focusKey: lastBlock.getKey(),
      anchorKey: lastBlock.getKey(),
      focusOffset: lastBlock.getLength(),
      anchorOffset:  lastBlock.getLength()
    });

    // we are trying to use the current blockMap to insert and replace the existing one
    const fragmentBlockMap = contentState.getBlockMap();
    const newKeys = fragmentBlockMap.keySeq().toArray();

    const newContentState = insertFragmentIntoContentState(
      contentState,
      selection,
      fragmentBlockMap
    );

    const newBlockMap = newContentState.getBlockMap();

    expect(blockKeys).not.toBe(newKeys);
    expect(lastBlock.getText() + fisrtBlock.getText()).toBe(newBlockMap.skip(5).first().getText());
    expect(blockMap.last().getText()).toBe(newBlockMap.last().getText());
  });
});
