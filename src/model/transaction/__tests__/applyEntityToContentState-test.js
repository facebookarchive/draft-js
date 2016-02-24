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

const Immutable = require('immutable');
const SelectionState = require('SelectionState');
const applyEntityToContentState = require('applyEntityToContentState');
const getSampleStateForTesting = require('getSampleStateForTesting');

describe('applyEntityToContentState', () => {
  const {
    contentState,
  } = getSampleStateForTesting();

  function checkForCharacterList(block) {
    expect(Immutable.List.isList(block.getCharacterList())).toBe(true);
  }

  function getEntities(block) {
    return block.getCharacterList().map(c => c.getEntity()).toJS();
  }

  describe('Apply entity within single block', () => {
    const target = contentState.getBlockMap().first();
    const targetSelection = new SelectionState({
      anchorKey: target.getKey(),
      anchorOffset: 0,
      focusKey: target.getKey(),
      focusOffset: target.getLength(),
    });

    function applyAndCheck(entityKey) {
      const withNewEntity = applyEntityToContentState(
        contentState,
        targetSelection,
        entityKey
      );
      const first = withNewEntity.getBlockMap().first();

      checkForCharacterList(first);
      expect(getEntities(first)).toEqual(
        Immutable.Repeat(entityKey, first.getLength()).toArray()
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
    const blockMap = contentState.getBlockMap();
    const first = blockMap.first();
    const last = contentState.getBlockAfter(first.getKey());

    const targetSelection = new SelectionState({
      anchorKey: first.getKey(),
      anchorOffset: 0,
      focusKey: last.getKey(),
      focusOffset: last.getLength(),
    });

    function applyAndCheck(entityKey) {
      const withNewEntity = applyEntityToContentState(
        contentState,
        targetSelection,
        entityKey
      );
      const first = withNewEntity.getBlockMap().first();
      const last = withNewEntity.getBlockAfter(first.getKey());

      checkForCharacterList(first);
      expect(getEntities(first)).toEqual(
        Immutable.Repeat(entityKey, first.getLength()).toArray()
      );
      checkForCharacterList(last);
      expect(getEntities(first)).toEqual(
        Immutable.Repeat(entityKey, last.getLength()).toArray()
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
