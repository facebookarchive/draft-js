/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @oncall draft_js
 */

'use strict';

jest.mock('generateRandomKey');

import type {RawDraftContentState} from 'RawDraftContentState';

const convertFromRawToDraftState = require('convertFromRawToDraftState');
const mockUUID = require('mockUUID');

const toggleExperimentalTreeDataSupport = (enabled: boolean) => {
  jest.doMock('gkx', () => name => {
    return name === 'draft_tree_data_support' ? enabled : false;
  });
};

const assertDraftState = (rawState: RawDraftContentState) => {
  expect(
    convertFromRawToDraftState(rawState).getBlockMap().toJS(),
  ).toMatchSnapshot();
};

beforeEach(() => {
  jest.resetModules();
  jest.mock('uuid', () => mockUUID);
});

test('must map falsey block types to default value of unstyled', () => {
  const rawState = {
    blocks: [
      {
        key: 'A',
        text: 'AAAA',
        depth: 0,
        entityRanges: [],
        inlineStyleRanges: [],
      },
      {
        key: 'B',
        text: 'BBBB',
        type: null,
        depth: 0,
        entityRanges: [],
        inlineStyleRanges: [],
      },
      {
        key: 'C',
        text: 'CCCC',
        type: undefined,
        depth: 0,
        entityRanges: [],
        inlineStyleRanges: [],
      },
    ],
    entityMap: {},
  };

  // $FlowFixMe looks like the whole point of the test is to verify something prevented by flow? Let it be for now.
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
        mutability: 'IMMUTABLE',
        type: 'IMAGE',
      },
    },
  };

  assertDraftState(rawState);
});

test('must convert from raw tree draft to raw content state when experimentalTreeDataSupport is disabled', () => {
  const rawState = {
    blocks: [
      {
        key: 'A',
        text: '',
        entityRanges: [],
        inlineStyleRanges: [],
        type: 'unstyled',
        depth: 0,
        children: [
          {
            key: 'B',
            text: '',
            entityRanges: [],
            inlineStyleRanges: [],
            type: 'unstyled',
            depth: 0,
            children: [
              {
                key: 'C',
                text: 'left block',
                entityRanges: [],
                inlineStyleRanges: [],
                type: 'unstyled',
                depth: 0,
                children: [],
              },
              {
                key: 'D',
                text: 'right block',
                entityRanges: [],
                inlineStyleRanges: [],
                type: 'unstyled',
                depth: 0,
                children: [],
              },
            ],
          },
          {
            key: 'E',
            type: 'header-one',
            text: 'This is a tree based document!',
            entityRanges: [],
            inlineStyleRanges: [],
            depth: 0,
            children: [],
          },
        ],
      },
    ],
    entityMap: {},
  };

  assertDraftState(rawState);
});

test('convert from raw tree draft content state', () => {
  toggleExperimentalTreeDataSupport(true);
  const rawState = {
    blocks: [
      {
        key: 'A',
        text: '',
        entityRanges: [],
        depth: 0,
        inlineStyleRanges: [],
        type: 'unstyled',
        children: [
          {
            key: 'B',
            text: '',
            entityRanges: [],
            depth: 0,
            inlineStyleRanges: [],
            type: 'unstyled',
            children: [
              {
                key: 'C',
                text: 'left block',
                entityRanges: [],
                depth: 0,
                inlineStyleRanges: [],
                type: 'unstyled',
                children: [],
              },
              {
                key: 'D',
                text: 'right block',
                entityRanges: [],
                depth: 0,
                inlineStyleRanges: [],
                type: 'unstyled',
                children: [],
              },
            ],
          },
          {
            key: 'E',
            type: 'header-one',
            text: 'This is a tree based document!',
            entityRanges: [],
            depth: 0,
            inlineStyleRanges: [],
            children: [],
          },
        ],
      },
    ],
    entityMap: {},
  };

  assertDraftState(rawState);
});

test('must be able to convert from raw state to tree state when experimentalTreeDataSupport is enabled', () => {
  toggleExperimentalTreeDataSupport(true);
  const rawState = {
    blocks: [
      {
        key: 'A',
        text: 'AAAA',
        entityRanges: [],
        type: 'unstyled',
        inlineStyleRanges: [],
        depth: 0,
      },
      {
        key: 'B',
        text: 'BBBB',
        entityRanges: [],
        type: 'unstyled',
        inlineStyleRanges: [],
        depth: 0,
      },
      {
        key: 'C',
        text: 'CCCC',
        entityRanges: [],
        type: 'unstyled',
        inlineStyleRanges: [],
        depth: 0,
      },
    ],
    entityMap: {},
  };

  assertDraftState(rawState);
});

test('must be able to convert content blocks that have list with depth from raw state to tree state when experimentalTreeDataSupport is enabled', () => {
  toggleExperimentalTreeDataSupport(true);
  const rawState = {
    blocks: [
      {
        key: 'A',
        type: 'ordered-list-item',
        depth: 0,
        text: '',
        entityRanges: [],
        inlineStyleRanges: [],
      },
      {
        key: 'B',
        type: 'ordered-list-item',
        depth: 1,
        text: '',
        entityRanges: [],
        inlineStyleRanges: [],
      },
      {
        key: 'C',
        type: 'ordered-list-item',
        depth: 2,
        text: 'deeply nested list',
        entityRanges: [],
        inlineStyleRanges: [],
      },
    ],
    entityMap: {},
  };

  assertDraftState(rawState);
});

test('ignore empty children array', () => {
  const rawState = {
    blocks: [
      {
        key: 'A',
        type: 'ordered-list-item',
        depth: 0,
        text: 'A',
        entityRanges: [],
        inlineStyleRanges: [],
      },
      {
        key: 'B',
        type: 'ordered-list-item',
        depth: 0,
        text: 'B',
        entityRanges: [],
        inlineStyleRanges: [],
      },
      {
        key: 'C',
        type: 'ordered-list-item',
        depth: 0,
        text: 'C',
        children: [],
        entityRanges: [],
        inlineStyleRanges: [],
      },
    ],
    entityMap: {},
  };

  assertDraftState(rawState);
});

test('ignore empty children array for tree conversion 1', () => {
  const rawState = {
    blocks: [
      {
        key: 'A',
        type: 'ordered-list-item',
        depth: 0,
        text: 'A',
        entityRanges: [],
        inlineStyleRanges: [],
      },
      {
        key: 'B',
        type: 'ordered-list-item',
        depth: 0,
        text: 'B',
        entityRanges: [],
        inlineStyleRanges: [],
      },
      {
        key: 'C',
        type: 'ordered-list-item',
        depth: 0,
        text: 'C',
        children: [],
        entityRanges: [],
        inlineStyleRanges: [],
      },
    ],
    entityMap: {},
  };
  assertDraftState(rawState);
});

test('ignore empty children array for tree conversion 2', () => {
  toggleExperimentalTreeDataSupport(true);
  const rawState = {
    blocks: [
      {
        key: 'A',
        type: 'ordered-list-item',
        depth: 0,
        text: 'A',
        entityRanges: [],
        inlineStyleRanges: [],
      },
      {
        key: 'B',
        type: 'ordered-list-item',
        depth: 0,
        text: 'B',
        entityRanges: [],
        inlineStyleRanges: [],
      },
      {
        key: 'C',
        type: 'ordered-list-item',
        depth: 0,
        text: 'C',
        children: [],
        entityRanges: [],
        inlineStyleRanges: [],
      },
    ],
    entityMap: {},
  };
  assertDraftState(rawState);
});
