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

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var DraftEditorTextNode = require("./DraftEditorTextNode.react");

var React = require("react");

var invariant = require("fbjs/lib/invariant");

var isHTMLBRElement = require("./isHTMLBRElement");

var setDraftEditorSelection = require("./setDraftEditorSelection").setDraftEditorSelection;

/**
 * All leaf nodes in the editor are spans with single text nodes. Leaf
 * elements are styled based on the merging of an optional custom style map
 * and a default style map.
 *
 * `DraftEditorLeaf` also provides a wrapper for calling into the imperative
 * DOM Selection API. In this way, top-level components can declaratively
 * maintain the selection state.
 */
var DraftEditorLeaf = /*#__PURE__*/function (_React$Component) {
  _inheritsLoose(DraftEditorLeaf, _React$Component);

  function DraftEditorLeaf() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;

    _defineProperty(_assertThisInitialized(_this), "leaf", void 0);

    return _this;
  }

  var _proto = DraftEditorLeaf.prototype;

  _proto._setSelection = function _setSelection() {
    var selection = this.props.selection; // If selection state is irrelevant to the parent block, no-op.

    if (selection == null || !selection.getHasFocus()) {
      return;
    }

    var _this$props = this.props,
        block = _this$props.block,
        start = _this$props.start,
        text = _this$props.text;
    var blockKey = block.getKey();
    var end = start + text.length;

    if (!selection.hasEdgeWithin(blockKey, start, end)) {
      return;
    } // Determine the appropriate target node for selection. If the child
    // is not a text node, it is a <br /> spacer. In this case, use the
    // <span> itself as the selection target.


    var node = this.leaf;
    !node ? process.env.NODE_ENV !== "production" ? invariant(false, 'Missing node') : invariant(false) : void 0;
    var child = node.firstChild;
    !child ? process.env.NODE_ENV !== "production" ? invariant(false, 'Missing child') : invariant(false) : void 0;
    var targetNode;

    if (child.nodeType === Node.TEXT_NODE) {
      targetNode = child;
    } else if (isHTMLBRElement(child)) {
      targetNode = node;
    } else {
      targetNode = child.firstChild;
      !targetNode ? process.env.NODE_ENV !== "production" ? invariant(false, 'Missing targetNode') : invariant(false) : void 0;
    }

    setDraftEditorSelection(selection, targetNode, blockKey, start, end);
  };

  _proto.shouldComponentUpdate = function shouldComponentUpdate(nextProps) {
    var leafNode = this.leaf;
    !leafNode ? process.env.NODE_ENV !== "production" ? invariant(false, 'Missing leafNode') : invariant(false) : void 0;
    var shouldUpdate = leafNode.textContent !== nextProps.text || nextProps.styleSet !== this.props.styleSet || nextProps.forceSelection;
    return shouldUpdate;
  };

  _proto.componentDidUpdate = function componentDidUpdate() {
    this._setSelection();
  };

  _proto.componentDidMount = function componentDidMount() {
    this._setSelection();
  };

  _proto.render = function render() {
    var _this2 = this;

    var block = this.props.block;
    var text = this.props.text; // If the leaf is at the end of its block and ends in a soft newline, append
    // an extra line feed character. Browsers collapse trailing newline
    // characters, which leaves the cursor in the wrong place after a
    // shift+enter. The extra character repairs this.

    if (text.endsWith('\n') && this.props.isLast) {
      text += '\n';
    }

    var _this$props2 = this.props,
        customStyleMap = _this$props2.customStyleMap,
        customStyleFn = _this$props2.customStyleFn,
        offsetKey = _this$props2.offsetKey,
        styleSet = _this$props2.styleSet;
    var styleObj = styleSet.reduce(function (map, styleName) {
      var mergedStyles = {};
      var style = customStyleMap[styleName];

      if (style !== undefined && map.textDecoration !== style.textDecoration) {
        // .trim() is necessary for IE9/10/11 and Edge
        mergedStyles.textDecoration = [map.textDecoration, style.textDecoration].join(' ').trim();
      }

      return _assign(map, style, mergedStyles);
    }, {});

    if (customStyleFn) {
      var newStyles = customStyleFn(styleSet, block);
      styleObj = _assign(styleObj, newStyles);
    }

    return /*#__PURE__*/React.createElement("span", {
      "data-offset-key": offsetKey,
      ref: function ref(_ref) {
        return _this2.leaf = _ref;
      },
      style: styleObj
    }, /*#__PURE__*/React.createElement(DraftEditorTextNode, null, text));
  };

  return DraftEditorLeaf;
}(React.Component);

module.exports = DraftEditorLeaf;