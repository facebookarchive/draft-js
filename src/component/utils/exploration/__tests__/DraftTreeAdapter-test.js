/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+draft_js
 * @format
 */

'use strict';

jest.disableAutomock();

jest.mock('generateRandomKey');

const DraftTreeAdapter = require('DraftTreeAdapter');

const assertFromRawTreeStateToRawState = rawState => {
  expect(
    DraftTreeAdapter.fromRawTreeStateToRawState(rawState),
  ).toMatchSnapshot();
};

const assertFromRawStateToRawTreeState = rawState => {
  expect(
    DraftTreeAdapter.fromRawStateToRawTreeState(rawState),
  ).toMatchSnapshot();
};

test('must be able to convert from tree raw state with only root blocks to raw state', () => {
  const rawState = {
    blocks: [
      {
        key: 'A',
        text: 'Alpha',
        children: [],
      },
      {
        key: 'B',
        text: 'Beta',
        children: [],
      },
    ],
    entityMap: {},
  };

  assertFromRawTreeStateToRawState(rawState);
});

test('must be able to convert from tree raw state with nested blocks to raw state', () => {
  // Right now, we ignore non-list nested blocks
  const rawState = {
    blocks: [
      {
        key: 'A',
        type: 'blockquote',
        text: '',
        children: [
          {
            key: 'B',
            text: 'Beta',
            type: 'header-one',
            children: [],
          },
          {
            key: 'C',
            text: 'Charlie',
            type: 'header-two',
            children: [],
          },
        ],
      },
    ],
    entityMap: {},
  };

  assertFromRawTreeStateToRawState(rawState);
});

test('must be able to convert from tree raw state with nested list blocks to raw state preserving lists depth', () => {
  /**
   * 1. Alpha
   *   a. Beta
   *     i. Charlie
   *   b. Delta
   */
  const rawState = {
    blocks: [
      {
        key: 'A',
        type: 'ordered-list-item',
        text: 'Alpha',
        children: [],
      },
      {
        key: 'X',
        text: '',
        type: 'ordered-list-item',
        children: [
          {
            key: 'B',
            type: 'ordered-list-item',
            text: 'Beta',
            children: [],
          },
          {
            key: 'Y',
            type: 'ordered-list-item',
            text: '',
            children: [
              {
                key: 'C',
                text: 'Charlie',
                type: 'ordered-list-item',
                children: [],
              },
            ],
          },
          {
            key: 'D',
            text: 'Delta',
            type: 'ordered-list-item',
            children: [],
          },
        ],
      },
    ],
    entityMap: {},
  };

  assertFromRawTreeStateToRawState(rawState);
});

test('must be able to convert from tree raw state with nested list blocks to raw state preserving lists depth only if type matches', () => {
  const rawState = {
    blocks: [
      {
        key: 'A',
        type: 'ordered-list-item',
        text: 'Alpha',
        children: [],
      },
      {
        key: 'X',
        type: 'ordered-list-item',
        text: '',
        children: [
          {
            key: 'B',
            text: 'Beta',
            type: 'ordered-list-item',
            children: [],
          },
          {
            key: 'Y',
            type: 'ordered-list-item',
            text: '',
            children: [
              {
                key: 'C',
                text: 'Charlie',
                type: 'unordered-list-item',
                children: [],
              },
            ],
          },
        ],
      },
    ],
    entityMap: {},
  };

  assertFromRawTreeStateToRawState(rawState);
});

test('must be able to convert from raw state to raw tree state', () => {
  const rawState = {
    blocks: [
      {
        key: 'A',
        text: 'Alpha',
      },
      {
        key: 'B',
        text: 'Beta',
      },
      {
        key: 'C',
        text: 'Charlie',
      },
    ],
    entityMap: {},
  };

  assertFromRawStateToRawTreeState(rawState);
});

test('must be able to convert from raw state to raw tree state with nested trees based on lists depth', () => {
  const rawState = {
    blocks: [
      {
        key: 'A',
        text: 'Alpha',
        type: 'ordered-list-item',
        depth: 0,
      },
      {
        key: 'B',
        text: 'Beta',
        type: 'ordered-list-item',
        depth: 1,
      },
      {
        key: 'C',
        text: 'Charlie',
        type: 'ordered-list-item',
        depth: 2,
      },
      {
        key: 'D',
        text: 'Delta',
        type: 'ordered-list-item',
        depth: 1,
      },
    ],
    entityMap: {},
  };

  assertFromRawStateToRawTreeState(rawState);
});

test('must be able to convert from raw state to raw tree state with nested trees based on lists depth and attach nested blocks to closest depth parent', () => {
  const rawState = {
    blocks: [
      {
        key: 'A',
        text: 'Alpha',
        type: 'ordered-list-item',
        depth: 0,
      },
      {
        key: 'B',
        text: 'Beta',
        type: 'ordered-list-item',
        depth: 1,
      },
      {
        key: 'C',
        text: 'Charlie',
        type: 'ordered-list-item',
        depth: 1,
      },
      {
        key: 'D',
        text: 'Delta',
        type: 'ordered-list-item',
        depth: 2,
      },
    ],
    entityMap: {},
  };

  assertFromRawStateToRawTreeState(rawState);
});

test('must be able to convert from raw state to raw tree state with nested trees of various depths', () => {
  const rawState = {
    blocks: [
      {
        key: 'A',
        text: 'alpha',
        type: 'unordered-list-item',
        depth: 0,
      },
      {
        key: 'B',
        text: 'beta',
        type: 'unordered-list-item',
        depth: 1,
      },
      {
        key: 'C',
        text: 'charlie',
        type: 'unordered-list-item',
        depth: 1,
      },
      {
        key: 'D',
        text: 'delta',
        type: 'unordered-list-item',
        depth: 2,
      },
      {
        key: 'E',
        text: 'epsilon',
        type: 'unordered-list-item',
        depth: 1,
      },
      {
        key: 'F',
        text: 'foo',
        type: 'unordered-list-item',
        depth: 2,
      },
      {
        key: 'G',
        text: 'gamma',
        type: 'unordered-list-item',
        depth: 3,
      },
      {
        key: 'H',
        text: 'house',
        type: 'unordered-list-item',
        depth: 1,
      },
      {
        key: 'I',
        text: 'iota',
        type: 'unordered-list-item',
        depth: 0,
      },
    ],
    entityMap: {},
  };

  assertFromRawStateToRawTreeState(rawState);
});
