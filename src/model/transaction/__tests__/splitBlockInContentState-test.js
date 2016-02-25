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

jest.autoMockOff();

const Immutable = require('immutable');
const getSampleStateForTesting = require('getSampleStateForTesting');
const splitBlockInContentState = require('splitBlockInContentState');

describe('removeRangeFromContentState', () => {
  const {
    contentState,
    selectionState,
  } = getSampleStateForTesting();

  function checkForCharacterList(block) {
    expect(Immutable.List.isList(block.getCharacterList())).toBe(true);
  }

  function getInlineStyles(block) {
    return block.getCharacterList().map(c => c.getStyle()).toJS();
  }

  function getEntities(block) {
    return block.getCharacterList().map(c => c.getEntity()).toJS();
  }

  it('must be restricted to collapsed selections', () => {
    expect(() => {
      const nonCollapsed = selectionState.set('focusOffset', 1);
      return splitBlockInContentState(contentState, nonCollapsed);
    }).toThrow();

    expect(() => {
      return splitBlockInContentState(contentState, selectionState);
    }).not.toThrow();
  });

  it('must split at the beginning of a block', () => {
    const initialBlock = contentState.getBlockMap().first();
    const afterSplit = splitBlockInContentState(contentState, selectionState);
    const afterBlockMap = afterSplit.getBlockMap();
    expect(afterBlockMap.size).toBe(4);

    const preSplitBlock = afterBlockMap.first();

    expect(preSplitBlock.getKey()).toBe(initialBlock.getKey());
    expect(preSplitBlock.getText()).toBe('');
    expect(getInlineStyles(preSplitBlock)).toEqual([]);
    expect(getEntities(preSplitBlock)).toEqual([]);

    const postSplitBlock = afterBlockMap.skip(1).first();
    expect(preSplitBlock.getKey()).not.toBe(postSplitBlock.getKey());
    expect(preSplitBlock.getType()).toBe(postSplitBlock.getType());

    expect(postSplitBlock.getKey()).not.toBe(initialBlock.getKey());
    expect(postSplitBlock.getType()).toBe(initialBlock.getType());
    expect(postSplitBlock.getText()).toBe(initialBlock.getText());
    expect(
      getInlineStyles(initialBlock)
    ).toEqual(
      getInlineStyles(postSplitBlock)
    );
    expect(
      getEntities(postSplitBlock)
    ).toEqual(
      getEntities(initialBlock)
    );

    checkForCharacterList(preSplitBlock);
    checkForCharacterList(postSplitBlock);
  });

  it('must split within a block', () => {
    const initialBlock = contentState.getBlockMap().first();
    const SPLIT_OFFSET = 3;
    const selection = selectionState.merge({
      anchorOffset: SPLIT_OFFSET,
      focusOffset: SPLIT_OFFSET,
    });

    const afterSplit = splitBlockInContentState(contentState, selection);
    const afterBlockMap = afterSplit.getBlockMap();
    expect(afterBlockMap.size).toBe(4);

    const preSplitBlock = afterBlockMap.first();
    const postSplitBlock = afterBlockMap.skip(1).first();

    expect(preSplitBlock.getKey()).toBe(initialBlock.getKey());
    expect(preSplitBlock.getText()).toBe(
      initialBlock.getText().slice(0, SPLIT_OFFSET)
    );
    expect(getInlineStyles(preSplitBlock)).toEqual(
      getInlineStyles(initialBlock).slice(0, SPLIT_OFFSET)
    );
    expect(getEntities(preSplitBlock)).toEqual(
      getEntities(initialBlock).slice(0, SPLIT_OFFSET)
    );

    expect(preSplitBlock.getKey()).not.toBe(postSplitBlock.getKey());
    expect(preSplitBlock.getType()).toBe(postSplitBlock.getType());

    expect(postSplitBlock.getKey()).not.toBe(initialBlock.getKey());
    expect(postSplitBlock.getType()).toBe(initialBlock.getType());
    expect(postSplitBlock.getText()).toBe(
      initialBlock.getText().slice(SPLIT_OFFSET)
    );
    expect(getInlineStyles(postSplitBlock)).toEqual(
      getInlineStyles(initialBlock).slice(SPLIT_OFFSET)
    );
    expect(getEntities(postSplitBlock)).toEqual(
      getEntities(initialBlock).slice(SPLIT_OFFSET)
    );

    checkForCharacterList(preSplitBlock);
    checkForCharacterList(postSplitBlock);
  });

  it('must split at the end of a block', () => {
    const initialBlock = contentState.getBlockMap().first();
    const end = initialBlock.getLength();
    const selection = selectionState.merge({
      anchorOffset: end,
      focusOffset: end,
    });

    const afterSplit = splitBlockInContentState(contentState, selection);
    const afterBlockMap = afterSplit.getBlockMap();
    expect(afterBlockMap.size).toBe(4);

    const preSplitBlock = afterBlockMap.first();
    const postSplitBlock = afterBlockMap.skip(1).first();

    expect(preSplitBlock.getKey()).toBe(initialBlock.getKey());

    expect(preSplitBlock.getKey()).not.toBe(postSplitBlock.getKey());
    expect(preSplitBlock.getType()).toBe(postSplitBlock.getType());
    expect(preSplitBlock.getText()).toBe(initialBlock.getText());
    expect(
      getInlineStyles(preSplitBlock)
    ).toEqual(
      getInlineStyles(initialBlock)
    );
    expect(
      getEntities(preSplitBlock)
    ).toEqual(
      getEntities(initialBlock)
    );

    expect(postSplitBlock.getKey()).not.toBe(initialBlock.getKey());
    expect(postSplitBlock.getType()).toBe(initialBlock.getType());
    expect(postSplitBlock.getText()).toBe('');
    expect(getInlineStyles(postSplitBlock)).toEqual([]);
    expect(getEntities(postSplitBlock)).toEqual([]);

    checkForCharacterList(preSplitBlock);
    checkForCharacterList(postSplitBlock);
  });
});
