/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+draft_js
 * @format
 */

'use strict';

jest.disableAutomock();

const addFocusToSelection = require('setDraftEditorSelection')
  .addFocusToSelection;
const getSampleSelectionMocksForTesting = require('getSampleSelectionMocksForTesting');

// Based on https://w3c.github.io/selection-api/#selection-interface
class Selection {
  constructor({range}) {
    this.rangeCount = range ? 1 : 0;
    this.focusNode = (range && range.node) || null;
    this.focusOffset = (range && range.startOffset) || 0;
    this.range = range || null;
  }

  getRangeAt(idx) {
    if (idx !== 0 || this.rangeCount <= 0) {
      throw new Error('IndexSizeError');
    }
    return this.range;
  }

  addRange(range) {
    this.range = range;
    this.rangeCount = 1;
  }
}

// Based on https://dom.spec.whatwg.org/#concept-range
class Range {
  constructor({startOffset, endOffset, node}) {
    this.startOffset = startOffset;
    this.endOffset = endOffset;
    this.node = node;
  }

  setEnd(node, offset) {
    this.endOffset = offset;
    this.node = node;
  }

  cloneRange() {
    return new Range({
      startOffset: this.startOffset,
      endOffset: this.endOffset,
      node: this.node,
    });
  }
}

let editorState = null;
let textNodes = null;

const resetRootNodeMocks = () => {
  ({editorState, textNodes} = getSampleSelectionMocksForTesting());
};

beforeEach(() => {
  resetRootNodeMocks();
});

describe('addFocusToSelection', () => {
  test('sets a new focus on the selection if selection.extend is unsupported', () => {
    const range = new Range({
      startOffset: 0,
      endOffset: 0,
      node: textNodes[0],
    });
    const selection = new Selection({range});
    const storedFocusNode = selection.focusNode;
    const storedFocusOffset = 3;
    addFocusToSelection(
      selection,
      storedFocusNode,
      storedFocusOffset,
      editorState.getSelection(),
    );
    expect(selection).toMatchSnapshot();
  });

  // If rangeCount is 0, selection.getRangeAt() will throw on various browsers
  test('the range is not updated if rangeCount is 0', () => {
    const selection = new Selection({});
    const storedFocusNode = selection.focusNode;
    const storedFocusOffset = 3;
    addFocusToSelection(
      selection,
      storedFocusNode,
      storedFocusOffset,
      editorState.getSelection(),
    );
    expect(selection).toMatchSnapshot();
  });
});
