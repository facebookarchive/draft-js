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
var Immutable = require('immutable');
var {BOLD} = require('SampleDraftInlineStyle');

var getSampleStateForTesting = require('getSampleStateForTesting');
var insertTextIntoContentState = require('insertTextIntoContentState');

describe('insertTextIntoContentState', () => {
  var sample = getSampleStateForTesting();
  var content = sample.contentState;
  var selection = sample.selectionState;

  var EMPTY = CharacterMetadata.EMPTY;

  var block = content.getBlockMap().first();

  it('must throw if selection is not collapsed', () => {
    var target = selection.set('focusOffset', 2);
    expect(() => {
      insertTextIntoContentState(content, target, 'hey', EMPTY);
    }).toThrow();
  });

  it('must return early if no text is provided', () => {
    var modified = insertTextIntoContentState(content, selection, '', EMPTY);
    expect(modified).toBe(content);
  });

  it('must insert at the start', () => {
    var character = CharacterMetadata.create({style: BOLD});
    var modified = insertTextIntoContentState(
      content,
      selection,
      'xx',
      character,
    );

    var newBlock = modified.getBlockMap().first();
    expect(newBlock.getText().slice(0, 2)).toBe('xx');
    expect(newBlock.getText().slice(2)).toBe(block.getText());

    expect(
      Immutable.is(
        Immutable.List.of(
          character, character, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY,
        ),
        newBlock.getCharacterList(),
      ),
    ).toBe(true);
  });

  it('must insert within block', () => {
    var target = selection.merge({
      focusOffset: 2,
      anchorOffset: 2,
      isBackward: false,
    });
    var character = CharacterMetadata.create({style: BOLD});
    var modified = insertTextIntoContentState(content, target, 'xx', character);
    var newBlock = modified.getBlockMap().first();

    expect(newBlock.getText().slice(2, 4)).toBe('xx');
    expect(newBlock.getText().slice(0, 2)).toBe(block.getText().slice(0, 2));
    expect(newBlock.getText().slice(4, 7)).toBe(block.getText().slice(2, 5));

    expect(
      Immutable.is(
        newBlock.getCharacterList(),
        Immutable.List([
          EMPTY, EMPTY, character, character, EMPTY, EMPTY, EMPTY,
        ]),
      ),
    ).toBe(true);
  });

  it('must insert at the end', () => {
    var target = selection.merge({
      focusOffset: block.getLength(),
      anchorOffset: block.getLength(),
      isBackward: false,
    });

    var character = CharacterMetadata.create({style: BOLD});
    var modified = insertTextIntoContentState(content, target, 'xx', character);

    var newBlock = modified.getBlockMap().first();
    expect(newBlock.getText().slice(5, 7)).toBe('xx');
    expect(newBlock.getText().slice(0, 5)).toBe(block.getText());

    expect(
      Immutable.is(
        newBlock.getCharacterList(),
        Immutable.List([
          EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, character, character,
        ]),
      ),
    ).toBe(true);
  });
});
