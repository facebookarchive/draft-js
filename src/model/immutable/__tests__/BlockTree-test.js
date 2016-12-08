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

var BlockTree = require('BlockTree');
var CharacterMetadata = require('CharacterMetadata');
var ContentBlock = require('ContentBlock');
const ContentState = require('ContentState');
var Immutable = require('immutable');
var {BOLD} = require('SampleDraftInlineStyle');

var {EMPTY} = CharacterMetadata;

var {
  Repeat,
} = Immutable;

var PLAIN_BLOCK = {
  key: 'a',
  text: 'Lincoln',
  characterList: Repeat(EMPTY, 7).toList(),
};

var boldChar = CharacterMetadata.create({style: BOLD});
var styledChars = Repeat(EMPTY, 4).concat(
  Repeat(boldChar, 4),
  Repeat(EMPTY, 2)
);

var STYLED_BLOCK = {
  key: 'b',
  text: 'Washington',
  characterList: styledChars,
};

function assertLeafSetValues(leafSet, values) {
  var {start, end, decoratorKey} = values;
  expect(leafSet.get('start')).toBe(start);
  expect(leafSet.get('end')).toBe(end);
  expect(leafSet.get('decoratorKey')).toBe(decoratorKey);
}

function assertLeafValues(leaf, values) {
  expect(leaf.get('start')).toBe(values.start);
  expect(leaf.get('end')).toBe(values.end);
}

describe('BlockTree', () => {
  class Decorator {}
  Decorator.prototype.getDecorations = jest.fn();
  beforeEach(() => {
    jest.resetModuleRegistry();
  });

  describe('generate tree with zero decorations', () => {
    function getDecorator(length) {
      Decorator.prototype.getDecorations.mockImplementation(
        () => Repeat(null, length).toList()
      );
      return new Decorator();
    }

    it('must generate for unstyled block', () => {
      var block = new ContentBlock(PLAIN_BLOCK);
      var length = PLAIN_BLOCK.text.length;
      var decorator = getDecorator(length);
      const contentState = ContentState.createFromText(PLAIN_BLOCK.text);
      var tree = BlockTree.generate(contentState, block, decorator);

      // No decorations, so only one leaf set.
      expect(tree.size).toBe(1);
      var leafSet = tree.get(0);
      assertLeafSetValues(leafSet, {
        start: 0,
        end: length,
        decoratorKey: null,
      });

      var leaves = leafSet.get('leaves');
      expect(leaves.size).toBe(1);

      var leaf = leaves.get(0);
      assertLeafValues(leaf, {start: 0, end: length});

      expect(BlockTree.getFingerprint(tree)).toBe('.1');
    });

    it('must generate for styled block', () => {
      var block = new ContentBlock(STYLED_BLOCK);
      var length = STYLED_BLOCK.text.length;
      var decorator = getDecorator(length);
      const contentState = ContentState.createFromText(STYLED_BLOCK.text);
      var tree = BlockTree.generate(contentState, block, decorator);

      // No decorations, so only one leaf set.
      expect(tree.size).toBe(1);
      var leafSet = tree.get(0);
      assertLeafSetValues(leafSet, {
        start: 0,
        end: length,
        decoratorKey: null,
      });

      // Three styled sections, so three leaves in this leaf set.
      var leaves = leafSet.get('leaves');
      expect(leaves.size).toBe(3);

      assertLeafValues(leaves.get(0), {start: 0, end: 4});
      assertLeafValues(leaves.get(1), {start: 4, end: 8});
      assertLeafValues(leaves.get(2), {start: 8, end: 10});

      expect(BlockTree.getFingerprint(tree)).toBe('.3');
    });
  });

  describe('generate tree with single decoration', () => {
    var DECORATOR_KEY = 'x';
    var RANGE_LENGTH = 3;

    function getDecorator(length) {
      Decorator.prototype.getDecorations.mockImplementation(
        () => {
          return Repeat(null, RANGE_LENGTH).concat(
            Repeat(DECORATOR_KEY, RANGE_LENGTH),
            Repeat(null, (length - (2 * RANGE_LENGTH)))
          ).toList();
        }
      );
      return new Decorator();
    }

    it('must generate for unstyled block', () => {
      var block = new ContentBlock(PLAIN_BLOCK);
      var length = PLAIN_BLOCK.text.length;
      var decorator = getDecorator(length);
      const contentState = ContentState.createFromText(PLAIN_BLOCK.text);
      var tree = BlockTree.generate(contentState, block, decorator);

      // One leaf set for each decoration range.
      expect(tree.size).toBe(3);
      assertLeafSetValues(tree.get(0), {
        start: 0,
        end: RANGE_LENGTH,
        decoratorKey: null,
      });
      assertLeafSetValues(tree.get(1), {
        start: RANGE_LENGTH,
        end: RANGE_LENGTH * 2,
        decoratorKey: DECORATOR_KEY,
      });
      assertLeafSetValues(tree.get(2), {
        start: RANGE_LENGTH * 2,
        end: length,
        decoratorKey: null,
      });

      expect(tree.get(0).get('leaves').size).toBe(1);
      expect(tree.get(1).get('leaves').size).toBe(1);
      expect(tree.get(2).get('leaves').size).toBe(1);

      expect(BlockTree.getFingerprint(tree)).toBe('.1-x.3.1-.1');
    });

    it('must generate for styled block', () => {
      var block = new ContentBlock(STYLED_BLOCK);
      var length = STYLED_BLOCK.text.length;
      var decorator = getDecorator(length);
      const contentState = ContentState.createFromText(STYLED_BLOCK.text);
      var tree = BlockTree.generate(contentState, block, decorator);

      // Leaf Sets: ['Was', 'hin', 'gton']
      // Set 0 leaves (null entity): ['Was'] with NONE
      // Set 1 leaves ('x' entity): ['h', 'in'] with NONE, BOLD
      // Set 2 leaves (null entity): ['gt', 'on'] with BOLD, NONE

      // One leaf set for each decoration range.
      expect(tree.size).toBe(3);
      assertLeafSetValues(tree.get(0), {
        start: 0,
        end: RANGE_LENGTH,
        decoratorKey: null,
      });
      assertLeafSetValues(tree.get(1), {
        start: RANGE_LENGTH,
        end: RANGE_LENGTH * 2,
        decoratorKey: DECORATOR_KEY,
      });
      assertLeafSetValues(tree.get(2), {
        start: RANGE_LENGTH * 2,
        end: length,
        decoratorKey: null,
      });

      expect(tree.get(0).get('leaves').size).toBe(1);
      expect(tree.get(1).get('leaves').size).toBe(2);
      expect(tree.get(2).get('leaves').size).toBe(2);

      expect(BlockTree.getFingerprint(tree)).toBe('.1-x.3.2-.2');
    });
  });

  describe('generate tree with multiple decorations', () => {
    var DECORATOR_KEY_A = 'y';
    var DECORATOR_KEY_B = 'z';
    var RANGE_LENGTH = 3;

    function getDecorator(length) {
      Decorator.prototype.getDecorations.mockImplementation(
        () => {
          return Repeat(DECORATOR_KEY_A, RANGE_LENGTH).concat(
            Repeat(null, RANGE_LENGTH),
            Repeat(DECORATOR_KEY_B, (length - (2 * RANGE_LENGTH)))
          ).toList();
        }
      );
      return new Decorator();
    }

    it('must generate for unstyled block', () => {
      var block = new ContentBlock(PLAIN_BLOCK);
      var length = PLAIN_BLOCK.text.length;
      var decorator = getDecorator(length);
      const contentState = ContentState.createFromText(PLAIN_BLOCK.text);
      var tree = BlockTree.generate(contentState, block, decorator);

      // One leaf set for each decoration range.
      expect(tree.size).toBe(3);
      assertLeafSetValues(tree.get(0), {
        start: 0,
        end: RANGE_LENGTH,
        decoratorKey: DECORATOR_KEY_A,
      });
      assertLeafSetValues(tree.get(1), {
        start: RANGE_LENGTH,
        end: RANGE_LENGTH * 2,
        decoratorKey: null,
      });
      assertLeafSetValues(tree.get(2), {
        start: RANGE_LENGTH * 2,
        end: length,
        decoratorKey: DECORATOR_KEY_B,
      });

      expect(tree.get(0).get('leaves').size).toBe(1);
      expect(tree.get(1).get('leaves').size).toBe(1);
      expect(tree.get(2).get('leaves').size).toBe(1);

      expect(BlockTree.getFingerprint(tree)).toBe('y.3.1-.1-z.1.1');
    });

    it('must generate for styled block', () => {
      var block = new ContentBlock(STYLED_BLOCK);
      var length = STYLED_BLOCK.text.length;
      var decorator = getDecorator(length);
      const contentState = ContentState.createFromText(STYLED_BLOCK.text);
      var tree = BlockTree.generate(contentState, block, decorator);

      // Leaf Sets: ['Was', 'hin', 'gton']
      // Set 0 leaves ('y' entity): ['Was'] with NONE
      // Set 1 leaves (null entity): ['h', 'in'] with NONE, BOLD
      // Set 2 leaves ('z' entity): ['gt', 'on'] with BOLD, NONE

      // One leaf set for each decoration range.
      expect(tree.size).toBe(3);
      assertLeafSetValues(tree.get(0), {
        start: 0,
        end: RANGE_LENGTH,
        decoratorKey: DECORATOR_KEY_A,
      });
      assertLeafSetValues(tree.get(1), {
        start: RANGE_LENGTH,
        end: RANGE_LENGTH * 2,
        decoratorKey: null,
      });
      assertLeafSetValues(tree.get(2), {
        start: RANGE_LENGTH * 2,
        end: length,
        decoratorKey: DECORATOR_KEY_B,
      });

      expect(tree.get(0).get('leaves').size).toBe(1);
      expect(tree.get(0).get('leaves').get(0).toJS())
        .toEqual({start: 0, end: 3});

      expect(tree.get(1).get('leaves').size).toBe(2);
      expect(tree.get(1).get('leaves').get(0).toJS())
        .toEqual({start: 3, end: 4});
      expect(tree.get(1).get('leaves').get(1).toJS())
        .toEqual({start: 4, end: 6});

      expect(tree.get(2).get('leaves').size).toBe(2);
      expect(tree.get(2).get('leaves').get(0).toJS())
        .toEqual({start: 6, end: 8});
      expect(tree.get(2).get('leaves').get(1).toJS())
        .toEqual({start: 8, end: 10});

      expect(BlockTree.getFingerprint(tree)).toBe('y.3.1-.2-z.4.2');
    });
  });
});
