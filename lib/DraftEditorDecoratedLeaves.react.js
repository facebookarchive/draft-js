/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * 
 * @emails oncall+draft_js
 *
 * This is unstable and not part of the public API and should not be used by
 * production systems. This file may be update/removed without notice.
 */
'use strict';

var _assign = require("object-assign");

function _extends() { _extends = _assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var DraftOffsetKey = require("./DraftOffsetKey");

var React = require("react");

var UnicodeBidi = require("fbjs/lib/UnicodeBidi");

var UnicodeBidiDirection = require("fbjs/lib/UnicodeBidiDirection");

var DraftEditorDecoratedLeaves = /*#__PURE__*/function (_React$Component) {
  _inheritsLoose(DraftEditorDecoratedLeaves, _React$Component);

  function DraftEditorDecoratedLeaves() {
    return _React$Component.apply(this, arguments) || this;
  }

  var _proto = DraftEditorDecoratedLeaves.prototype;

  _proto.render = function render() {
    var _this$props = this.props,
        block = _this$props.block,
        children = _this$props.children,
        contentState = _this$props.contentState,
        decorator = _this$props.decorator,
        decoratorKey = _this$props.decoratorKey,
        direction = _this$props.direction,
        leafSet = _this$props.leafSet,
        text = _this$props.text;
    var blockKey = block.getKey();
    var leavesForLeafSet = leafSet.get('leaves');
    var DecoratorComponent = decorator.getComponentForKey(decoratorKey);
    var decoratorProps = decorator.getPropsForKey(decoratorKey);
    var decoratorOffsetKey = DraftOffsetKey.encode(blockKey, parseInt(decoratorKey, 10), 0);
    var decoratedText = text.slice(leavesForLeafSet.first().get('start'), leavesForLeafSet.last().get('end')); // Resetting dir to the same value on a child node makes Chrome/Firefox
    // confused on cursor movement. See http://jsfiddle.net/d157kLck/3/

    var dir = UnicodeBidiDirection.getHTMLDirIfDifferent(UnicodeBidi.getDirection(decoratedText), direction);
    return React.createElement(DecoratorComponent, _extends({}, decoratorProps, {
      contentState: contentState,
      decoratedText: decoratedText,
      dir: dir,
      key: decoratorOffsetKey,
      entityKey: block.getEntityAt(leafSet.get('start')),
      offsetKey: decoratorOffsetKey
    }), children);
  };

  return DraftEditorDecoratedLeaves;
}(React.Component);

module.exports = DraftEditorDecoratedLeaves;