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
const Immutable = require('immutable');
const insertTextIntoContentState = require('insertTextIntoContentState');
const getSampleStateForTesting = require('getSampleStateForTesting');
const {BOLD} = require('SampleDraftInlineStyle');

describe('insertTextIntoContentState', () => {
  const sample = getSampleStateForTesting();
  const content = sample.contentState;
  const selection = sample.selectionState;

  const EMPTY = CharacterMetadata.EMPTY;

  const block = content.getBlockMap().first();

  it('must throw if selection is not collapsed', () => {
    const target = selection.set('focusOffset', 2);
    expect(() => {
      insertTextIntoContentState(content, target, 'hey', EMPTY);
    }).toThrow();
  });

  it('must return early if no text is provided', () => {
    const modified = insertTextIntoContentState(content, selection, '', EMPTY);
    expect(modified).toBe(content);
  });

  it('must insert at the start', () => {
    const character = CharacterMetadata.create({style: BOLD});
    const modified = insertTextIntoContentState(
      content,
      selection,
      'xx',
      character
    );

    const newBlock = modified.getBlockMap().first();
    expect(newBlock.getText().slice(0, 2)).toBe('xx');
    expect(newBlock.getText().slice(2)).toBe(block.getText());

    expect(
      Immutable.is(
        Immutable.List.of(
          character, character, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY
        ),
        newBlock.getCharacterList()
      )
    ).toBe(true);
  });

  it('must insert within block', () => {
    const target = selection.merge({
      focusOffset: 2,
      anchorOffset: 2,
      isBackward: false,
    });
    const character = CharacterMetadata.create({style: BOLD});
    const modified = insertTextIntoContentState(content, target, 'xx', character);
    const newBlock = modified.getBlockMap().first();

    expect(newBlock.getText().slice(2, 4)).toBe('xx');
    expect(newBlock.getText().slice(0, 2)).toBe(block.getText().slice(0, 2));
    expect(newBlock.getText().slice(4, 7)).toBe(block.getText().slice(2, 5));

    expect(
      Immutable.is(
        newBlock.getCharacterList(),
        Immutable.List([
          EMPTY, EMPTY, character, character, EMPTY, EMPTY, EMPTY,
        ])
      )
    ).toBe(true);
  });

  it('must insert at the end', () => {
    const target = selection.merge({
      focusOffset: block.getLength(),
      anchorOffset: block.getLength(),
      isBackward: false,
    });

    const character = CharacterMetadata.create({style: BOLD});
    const modified = insertTextIntoContentState(content, target, 'xx', character);

    const newBlock = modified.getBlockMap().first();
    expect(newBlock.getText().slice(5, 7)).toBe('xx');
    expect(newBlock.getText().slice(0, 5)).toBe(block.getText());

    expect(
      Immutable.is(
        newBlock.getCharacterList(),
        Immutable.List([
          EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, character, character,
        ])
      )
    ).toBe(true);
  });
});
