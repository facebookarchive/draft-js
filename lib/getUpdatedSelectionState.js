/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * 
 * @emails oncall+draft_js
 */
'use strict';

var DraftOffsetKey = require("./DraftOffsetKey");

var nullthrows = require("fbjs/lib/nullthrows");

function getUpdatedSelectionState(editorState, anchorKey, anchorOffset, focusKey, focusOffset) {
  var selection = nullthrows(editorState.getSelection());

  if (!anchorKey || !focusKey) {
    // If we cannot make sense of the updated selection state, stick to the current one.
    if (process.env.NODE_ENV !== "production") {
      /* eslint-disable-next-line */
      console.warn('Invalid selection state.', arguments, editorState.toJS());
    }

    return selection;
  }

  var anchorPath = DraftOffsetKey.decode(anchorKey);
  var anchorBlockKey = anchorPath.blockKey;
  var anchorLeafBlockTree = editorState.getBlockTree(anchorBlockKey);
  var anchorLeaf = anchorLeafBlockTree && anchorLeafBlockTree.getIn([anchorPath.decoratorKey, 'leaves', anchorPath.leafKey]);
  var focusPath = DraftOffsetKey.decode(focusKey);
  var focusBlockKey = focusPath.blockKey;
  var focusLeafBlockTree = editorState.getBlockTree(focusBlockKey);
  var focusLeaf = focusLeafBlockTree && focusLeafBlockTree.getIn([focusPath.decoratorKey, 'leaves', focusPath.leafKey]);

  if (!anchorLeaf || !focusLeaf) {
    // If we cannot make sense of the updated selection state, stick to the current one.
    if (process.env.NODE_ENV !== "production") {
      /* eslint-disable-next-line */
      console.warn('Invalid selection state.', arguments, editorState.toJS());
    }

    return selection;
  }

  var anchorLeafStart = anchorLeaf.get('start');
  var focusLeafStart = focusLeaf.get('start');
  var anchorBlockOffset = anchorLeaf ? anchorLeafStart + anchorOffset : null;
  var focusBlockOffset = focusLeaf ? focusLeafStart + focusOffset : null;
  var areEqual = selection.getAnchorKey() === anchorBlockKey && selection.getAnchorOffset() === anchorBlockOffset && selection.getFocusKey() === focusBlockKey && selection.getFocusOffset() === focusBlockOffset;

  if (areEqual) {
    return selection;
  }

  var isBackward = false;

  if (anchorBlockKey === focusBlockKey) {
    var anchorLeafEnd = anchorLeaf.get('end');
    var focusLeafEnd = focusLeaf.get('end');

    if (focusLeafStart === anchorLeafStart && focusLeafEnd === anchorLeafEnd) {
      isBackward = focusOffset < anchorOffset;
    } else {
      isBackward = focusLeafStart < anchorLeafStart;
    }
  } else {
    var startKey = editorState.getCurrentContent().getBlockMap().keySeq().skipUntil(function (v) {
      return v === anchorBlockKey || v === focusBlockKey;
    }).first();
    isBackward = startKey === focusBlockKey;
  }

  return selection.merge({
    anchorKey: anchorBlockKey,
    anchorOffset: anchorBlockOffset,
    focusKey: focusBlockKey,
    focusOffset: focusBlockOffset,
    isBackward: isBackward
  });
}

module.exports = getUpdatedSelectionState;