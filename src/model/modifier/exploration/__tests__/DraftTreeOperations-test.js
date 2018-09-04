/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+draft_js
 * @flow strict-local
 * @format
 */

'use strict';

jest.disableAutomock();

const ContentBlockNode = require('ContentBlockNode');
const DraftTreeOperations = require('DraftTreeOperations');

const Immutable = require('immutable');
const blockMap1 = Immutable.OrderedMap({
  A: new ContentBlockNode({
    key: 'A',
    parent: null,
    text: 'alpha',
    children: Immutable.List([]),
    prevSibling: null,
    nextSibling: 'X',
  }),
  X: new ContentBlockNode({
    key: 'X',
    parent: null,
    text: '',
    children: Immutable.List(['B', 'C']),
    prevSibling: 'A',
    nextSibling: 'D',
  }),
  B: new ContentBlockNode({
    key: 'B',
    parent: 'X',
    text: 'beta',
    children: Immutable.List([]),
    prevSibling: null,
    nextSibling: 'C',
  }),
  C: new ContentBlockNode({
    key: 'C',
    parent: 'X',
    text: 'charlie',
    children: Immutable.List([]),
    prevSibling: 'B',
    nextSibling: null,
  }),
  D: new ContentBlockNode({
    key: 'D',
    parent: null,
    text: 'delta',
    children: Immutable.List([]),
    prevSibling: 'X',
    nextSibling: null,
  }),
});

test('test adding a last child to parent', () => {
  let newBlockMap = DraftTreeOperations.updateParentChild(
    blockMap1,
    'X',
    'D',
    'last',
  );
  newBlockMap = newBlockMap.merge({
    X: newBlockMap.get('X').merge({
      nextSibling: null,
    }),
  });
  expect(newBlockMap).toMatchSnapshot();
});

test('test adding a first child to parent', () => {
  let newBlockMap = DraftTreeOperations.updateParentChild(
    blockMap1,
    'X',
    'D',
    'first',
  );
  newBlockMap = newBlockMap.merge({
    X: newBlockMap.get('X').merge({
      nextSibling: null,
    }),
  });
  expect(newBlockMap).toMatchSnapshot();
});

test('test adding a sibling', () => {
  let newBlockMap = DraftTreeOperations.updateSibling(blockMap1, 'D', 'C');
  newBlockMap = newBlockMap.merge({
    B: newBlockMap.get('B').merge({
      nextSibling: null,
    }),
    C: newBlockMap.get('C').merge({
      parent: null,
    }),
    X: newBlockMap.get('X').merge({
      children: ['B'],
    }),
  });
  expect(newBlockMap).toMatchSnapshot();
});

const blockMap2 = Immutable.OrderedMap({
  A: new ContentBlockNode({
    key: 'A',
    parent: null,
    text: 'alpha',
    children: Immutable.List([]),
    prevSibling: null,
    nextSibling: 'X',
  }),
  X: new ContentBlockNode({
    key: 'X',
    parent: null,
    text: '',
    children: Immutable.List([]),
    prevSibling: 'A',
    nextSibling: 'B',
  }),
  B: new ContentBlockNode({
    key: 'B',
    parent: null,
    text: 'beta',
    children: Immutable.List([]),
    prevSibling: 'X',
    nextSibling: 'C',
  }),
  C: new ContentBlockNode({
    key: 'C',
    parent: null,
    text: 'charlie',
    children: Immutable.List([]),
    prevSibling: 'B',
    nextSibling: null,
  }),
});

test('test adding an only child to parent', () => {
  let newBlockMap = DraftTreeOperations.updateParentChild(
    blockMap2,
    'X',
    'C',
    'first',
  );
  newBlockMap = newBlockMap.merge({
    B: newBlockMap.get('B').merge({
      nextSibling: null,
    }),
  });
  expect(newBlockMap).toMatchSnapshot();
});
