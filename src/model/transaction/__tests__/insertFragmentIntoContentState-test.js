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

var BlockMapBuilder = require('BlockMapBuilder');
var CharacterMetadata = require('CharacterMetadata');
var ContentBlock = require('ContentBlock');
var Immutable = require('immutable');

var getSampleStateForTesting = require('getSampleStateForTesting');
var insertFragmentIntoContentState = require('insertFragmentIntoContentState');

const {EMPTY} = CharacterMetadata;
const {List, Map} = Immutable;

describe('insertFragmentIntoContentState', () => {
  var sample = getSampleStateForTesting();
  var content = sample.contentState;
  var selection = sample.selectionState;

  var block = content.getBlockMap().first();
  var data = new Map({a: 1});
  var secondData = new Map({b: 2});
  var thirdData = new Map({c: 2});

  function createFragment() {
    var fragmentArray = [
      new ContentBlock({
        key: 'j',
        type: 'unstyled',
        text: 'xx',
        characterList: List.of(EMPTY, EMPTY),
        data,
      }),
    ];
    return BlockMapBuilder.createFromArray(fragmentArray);
  }

  function createMultiblockFragment() {
    var fragmentArray = [
      new ContentBlock({
        key: 'j',
        type: 'unstyled',
        text: 'xx',
        characterList: List.of(EMPTY, EMPTY),
        data,
      }),
      new ContentBlock({
        key: 'k',
        type: 'unstyled',
        text: 'yy',
        characterList: List.of(EMPTY, EMPTY),
        data: secondData,
      }),
    ];
    return BlockMapBuilder.createFromArray(fragmentArray);
  }

  function createFragmentWithAtomicStart() {
    var fragmentArray = [
      new ContentBlock({
        key: 'j',
        type: 'atomic',
        text: ' ',
        characterList: List.of(EMPTY),
        data: data,
      }),
      new ContentBlock({
        key: 'k',
        type: 'unstyled',
        text: 'yy',
        characterList: List.of(EMPTY, EMPTY),
        data: secondData,
      }),
    ];
    return BlockMapBuilder.createFromArray(fragmentArray);
  }

  function createFragmentWithAtomicBounds() {
    var fragmentArray = [
      new ContentBlock({
        key: 'j',
        type: 'atomic',
        text: ' ',
        characterList: List.of(EMPTY),
        data: data,
      }),
      new ContentBlock({
        key: 'k',
        type: 'unstyled',
        text: 'yy',
        characterList: List.of(EMPTY, EMPTY),
        data: secondData,
      }),
      new ContentBlock({
        key: 'i',
        type: 'atomic',
        text: ' ',
        characterList: List.of(EMPTY),
        data: thirdData,
      }),
    ];
    return BlockMapBuilder.createFromArray(fragmentArray);
  }

  it('must throw if no fragment is provided', () => {
    var fragment = BlockMapBuilder.createFromArray([]);
    expect(() => {
      insertFragmentIntoContentState(
        content,
        selection,
        fragment,
      );
    }).toThrow();
  });

  it('must apply fragment to the start', () => {
    var fragment = createFragment();
    var modified = insertFragmentIntoContentState(
      content,
      selection,
      fragment,
    );

    var newBlock = modified.getBlockMap().first();

    expect(newBlock.getText().slice(0, 2)).toBe('xx');
    expect(newBlock.getData()).toBe(data);
  });

  it('must apply fragment to within block', () => {
    var target = selection.merge({
      focusOffset: 2,
      anchorOffset: 2,
      isBackward: false,
    });

    var fragment = createFragment();

    var modified = insertFragmentIntoContentState(
      content,
      target,
      fragment,
    );

    var newBlock = modified.getBlockMap().first();

    expect(newBlock.getText().slice(2, 4)).toBe('xx');
    expect(newBlock.getData()).toBe(data);
  });

  it('must apply fragment at the end', () => {
    var length = block.getLength();
    var target = selection.merge({
      focusOffset: length,
      anchorOffset: length,
      isBackward: false,
    });

    var fragment = createFragment();
    var modified = insertFragmentIntoContentState(
      content,
      target,
      fragment,
    );

    var newBlock = modified.getBlockMap().first();

    expect(newBlock.getText().slice(length, length + 2)).toBe('xx');
    expect(newBlock.getData()).toBe(data);
  });

  it('must apply multiblock fragments', () => {
    var fragment = createMultiblockFragment();
    var modified = insertFragmentIntoContentState(
      content,
      selection,
      fragment,
    );

    var newBlock = modified.getBlockMap().first();
    var secondBlock = modified.getBlockMap().toArray()[1];

    expect(newBlock.getText()).toBe('xx');
    expect(newBlock.getData()).toBe(data);
    expect(secondBlock.getText().slice(0, 2)).toBe('yy');
    expect(secondBlock.getData()).toBe(secondData);
  });

  it(
    `must apply multiblock fragments starting with 'atomic'
    to the start`,
    () => {
      var fragment = createFragmentWithAtomicStart();
      var modified = insertFragmentIntoContentState(
        content,
        selection,
        fragment,
      );

      var blocks = modified.getBlockMap().toArray();

      expect(blocks.length).toBe(4);
      expect(blocks[0].getType()).toBe('atomic');
      expect(blocks[0].getData()).toBe(data);
      expect(blocks[1].getType()).toBe('unstyled');
      expect(blocks[1].getText().slice(0, 2)).toBe('yy');
      expect(blocks[2].getType()).toBe(
        content.getBlockMap().skip(1).first().getType(),
      );
      expect(blocks[2].getText()).toBe(
        content.getBlockMap().skip(1).first().getText(),
      );
    },
  );

  it(
    `must apply multiblock fragments starting with 'atomic'
    at the end`,
    () => {
      var length = block.getLength();
      var target = selection.merge({
        focusOffset: length,
        anchorOffset: length,
        isBackward: false,
      });

      var fragment = createFragmentWithAtomicStart();
      var modified = insertFragmentIntoContentState(
        content,
        target,
        fragment,
      );

      var blocks = modified.getBlockMap().toArray();

      expect(blocks.length).toBe(5);

      expect(blocks[0].getText()).toBe(block.getText());
      expect(blocks[0].getData()).toBe(block.getData());

      expect(blocks[1].getType()).toBe('atomic');
      expect(blocks[1].getData()).toBe(data);
      expect(blocks[2].getType()).toBe('unstyled');
      expect(blocks[2].getText()).toBe('yy');
    },
  );

  it(
    `must apply multiblock fragments starting with 'atomic'
    to within block`,
    () => {
      var fragment = createFragmentWithAtomicStart();
      var originalFirstBlock = content.getBlockMap().first();
      var target = selection.merge({
        focusOffset: 2,
        anchorOffset: 2,
        isBackward: false,
      });
      var modified = insertFragmentIntoContentState(
        content,
        target,
        fragment,
      );

      var blocks = modified.getBlockMap().toArray();

      expect(blocks.length).toBe(5);
      expect(blocks[0].getType()).toBe('unstyled');
      expect(blocks[0].getText()).toBe(
        originalFirstBlock.getText().slice(0, 2),
      );
      expect(blocks[1].getType()).toBe('atomic');
      expect(blocks[1].getData()).toBe(data);
      expect(blocks[2].getType()).toBe('unstyled');
      expect(blocks[2].getText().slice(0, 2)).toBe('yy');
    },
  );

  it('must apply multiblock fragments with `atomic`s to within block', () => {
    var fragment = createFragmentWithAtomicBounds();
    var originalFirstBlock = content.getBlockMap().first();
    var target = selection.merge({
      focusOffset: 2,
      anchorOffset: 2,
      isBackward: false,
    });
    var modified = insertFragmentIntoContentState(
      content,
      target,
      fragment,
    );

    var blocks = modified.getBlockMap().toArray();

    expect(blocks.length).toBe(7);
    expect(blocks[0].getType()).toBe('unstyled');
    expect(blocks[0].getText()).toBe(
      originalFirstBlock.getText().slice(0, 2),
    );
    expect(blocks[1].getType()).toBe('atomic');
    expect(blocks[1].getData()).toBe(data);
    expect(blocks[2].getType()).toBe('unstyled');
    expect(blocks[2].getText()).toBe('yy');
    expect(blocks[3].getType()).toBe('atomic');
    expect(blocks[3].getData()).toBe(thirdData);

    expect(blocks[4].getType()).toBe('unstyled');
    expect(blocks[4].getText()).toBe(
      originalFirstBlock.getText().slice(2),
    );
  });

});
