/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+ui_infra
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
  expect(state instanceof SelectionState).toMatchSnapshot();
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

test('is false for non-edge block keys', () => {
  expect(COLLAPSED.hasEdgeWithin('b', 0, 0)).toMatchSnapshot();
  expect(WITHIN_BLOCK.hasEdgeWithin('b', 0, 0)).toMatchSnapshot();
  expect(MULTI_BLOCK.hasEdgeWithin('d', 0, 0)).toMatchSnapshot();
});

test('is false if offset is outside the selection range', () => {
  expect(COLLAPSED.hasEdgeWithin('a', 1, 1)).toMatchSnapshot();
  expect(WITHIN_BLOCK.hasEdgeWithin('a', 1, 1)).toMatchSnapshot();
  expect(MULTI_BLOCK.hasEdgeWithin('b', 1, 1)).toMatchSnapshot();
});

test('is true if key match and offset equals selection edge', () => {
  expect(COLLAPSED.hasEdgeWithin('a', 0, 1)).toMatchSnapshot();
  expect(WITHIN_BLOCK.hasEdgeWithin('a', 10, 15)).toMatchSnapshot();
  expect(WITHIN_BLOCK.hasEdgeWithin('a', 15, 20)).toMatchSnapshot();
  expect(MULTI_BLOCK.hasEdgeWithin('b', 10, 20)).toMatchSnapshot();
  expect(MULTI_BLOCK.hasEdgeWithin('c', 15, 20)).toMatchSnapshot();
});

test('is true if selection range is entirely within test range', () => {
  expect(
    getSample('COLLAPSED', {
      anchorOffset: 5,
      focusOffset: 5,
    }).hasEdgeWithin('a', 0, 10),
  ).toMatchSnapshot();
  expect(WITHIN_BLOCK.hasEdgeWithin('a', 0, 40)).toMatchSnapshot();
});

test('is true if selection range edge overlaps test range', () => {
  expect(WITHIN_BLOCK.hasEdgeWithin('a', 5, 15)).toMatchSnapshot();
  expect(WITHIN_BLOCK.hasEdgeWithin('a', 15, 25)).toMatchSnapshot();
  expect(MULTI_BLOCK.hasEdgeWithin('b', 5, 20)).toMatchSnapshot();
  expect(MULTI_BLOCK.hasEdgeWithin('c', 5, 20)).toMatchSnapshot();
});

test('detects collapsed selection properly', () => {
  expect(COLLAPSED.isCollapsed()).toMatchSnapshot();
  expect(WITHIN_BLOCK.isCollapsed()).toMatchSnapshot();
  expect(MULTI_BLOCK.isCollapsed()).toMatchSnapshot();
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
