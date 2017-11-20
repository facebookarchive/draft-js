/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule DraftEditorDecoratedLeaves.react
 * @format
 * 
 *
 * This is unstable and not part of the public API and should not be used by
 * production systems. This file may be update/removed without notice.
 */

'use strict';

var _assign = require('object-assign');

var _extends = _assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DraftOffsetKey = require('./DraftOffsetKey');
var React = require('react');
var UnicodeBidi = require('fbjs/lib/UnicodeBidi');
var UnicodeBidiDirection = require('fbjs/lib/UnicodeBidiDirection');

var DraftEditorDecoratedLeaves = function (_React$Component) {
  _inherits(DraftEditorDecoratedLeaves, _React$Component);

  function DraftEditorDecoratedLeaves() {
    _classCallCheck(this, DraftEditorDecoratedLeaves);

    return _possibleConstructorReturn(this, _React$Component.apply(this, arguments));
  }

  DraftEditorDecoratedLeaves.prototype.render = function render() {
    var _props = this.props,
        block = _props.block,
        children = _props.children,
        contentState = _props.contentState,
        decorator = _props.decorator,
        decoratorKey = _props.decoratorKey,
        direction = _props.direction,
        leafSet = _props.leafSet,
        text = _props.text;


    var blockKey = block.getKey();
    var leavesForLeafSet = leafSet.get('leaves');
    var DecoratorComponent = decorator.getComponentForKey(decoratorKey);
    var decoratorProps = decorator.getPropsForKey(decoratorKey);
    var decoratorOffsetKey = DraftOffsetKey.encode(blockKey, parseInt(decoratorKey, 10), 0);

    var decoratedText = text.slice(leavesForLeafSet.first().get('start'), leavesForLeafSet.last().get('end'));

    // Resetting dir to the same value on a child node makes Chrome/Firefox
    // confused on cursor movement. See http://jsfiddle.net/d157kLck/3/
    var dir = UnicodeBidiDirection.getHTMLDirIfDifferent(UnicodeBidi.getDirection(decoratedText), direction);

    return React.createElement(
      DecoratorComponent,
      _extends({}, decoratorProps, {
        contentState: contentState,
        decoratedText: decoratedText,
        dir: dir,
        key: decoratorOffsetKey,
        entityKey: block.getEntityAt(leafSet.get('start')),
        offsetKey: decoratorOffsetKey }),
      children
    );
  };

  return DraftEditorDecoratedLeaves;
}(React.Component);

module.exports = DraftEditorDecoratedLeaves;