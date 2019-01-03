/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+draft_js
 * @format
 * @flow strict-local
 */

'use strict';

jest.disableAutomock();

const BlockMapBuilder = require('BlockMapBuilder');
const CharacterMetadata = require('CharacterMetadata');
const ContentBlock = require('ContentBlock');
const ContentBlockNode = require('ContentBlockNode');
const ContentState = require('ContentState');
const DraftEntityInstance = require('DraftEntityInstance');

const convertFromDraftStateToRaw = require('convertFromDraftStateToRaw');
const getSampleStateForTesting = require('getSampleStateForTesting');
const Immutable = require('immutable');

const {contentState} = getSampleStateForTesting();

const treeContentState = contentState.set(
  'blockMap',
  BlockMapBuilder.createFromArray([
    new ContentBlockNode({
      key: 'A',
      children: Immutable.List.of('B', 'E'),
    }),
    new ContentBlockNode({
      parent: 'A',
      key: 'B',
      nextSibling: 'C',
      children: Immutable.List.of('C', 'D'),
    }),
    new ContentBlockNode({
      parent: 'B',
      key: 'C',
      text: 'left block',
      nextSibling: 'D',
    }),
    new ContentBlockNode({
      parent: 'B',
      key: 'D',
      text: 'right block',
      prevSibling: 'C',
    }),
    new ContentBlockNode({
      parent: 'A',
      key: 'E',
      text: 'This is a tree based document!',
      type: 'header-one',
      prevSibling: 'B',
    }),
  ]),
);

const getMetadata = entityKey =>
  Immutable.Repeat(CharacterMetadata.create({entity: entityKey}), 5);
const getLink = entityKey =>
  new DraftEntityInstance({
    type: 'LINK',
    mutabiltity: 'MUTABLE',
    data: {
      url: `www.${entityKey}.com`,
    },
  });
// We start numbering our entities with '2' because getSampleStateForTesting
// already created an entity with key '1'.
const contentStateWithNonContiguousEntities = ContentState.createFromBlockArray(
  [
    new ContentBlock({
      key: 'a',
      type: 'unstyled',
      text: 'link2 link2 link3',
      characterList: getMetadata('2')
        .toList()
        .push(CharacterMetadata.EMPTY)
        .concat(getMetadata('2'))
        .push(CharacterMetadata.EMPTY)
        .concat(getMetadata('3')),
    }),
    new ContentBlock({
      key: 'b',
      type: 'unstyled',
      text: 'link4 link2 link5',
      characterList: getMetadata('4')
        .toList()
        .push(CharacterMetadata.EMPTY)
        .concat(getMetadata('2'))
        .push(CharacterMetadata.EMPTY)
        .concat(getMetadata('5')),
    }),
  ],
)
  .addEntity(getLink('2'))
  .addEntity(getLink('3'))
  .addEntity(getLink('4'))
  .addEntity(getLink('5'));

const assertConvertFromDraftStateToRaw = content => {
  expect(convertFromDraftStateToRaw(content)).toMatchSnapshot();
};

test('must be able to convert from draft state with ContentBlock to raw', () => {
  assertConvertFromDraftStateToRaw(contentState);
});

test('must be able to convert from draft state with ContentBlockNode to raw', () => {
  assertConvertFromDraftStateToRaw(treeContentState);
});

test('must be able to convert from draft state with noncontiguous entities to raw', () => {
  assertConvertFromDraftStateToRaw(contentStateWithNonContiguousEntities);
});
