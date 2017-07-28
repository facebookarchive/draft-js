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
var ContentBlock = require('ContentBlock');
var {
  List,
  Repeat,
} = require('immutable');

var applyEntityToContentBlock = require('applyEntityToContentBlock');

describe('applyEntityToContentBlock', () => {
  var block = new ContentBlock({
    key: 'a',
    text: 'Hello',
    characterList: List(Repeat(CharacterMetadata.EMPTY, 5)),
  });

  function getEntities(block) {
    return block.getCharacterList().map(c => c.getEntity()).toJS();
  }

  it('must apply from the start', () => {
    var modified = applyEntityToContentBlock(block, 0, 2, 'x');
    expect(getEntities(modified)).toEqual(['x', 'x', null, null, null]);
  });

  it('must apply within', () => {
    var modified = applyEntityToContentBlock(block, 1, 4, 'x');
    expect(getEntities(modified)).toEqual([null, 'x', 'x', 'x', null]);
  });

  it('must apply at the end', () => {
    var modified = applyEntityToContentBlock(block, 3, 5, 'x');
    expect(getEntities(modified)).toEqual([null, null, null, 'x', 'x']);
  });

  it('must apply to the entire text', () => {
    var modified = applyEntityToContentBlock(block, 0, 5, 'x');
    expect(getEntities(modified)).toEqual(['x', 'x', 'x', 'x', 'x']);
  });
});
