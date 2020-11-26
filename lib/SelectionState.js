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

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var Immutable = require("immutable");

var Record = Immutable.Record;
var defaultRecord = {
  anchorKey: '',
  anchorOffset: 0,
  focusKey: '',
  focusOffset: 0,
  isBackward: false,
  hasFocus: false
};
/* $FlowFixMe[unclear-type] This comment suppresses an error found when
 * automatically adding a type annotation with the codemod Komodo/Annotate_
 * exports. To see the error delete this comment and run Flow. */

var SelectionStateRecord = Record(defaultRecord);

var SelectionState = /*#__PURE__*/function (_SelectionStateRecord) {
  _inheritsLoose(SelectionState, _SelectionStateRecord);

  function SelectionState() {
    return _SelectionStateRecord.apply(this, arguments) || this;
  }

  var _proto = SelectionState.prototype;

  _proto.serialize = function serialize() {
    return 'Anchor: ' + this.getAnchorKey() + ':' + this.getAnchorOffset() + ', ' + 'Focus: ' + this.getFocusKey() + ':' + this.getFocusOffset() + ', ' + 'Is Backward: ' + String(this.getIsBackward()) + ', ' + 'Has Focus: ' + String(this.getHasFocus());
  };

  _proto.getAnchorKey = function getAnchorKey() {
    return this.get('anchorKey');
  };

  _proto.getAnchorOffset = function getAnchorOffset() {
    return this.get('anchorOffset');
  };

  _proto.getFocusKey = function getFocusKey() {
    return this.get('focusKey');
  };

  _proto.getFocusOffset = function getFocusOffset() {
    return this.get('focusOffset');
  };

  _proto.getIsBackward = function getIsBackward() {
    return this.get('isBackward');
  };

  _proto.getHasFocus = function getHasFocus() {
    return this.get('hasFocus');
  }
  /**
   * Return whether the specified range overlaps with an edge of the
   * SelectionState.
   */
  ;

  _proto.hasEdgeWithin = function hasEdgeWithin(blockKey, start, end) {
    var anchorKey = this.getAnchorKey();
    var focusKey = this.getFocusKey();

    if (anchorKey === focusKey && anchorKey === blockKey) {
      var selectionStart = this.getStartOffset();
      var selectionEnd = this.getEndOffset();
      return start <= selectionStart && selectionStart <= end || // selectionStart is between start and end, or
      start <= selectionEnd && selectionEnd <= end // selectionEnd is between start and end
      ;
    }

    if (blockKey !== anchorKey && blockKey !== focusKey) {
      return false;
    }

    var offsetToCheck = blockKey === anchorKey ? this.getAnchorOffset() : this.getFocusOffset();
    return start <= offsetToCheck && end >= offsetToCheck;
  };

  _proto.isCollapsed = function isCollapsed() {
    return this.getAnchorKey() === this.getFocusKey() && this.getAnchorOffset() === this.getFocusOffset();
  };

  _proto.getStartKey = function getStartKey() {
    return this.getIsBackward() ? this.getFocusKey() : this.getAnchorKey();
  };

  _proto.getStartOffset = function getStartOffset() {
    return this.getIsBackward() ? this.getFocusOffset() : this.getAnchorOffset();
  };

  _proto.getEndKey = function getEndKey() {
    return this.getIsBackward() ? this.getAnchorKey() : this.getFocusKey();
  };

  _proto.getEndOffset = function getEndOffset() {
    return this.getIsBackward() ? this.getAnchorOffset() : this.getFocusOffset();
  };

  SelectionState.createEmpty = function createEmpty(key) {
    return new SelectionState({
      anchorKey: key,
      anchorOffset: 0,
      focusKey: key,
      focusOffset: 0,
      isBackward: false,
      hasFocus: false
    });
  };

  return SelectionState;
}(SelectionStateRecord);

module.exports = SelectionState;