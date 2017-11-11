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

const convertFromRawToDraftState = require('convertFromRawToDraftState');

const assertDraftState = (rawState, expected) => {
  expect(
    convertFromRawToDraftState(rawState)
      .getBlockMap()
      .toJS(),
  ).toMatchSnapshot();
};

test('must map falsey block types to default value of unstyled', () => {
  const rawState = {
    blocks: [
      {key: 'A', text: 'AAAA'},
      {key: 'B', text: 'BBBB', type: null},
      {key: 'C', text: 'CCCC', type: undefined},
    ],
    entityMap: {},
  };

  assertDraftState(rawState);
});

test('must be able to convert from styled blocks and entities mapped raw state', () => {
  const rawState = {
    blocks: [
      {
        data: {},
        depth: 0,
        entityRanges: [],
        inlineStyleRanges: [],
        key: 'a',
        text: 'Alpha',
        type: 'unstyled',
      },
      {
        data: {},
        depth: 0,
        entityRanges: [
          {
            key: 0,
            length: 5,
            offset: 0,
          },
        ],
        inlineStyleRanges: [
          {
            length: 5,
            offset: 0,
            style: 'BOLD',
          },
        ],
        key: 'b',
        text: 'Bravo',
        type: 'unordered-list-item',
      },
      {
        data: {},
        depth: 0,
        entityRanges: [],
        inlineStyleRanges: [
          {
            length: 7,
            offset: 0,
            style: 'ITALIC',
          },
        ],
        key: 'c',
        text: 'Charlie',
        type: 'blockquote',
      },
    ],
    entityMap: {
      '0': {
        data: {},
        mutability: undefined,
        type: {
          data: null,
          mutability: 'IMMUTABLE',
          type: 'IMAGE',
        },
      },
    },
  };

  assertDraftState(rawState);
});

test('convert from raw tree draft content state', () => {
  const rawState = {
    blocks: [
      {
        key: 'A',
        text: '',
        children: [
          {
            key: 'B',
            text: '',
            children: [
              {key: 'C', text: 'left block', children: []},
              {key: 'D', text: 'right block', children: []},
            ],
          },
          {
            key: 'E',
            type: 'header-one',
            text: 'This is a tree based document!',
            children: [],
          },
        ],
      },
    ],
    entityMap: {},
  };

  assertDraftState(rawState);
});
