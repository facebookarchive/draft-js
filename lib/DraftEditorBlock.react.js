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

var _assign = require("object-assign");

function _extends() { _extends = _assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var DraftEditorLeaf = require("./DraftEditorLeaf.react");

var DraftOffsetKey = require("./DraftOffsetKey");

var React = require("react");

var Scroll = require("fbjs/lib/Scroll");

var Style = require("fbjs/lib/Style");

var UnicodeBidi = require("fbjs/lib/UnicodeBidi");

var UnicodeBidiDirection = require("fbjs/lib/UnicodeBidiDirection");

var cx = require("fbjs/lib/cx");

var getElementPosition = require("fbjs/lib/getElementPosition");

var getScrollPosition = require("fbjs/lib/getScrollPosition");

var getViewportDimensions = require("fbjs/lib/getViewportDimensions");

var invariant = require("fbjs/lib/invariant");

var isHTMLElement = require("./isHTMLElement");

var nullthrows = require("fbjs/lib/nullthrows");

var SCROLL_BUFFER = 10;

/**
 * Return whether a block overlaps with either edge of the `SelectionState`.
 */
var isBlockOnSelectionEdge = function isBlockOnSelectionEdge(selection, key) {
  return selection.getAnchorKey() === key || selection.getFocusKey() === key;
};
/**
 * The default block renderer for a `DraftEditor` component.
 *
 * A `DraftEditorBlock` is able to render a given `ContentBlock` to its
 * appropriate decorator and inline style components.
 */


var DraftEditorBlock = /*#__PURE__*/function (_React$Component) {
  _inheritsLoose(DraftEditorBlock, _React$Component);

  function DraftEditorBlock() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;

    _defineProperty(_assertThisInitialized(_this), "_node", void 0);

    return _this;
  }

  var _proto = DraftEditorBlock.prototype;

  _proto.shouldComponentUpdate = function shouldComponentUpdate(nextProps) {
    return this.props.block !== nextProps.block || this.props.tree !== nextProps.tree || this.props.direction !== nextProps.direction || isBlockOnSelectionEdge(nextProps.selection, nextProps.block.getKey()) && nextProps.forceSelection;
  }
  /**
   * When a block is mounted and overlaps the selection state, we need to make
   * sure that the cursor is visible to match native behavior. This may not
   * be the case if the user has pressed `RETURN` or pasted some content, since
   * programmatically creating these new blocks and setting the DOM selection
   * will miss out on the browser natively scrolling to that position.
   *
   * To replicate native behavior, if the block overlaps the selection state
   * on mount, force the scroll position. Check the scroll state of the scroll
   * parent, and adjust it to align the entire block to the bottom of the
   * scroll parent.
   */
  ;

  _proto.componentDidMount = function componentDidMount() {
    if (this.props.preventScroll) {
      return;
    }

    var selection = this.props.selection;
    var endKey = selection.getEndKey();

    if (!selection.getHasFocus() || endKey !== this.props.block.getKey()) {
      return;
    }

    var blockNode = this._node;

    if (blockNode == null) {
      return;
    }

    var scrollParent = Style.getScrollParent(blockNode);
    var scrollPosition = getScrollPosition(scrollParent);
    var scrollDelta;

    if (scrollParent === window) {
      var nodePosition = getElementPosition(blockNode);
      var nodeBottom = nodePosition.y + nodePosition.height;
      var viewportHeight = getViewportDimensions().height;
      scrollDelta = nodeBottom - viewportHeight;

      if (scrollDelta > 0) {
        window.scrollTo(scrollPosition.x, scrollPosition.y + scrollDelta + SCROLL_BUFFER);
      }
    } else {
      !isHTMLElement(blockNode) ? process.env.NODE_ENV !== "production" ? invariant(false, 'blockNode is not an HTMLElement') : invariant(false) : void 0;
      var blockBottom = blockNode.offsetHeight + blockNode.offsetTop;
      var pOffset = scrollParent.offsetTop + scrollParent.offsetHeight;
      var scrollBottom = pOffset + scrollPosition.y;
      scrollDelta = blockBottom - scrollBottom;

      if (scrollDelta > 0) {
        Scroll.setTop(scrollParent, Scroll.getTop(scrollParent) + scrollDelta + SCROLL_BUFFER);
      }
    }
  };

  _proto._renderChildren = function _renderChildren() {
    var _this2 = this;

    var block = this.props.block;
    var blockKey = block.getKey();
    var text = block.getText();
    var lastLeafSet = this.props.tree.size - 1;
    var hasSelection = isBlockOnSelectionEdge(this.props.selection, blockKey);
    return this.props.tree.map(function (leafSet, ii) {
      var leavesForLeafSet = leafSet.get('leaves'); // T44088704

      if (leavesForLeafSet.size === 0) {
        return null;
      }

      var lastLeaf = leavesForLeafSet.size - 1;
      var leaves = leavesForLeafSet.map(function (leaf, jj) {
        var offsetKey = DraftOffsetKey.encode(blockKey, ii, jj);
        var start = leaf.get('start');
        var end = leaf.get('end');
        return React.createElement(DraftEditorLeaf, {
          key: offsetKey,
          offsetKey: offsetKey,
          block: block,
          start: start,
          selection: hasSelection ? _this2.props.selection : null,
          forceSelection: _this2.props.forceSelection,
          text: text.slice(start, end),
          styleSet: block.getInlineStyleAt(start),
          customStyleMap: _this2.props.customStyleMap,
          customStyleFn: _this2.props.customStyleFn,
          isLast: ii === lastLeafSet && jj === lastLeaf
        });
      }).toArray();
      var decoratorKey = leafSet.get('decoratorKey');

      if (decoratorKey == null) {
        return leaves;
      }

      if (!_this2.props.decorator) {
        return leaves;
      }

      var decorator = nullthrows(_this2.props.decorator);
      var DecoratorComponent = decorator.getComponentForKey(decoratorKey);

      if (!DecoratorComponent) {
        return leaves;
      }

      var decoratorProps = decorator.getPropsForKey(decoratorKey);
      var decoratorOffsetKey = DraftOffsetKey.encode(blockKey, ii, 0);
      var start = leavesForLeafSet.first().get('start');
      var end = leavesForLeafSet.last().get('end');
      var decoratedText = text.slice(start, end);
      var entityKey = block.getEntityAt(leafSet.get('start')); // Resetting dir to the same value on a child node makes Chrome/Firefox
      // confused on cursor movement. See http://jsfiddle.net/d157kLck/3/

      var dir = UnicodeBidiDirection.getHTMLDirIfDifferent(UnicodeBidi.getDirection(decoratedText), _this2.props.direction);
      var commonProps = {
        contentState: _this2.props.contentState,
        decoratedText: decoratedText,
        dir: dir,
        start: start,
        end: end,
        blockKey: blockKey,
        entityKey: entityKey,
        offsetKey: decoratorOffsetKey
      };
      return React.createElement(DecoratorComponent, _extends({}, decoratorProps, commonProps, {
        key: decoratorOffsetKey
      }), leaves);
    }).toArray();
  };

  _proto.render = function render() {
    var _this3 = this;

    var _this$props = this.props,
        direction = _this$props.direction,
        offsetKey = _this$props.offsetKey;
    var className = cx({
      'public/DraftStyleDefault/block': true,
      'public/DraftStyleDefault/ltr': direction === 'LTR',
      'public/DraftStyleDefault/rtl': direction === 'RTL'
    });
    return React.createElement("div", {
      "data-offset-key": offsetKey,
      className: className,
      ref: function ref(_ref) {
        return _this3._node = _ref;
      }
    }, this._renderChildren());
  };

  return DraftEditorBlock;
}(React.Component);

module.exports = DraftEditorBlock;