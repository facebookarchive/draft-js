/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule DraftEditor.react
 * @typechecks
 * 
 * @preventMunge
 */

'use strict';

var _assign = require('object-assign');

var _extends = _assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DefaultDraftBlockRenderMap = require('./DefaultDraftBlockRenderMap');
var DefaultDraftInlineStyle = require('./DefaultDraftInlineStyle');
var DraftEditorCompositionHandler = require('./DraftEditorCompositionHandler');
var DraftEditorContents = require('./DraftEditorContents.react');
var DraftEditorDragHandler = require('./DraftEditorDragHandler');
var DraftEditorEditHandler = require('./DraftEditorEditHandler');
var DraftEditorPlaceholder = require('./DraftEditorPlaceholder.react');
var EditorState = require('./EditorState');
var React = require('react');
var ReactDOM = require('react-dom');
var Scroll = require('fbjs/lib/Scroll');
var Style = require('fbjs/lib/Style');
var UserAgent = require('fbjs/lib/UserAgent');

var cx = require('fbjs/lib/cx');
var emptyFunction = require('fbjs/lib/emptyFunction');
var generateRandomKey = require('./generateRandomKey');
var getDefaultKeyBinding = require('./getDefaultKeyBinding');
var nullthrows = require('fbjs/lib/nullthrows');
var getScrollPosition = require('fbjs/lib/getScrollPosition');

var isIE = UserAgent.isBrowser('IE');

// IE does not support the `input` event on contentEditable, so we can't
// observe spellcheck behavior.
var allowSpellCheck = !isIE;

// Define a set of handler objects to correspond to each possible `mode`
// of editor behavior.
var handlerMap = {
  'edit': DraftEditorEditHandler,
  'composite': DraftEditorCompositionHandler,
  'drag': DraftEditorDragHandler,
  'cut': null,
  'render': null
};

/**
 * `DraftEditor` is the root editor component. It composes a `contentEditable`
 * div, and provides a wide variety of useful function props for managing the
 * state of the editor. See `DraftEditorProps` for details.
 */
var DraftEditor = function (_React$Component) {
  _inherits(DraftEditor, _React$Component);

  function DraftEditor(props) {
    _classCallCheck(this, DraftEditor);

    var _this = _possibleConstructorReturn(this, _React$Component.call(this, props));

    _this._blockSelectEvents = false;
    _this._clipboard = null;
    _this._handler = null;
    _this._dragCount = 0;
    _this._editorKey = generateRandomKey();
    _this._placeholderAccessibilityID = 'placeholder-' + _this._editorKey;
    _this._latestEditorState = props.editorState;

    _this._onBeforeInput = _this._buildHandler('onBeforeInput');
    _this._onBlur = _this._buildHandler('onBlur');
    _this._onCharacterData = _this._buildHandler('onCharacterData');
    _this._onCompositionEnd = _this._buildHandler('onCompositionEnd');
    _this._onCompositionStart = _this._buildHandler('onCompositionStart');
    _this._onCopy = _this._buildHandler('onCopy');
    _this._onCut = _this._buildHandler('onCut');
    _this._onDragEnd = _this._buildHandler('onDragEnd');
    _this._onDragOver = _this._buildHandler('onDragOver');
    _this._onDragStart = _this._buildHandler('onDragStart');
    _this._onDrop = _this._buildHandler('onDrop');
    _this._onInput = _this._buildHandler('onInput');
    _this._onFocus = _this._buildHandler('onFocus');
    _this._onKeyDown = _this._buildHandler('onKeyDown');
    _this._onKeyPress = _this._buildHandler('onKeyPress');
    _this._onKeyUp = _this._buildHandler('onKeyUp');
    _this._onMouseDown = _this._buildHandler('onMouseDown');
    _this._onMouseUp = _this._buildHandler('onMouseUp');
    _this._onPaste = _this._buildHandler('onPaste');
    _this._onSelect = _this._buildHandler('onSelect');

    // Manual binding for public and internal methods.
    _this.focus = _this._focus.bind(_this);
    _this.blur = _this._blur.bind(_this);
    _this.setMode = _this._setMode.bind(_this);
    _this.exitCurrentMode = _this._exitCurrentMode.bind(_this);
    _this.restoreEditorDOM = _this._restoreEditorDOM.bind(_this);
    _this.setClipboard = _this._setClipboard.bind(_this);
    _this.getClipboard = _this._getClipboard.bind(_this);
    _this.getEditorKey = function () {
      return _this._editorKey;
    };
    _this.update = _this._update.bind(_this);
    _this.onDragEnter = _this._onDragEnter.bind(_this);
    _this.onDragLeave = _this._onDragLeave.bind(_this);

    // See `_restoreEditorDOM()`.
    _this.state = { containerKey: 0 };
    return _this;
  }

  /**
   * Build a method that will pass the event to the specified handler method.
   * This allows us to look up the correct handler function for the current
   * editor mode, if any has been specified.
   */


  /**
   * Define proxies that can route events to the current handler.
   */


  DraftEditor.prototype._buildHandler = function _buildHandler(eventName) {
    var _this2 = this;

    return function (e) {
      if (!_this2.props.readOnly) {
        var method = _this2._handler && _this2._handler[eventName];
        method && method(_this2, e);
      }
    };
  };

  DraftEditor.prototype._showPlaceholder = function _showPlaceholder() {
    return !!this.props.placeholder && !this.props.editorState.isInCompositionMode() && !this.props.editorState.getCurrentContent().hasText();
  };

  DraftEditor.prototype._renderPlaceholder = function _renderPlaceholder() {
    if (this._showPlaceholder()) {
      return React.createElement(DraftEditorPlaceholder, {
        text: nullthrows(this.props.placeholder),
        editorState: this.props.editorState,
        textAlignment: this.props.textAlignment,
        accessibilityID: this._placeholderAccessibilityID
      });
    }
    return null;
  };

  DraftEditor.prototype.render = function render() {
    var _props = this.props,
        readOnly = _props.readOnly,
        textAlignment = _props.textAlignment;

    var rootClass = cx({
      'DraftEditor/root': true,
      'DraftEditor/alignLeft': textAlignment === 'left',
      'DraftEditor/alignRight': textAlignment === 'right',
      'DraftEditor/alignCenter': textAlignment === 'center'
    });

    var contentStyle = {
      outline: 'none',
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word'
    };

    return React.createElement(
      'div',
      { className: rootClass },
      this._renderPlaceholder(),
      React.createElement(
        'div',
        {
          className: cx('DraftEditor/editorContainer'),
          key: 'editor' + this.state.containerKey,
          ref: 'editorContainer' },
        React.createElement(
          'div',
          {
            'aria-activedescendant': readOnly ? null : this.props.ariaActiveDescendantID,
            'aria-autocomplete': readOnly ? null : this.props.ariaAutoComplete,
            'aria-describedby': this._showPlaceholder() ? this._placeholderAccessibilityID : null,
            'aria-expanded': readOnly ? null : this.props.ariaExpanded,
            'aria-haspopup': readOnly ? null : this.props.ariaHasPopup,
            'aria-label': this.props.ariaLabel,
            'aria-owns': readOnly ? null : this.props.ariaOwneeID,
            className: cx('public/DraftEditor/content'),
            contentEditable: !readOnly,
            'data-testid': this.props.webDriverTestID,
            onBeforeInput: this._onBeforeInput,
            onBlur: this._onBlur,
            onCompositionEnd: this._onCompositionEnd,
            onCompositionStart: this._onCompositionStart,
            onCopy: this._onCopy,
            onCut: this._onCut,
            onDragEnd: this._onDragEnd,
            onDragEnter: this.onDragEnter,
            onDragLeave: this.onDragLeave,
            onDragOver: this._onDragOver,
            onDragStart: this._onDragStart,
            onDrop: this._onDrop,
            onFocus: this._onFocus,
            onInput: this._onInput,
            onKeyDown: this._onKeyDown,
            onKeyPress: this._onKeyPress,
            onKeyUp: this._onKeyUp,
            onMouseUp: this._onMouseUp,
            onPaste: this._onPaste,
            onSelect: this._onSelect,
            ref: 'editor',
            role: readOnly ? null : this.props.role || 'textbox',
            spellCheck: allowSpellCheck && this.props.spellCheck,
            style: contentStyle,
            suppressContentEditableWarning: true,
            tabIndex: this.props.tabIndex },
          React.createElement(DraftEditorContents, {
            blockRenderMap: this.props.blockRenderMap,
            blockRendererFn: this.props.blockRendererFn,
            blockStyleFn: this.props.blockStyleFn,
            customStyleMap: _extends({}, DefaultDraftInlineStyle, this.props.customStyleMap),
            customStyleFn: this.props.customStyleFn,
            editorKey: this._editorKey,
            editorState: this.props.editorState
          })
        )
      )
    );
  };

  DraftEditor.prototype.componentDidMount = function componentDidMount() {
    this.setMode('edit');

    /**
     * IE has a hardcoded "feature" that attempts to convert link text into
     * anchors in contentEditable DOM. This breaks the editor's expectations of
     * the DOM, and control is lost. Disable it to make IE behave.
     * See: http://blogs.msdn.com/b/ieinternals/archive/2010/09/15/
     * ie9-beta-minor-change-list.aspx
     */
    if (isIE) {
      document.execCommand('AutoUrlDetect', false, false);
    }
  };

  /**
   * Prevent selection events from affecting the current editor state. This
   * is mostly intended to defend against IE, which fires off `selectionchange`
   * events regardless of whether the selection is set via the browser or
   * programmatically. We only care about selection events that occur because
   * of browser interaction, not re-renders and forced selections.
   */


  DraftEditor.prototype.componentWillUpdate = function componentWillUpdate(nextProps) {
    this._blockSelectEvents = true;
    this._latestEditorState = nextProps.editorState;
  };

  DraftEditor.prototype.componentDidUpdate = function componentDidUpdate() {
    this._blockSelectEvents = false;
  };

  /**
   * Used via `this.focus()`.
   *
   * Force focus back onto the editor node.
   *
   * Forcing focus causes the browser to scroll to the top of the editor, which
   * may be undesirable when the editor is taller than the viewport. To solve
   * this, either use a specified scroll position (in cases like `cut` behavior
   * where it should be restored to a known position) or store the current
   * scroll state and put it back in place after focus has been forced.
   */


  DraftEditor.prototype._focus = function _focus(scrollPosition) {
    var editorState = this.props.editorState;

    var alreadyHasFocus = editorState.getSelection().getHasFocus();
    var editorNode = ReactDOM.findDOMNode(this.refs.editor);

    var scrollParent = Style.getScrollParent(editorNode);

    var _ref = scrollPosition || getScrollPosition(scrollParent),
        x = _ref.x,
        y = _ref.y;

    editorNode.focus();
    if (scrollParent === window) {
      window.scrollTo(x, y);
    } else {
      Scroll.setTop(scrollParent, y);
    }

    // On Chrome and Safari, calling focus on contenteditable focuses the
    // cursor at the first character. This is something you don't expect when
    // you're clicking on an input element but not directly on a character.
    // Put the cursor back where it was before the blur.
    if (!alreadyHasFocus) {
      this.update(EditorState.forceSelection(editorState, editorState.getSelection()));
    }
  };

  DraftEditor.prototype._blur = function _blur() {
    ReactDOM.findDOMNode(this.refs.editor).blur();
  };

  /**
   * Used via `this.setMode(...)`.
   *
   * Set the behavior mode for the editor component. This switches the current
   * handler module to ensure that DOM events are managed appropriately for
   * the active mode.
   */


  DraftEditor.prototype._setMode = function _setMode(mode) {
    this._handler = handlerMap[mode];
  };

  DraftEditor.prototype._exitCurrentMode = function _exitCurrentMode() {
    this.setMode('edit');
  };

  /**
   * Used via `this.restoreEditorDOM()`.
   *
   * Force a complete re-render of the editor based on the current EditorState.
   * This is useful when we know we are going to lose control of the DOM
   * state (cut command, IME) and we want to make sure that reconciliation
   * occurs on a version of the DOM that is synchronized with our EditorState.
   */


  DraftEditor.prototype._restoreEditorDOM = function _restoreEditorDOM(scrollPosition) {
    var _this3 = this;

    this.setState({ containerKey: this.state.containerKey + 1 }, function () {
      _this3._focus(scrollPosition);
    });
  };

  /**
   * Used via `this.setClipboard(...)`.
   *
   * Set the clipboard state for a cut/copy event.
   */


  DraftEditor.prototype._setClipboard = function _setClipboard(clipboard) {
    this._clipboard = clipboard;
  };

  /**
   * Used via `this.getClipboard()`.
   *
   * Retrieve the clipboard state for a cut/copy event.
   */


  DraftEditor.prototype._getClipboard = function _getClipboard() {
    return this._clipboard;
  };

  /**
   * Used via `this.update(...)`.
   *
   * Propagate a new `EditorState` object to higher-level components. This is
   * the method by which event handlers inform the `DraftEditor` component of
   * state changes. A component that composes a `DraftEditor` **must** provide
   * an `onChange` prop to receive state updates passed along from this
   * function.
   */


  DraftEditor.prototype._update = function _update(editorState) {
    this._latestEditorState = editorState;
    this.props.onChange(editorState);
  };

  /**
   * Used in conjunction with `_onDragLeave()`, by counting the number of times
   * a dragged element enters and leaves the editor (or any of its children),
   * to determine when the dragged element absolutely leaves the editor.
   */


  DraftEditor.prototype._onDragEnter = function _onDragEnter() {
    this._dragCount++;
  };

  /**
   * See `_onDragEnter()`.
   */


  DraftEditor.prototype._onDragLeave = function _onDragLeave() {
    this._dragCount--;
    if (this._dragCount === 0) {
      this.exitCurrentMode();
    }
  };

  return DraftEditor;
}(React.Component);

DraftEditor.defaultProps = {
  blockRenderMap: DefaultDraftBlockRenderMap,
  blockRendererFn: emptyFunction.thatReturnsNull,
  blockStyleFn: emptyFunction.thatReturns(''),
  keyBindingFn: getDefaultKeyBinding,
  readOnly: false,
  spellCheck: false,
  stripPastedStyles: false
};


module.exports = DraftEditor;