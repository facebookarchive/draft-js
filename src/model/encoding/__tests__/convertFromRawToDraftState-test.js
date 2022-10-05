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

import type {EntityRange} from 'EntityRange';
import type {InlineStyleRange} from 'InlineStyleRange';
import type {RawDraftContentBlock} from 'RawDraftContentBlock';
import type {RawDraftContentState} from 'RawDraftContentState';

const convertFromRawToDraftState = require('convertFromRawToDraftState');
const mockUUID = require('mockUUID');

jest.mock('generateRandomKey');

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
        entityRanges: ([]: Array<EntityRange>),
        inlineStyleRanges: ([]: Array<InlineStyleRange>),
      },
      {
        key: 'B',
        text: 'BBBB',
        type: null,
        depth: 0,
        entityRanges: ([]: Array<EntityRange>),
        inlineStyleRanges: ([]: Array<InlineStyleRange>),
      },
      {
        key: 'C',
        text: 'CCCC',
        type: undefined,
        depth: 0,
        entityRanges: ([]: Array<EntityRange>),
        inlineStyleRanges: ([]: Array<InlineStyleRange>),
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
        entityRanges: ([]: Array<EntityRange>),
        inlineStyleRanges: ([]: Array<InlineStyleRange>),
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
        entityRanges: ([]: Array<EntityRange>),
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
        entityRanges: ([]: Array<EntityRange>),
        inlineStyleRanges: ([]: Array<InlineStyleRange>),
        type: 'unstyled',
        depth: 0,
        children: [
          {
            key: 'B',
            text: '',
            entityRanges: ([]: Array<EntityRange>),
            inlineStyleRanges: ([]: Array<InlineStyleRange>),
            type: 'unstyled',
            depth: 0,
            children: [
              {
                key: 'C',
                text: 'left block',
                entityRanges: ([]: Array<EntityRange>),
                inlineStyleRanges: ([]: Array<InlineStyleRange>),
                type: 'unstyled',
                depth: 0,
                children: ([]: Array<RawDraftContentBlock>),
              },
              {
                key: 'D',
                text: 'right block',
                entityRanges: ([]: Array<EntityRange>),
                inlineStyleRanges: ([]: Array<InlineStyleRange>),
                type: 'unstyled',
                depth: 0,
                children: ([]: Array<RawDraftContentBlock>),
              },
            ],
          },
          {
            key: 'E',
            type: 'header-one',
            text: 'This is a tree based document!',
            entityRanges: ([]: Array<EntityRange>),
            inlineStyleRanges: ([]: Array<InlineStyleRange>),
            depth: 0,
            children: ([]: Array<RawDraftContentBlock>),
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
        entityRanges: ([]: Array<EntityRange>),
        depth: 0,
        inlineStyleRanges: ([]: Array<InlineStyleRange>),
        type: 'unstyled',
        children: [
          {
            key: 'B',
            text: '',
            entityRanges: ([]: Array<EntityRange>),
            depth: 0,
            inlineStyleRanges: ([]: Array<InlineStyleRange>),
            type: 'unstyled',
            children: [
              {
                key: 'C',
                text: 'left block',
                entityRanges: ([]: Array<EntityRange>),
                depth: 0,
                inlineStyleRanges: ([]: Array<InlineStyleRange>),
                type: 'unstyled',
                children: ([]: Array<RawDraftContentBlock>),
              },
              {
                key: 'D',
                text: 'right block',
                entityRanges: ([]: Array<EntityRange>),
                depth: 0,
                inlineStyleRanges: ([]: Array<InlineStyleRange>),
                type: 'unstyled',
                children: ([]: Array<RawDraftContentBlock>),
              },
            ],
          },
          {
            key: 'E',
            type: 'header-one',
            text: 'This is a tree based document!',
            entityRanges: ([]: Array<EntityRange>),
            depth: 0,
            inlineStyleRanges: ([]: Array<InlineStyleRange>),
            children: ([]: Array<RawDraftContentBlock>),
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
        entityRanges: ([]: Array<EntityRange>),
        type: 'unstyled',
        inlineStyleRanges: ([]: Array<InlineStyleRange>),
        depth: 0,
      },
      {
        key: 'B',
        text: 'BBBB',
        entityRanges: ([]: Array<EntityRange>),
        type: 'unstyled',
        inlineStyleRanges: ([]: Array<InlineStyleRange>),
        depth: 0,
      },
      {
        key: 'C',
        text: 'CCCC',
        entityRanges: ([]: Array<EntityRange>),
        type: 'unstyled',
        inlineStyleRanges: ([]: Array<InlineStyleRange>),
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
        entityRanges: ([]: Array<EntityRange>),
        inlineStyleRanges: ([]: Array<InlineStyleRange>),
      },
      {
        key: 'B',
        type: 'ordered-list-item',
        depth: 1,
        text: '',
        entityRanges: ([]: Array<EntityRange>),
        inlineStyleRanges: ([]: Array<InlineStyleRange>),
      },
      {
        key: 'C',
        type: 'ordered-list-item',
        depth: 2,
        text: 'deeply nested list',
        entityRanges: ([]: Array<EntityRange>),
        inlineStyleRanges: ([]: Array<InlineStyleRange>),
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
        entityRanges: ([]: Array<EntityRange>),
        inlineStyleRanges: ([]: Array<InlineStyleRange>),
      },
      {
        key: 'B',
        type: 'ordered-list-item',
        depth: 0,
        text: 'B',
        entityRanges: ([]: Array<EntityRange>),
        inlineStyleRanges: ([]: Array<InlineStyleRange>),
      },
      {
        key: 'C',
        type: 'ordered-list-item',
        depth: 0,
        text: 'C',
        children: ([]: Array<RawDraftContentBlock>),
        entityRanges: ([]: Array<EntityRange>),
        inlineStyleRanges: ([]: Array<InlineStyleRange>),
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
        entityRanges: ([]: Array<EntityRange>),
        inlineStyleRanges: ([]: Array<InlineStyleRange>),
      },
      {
        key: 'B',
        type: 'ordered-list-item',
        depth: 0,
        text: 'B',
        entityRanges: ([]: Array<EntityRange>),
        inlineStyleRanges: ([]: Array<InlineStyleRange>),
      },
      {
        key: 'C',
        type: 'ordered-list-item',
        depth: 0,
        text: 'C',
        children: ([]: Array<RawDraftContentBlock>),
        entityRanges: ([]: Array<EntityRange>),
        inlineStyleRanges: ([]: Array<InlineStyleRange>),
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
        entityRanges: ([]: Array<EntityRange>),
        inlineStyleRanges: ([]: Array<InlineStyleRange>),
      },
      {
        key: 'B',
        type: 'ordered-list-item',
        depth: 0,
        text: 'B',
        entityRanges: ([]: Array<EntityRange>),
        inlineStyleRanges: ([]: Array<InlineStyleRange>),
      },
      {
        key: 'C',
        type: 'ordered-list-item',
        depth: 0,
        text: 'C',
        children: ([]: Array<RawDraftContentBlock>),
        entityRanges: ([]: Array<EntityRange>),
        inlineStyleRanges: ([]: Array<InlineStyleRange>),
      },
    ],
    entityMap: {},
  };
  assertDraftState(rawState);
});
