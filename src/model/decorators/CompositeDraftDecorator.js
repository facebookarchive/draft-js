/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule CompositeDraftDecorator
 * @typechecks
 * @flow
 */

'use strict';

var Immutable = require('immutable');

import type ContentBlock from 'ContentBlock';
import type {DraftDecorator} from 'DraftDecorator';
import type ContentState from 'ContentState';

var {List} = Immutable;

var DELIMITER = '.';

/**
 * A CompositeDraftDecorator traverses through a list of DraftDecorator
 * instances to identify sections of a ContentBlock that should be rendered
 * in a "decorated" manner. For example, hashtags, mentions, and links may
 * be intended to stand out visually, be rendered as anchors, etc.
 *
 * The list of decorators supplied to the constructor will be used in the
 * order they are provided. This allows the caller to specify a priority for
 * string matching, in case of match collisions among decorators.
 *
 * For instance, I may have a link with a `#` in its text. Though this section
 * of text may match our hashtag decorator, it should not be treated as a
 * hashtag. I should therefore list my link DraftDecorator
 * before my hashtag DraftDecorator when constructing this composite
 * decorator instance.
 *
 * Thus, when a collision like this is encountered, the earlier match is
 * preserved and the new match is discarded.
 */
class CompositeDraftDecorator {
  _decorators: Array<DraftDecorator>;

  constructor(decorators: Array<DraftDecorator>) {
    // Copy the decorator array, since we use this array order to determine
    // precedence of decoration matching. If the array is mutated externally,
    // we don't want to be affected here.
    this._decorators = decorators.slice();
  }

  getDecorations(contentState: ContentState, block: ContentBlock): List<?string> {
    var decorations = Array(block.getText().length).fill(null);

    this._decorators.forEach(
      (/*object*/ decorator, /*number*/ ii) => {
        var counter = 0;
        var strategy = decorator.strategy;
        strategy(contentState, block, (/*number*/ start, /*number*/ end) => {
          // Find out if any of our matching range is already occupied
          // by another decorator. If so, discard the match. Otherwise, store
          // the component key for rendering.
          if (canOccupySlice(decorations, start, end)) {
            occupySlice(decorations, start, end, ii + DELIMITER + counter);
            counter++;
          }
        });
      }
    );

    return List(decorations);
  }

  getComponentForKey(key: string): Function {
    var componentKey = parseInt(key.split(DELIMITER)[0], 10);
    return this._decorators[componentKey].component;
  }

  getPropsForKey(key: string): ?Object {
    var componentKey = parseInt(key.split(DELIMITER)[0], 10);
    return this._decorators[componentKey].props;
  }
}

/**
 * Determine whether we can occupy the specified slice of the decorations
 * array.
 */
function canOccupySlice(
  decorations: Array<?string>,
  start: number,
  end: number
): boolean {
  for (var ii = start; ii < end; ii++) {
    if (decorations[ii] != null) {
      return false;
    }
  }
  return true;
}

/**
 * Splice the specified component into our decoration array at the desired
 * range.
 */
function occupySlice(
  targetArr: Array<?string>,
  start: number,
  end: number,
  componentKey: string
): void {
  for (var ii = start; ii < end; ii++) {
    targetArr[ii] = componentKey;
  }
}

module.exports = CompositeDraftDecorator;
