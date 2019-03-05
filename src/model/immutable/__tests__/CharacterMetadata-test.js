/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+draft_js
 * @flow strict-local
 * @format
 */

'use strict';

jest.disableAutomock();

const CharacterMetadata = require('CharacterMetadata');
const {BOLD, BOLD_ITALIC, NONE, UNDERLINE} = require('SampleDraftInlineStyle');

const plain = CharacterMetadata.create();
const bold = CharacterMetadata.create({style: BOLD});
const fancy = CharacterMetadata.create({style: BOLD_ITALIC});

const withoutEntity = CharacterMetadata.create();
const withEntity = CharacterMetadata.create({entity: 'a'});

const withStyleAndEntity = CharacterMetadata.create({
  entity: 'a',
  style: BOLD,
});

test('must have appropriate default values', () => {
  const character = CharacterMetadata.create();
  expect(character.toJS()).toMatchSnapshot();
  expect(character.getStyle().size).toMatchSnapshot();
  expect(character.getEntity()).toMatchSnapshot();
});

test('must run `hasStyle` correctly', () => {
  expect(plain.hasStyle('BOLD')).toMatchSnapshot();
  expect(bold.hasStyle('BOLD')).toMatchSnapshot();
  expect(fancy.hasStyle('BOLD')).toMatchSnapshot();
  expect(plain.hasStyle('ITALIC')).toMatchSnapshot();
  expect(bold.hasStyle('ITALIC')).toMatchSnapshot();
  expect(fancy.hasStyle('ITALIC')).toMatchSnapshot();
});

test('must apply style', () => {
  const newlyBold = CharacterMetadata.applyStyle(plain, 'BOLD');
  expect(newlyBold.hasStyle('BOLD')).toMatchSnapshot();
  const alsoItalic = CharacterMetadata.applyStyle(newlyBold, 'ITALIC');
  expect(alsoItalic.hasStyle('BOLD')).toMatchSnapshot();
  expect(alsoItalic.hasStyle('ITALIC')).toMatchSnapshot();
});

test('must remove style', () => {
  const justBold = CharacterMetadata.removeStyle(fancy, 'ITALIC');
  expect(justBold.hasStyle('BOLD')).toMatchSnapshot();
  expect(justBold.hasStyle('ITALIC')).toMatchSnapshot();
  const justPlain = CharacterMetadata.removeStyle(justBold, 'BOLD');
  expect(justPlain.hasStyle('BOLD')).toMatchSnapshot();
  expect(justPlain.hasStyle('ITALIC')).toMatchSnapshot();
});

test('must apply entity correctly', () => {
  const newKey = 'x';
  const modifiedA = CharacterMetadata.applyEntity(withoutEntity, newKey);
  const modifiedB = CharacterMetadata.applyEntity(withEntity, newKey);
  expect(modifiedA.getEntity()).toMatchSnapshot();
  expect(modifiedB.getEntity()).toMatchSnapshot();
});

test('must remove entity correctly', () => {
  const modifiedA = CharacterMetadata.applyEntity(withoutEntity, null);
  const modifiedB = CharacterMetadata.applyEntity(withEntity, null);
  expect(modifiedA.getEntity()).toMatchSnapshot();
  expect(modifiedB.getEntity()).toMatchSnapshot();
});

test('must reuse the same objects', () => {
  expect(CharacterMetadata.create() === plain).toMatchSnapshot();
  expect(CharacterMetadata.create({style: BOLD}) === bold).toMatchSnapshot();
  expect(
    CharacterMetadata.create({style: BOLD_ITALIC}) === fancy,
  ).toMatchSnapshot();
  expect(
    CharacterMetadata.create({entity: 'a'}) === withEntity,
  ).toMatchSnapshot();
  expect(
    CharacterMetadata.create({entity: 'a', style: BOLD}) === withStyleAndEntity,
  ).toMatchSnapshot();
});

test('must reuse objects by defaulting config properties', () => {
  expect(
    CharacterMetadata.create({style: NONE, entity: 'a'}) === withEntity,
  ).toMatchSnapshot();

  expect(
    CharacterMetadata.create({style: BOLD, entity: null}) === bold,
  ).toMatchSnapshot();

  const underlined = CharacterMetadata.create({
    style: UNDERLINE,
    entity: null,
  });

  expect(
    CharacterMetadata.create({style: UNDERLINE}) === underlined,
  ).toMatchSnapshot();
});
