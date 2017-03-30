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

jest.disableAutomock();

var CharacterMetadata = require('CharacterMetadata');
var {
  BOLD,
  BOLD_ITALIC,
  NONE,
  UNDERLINE,
} = require('SampleDraftInlineStyle');

describe('CharacterMetadata', () => {
  it('must have appropriate default values', () => {
    var character = CharacterMetadata.create();
    expect(character.getStyle().size).toBe(0);
    expect(character.getEntity()).toBe(null);
  });

  describe('Style handling', () => {
    var plain = CharacterMetadata.create();
    var bold = CharacterMetadata.create({style: BOLD});
    var fancy = CharacterMetadata.create({style: BOLD_ITALIC});

    it('must run `hasStyle` correctly', () => {
      expect(plain.hasStyle('BOLD')).toBe(false);
      expect(bold.hasStyle('BOLD')).toBe(true);
      expect(fancy.hasStyle('BOLD')).toBe(true);
      expect(plain.hasStyle('ITALIC')).toBe(false);
      expect(bold.hasStyle('ITALIC')).toBe(false);
      expect(fancy.hasStyle('ITALIC')).toBe(true);
    });

    it('must apply style', () => {
      var newlyBold = CharacterMetadata.applyStyle(plain, 'BOLD');
      expect(newlyBold.hasStyle('BOLD')).toBe(true);
      var alsoItalic = CharacterMetadata.applyStyle(newlyBold, 'ITALIC');
      expect(alsoItalic.hasStyle('BOLD')).toBe(true);
      expect(alsoItalic.hasStyle('ITALIC')).toBe(true);
    });

    it('must remove style', () => {
      var justBold = CharacterMetadata.removeStyle(fancy, 'ITALIC');
      expect(justBold.hasStyle('BOLD')).toBe(true);
      expect(justBold.hasStyle('ITALIC')).toBe(false);
      var justPlain = CharacterMetadata.removeStyle(justBold, 'BOLD');
      expect(justPlain.hasStyle('BOLD')).toBe(false);
      expect(justPlain.hasStyle('ITALIC')).toBe(false);
    });
  });

  describe('Entity handling', () => {
    var withoutEntity = CharacterMetadata.create();
    var withEntity = CharacterMetadata.create({entity: 'a'});

    it('must apply entity correctly', () => {
      var newKey = 'x';
      var modifiedA = CharacterMetadata.applyEntity(withoutEntity, newKey);
      var modifiedB = CharacterMetadata.applyEntity(withEntity, newKey);
      expect(modifiedA.getEntity()).toBe(newKey);
      expect(modifiedB.getEntity()).toBe(newKey);
    });

    it('must remove entity correctly', () => {
      var modifiedA = CharacterMetadata.applyEntity(withoutEntity, null);
      var modifiedB = CharacterMetadata.applyEntity(withEntity, null);
      expect(modifiedA.getEntity()).toBe(null);
      expect(modifiedB.getEntity()).toBe(null);
    });
  });

  describe('Metadata Reuse', () => {
    var empty = CharacterMetadata.create();
    var withStyle = CharacterMetadata.create({style: BOLD});
    var withTwoStyles = CharacterMetadata.create({style: BOLD_ITALIC});
    var withEntity = CharacterMetadata.create({entity: '1234'});
    var withStyleAndEntity = CharacterMetadata.create({
      entity: '1234',
      style: BOLD,
    });

    it('must reuse the same objects', () => {
      expect(CharacterMetadata.create()).toBe(empty);
      expect(CharacterMetadata.create({style: BOLD})).toBe(withStyle);
      expect(
        CharacterMetadata.create({style: BOLD_ITALIC}),
      ).toBe(
        withTwoStyles,
      );
      expect(CharacterMetadata.create({entity: '1234'})).toBe(withEntity);
      expect(
        CharacterMetadata.create({entity: '1234', style: BOLD}),
      ).toBe(
        withStyleAndEntity,
      );
    });

    it('must reuse objects by defaulting config properties', () => {
      expect(
        CharacterMetadata.create({style: BOLD, entity: null}),
      ).toBe(
        withStyle,
      );
      expect(
        CharacterMetadata.create({style: NONE, entity: '1234'}),
      ).toBe(
        withEntity,
      );

      var underlined = CharacterMetadata.create({
        style: UNDERLINE,
        entity: null,
      });

      expect(
        CharacterMetadata.create({style: UNDERLINE}),
      ).toBe(
        underlined,
      );
    });
  });
});
