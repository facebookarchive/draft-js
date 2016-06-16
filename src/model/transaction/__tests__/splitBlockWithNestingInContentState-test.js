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

var Immutable = require('immutable');
var getSampleStateForTesting = require('getSampleStateForTesting');
var splitBlockWithNestingInContentState = require('splitBlockWithNestingInContentState');

describe('splitBlockWithNestingInContentState', () => {
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
      return splitBlockWithNestingInContentState(contentState, nonCollapsed);
    }).toThrow();

    expect(() => {
      return splitBlockWithNestingInContentState(contentState, selectionState);
    }).not.toThrow();
  });

  it('must split at the beginning of a block', () => {
    const initialBlock = contentState.getBlockMap().first();
    const afterSplit = splitBlockWithNestingInContentState(contentState, selectionState);
    const afterBlockMap = afterSplit.getBlockMap();
    expect(afterBlockMap.size).toBe(5);

    const preSplitBlock = afterBlockMap.first();
    expect(preSplitBlock.getKey()).toBe(initialBlock.getKey());
    expect(preSplitBlock.getText()).toBe('');
    expect(getInlineStyles(preSplitBlock)).toEqual([]);
    expect(getEntities(preSplitBlock)).toEqual([]);

    const nestedBlocks = afterSplit.getBlockChildren(initialBlock.getKey());
    expect(nestedBlocks.size).toBe(2);

    const firstNestedBlock = nestedBlocks.first();
    const lastNestedBlock = nestedBlocks.last();

    // First block should contain nothing
    expect(firstNestedBlock.getKey()).not.toBe(lastNestedBlock.getKey());
    expect(firstNestedBlock.getType()).toBe(lastNestedBlock.getType());
    expect(firstNestedBlock.getType()).toBe('unstyled');
    expect(firstNestedBlock.getText()).toBe('');
    expect(getInlineStyles(firstNestedBlock)).toEqual([]);
    expect(getEntities(firstNestedBlock)).toEqual([]);

    // Last block should contain everything
    expect(lastNestedBlock.getKey()).not.toBe(firstNestedBlock.getKey());
    expect(lastNestedBlock.getText()).toBe(initialBlock.getText());

    expect(
      getInlineStyles(initialBlock)
    ).toEqual(
      getInlineStyles(lastNestedBlock)
    );
    expect(
      getEntities(lastNestedBlock)
    ).toEqual(
      getEntities(initialBlock)
    );

    checkForCharacterList(firstNestedBlock);
    checkForCharacterList(lastNestedBlock);
  });

  it('must split within a block', () => {
    const initialBlock = contentState.getBlockMap().first();
    const SPLIT_OFFSET = 3;
    const selection = selectionState.merge({
      anchorOffset: SPLIT_OFFSET,
      focusOffset: SPLIT_OFFSET,
    });

    const afterSplit = splitBlockWithNestingInContentState(contentState, selection);
    const afterBlockMap = afterSplit.getBlockMap();
    expect(afterBlockMap.size).toBe(5);

    const preSplitBlock = afterBlockMap.first();
    expect(preSplitBlock.getKey()).toBe(initialBlock.getKey());
    expect(preSplitBlock.getText()).toBe('');
    expect(getInlineStyles(preSplitBlock)).toEqual([]);
    expect(getEntities(preSplitBlock)).toEqual([]);

    const nestedBlocks = afterSplit.getBlockChildren(initialBlock.getKey());
    expect(nestedBlocks.size).toBe(2);

    const firstNestedBlock = nestedBlocks.first();
    const lastNestedBlock = nestedBlocks.last();

    // First block should contain everything until offset
    expect(firstNestedBlock.getText()).toBe(initialBlock.getText().slice(0, SPLIT_OFFSET));
    expect(
      getInlineStyles(firstNestedBlock)
    ).toEqual(
      getInlineStyles(initialBlock).slice(0, SPLIT_OFFSET)
    );
    expect(
      getEntities(firstNestedBlock)
    ).toEqual(
      getEntities(initialBlock).slice(0, SPLIT_OFFSET)
    );

    // First block should contain everything after offset
    expect(lastNestedBlock.getText()).toBe(initialBlock.getText().slice(SPLIT_OFFSET));
    expect(
      getInlineStyles(lastNestedBlock)
    ).toEqual(
      getInlineStyles(initialBlock).slice(SPLIT_OFFSET)
    );
    expect(
      getEntities(lastNestedBlock)
    ).toEqual(
      getEntities(initialBlock).slice(SPLIT_OFFSET)
    );
  });

  it('must split at the end of a block', () => {
    const initialBlock = contentState.getBlockMap().first();
    const end = initialBlock.getLength();
    const selection = selectionState.merge({
      anchorOffset: end,
      focusOffset: end,
    });

    const afterSplit = splitBlockWithNestingInContentState(contentState, selection);
    const afterBlockMap = afterSplit.getBlockMap();
    expect(afterBlockMap.size).toBe(5);

    const preSplitBlock = afterBlockMap.first();
    expect(preSplitBlock.getKey()).toBe(initialBlock.getKey());
    expect(preSplitBlock.getText()).toBe('');
    expect(getInlineStyles(preSplitBlock)).toEqual([]);
    expect(getEntities(preSplitBlock)).toEqual([]);

    const nestedBlocks = afterSplit.getBlockChildren(initialBlock.getKey());
    expect(nestedBlocks.size).toBe(2);

    const firstNestedBlock = nestedBlocks.first();
    const lastNestedBlock = nestedBlocks.last();

    expect(firstNestedBlock.getKey()).not.toBe(lastNestedBlock.getKey());
    expect(firstNestedBlock.getType()).toBe(lastNestedBlock.getType());
    expect(firstNestedBlock.getType()).toBe('unstyled');
    expect(lastNestedBlock.getKey()).not.toBe(firstNestedBlock.getKey());

    // First block should contain everything
    expect(firstNestedBlock.getText()).toBe(initialBlock.getText());
    expect(
      getInlineStyles(firstNestedBlock)
    ).toEqual(
      getInlineStyles(initialBlock)
    );
    expect(
      getEntities(firstNestedBlock)
    ).toEqual(
      getEntities(initialBlock)
    );

    // Second block should be empty
    expect(lastNestedBlock.getText()).toBe('');
    expect(getInlineStyles(lastNestedBlock)).toEqual([]);
    expect(getEntities(lastNestedBlock)).toEqual([]);

    checkForCharacterList(firstNestedBlock);
    checkForCharacterList(lastNestedBlock);
  });
});
