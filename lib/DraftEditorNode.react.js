/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule DraftEditorNode.react
 * @format
 * 
 *
 * This is unstable and not part of the public API and should not be used by
 * production systems. This file may be update/removed without notice.
 */

'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DraftEditorDecoratedLeaves = require('./DraftEditorDecoratedLeaves.react');
var DraftEditorLeaf = require('./DraftEditorLeaf.react');
var DraftOffsetKey = require('./DraftOffsetKey');
var Immutable = require('immutable');
var React = require('react');

var cx = require('fbjs/lib/cx');

var List = Immutable.List;

var DraftEditorNode = function (_React$Component) {
  _inherits(DraftEditorNode, _React$Component);

  function DraftEditorNode() {
    _classCallCheck(this, DraftEditorNode);

    return _possibleConstructorReturn(this, _React$Component.apply(this, arguments));
  }

  DraftEditorNode.prototype.render = function render() {
    var _props = this.props,
        block = _props.block,
        contentState = _props.contentState,
        customStyleFn = _props.customStyleFn,
        customStyleMap = _props.customStyleMap,
        decorator = _props.decorator,
        direction = _props.direction,
        forceSelection = _props.forceSelection,
        hasSelection = _props.hasSelection,
        selection = _props.selection,
        tree = _props.tree;


    var blockKey = block.getKey();
    var text = block.getText();
    var lastLeafSet = tree.size - 1;

    var children = this.props.children || tree.map(function (leafSet, ii) {
      var decoratorKey = leafSet.get('decoratorKey');
      var leavesForLeafSet = leafSet.get('leaves');
      var lastLeaf = leavesForLeafSet.size - 1;
      var Leaves = leavesForLeafSet.map(function (leaf, jj) {
        var offsetKey = DraftOffsetKey.encode(blockKey, ii, jj);
        var start = leaf.get('start');
        var end = leaf.get('end');
        return React.createElement(DraftEditorLeaf, {
          key: offsetKey,
          offsetKey: offsetKey,
          block: block,
          start: start,
          selection: hasSelection ? selection : null,
          forceSelection: forceSelection,
          text: text.slice(start, end),
          styleSet: block.getInlineStyleAt(start),
          customStyleMap: customStyleMap,
          customStyleFn: customStyleFn,
          isLast: decoratorKey === lastLeafSet && jj === lastLeaf
        });
      }).toArray();

      if (!decoratorKey || !decorator) {
        return Leaves;
      }

      return React.createElement(DraftEditorDecoratedLeaves, {
        block: block,
        children: Leaves,
        contentState: contentState,
        decorator: decorator,
        decoratorKey: decoratorKey,
        direction: direction,
        leafSet: leafSet,
        text: text,
        key: ii
      });
    }).toArray();

    return React.createElement(
      'div',
      {
        'data-offset-key': DraftOffsetKey.encode(blockKey, 0, 0),
        className: cx({
          'public/DraftStyleDefault/block': true,
          'public/DraftStyleDefault/ltr': direction === 'LTR',
          'public/DraftStyleDefault/rtl': direction === 'RTL'
        }) },
      children
    );
  };

  return DraftEditorNode;
}(React.Component);

module.exports = DraftEditorNode;