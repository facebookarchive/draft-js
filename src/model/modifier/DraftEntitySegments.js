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

import type {DraftRange} from 'DraftRange';
import type {DraftRemovalDirection} from 'DraftRemovalDirection';

export function getRemovalRange(
  selectionStart: number,
  selectionEnd: number,
  text: string,
  entityStart: number,
  direction: DraftRemovalDirection,
): DraftRange {
  let segments = text.split(' ');
  segments = segments.map((/*string*/ segment, /*number*/ ii) => {
    if (direction === 'forward') {
      if (ii > 0) {
        return ' ' + segment;
      }
    } else if (ii < segments.length - 1) {
      return segment + ' ';
    }
    return segment;
  });

  let segmentStart = entityStart;
  let segmentEnd;
  let segment;
  let removalStart: any = null;
  let removalEnd: any = null;

  for (let jj = 0; jj < segments.length; jj++) {
    segment = segments[jj];
    segmentEnd = segmentStart + segment.length;

    // Our selection overlaps this segment.
    if (selectionStart < segmentEnd && segmentStart < selectionEnd) {
      if (removalStart !== null) {
        removalEnd = segmentEnd;
      } else {
        removalStart = segmentStart;
        removalEnd = segmentEnd;
      }
    } else if (removalStart !== null) {
      break;
    }

    segmentStart = segmentEnd;
  }

  const entityEnd = entityStart + text.length;
  const atStart = removalStart === entityStart;
  const atEnd = removalEnd === entityEnd;

  if ((!atStart && atEnd) || (atStart && !atEnd)) {
    if (direction === 'forward') {
      if (removalEnd !== entityEnd) {
        removalEnd++;
      }
    } else if (removalStart !== entityStart) {
      removalStart--;
    }
  }

  return {
    start: removalStart,
    end: removalEnd,
  };
}
