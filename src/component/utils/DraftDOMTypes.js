/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * Types for things in the DOM used in Draft.js. These should eventaully be
 * added to the flow DOM lib itself.
 *
 * @emails oncall+draft_js
 * @flow strict
 * @format
 */

'use strict';

// https://developer.mozilla.org/en-US/docs/Web/API/Selection
export type SelectionObject = {
  /**
   * Returns the Node in which the selection begins. Can return null if
   * selection never existed in the document (e.g., an iframe that was
   * never clicked on). */
  anchorNode: ?Node,
  anchorOffset: number,
  focusNode: ?Node,
  focusOffset: number,
  isCollapsed: boolean,
  rangeCount: number,
  type: string,

  removeAllRanges(): void,
  getRangeAt: (index: number) => Range,
  extend?: (node: Node, offset?: number) => void,
  addRange: (range: Range) => void,
  // ...etc. This is a non-exhaustive definition.
};
