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

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var React = require("react");

var UserAgent = require("fbjs/lib/UserAgent");

var invariant = require("fbjs/lib/invariant");

var isElement = require("./isElement"); // In IE, spans with <br> tags render as two newlines. By rendering a span
// with only a newline character, we can be sure to render a single line.


var useNewlineChar = UserAgent.isBrowser('IE <= 11');
/**
 * Check whether the node should be considered a newline.
 */

function isNewline(node) {
  return useNewlineChar ? node.textContent === '\n' : node.tagName === 'BR';
}
/**
 * Placeholder elements for empty text content.
 *
 * What is this `data-text` attribute, anyway? It turns out that we need to
 * put an attribute on the lowest-level text node in order to preserve correct
 * spellcheck handling. If the <span> is naked, Chrome and Safari may do
 * bizarre things to do the DOM -- split text nodes, create extra spans, etc.
 * If the <span> has an attribute, this appears not to happen.
 * See http://jsfiddle.net/9khdavod/ for the failure case, and
 * http://jsfiddle.net/7pg143f7/ for the fixed case.
 */


var NEWLINE_A = function NEWLINE_A(ref) {
  return useNewlineChar ? React.createElement("span", {
    key: "A",
    "data-text": "true",
    ref: ref
  }, '\n') : React.createElement("br", {
    key: "A",
    "data-text": "true",
    ref: ref
  });
};

var NEWLINE_B = function NEWLINE_B(ref) {
  return useNewlineChar ? React.createElement("span", {
    key: "B",
    "data-text": "true",
    ref: ref
  }, '\n') : React.createElement("br", {
    key: "B",
    "data-text": "true",
    ref: ref
  });
};

/**
 * The lowest-level component in a `DraftEditor`, the text node component
 * replaces the default React text node implementation. This allows us to
 * perform custom handling of newline behavior and avoid re-rendering text
 * nodes with DOM state that already matches the expectations of our immutable
 * editor state.
 */
var DraftEditorTextNode = /*#__PURE__*/function (_React$Component) {
  _inheritsLoose(DraftEditorTextNode, _React$Component);

  function DraftEditorTextNode(props) {
    var _this;

    _this = _React$Component.call(this, props) || this; // By flipping this flag, we also keep flipping keys which forces
    // React to remount this node every time it rerenders.

    _defineProperty(_assertThisInitialized(_this), "_forceFlag", void 0);

    _defineProperty(_assertThisInitialized(_this), "_node", void 0);

    _this._forceFlag = false;
    return _this;
  }

  var _proto = DraftEditorTextNode.prototype;

  _proto.shouldComponentUpdate = function shouldComponentUpdate(nextProps) {
    var node = this._node;
    var shouldBeNewline = nextProps.children === '';
    !isElement(node) ? process.env.NODE_ENV !== "production" ? invariant(false, 'node is not an Element') : invariant(false) : void 0;
    var elementNode = node;

    if (shouldBeNewline) {
      return !isNewline(elementNode);
    }

    return elementNode.textContent !== nextProps.children;
  };

  _proto.componentDidMount = function componentDidMount() {
    this._forceFlag = !this._forceFlag;
  };

  _proto.componentDidUpdate = function componentDidUpdate() {
    this._forceFlag = !this._forceFlag;
  };

  _proto.render = function render() {
    var _this2 = this;

    if (this.props.children === '') {
      return this._forceFlag ? NEWLINE_A(function (ref) {
        return _this2._node = ref;
      }) : NEWLINE_B(function (ref) {
        return _this2._node = ref;
      });
    }

    return React.createElement("span", {
      key: this._forceFlag ? 'A' : 'B',
      "data-text": "true",
      ref: function ref(_ref) {
        return _this2._node = _ref;
      }
    }, this.props.children);
  };

  return DraftEditorTextNode;
}(React.Component);

module.exports = DraftEditorTextNode;