/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+draft_js
 * @flow strict-local
 * @format
 */

'use strict';

jest.disableAutomock();

const SelectionState = require('SelectionState');

const DEFAULT_CONFIG = {
  anchorKey: 'a',
  anchorOffset: 0,
  focusKey: 'a',
  focusOffset: 0,
  isBackward: false,
  hasFocus: true,
};

const flip = selectionState => {
  return selectionState.merge({
    anchorKey: selectionState.getFocusKey(),
    anchorOffset: selectionState.getFocusOffset(),
    focusKey: selectionState.getAnchorKey(),
    focusOffset: selectionState.getAnchorOffset(),
    isBackward: !selectionState.getIsBackward(),
  });
};

const getSample = (type, config = {}) => {
  let selectionState;

  switch (type) {
    case 'MULTI_BLOCK':
      selectionState = new SelectionState({
        ...DEFAULT_CONFIG,
        anchorKey: 'b',
        focusKey: 'c',
        anchorOffset: 10,
        focusOffset: 15,
        ...config,
      });
      break;
    case 'WITHIN_BLOCK':
      selectionState = new SelectionState({
        ...DEFAULT_CONFIG,
        anchorOffset: 10,
        focusOffset: 20,
        ...config,
      });
      break;
    case 'COLLAPSED':
    default:
      selectionState = new SelectionState({
        ...DEFAULT_CONFIG,
        ...config,
      });
  }

  expect(selectionState.toJS()).toMatchSnapshot();

  return selectionState;
};

const COLLAPSED = getSample('COLLAPSED');
const MULTI_BLOCK = getSample('MULTI_BLOCK');
const WITHIN_BLOCK = getSample('WITHIN_BLOCK');

test('must create a new instance', () => {
  const state = COLLAPSED;
  expect(state instanceof SelectionState).toBe(true);
});

test('must retrieve properties correctly', () => {
  const state = COLLAPSED;
  expect([
    state.getAnchorKey(),
    state.getAnchorOffset(),
    state.getFocusKey(),
    state.getFocusOffset(),
    state.getIsBackward(),
    state.getHasFocus(),
  ]).toMatchSnapshot();
});

test('must serialize properties correctly', () => {
  expect(COLLAPSED.serialize()).toMatchSnapshot();
  expect(WITHIN_BLOCK.serialize()).toMatchSnapshot();
  expect(MULTI_BLOCK.serialize()).toMatchSnapshot();
});

describe('hasEdgeWithin', () => {
  test('is false for non-edge block keys', () => {
    expect(COLLAPSED.hasEdgeWithin('b', 0, 0)).toBe(false);
    expect(WITHIN_BLOCK.hasEdgeWithin('b', 0, 0)).toBe(false);
    expect(MULTI_BLOCK.hasEdgeWithin('d', 0, 0)).toBe(false);
  });

  test('is false if offset is outside the selection range', () => {
    expect(COLLAPSED.hasEdgeWithin('a', 1, 1)).toBe(false);
    expect(WITHIN_BLOCK.hasEdgeWithin('a', 1, 1)).toBe(false);
    expect(MULTI_BLOCK.hasEdgeWithin('b', 1, 1)).toBe(false);
  });

  test('is true if key match and offset equals selection edge', () => {
    expect(COLLAPSED.hasEdgeWithin('a', 0, 1)).toBe(true);
    expect(WITHIN_BLOCK.hasEdgeWithin('a', 10, 15)).toBe(true);
    expect(WITHIN_BLOCK.hasEdgeWithin('a', 15, 20)).toBe(true);
    expect(MULTI_BLOCK.hasEdgeWithin('b', 10, 20)).toBe(true);
    expect(MULTI_BLOCK.hasEdgeWithin('c', 15, 20)).toBe(true);
  });

  test('is true if selection range is entirely within test range', () => {
    expect(
      getSample('COLLAPSED', {
        anchorOffset: 5,
        focusOffset: 5,
      }).hasEdgeWithin('a', 0, 10),
    ).toBe(true);
    expect(WITHIN_BLOCK.hasEdgeWithin('a', 0, 40)).toBe(true);
  });

  test('is true if selection range edge overlaps test range', () => {
    expect(WITHIN_BLOCK.hasEdgeWithin('a', 5, 15)).toBe(true);
    expect(WITHIN_BLOCK.hasEdgeWithin('a', 15, 25)).toBe(true);
    expect(MULTI_BLOCK.hasEdgeWithin('b', 5, 20)).toBe(true);
    expect(MULTI_BLOCK.hasEdgeWithin('c', 5, 20)).toBe(true);
  });

  test('is false if test range is entirely within selection range', () => {
    expect(WITHIN_BLOCK.hasEdgeWithin('a', 12, 15)).toBe(false);
    expect(MULTI_BLOCK.hasEdgeWithin('b', 12, 15)).toBe(false);
  });
});

test('detects collapsed selection properly', () => {
  expect(COLLAPSED.isCollapsed()).toBe(true);
  expect(WITHIN_BLOCK.isCollapsed()).toBe(false);
  expect(MULTI_BLOCK.isCollapsed()).toBe(false);
});

test('properly identifies start and end keys', () => {
  expect(COLLAPSED.getStartKey()).toMatchSnapshot();
  expect(WITHIN_BLOCK.getStartKey()).toMatchSnapshot();
  expect(MULTI_BLOCK.getStartKey()).toMatchSnapshot();
  expect(COLLAPSED.getEndKey()).toMatchSnapshot();
  expect(WITHIN_BLOCK.getEndKey()).toMatchSnapshot();
  expect(MULTI_BLOCK.getEndKey()).toMatchSnapshot();
});

test('properly identifies start and end offsets', () => {
  expect(COLLAPSED.getStartOffset()).toMatchSnapshot();
  expect(WITHIN_BLOCK.getStartOffset()).toMatchSnapshot();
  expect(MULTI_BLOCK.getStartOffset()).toMatchSnapshot();
  expect(COLLAPSED.getEndOffset()).toMatchSnapshot();
  expect(WITHIN_BLOCK.getEndOffset()).toMatchSnapshot();
  expect(MULTI_BLOCK.getEndOffset()).toMatchSnapshot();
});

test('properly identifies start and end keys when backward', () => {
  const withinBlock = flip(WITHIN_BLOCK);
  const MULTI_BLOCK = getSample('MULTI_BLOCK', {
    isBackward: true,
  });

  expect(withinBlock.getStartKey()).toMatchSnapshot();
  expect(MULTI_BLOCK.getStartKey()).toMatchSnapshot();
  expect(withinBlock.getEndKey()).toMatchSnapshot();
  expect(MULTI_BLOCK.getEndKey()).toMatchSnapshot();
});

test('properly identifies start and end offsets when backward', () => {
  const withinBlock = flip(WITHIN_BLOCK);
  const MULTI_BLOCK = getSample('MULTI_BLOCK', {
    isBackward: true,
  });

  expect(withinBlock.getStartOffset()).toMatchSnapshot();
  expect(MULTI_BLOCK.getStartOffset()).toMatchSnapshot();
  expect(withinBlock.getEndOffset()).toMatchSnapshot();
  expect(MULTI_BLOCK.getEndOffset()).toMatchSnapshot();
});
