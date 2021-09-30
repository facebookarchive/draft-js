/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 * @emails oncall+draft_js
 */

'use strict';

import type {BlockNodeRecord} from 'BlockNodeRecord';
import type CharacterMetadata from 'CharacterMetadata';
import type ContentState from 'ContentState';
import type {DraftDecoratorType} from 'DraftDecoratorType';

const findRangesImmutable = require('findRangesImmutable');
const getOwnObjectValues = require('getOwnObjectValues');
const Immutable = require('immutable');

const {List, Repeat, Record} = Immutable;

const returnTrue = function() {
  return true;
};

const defaultLeafRange: {
  start: ?number,
  end: ?number,
  ...
} = {
  start: null,
  end: null,
};

const LeafRange = (Record(defaultLeafRange): any);

export type DecoratorRangeRawType = {
  start: ?number,
  end: ?number,
  decoratorKey: ?string,
  // $FlowFixMe[value-as-type]
  leaves: ?Array<LeafRange>,
  ...
};

type DecoratorRangeType = {
  start: ?number,
  end: ?number,
  decoratorKey: ?string,
  // $FlowFixMe[value-as-type]
  leaves: ?List<LeafRange>,
  ...
};

const defaultDecoratorRange: DecoratorRangeType = {
  start: null,
  end: null,
  decoratorKey: null,
  leaves: null,
};

const DecoratorRange = (Record(defaultDecoratorRange): any);

const BlockTree = {
  /**
   * Generate a block tree for a given ContentBlock/decorator pair.
   */
  generate(
    contentState: ContentState,
    block: BlockNodeRecord,
    decorator: ?DraftDecoratorType,
    // $FlowFixMe[value-as-type]
  ): List<DecoratorRange> {
    const textLength = block.getLength();
    if (!textLength) {
      return List.of(
        new DecoratorRange({
          start: 0,
          end: 0,
          decoratorKey: null,
          leaves: List.of(new LeafRange({start: 0, end: 0})),
        }),
      );
    }

    const leafSets = [];
    const decorations = decorator
      ? decorator.getDecorations(block, contentState)
      : List(Repeat(null, textLength));

    const chars = block.getCharacterList();

    findRangesImmutable(decorations, areEqual, returnTrue, (start, end) => {
      leafSets.push(
        new DecoratorRange({
          start,
          end,
          decoratorKey: decorations.get(start),
          leaves: generateLeaves(chars.slice(start, end).toList(), start),
        }),
      );
    });

    return List(leafSets);
  },

  // $FlowFixMe[value-as-type]
  fromJS({leaves, ...other}: DecoratorRangeRawType): DecoratorRange {
    return new DecoratorRange({
      ...other,
      leaves:
        leaves != null
          ? List(
              Array.isArray(leaves) ? leaves : getOwnObjectValues(leaves),
            ).map(leaf => LeafRange(leaf))
          : null,
    });
  },
};

/**
 * Generate LeafRange records for a given character list.
 */
function generateLeaves(
  characters: List<CharacterMetadata>,
  offset: number,
  // $FlowFixMe[value-as-type]
): List<LeafRange> {
  const leaves = [];
  const inlineStyles = characters.map(c => c.getStyle()).toList();
  findRangesImmutable(inlineStyles, areEqual, returnTrue, (start, end) => {
    leaves.push(
      new LeafRange({
        start: start + offset,
        end: end + offset,
      }),
    );
  });
  return List(leaves);
}

function areEqual(a: any, b: any): boolean {
  return a === b;
}

module.exports = BlockTree;
