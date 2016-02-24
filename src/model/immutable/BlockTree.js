/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule BlockTree
 * @flow
 */

'use strict';

const Immutable = require('immutable');

const emptyFunction = require('emptyFunction');
const findRangesImmutable = require('findRangesImmutable');

import type CharacterMetadata from 'CharacterMetadata';
import type ContentBlock from 'ContentBlock';
import type {DraftDecoratorType} from 'DraftDecoratorType';

const {
  List,
  Repeat,
  Record,
} = Immutable;

const returnTrue = emptyFunction.thatReturnsTrue;

const FINGERPRINT_DELIMITER = '-';

const defaultLeafRange: {
  start: ?number;
  end: ?number;
} = {
  start: null,
  end: null,
};

const LeafRange = Record(defaultLeafRange);

const defaultDecoratorRange: {
  start: ?number;
  end: ?number;
  decoratorKey: ?string;
  leaves: ?List<LeafRange>;
} = {
  start: null,
  end: null,
  decoratorKey: null,
  leaves: null,
};

const DecoratorRange = Record(defaultDecoratorRange);

const BlockTree = {
  /**
   * Generate a block tree for a given ContentBlock/decorator pair.
   */
  generate: function(
    block: ContentBlock,
    decorator: ?DraftDecoratorType
  ): List<DecoratorRange> {
    const textLength = block.getLength();
    if (!textLength) {
      return List.of(
        new DecoratorRange({
          start: 0,
          end: 0,
          decoratorKey: null,
          leaves: List.of(
            new LeafRange({start: 0, end: 0})
          ),
        })
      );
    }

    const leafSets = [];
    const decorations = decorator ?
      decorator.getDecorations(block) :
      List(Repeat(null, textLength));

    const chars = block.getCharacterList();

    findRangesImmutable(
      decorations,
      areEqual,
      returnTrue,
      (start, end) => {
        leafSets.push(
          new DecoratorRange({
            start,
            end,
            decoratorKey: decorations.get(start),
            leaves: generateLeaves(
              chars.slice(start, end).toList(),
              start
            ),
          })
        );
      }
    );

    return List(leafSets);
  },

  /**
   * Create a string representation of the given tree map. This allows us
   * to rapidly determine whether a tree has undergone a significant
   * structural change.
   */
  getFingerprint: function(tree: List<DecoratorRange>): string {
    return tree.map(
      leafSet => {
        const decoratorKey = leafSet.get('decoratorKey');
        const fingerprintString = decoratorKey !== null ?
          decoratorKey + '.' + (leafSet.get('end') - leafSet.get('start')) :
          '';
        return '' + fingerprintString + '.' + leafSet.get('leaves').size;
      }
    ).join(FINGERPRINT_DELIMITER);
  },
};

/**
 * Generate LeafRange records for a given character list.
 */
function generateLeaves(
  characters: List<CharacterMetadata>,
  offset: number
): List<LeafRange> {
  const leaves = [];
  const inlineStyles = characters.map(c => c.getStyle()).toList();
  findRangesImmutable(
    inlineStyles,
    areEqual,
    returnTrue,
    (start, end) => {
      leaves.push(
        new LeafRange({
          start: start + offset,
          end: end + offset,
        })
      );
    }
  );
  return List(leaves);
}

function areEqual(a: any, b: any): boolean {
  return a === b;
}

module.exports = BlockTree;
