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
  const rawState = {
    blocks: [
      {
        key: 'A',
        type: 'ordered-list-item',
        text: 'Alpha',
        children: [
          {
            key: 'B',
            text: 'Beta',
            type: 'ordered-list-item',
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
        children: [
          {
            key: 'B',
            text: 'Beta',
            type: 'ordered-list-item',
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
