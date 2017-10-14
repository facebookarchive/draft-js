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
var SelectionState = require('SelectionState');

var applyEntityToContentState = require('applyEntityToContentState');
var getSampleStateForTesting = require('getSampleStateForTesting');

describe('applyEntityToContentState', () => {
  var {
    contentState,
  } = getSampleStateForTesting();

  function checkForCharacterList(block) {
    expect(Immutable.List.isList(block.getCharacterList())).toBe(true);
  }

  function getEntities(block) {
    return block.getCharacterList().map(c => c.getEntity()).toJS();
  }

  describe('Apply entity within single block', () => {
    var target = contentState.getBlockMap().first();
    var targetSelection = new SelectionState({
      anchorKey: target.getKey(),
      anchorOffset: 0,
      focusKey: target.getKey(),
      focusOffset: target.getLength(),
    });

    function applyAndCheck(entityKey) {
      var withNewEntity = applyEntityToContentState(
        contentState,
        targetSelection,
        entityKey,
      );
      var first = withNewEntity.getBlockMap().first();

      checkForCharacterList(first);
      expect(getEntities(first)).toEqual(
        Immutable.Repeat(entityKey, first.getLength()).toArray(),
      );
    }

    it('must apply entity key', () => {
      applyAndCheck('x');
    });

    it('must apply null entity', () => {
      applyAndCheck(null);
    });
  });

  describe('Apply entity across multiple blocks', () => {
    var blockMap = contentState.getBlockMap();
    var first = blockMap.first();
    var last = contentState.getBlockAfter(first.getKey());

    var targetSelection = new SelectionState({
      anchorKey: first.getKey(),
      anchorOffset: 0,
      focusKey: last.getKey(),
      focusOffset: last.getLength(),
    });

    function applyAndCheck(entityKey) {
      var withNewEntity = applyEntityToContentState(
        contentState,
        targetSelection,
        entityKey,
      );
      var first = withNewEntity.getBlockMap().first();
      var last = withNewEntity.getBlockAfter(first.getKey());

      checkForCharacterList(first);
      expect(getEntities(first)).toEqual(
        Immutable.Repeat(entityKey, first.getLength()).toArray(),
      );
      checkForCharacterList(last);
      expect(getEntities(last)).toEqual(
        Immutable.Repeat(entityKey, last.getLength()).toArray(),
      );
    }

    it('must apply entity key', () => {
      applyAndCheck('x');
    });

    it('must apply null entity', () => {
      applyAndCheck(null);
    });
  });
});
