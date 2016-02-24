/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+ui_infra
 */

'use strict';

jest.autoMockOff();

const CharacterMetadata = require('CharacterMetadata');
const {
  BOLD,
  BOLD_ITALIC,
  NONE,
  UNDERLINE,
} = require('SampleDraftInlineStyle');

describe('CharacterMetadata', () => {
  it('must have appropriate default values', () => {
    const character = CharacterMetadata.create();
    expect(character.getStyle().size).toBe(0);
    expect(character.getEntity()).toBe(null);
  });

  describe('Style handling', () => {
    const plain = CharacterMetadata.create();
    const bold = CharacterMetadata.create({style: BOLD});
    const fancy = CharacterMetadata.create({style: BOLD_ITALIC});

    it('must run `hasStyle` correctly', () => {
      expect(plain.hasStyle('BOLD')).toBe(false);
      expect(bold.hasStyle('BOLD')).toBe(true);
      expect(fancy.hasStyle('BOLD')).toBe(true);
      expect(plain.hasStyle('ITALIC')).toBe(false);
      expect(bold.hasStyle('ITALIC')).toBe(false);
      expect(fancy.hasStyle('ITALIC')).toBe(true);
    });

    it('must apply style', () => {
      const newlyBold = CharacterMetadata.applyStyle(plain, 'BOLD');
      expect(newlyBold.hasStyle('BOLD')).toBe(true);
      const alsoItalic = CharacterMetadata.applyStyle(newlyBold, 'ITALIC');
      expect(alsoItalic.hasStyle('BOLD')).toBe(true);
      expect(alsoItalic.hasStyle('ITALIC')).toBe(true);
    });

    it('must remove style', () => {
      const justBold = CharacterMetadata.removeStyle(fancy, 'ITALIC');
      expect(justBold.hasStyle('BOLD')).toBe(true);
      expect(justBold.hasStyle('ITALIC')).toBe(false);
      const justPlain = CharacterMetadata.removeStyle(justBold, 'BOLD');
      expect(justPlain.hasStyle('BOLD')).toBe(false);
      expect(justPlain.hasStyle('ITALIC')).toBe(false);
    });
  });

  describe('Entity handling', () => {
    const withoutEntity = CharacterMetadata.create();
    const withEntity = CharacterMetadata.create({entity: 'a'});

    it('must apply entity correctly', () => {
      const newKey = 'x';
      const modifiedA = CharacterMetadata.applyEntity(withoutEntity, newKey);
      const modifiedB = CharacterMetadata.applyEntity(withEntity, newKey);
      expect(modifiedA.getEntity()).toBe(newKey);
      expect(modifiedB.getEntity()).toBe(newKey);
    });

    it('must remove entity correctly', () => {
      const modifiedA = CharacterMetadata.applyEntity(withoutEntity, null);
      const modifiedB = CharacterMetadata.applyEntity(withEntity, null);
      expect(modifiedA.getEntity()).toBe(null);
      expect(modifiedB.getEntity()).toBe(null);
    });
  });

  describe('Metadata Reuse', () => {
    const empty = CharacterMetadata.create();
    const withStyle = CharacterMetadata.create({style: BOLD});
    const withTwoStyles = CharacterMetadata.create({style: BOLD_ITALIC});
    const withEntity = CharacterMetadata.create({entity: '1234'});
    const withStyleAndEntity = CharacterMetadata.create({
      entity: '1234',
      style: BOLD,
    });

    it('must reuse the same objects', () => {
      expect(CharacterMetadata.create()).toBe(empty);
      expect(CharacterMetadata.create({style: BOLD})).toBe(withStyle);
      expect(
        CharacterMetadata.create({style: BOLD_ITALIC})
      ).toBe(
        withTwoStyles
      );
      expect(CharacterMetadata.create({entity: '1234'})).toBe(withEntity);
      expect(
        CharacterMetadata.create({entity: '1234', style: BOLD})
      ).toBe(
        withStyleAndEntity
      );
    });

    it('must reuse objects by defaulting config properties', () => {
      expect(
        CharacterMetadata.create({style: BOLD, entity: null})
      ).toBe(
        withStyle
      );
      expect(
        CharacterMetadata.create({style: NONE, entity: '1234'})
      ).toBe(
        withEntity
      );

      const underlined = CharacterMetadata.create({
        style: UNDERLINE,
        entity: null,
      });

      expect(
        CharacterMetadata.create({style: UNDERLINE})
      ).toBe(
        underlined
      );
    });
  });
});
