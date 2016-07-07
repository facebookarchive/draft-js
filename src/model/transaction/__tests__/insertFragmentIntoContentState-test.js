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

var Immutable = require('immutable');
var insertFragmentIntoContentState = require('insertFragmentIntoContentState');
var getSampleStateForTesting = require('getSampleStateForTesting');
var BlockMapBuilder = require('BlockMapBuilder');
var ContentBlock = require('ContentBlock');

describe('insertFragmentIntoContentState', () => {
  var sample = getSampleStateForTesting();
  var content = sample.contentState;
  var selection = sample.selectionState;

  var block = content.getBlockMap().first();
  var data = new Immutable.Map({a: 1});
  var secondData = new Immutable.Map({b: 2});

  function createFragment() {
    var fragmentArray = [
      new ContentBlock({
        key: 'j',
        type: 'unstyled',
        text: 'xx',
        characterList: Immutable.List(),
        data: data
      })
    ];
    return BlockMapBuilder.createFromArray(fragmentArray);
  }

  function createMultiblockFragment() {
    var fragmentArray = [
      new ContentBlock({
        key: 'j',
        type: 'unstyled',
        text: 'xx',
        characterList: Immutable.List(),
        data: data
      }),
      new ContentBlock({
        key: 'k',
        type: 'unstyled',
        text: 'yy',
        characterList: Immutable.List(),
        data: secondData
      })
    ];
    return BlockMapBuilder.createFromArray(fragmentArray);
  }

  it('must throw if no fragment is provided', () => {
    var fragment = BlockMapBuilder.createFromArray([]);
    expect(() => {
      insertFragmentIntoContentState(
        content,
        selection,
        fragment);
    }).toThrow();
  });

  it('must apply fragment to the start', () => {
    var fragment = createFragment();
    var modified = insertFragmentIntoContentState(
      content,
      selection,
      fragment);

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
      fragment);

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
      fragment);

    var newBlock = modified.getBlockMap().first();

    expect(newBlock.getText().slice(length, length + 2)).toBe('xx');
    expect(newBlock.getData()).toBe(data);
  });

  it('must apply multiblock fragments', () => {
    var fragment = createMultiblockFragment();
    var modified = insertFragmentIntoContentState(
      content,
      selection,
      fragment);

    var newBlock = modified.getBlockMap().first();
    var secondBlock = modified.getBlockMap().toArray()[1];

    expect(newBlock.getText()).toBe('xx');
    expect(newBlock.getData()).toBe(data);
    expect(secondBlock.getText().slice(0, 2)).toBe('yy');
    expect(secondBlock.getData()).toBe(secondData);
  });

});
