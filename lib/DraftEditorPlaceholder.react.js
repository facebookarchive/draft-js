/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule DraftEditorPlaceholder.react
 * @format
 * 
 */

'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('react');

var cx = require('fbjs/lib/cx');

/**
 * This component is responsible for rendering placeholder text for the
 * `DraftEditor` component.
 *
 * Override placeholder style via CSS.
 */
var DraftEditorPlaceholder = function (_React$Component) {
  _inherits(DraftEditorPlaceholder, _React$Component);

  function DraftEditorPlaceholder() {
    _classCallCheck(this, DraftEditorPlaceholder);

    return _possibleConstructorReturn(this, _React$Component.apply(this, arguments));
  }

  DraftEditorPlaceholder.prototype.shouldComponentUpdate = function shouldComponentUpdate(nextProps) {
    return this.props.text !== nextProps.text || this.props.editorState.getSelection().getHasFocus() !== nextProps.editorState.getSelection().getHasFocus();
  };

  DraftEditorPlaceholder.prototype.render = function render() {
    var hasFocus = this.props.editorState.getSelection().getHasFocus();

    var className = cx({
      'public/DraftEditorPlaceholder/root': true,
      'public/DraftEditorPlaceholder/hasFocus': hasFocus
    });

    var contentStyle = {
      whiteSpace: 'pre-wrap'
    };

    return React.createElement(
      'div',
      { className: className },
      React.createElement(
        'div',
        {
          className: cx('public/DraftEditorPlaceholder/inner'),
          id: this.props.accessibilityID,
          style: contentStyle },
        this.props.text
      )
    );
  };

  return DraftEditorPlaceholder;
}(React.Component);

module.exports = DraftEditorPlaceholder;