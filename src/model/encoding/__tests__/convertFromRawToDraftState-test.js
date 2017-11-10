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
  // https://github.com/facebook/draft-js/pull/1490
  // TODO: mitermayer - re-enable snapshot testing after PR [1490] is merged
  // expect(convertFromRawToDraftState(rawState).getBlockMap()).toMatchSnapshot();

  expect(
    convertFromRawToDraftState(rawState)
      .getBlockMap()
      .toJS(),
  ).toEqual(expected);
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

  assertDraftState(rawState, {
    A: {
      key: 'A',
      type: 'unstyled',
      text: 'AAAA',
      characterList: [
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
      ],
      depth: 0,
      data: {},
    },
    B: {
      key: 'B',
      type: 'unstyled',
      text: 'BBBB',
      characterList: [
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
      ],
      depth: 0,
      data: {},
    },
    C: {
      key: 'C',
      type: 'unstyled',
      text: 'CCCC',
      characterList: [
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
      ],
      depth: 0,
      data: {},
    },
  });
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

  assertDraftState(rawState, {
    a: {
      key: 'a',
      type: 'unstyled',
      text: 'Alpha',
      characterList: [
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
      ],
      depth: 0,
      data: {},
    },
    b: {
      key: 'b',
      type: 'unordered-list-item',
      text: 'Bravo',
      characterList: [
        {
          style: ['BOLD'],
          entity: '1',
        },
        {
          style: ['BOLD'],
          entity: '1',
        },
        {
          style: ['BOLD'],
          entity: '1',
        },
        {
          style: ['BOLD'],
          entity: '1',
        },
        {
          style: ['BOLD'],
          entity: '1',
        },
      ],
      depth: 0,
      data: {},
    },
    c: {
      key: 'c',
      type: 'blockquote',
      text: 'Charlie',
      characterList: [
        {
          style: ['ITALIC'],
          entity: null,
        },
        {
          style: ['ITALIC'],
          entity: null,
        },
        {
          style: ['ITALIC'],
          entity: null,
        },
        {
          style: ['ITALIC'],
          entity: null,
        },
        {
          style: ['ITALIC'],
          entity: null,
        },
        {
          style: ['ITALIC'],
          entity: null,
        },
        {
          style: ['ITALIC'],
          entity: null,
        },
      ],
      depth: 0,
      data: {},
    },
  });
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

  assertDraftState(rawState, {
    A: {
      parent: null,
      characterList: [],
      data: {},
      depth: 0,
      key: 'A',
      text: '',
      type: 'unstyled',
      children: ['B', 'E'],
      prevSibling: null,
      nextSibling: null,
    },
    B: {
      parent: 'A',
      characterList: [],
      data: {},
      depth: 0,
      key: 'B',
      text: '',
      type: 'unstyled',
      children: ['C', 'D'],
      prevSibling: null,
      nextSibling: 'E',
    },
    C: {
      parent: 'B',
      characterList: [
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
      ],
      data: {},
      depth: 0,
      key: 'C',
      text: 'left block',
      type: 'unstyled',
      children: [],
      prevSibling: null,
      nextSibling: 'D',
    },
    D: {
      parent: 'B',
      characterList: [
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
      ],
      data: {},
      depth: 0,
      key: 'D',
      text: 'right block',
      type: 'unstyled',
      children: [],
      prevSibling: 'C',
      nextSibling: null,
    },
    E: {
      parent: 'A',
      characterList: [
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
        {
          style: [],
          entity: null,
        },
      ],
      data: {},
      depth: 0,
      key: 'E',
      text: 'This is a tree based document!',
      type: 'header-one',
      children: [],
      prevSibling: 'B',
      nextSibling: null,
    },
  });
});
