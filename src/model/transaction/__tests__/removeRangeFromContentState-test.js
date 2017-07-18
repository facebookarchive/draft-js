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

var ContentBlock = require('ContentBlock');
var Immutable = require('immutable');

var getSampleStateForTesting = require('getSampleStateForTesting');
var removeRangeFromContentState = require('removeRangeFromContentState');

describe('removeRangeFromContentState', () => {
  var {
    contentState,
    selectionState,
  } = getSampleStateForTesting();

  function checkForCharacterList(block) {
    expect(Immutable.List.isList(block.getCharacterList())).toBe(true);
  }

  function getInlineStyles(block) {
    return block.getCharacterList().map(c => c.getStyle()).toJS();
  }

  function getEntities(block) {
    return block.getCharacterList().map(c => c.getEntity()).toJS();
  }

  function expectBlockToBeSlice(block, comparison, start, end) {
    expect(block.getType()).toBe(comparison.getType());
    expect(block.getText()).toBe(comparison.getText().slice(start, end));
    expect(
      getInlineStyles(block),
    ).toEqual(
      getInlineStyles(comparison).slice(start, end),
    );
    expect(
      getEntities(block),
    ).toEqual(
      getEntities(comparison).slice(start, end),
    );
    checkForCharacterList(block);
  }

  it('must return the input ContentState if selection is collapsed', () => {
    expect(
      removeRangeFromContentState(contentState, selectionState),
    ).toBe(contentState);
  });

  describe('Removal within a single block', () => {
    it('must remove from the beginning of the block', () => {
      // Remove from 0 to 3.
      var selection = selectionState.set('focusOffset', 3);
      var afterRemoval = removeRangeFromContentState(contentState, selection);
      var afterBlockMap = afterRemoval.getBlockMap();
      var alteredBlock = afterBlockMap.first();
      var originalBlock = contentState.getBlockMap().first();

      expectBlockToBeSlice(alteredBlock, originalBlock, 3);
    });

    it('must remove from within the block', () => {
      // Remove from 2 to 4.
      var selection = selectionState.merge({
        anchorOffset: 2,
        focusOffset: 4,
      });
      var afterRemoval = removeRangeFromContentState(contentState, selection);
      var afterBlockMap = afterRemoval.getBlockMap();
      var alteredBlock = afterBlockMap.first();
      var originalBlock = contentState.getBlockMap().first();

      expect(alteredBlock).not.toBe(originalBlock);
      expect(alteredBlock.getType()).toBe(originalBlock.getType());
      expect(alteredBlock.getText()).toBe(
        originalBlock.getText().slice(0, 2) +
        originalBlock.getText().slice(4),
      );

      var stylesToJS = getInlineStyles(originalBlock);
      expect(getInlineStyles(alteredBlock)).toEqual(
        stylesToJS.slice(0, 2).concat(stylesToJS.slice(4)),
      );
      var entitiesToJS = getEntities(originalBlock);
      expect(getEntities(alteredBlock)).toEqual(
        entitiesToJS.slice(0, 2).concat(entitiesToJS.slice(4)),
      );
    });

    it('nust remove to the end of the block', () => {
      // Remove from 3 to end.
      var originalBlock = contentState.getBlockMap().first();
      var selection = selectionState.merge({
        anchorOffset: 3,
        focusOffset: originalBlock.getLength(),
      });
      var afterRemoval = removeRangeFromContentState(contentState, selection);
      var afterBlockMap = afterRemoval.getBlockMap();
      var alteredBlock = afterBlockMap.first();

      expectBlockToBeSlice(alteredBlock, originalBlock, 0, 3);
    });
  });

  describe('Removal across two blocks', () => {
    describe('Removal from the start of A', () => {
      it('must remove from the start of A to the start of B', () => {
        var selection = selectionState.set('focusKey', 'b');
        var afterRemoval = removeRangeFromContentState(contentState, selection);
        var afterBlockMap = afterRemoval.getBlockMap();
        expect(afterBlockMap.size).toBe(2);
        var alteredBlock = afterBlockMap.first();

        // Block B is removed. Its contents replace the contents of block A,
        // while the `type` of block A is preserved.
        var blockB = contentState.getBlockMap().skip(1).first();
        var sameContentDifferentType = blockB.set(
          'type',
          contentState.getBlockMap().first().getType(),
        );

        expectBlockToBeSlice(alteredBlock, sameContentDifferentType, 0);
      });

      it('must remove from the start of A to within B', () => {
        var selection = selectionState.merge({
          focusKey: 'b',
          focusOffset: 3,
        });

        var afterRemoval = removeRangeFromContentState(contentState, selection);
        var afterBlockMap = afterRemoval.getBlockMap();
        expect(afterBlockMap.size).toBe(2);
        var alteredBlock = afterBlockMap.first();

        // A slice of block B contents replace the contents of block A,
        // while the `type` of block A is preserved. Block B is removed.
        var blockB = contentState.getBlockMap().skip(1).first();
        var sameContentDifferentType = blockB.set(
          'type',
          contentState.getBlockMap().first().getType(),
        );

        expectBlockToBeSlice(alteredBlock, sameContentDifferentType, 3);
      });

      it('must remove from the start of A to the end of B', () => {
        var blockB = contentState.getBlockMap().skip(1).first();
        var selection = selectionState.merge({
          focusKey: 'b',
          focusOffset: blockB.getLength(),
        });

        var afterRemoval = removeRangeFromContentState(contentState, selection);
        var afterBlockMap = afterRemoval.getBlockMap();
        expect(afterBlockMap.size).toBe(2);
        var alteredBlock = afterBlockMap.first();

        // Block A is effectively just emptied out, while block B is removed.
        var emptyBlock = new ContentBlock({
          text: '',
          type: contentState.getBlockMap().first().getType(),
          characterList: Immutable.List(),
        });

        expectBlockToBeSlice(alteredBlock, emptyBlock);
      });
    });

    describe('Removal from within A', () => {
      var selectionWithinA = selectionState.set('anchorOffset', 3);

      it('must remove from within A to the start of B', () => {
        var selection = selectionWithinA.set('focusKey', 'b');

        var originalBlockA = contentState.getBlockMap().first();
        var originalBlockB = contentState.getBlockMap().skip(1).first();
        var afterRemoval = removeRangeFromContentState(contentState, selection);
        var afterBlockMap = afterRemoval.getBlockMap();
        expect(afterBlockMap.size).toBe(2);
        var alteredBlock = afterBlockMap.first();

        expect(alteredBlock).not.toBe(originalBlockA);
        expect(alteredBlock).not.toBe(originalBlockB);
        expect(alteredBlock.getType()).toBe(originalBlockA.getType());
        expect(alteredBlock.getText()).toBe(
          originalBlockA.getText().slice(0, 3) +
          originalBlockB.getText(),
        );

        var stylesToJS = getInlineStyles(originalBlockA);
        expect(getInlineStyles(alteredBlock)).toEqual(
          stylesToJS.slice(0, 3).concat(getInlineStyles(originalBlockB)),
        );
        var entitiesToJS = getEntities(originalBlockA);
        expect(getEntities(alteredBlock)).toEqual(
          entitiesToJS.slice(0, 3).concat(getEntities(originalBlockB)),
        );

        checkForCharacterList(alteredBlock);
      });

      it('must remove from within A to within B', () => {
        var selection = selectionWithinA.merge({
          focusKey: 'b',
          focusOffset: 3,
        });

        var originalBlockA = contentState.getBlockMap().first();
        var originalBlockB = contentState.getBlockMap().skip(1).first();
        var afterRemoval = removeRangeFromContentState(contentState, selection);
        var afterBlockMap = afterRemoval.getBlockMap();
        expect(afterBlockMap.size).toBe(2);
        var alteredBlock = afterBlockMap.first();

        expect(alteredBlock).not.toBe(originalBlockA);
        expect(alteredBlock).not.toBe(originalBlockB);
        expect(alteredBlock.getType()).toBe(originalBlockA.getType());
        expect(alteredBlock.getText()).toBe(
          originalBlockA.getText().slice(0, 3) +
          originalBlockB.getText().slice(3),
        );

        var stylesToJS = getInlineStyles(originalBlockA);
        expect(getInlineStyles(alteredBlock)).toEqual(
          stylesToJS.slice(0, 3).concat(
            getInlineStyles(originalBlockB).slice(3),
          ),
        );
        var entitiesToJS = getEntities(originalBlockA);
        expect(getEntities(alteredBlock)).toEqual(
          entitiesToJS.slice(0, 3).concat(
            getEntities(originalBlockB).slice(3),
          ),
        );

        checkForCharacterList(alteredBlock);
      });

      it('must remove from within A to the end of B', () => {
        var blockB = contentState.getBlockMap().skip(1).first();
        var selection = selectionWithinA.merge({
          focusKey: 'b',
          focusOffset: blockB.getLength(),
        });

        var originalBlockA = contentState.getBlockMap().first();
        var originalBlockB = contentState.getBlockMap().skip(1).first();
        var afterRemoval = removeRangeFromContentState(contentState, selection);
        var afterBlockMap = afterRemoval.getBlockMap();
        expect(afterBlockMap.size).toBe(2);
        var alteredBlock = afterBlockMap.first();

        expect(alteredBlock).not.toBe(originalBlockA);
        expect(alteredBlock).not.toBe(originalBlockB);
        expect(alteredBlock.getType()).toBe(originalBlockA.getType());
        expect(alteredBlock.getText()).toBe(
          originalBlockA.getText().slice(0, 3),
        );

        var stylesToJS = getInlineStyles(originalBlockA);
        expect(getInlineStyles(alteredBlock)).toEqual(
          stylesToJS.slice(0, 3),
        );
        var entitiesToJS = getEntities(originalBlockA);
        expect(getEntities(alteredBlock)).toEqual(
          entitiesToJS.slice(0, 3),
        );

        checkForCharacterList(alteredBlock);
      });
    });

    describe('Removal from the end of A', () => {
      var initialBlock = contentState.getBlockMap().first();
      var selectionFromEndOfA = selectionState.merge({
        anchorOffset: initialBlock.getLength(),
        focusOffset: initialBlock.getLength(),
      });

      it('must remove from the end of A to the start of B', () => {
        var selection = selectionFromEndOfA.merge({
          focusKey: 'b',
          focusOffset: 0,
        });

        var originalBlockA = contentState.getBlockMap().first();
        var originalBlockB = contentState.getBlockMap().skip(1).first();
        var afterRemoval = removeRangeFromContentState(contentState, selection);
        var afterBlockMap = afterRemoval.getBlockMap();
        expect(afterBlockMap.size).toBe(2);
        var alteredBlock = afterBlockMap.first();

        expect(alteredBlock).not.toBe(originalBlockA);
        expect(alteredBlock).not.toBe(originalBlockB);
        expect(alteredBlock.getType()).toBe(originalBlockA.getType());
        expect(alteredBlock.getText()).toBe(
          originalBlockA.getText() +
          originalBlockB.getText(),
        );

        var stylesToJS = getInlineStyles(originalBlockA);
        expect(getInlineStyles(alteredBlock)).toEqual(
          stylesToJS.concat(getInlineStyles(originalBlockB)),
        );
        var entitiesToJS = getEntities(originalBlockA);
        expect(getEntities(alteredBlock)).toEqual(
          entitiesToJS.concat(getEntities(originalBlockB)),
        );

        checkForCharacterList(alteredBlock);
      });

      it('must remove from the end of A to within B', () => {
        var selection = selectionFromEndOfA.merge({
          focusKey: 'b',
          focusOffset: 3,
        });

        var originalBlockA = contentState.getBlockMap().first();
        var originalBlockB = contentState.getBlockMap().skip(1).first();
        var afterRemoval = removeRangeFromContentState(contentState, selection);
        var afterBlockMap = afterRemoval.getBlockMap();
        expect(afterBlockMap.size).toBe(2);
        var alteredBlock = afterBlockMap.first();

        expect(alteredBlock).not.toBe(originalBlockA);
        expect(alteredBlock).not.toBe(originalBlockB);
        expect(alteredBlock.getType()).toBe(originalBlockA.getType());
        expect(alteredBlock.getText()).toBe(
          originalBlockA.getText() +
          originalBlockB.getText().slice(3),
        );

        var stylesToJS = getInlineStyles(originalBlockA);
        expect(getInlineStyles(alteredBlock)).toEqual(
          stylesToJS.concat(
            getInlineStyles(originalBlockB).slice(3),
          ),
        );
        var entitiesToJS = getEntities(originalBlockA);
        expect(getEntities(alteredBlock)).toEqual(
          entitiesToJS.concat(
            getEntities(originalBlockB).slice(3),
          ),
        );
        checkForCharacterList(alteredBlock);
      });

      it('must remove from the end of A to the end of B', () => {
        var originalBlockA = contentState.getBlockMap().first();
        var originalBlockB = contentState.getBlockMap().skip(1).first();

        var selection = selectionFromEndOfA.merge({
          focusKey: 'b',
          focusOffset: originalBlockB.getLength(),
        });

        var afterRemoval = removeRangeFromContentState(contentState, selection);
        var afterBlockMap = afterRemoval.getBlockMap();
        expect(afterBlockMap.size).toBe(2);
        var alteredBlock = afterBlockMap.first();

        // no-op for the first block, since no new content is appended.
        expect(alteredBlock).toBe(originalBlockA);
        expect(alteredBlock).not.toBe(originalBlockB);
        expect(alteredBlock.getType()).toBe(originalBlockA.getType());

        expectBlockToBeSlice(alteredBlock, originalBlockA);
        checkForCharacterList(alteredBlock);
      });
    });
  });

  describe('Removal across more than two blocks', () => {
    var selection = selectionState.merge({
      anchorOffset: 3,
      focusKey: 'c',
      focusOffset: 3,
    });

    it('must remove blocks entirely within the selection', () => {
      var originalBlockA = contentState.getBlockMap().first();
      var originalBlockB = contentState.getBlockMap().skip(1).first();
      var originalBlockC = contentState.getBlockMap().skip(2).first();

      var afterRemoval = removeRangeFromContentState(contentState, selection);
      var afterBlockMap = afterRemoval.getBlockMap();
      expect(afterBlockMap.size).toBe(1);
      var alteredBlock = afterBlockMap.first();

      expect(alteredBlock).not.toBe(originalBlockA);
      expect(alteredBlock).not.toBe(originalBlockB);
      expect(alteredBlock).not.toBe(originalBlockC);
      expect(alteredBlock.getType()).toBe(originalBlockA.getType());
      expect(alteredBlock.getText()).toBe(
        originalBlockA.getText().slice(0, 3) +
        originalBlockC.getText().slice(3),
      );

      var stylesToJS = getInlineStyles(originalBlockA);
      expect(getInlineStyles(alteredBlock)).toEqual(
        stylesToJS.slice(0, 3).concat(
          getInlineStyles(originalBlockC).slice(3),
        ),
      );
      var entitiesToJS = getEntities(originalBlockA);
      expect(getEntities(alteredBlock)).toEqual(
        entitiesToJS.slice(0, 3).concat(
          getEntities(originalBlockC).slice(3),
        ),
      );

      checkForCharacterList(alteredBlock);
    });
  });
});
