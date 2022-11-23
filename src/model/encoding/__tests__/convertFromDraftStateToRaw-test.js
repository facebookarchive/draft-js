/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall draft_js
 */

'use strict';

const BlockMapBuilder = require('BlockMapBuilder');
const CharacterMetadata = require('CharacterMetadata');
const ContentBlock = require('ContentBlock');
const ContentBlockNode = require('ContentBlockNode');
const ContentState = require('ContentState');
const DraftEntityInstance = require('DraftEntityInstance');

const convertFromDraftStateToRaw = require('convertFromDraftStateToRaw');
const getSampleStateForTesting = require('getSampleStateForTesting');
const Immutable = require('immutable');
const mockUUID = require('mockUUID');

jest.mock('uuid', () => jest.fn(mockUUID));

const {contentState} = getSampleStateForTesting();

const treeContentState = contentState.setBlockMap(
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

const getMetadata = (
  entityKey:
    | $TEMPORARY$string<'3'>
    | $TEMPORARY$string<'4'>
    | $TEMPORARY$string<'5'>
    | $TEMPORARY$string<'6'>,
) => Immutable.Repeat(CharacterMetadata.create({entity: entityKey}), 5);
const getLink = (
  entityKey:
    | $TEMPORARY$string<'3'>
    | $TEMPORARY$string<'4'>
    | $TEMPORARY$string<'5'>
    | $TEMPORARY$string<'6'>,
) =>
  new DraftEntityInstance({
    type: 'LINK',
    mutabiltity: 'MUTABLE',
    data: {
      url: `www.${entityKey}.com`,
    },
  });
// We start numbering our entities with '3' because getSampleStateForTesting
// already created an entity with key '2'.
const contentStateWithNonContiguousEntities = ContentState.createFromBlockArray(
  [
    new ContentBlock({
      key: 'a',
      type: 'unstyled',
      text: 'link2 link2 link3',
      characterList: getMetadata('3')
        .toList()
        .push(CharacterMetadata.EMPTY)
        .concat(getMetadata('4'))
        .push(CharacterMetadata.EMPTY)
        .concat(getMetadata('5')),
    }),
    new ContentBlock({
      key: 'b',
      type: 'unstyled',
      text: 'link4 link2 link5',
      characterList: getMetadata('5')
        .toList()
        .push(CharacterMetadata.EMPTY)
        .concat(getMetadata('3'))
        .push(CharacterMetadata.EMPTY)
        .concat(getMetadata('6')),
    }),
  ],
)
  .addEntity(getLink('3'))
  .addEntity(getLink('4'))
  .addEntity(getLink('5'))
  .addEntity(getLink('6'));

const assertConvertFromDraftStateToRaw = (content: ContentState) => {
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
