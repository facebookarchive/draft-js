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

jest.mock('generateRandomKey');

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

test("test replacing a parent's child", () => {
  let newBlockMap = DraftTreeOperations.replaceParentChild(
    blockMap1,
    'X',
    'C',
    'D',
  );
  newBlockMap = DraftTreeOperations.updateSibling(newBlockMap, 'X', 'C');
  newBlockMap = DraftTreeOperations.updateSibling(newBlockMap, 'B', 'D');
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

const blockMap3 = Immutable.OrderedMap({
  A: new ContentBlockNode({
    key: 'A',
    parent: null,
    text: 'alpha',
    children: Immutable.List([]),
    prevSibling: null,
    nextSibling: 'B',
  }),
  B: new ContentBlockNode({
    key: 'B',
    parent: null,
    text: 'beta',
    children: Immutable.List([]),
    prevSibling: 'A',
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

test('test creating a new parent 1', () => {
  expect(DraftTreeOperations.createNewParent(blockMap3, 'B')).toMatchSnapshot();
});

test('test creating a new parent 2', () => {
  expect(DraftTreeOperations.createNewParent(blockMap1, 'C')).toMatchSnapshot();
});

test("test creating a updating node to become next sibling's child 1", () => {
  expect(
    DraftTreeOperations.updateAsSiblingsChild(blockMap1, 'A', 'next'),
  ).toMatchSnapshot();
});

const blockMap4 = Immutable.OrderedMap({
  A: new ContentBlockNode({
    key: 'A',
    parent: null,
    text: 'alpha',
    children: Immutable.List([]),
    prevSibling: null,
    nextSibling: 'B',
  }),
  B: new ContentBlockNode({
    key: 'B',
    parent: null,
    text: 'beta',
    children: Immutable.List([]),
    prevSibling: 'A',
    nextSibling: 'X',
  }),
  X: new ContentBlockNode({
    key: 'X',
    parent: null,
    text: '',
    children: Immutable.List(['C']),
    prevSibling: 'B',
    nextSibling: 'D',
  }),
  C: new ContentBlockNode({
    key: 'C',
    parent: 'X',
    text: 'charlie',
    children: Immutable.List([]),
    prevSibling: null,
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

test("test creating a updating node to become next sibling's child 2", () => {
  expect(
    DraftTreeOperations.updateAsSiblingsChild(blockMap4, 'B', 'next'),
  ).toMatchSnapshot();
});

const blockMap5 = Immutable.OrderedMap({
  X: new ContentBlockNode({
    key: 'X',
    parent: null,
    text: '',
    children: Immutable.List(['A', 'B', 'Y']),
    prevSibling: null,
    nextSibling: null,
  }),
  A: new ContentBlockNode({
    key: 'A',
    parent: 'X',
    text: 'alpha',
    children: Immutable.List([]),
    prevSibling: null,
    nextSibling: 'B',
  }),
  B: new ContentBlockNode({
    key: 'B',
    parent: 'X',
    text: 'beta',
    children: Immutable.List([]),
    prevSibling: 'A',
    nextSibling: 'Y',
  }),
  Y: new ContentBlockNode({
    key: 'Y',
    parent: 'X',
    text: '',
    children: Immutable.List(['C']),
    prevSibling: 'B',
    nextSibling: null,
  }),
  C: new ContentBlockNode({
    key: 'C',
    parent: 'Y',
    text: 'charlie',
    children: Immutable.List([]),
    prevSibling: null,
    nextSibling: null,
  }),
});

test("test creating a updating node to become next sibling's child 3", () => {
  expect(
    DraftTreeOperations.updateAsSiblingsChild(blockMap5, 'B', 'next'),
  ).toMatchSnapshot();
});

test("test creating a updating node to become previous sibling's child 1", () => {
  expect(
    DraftTreeOperations.updateAsSiblingsChild(blockMap1, 'D', 'previous'),
  ).toMatchSnapshot();
});

const blockMap6 = Immutable.OrderedMap({
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
    children: Immutable.List(['B']),
    prevSibling: 'A',
    nextSibling: 'C',
  }),
  B: new ContentBlockNode({
    key: 'B',
    parent: 'X',
    text: 'beta',
    children: Immutable.List([]),
    prevSibling: null,
    nextSibling: null,
  }),
  C: new ContentBlockNode({
    key: 'C',
    parent: null,
    text: 'charlie',
    children: Immutable.List([]),
    prevSibling: 'X',
    nextSibling: 'D',
  }),
  D: new ContentBlockNode({
    key: 'D',
    parent: null,
    text: 'delta',
    children: Immutable.List([]),
    prevSibling: 'C',
    nextSibling: null,
  }),
});

test("test creating a updating node to become previous sibling's child 2", () => {
  expect(
    DraftTreeOperations.updateAsSiblingsChild(blockMap6, 'C', 'previous'),
  ).toMatchSnapshot();
});
