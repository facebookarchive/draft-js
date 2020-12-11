/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * 
 * @preventMunge
 * @emails oncall+draft_js
 */
'use strict';

var _assign = require("object-assign");

function _extends() { _extends = _assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? Object(arguments[i]) : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var DefaultDraftBlockRenderMap = require("./DefaultDraftBlockRenderMap");

var DefaultDraftInlineStyle = require("./DefaultDraftInlineStyle");

var DraftEditorCompositionHandler = require("./DraftEditorCompositionHandler");

var DraftEditorContents = require("./DraftEditorContents.react");

var DraftEditorDragHandler = require("./DraftEditorDragHandler");

var DraftEditorEditHandler = require("./DraftEditorEditHandler");

var flushControlled = require("./DraftEditorFlushControlled");

var DraftEditorPlaceholder = require("./DraftEditorPlaceholder.react");

var DraftEffects = require("./DraftEffects");

var EditorState = require("./EditorState");

var React = require("react");

var Scroll = require("fbjs/lib/Scroll");

var Style = require("fbjs/lib/Style");

var UserAgent = require("fbjs/lib/UserAgent");

var cx = require("fbjs/lib/cx");

var generateRandomKey = require("./generateRandomKey");

var getDefaultKeyBinding = require("./getDefaultKeyBinding");

var getScrollPosition = require("fbjs/lib/getScrollPosition");

var gkx = require("./gkx");

var invariant = require("fbjs/lib/invariant");

var isHTMLElement = require("./isHTMLElement");

var nullthrows = require("fbjs/lib/nullthrows");

var _require = require("immutable"),
    Map = _require.Map;

var isIE = UserAgent.isBrowser('IE'); // IE does not support the `input` event on contentEditable, so we can't
// observe spellcheck behavior.

var allowSpellCheck = !isIE; // Define a set of handler objects to correspond to each possible `mode`
// of editor behavior.

var handlerMap = {
  edit: DraftEditorEditHandler,
  composite: DraftEditorCompositionHandler,
  drag: DraftEditorDragHandler,
  cut: null,
  render: null
};
var didInitODS = false;

var UpdateDraftEditorFlags = /*#__PURE__*/function (_React$Component) {
  _inheritsLoose(UpdateDraftEditorFlags, _React$Component);

  function UpdateDraftEditorFlags() {
    return _React$Component.apply(this, arguments) || this;
  }

  var _proto = UpdateDraftEditorFlags.prototype;

  _proto.render = function render() {
    return null;
  };

  _proto.componentDidMount = function componentDidMount() {
    this._update();
  };

  _proto.componentDidUpdate = function componentDidUpdate() {
    this._update();
  };

  _proto._update = function _update() {
    var editor = this.props.editor;
    /**
     * Sometimes a render triggers a 'focus' or other event, and that will
     * schedule a second render pass.
     * In order to make sure the second render pass gets the latest editor
     * state, we update it here.
     * Example:
     * render #1
     * +
     * |
     * | cWU -> Nothing ... latestEditorState = STALE_STATE :(
     * |
     * | render -> this.props.editorState = FRESH_STATE
     * | +         *and* set latestEditorState = FRESH_STATE
     *   |
     * | |
     * | +--> triggers 'focus' event, calling 'handleFocus' with latestEditorState
     * |                                                +
     * |                                                |
     * +>cdU -> latestEditorState = FRESH_STATE         | the 'handleFocus' call schedules render #2
     *                                                  | with latestEditorState, which is FRESH_STATE
     *                                                  |
     * render #2 <--------------------------------------+
     * +
     * |
     * | cwU -> nothing updates
     * |
     * | render -> this.props.editorState = FRESH_STATE which was passed in above
     * |
     * +>cdU fires and resets latestEditorState = FRESH_STATE
     * ---
     * Note that if we don't set latestEditorState in 'render' in the above
     * diagram, then STALE_STATE gets passed to render #2.
     */

    editor._latestEditorState = this.props.editorState;
    /**
     * The reason we set this 'blockSelectEvents' flag is that  IE will fire a
     * 'selectionChange' event when we programmatically change the selection,
     * meaning it would trigger a new select event while we are in the middle
     * of updating.
     * We found that the 'selection.addRange' was what triggered the stray
     * selectionchange event in IE.
     * To be clear - we have not been able to reproduce specific bugs related
     * to this stray selection event, but have recorded logs that some
     * conditions do cause it to get bumped into during editOnSelect.
     */

    editor._blockSelectEvents = true;
  };

  return UpdateDraftEditorFlags;
}(React.Component);
/**
 * `DraftEditor` is the root editor component. It composes a `contentEditable`
 * div, and provides a wide variety of useful function props for managing the
 * state of the editor. See `DraftEditorProps` for details.
 */


var DraftEditor = /*#__PURE__*/function (_React$Component2) {
  _inheritsLoose(DraftEditor, _React$Component2);

  /**
   * Define proxies that can route events to the current handler.
   */
  // See `restoreEditorDOM()`.
  function DraftEditor(props) {
    var _this;

    _this = _React$Component2.call(this, props) || this;

    _defineProperty(_assertThisInitialized(_this), "_blockSelectEvents", void 0);

    _defineProperty(_assertThisInitialized(_this), "_clipboard", void 0);

    _defineProperty(_assertThisInitialized(_this), "_handler", void 0);

    _defineProperty(_assertThisInitialized(_this), "_dragCount", void 0);

    _defineProperty(_assertThisInitialized(_this), "_internalDrag", false);

    _defineProperty(_assertThisInitialized(_this), "_editorKey", void 0);

    _defineProperty(_assertThisInitialized(_this), "_placeholderAccessibilityID", void 0);

    _defineProperty(_assertThisInitialized(_this), "_latestEditorState", void 0);

    _defineProperty(_assertThisInitialized(_this), "_latestCommittedEditorState", void 0);

    _defineProperty(_assertThisInitialized(_this), "_pendingStateFromBeforeInput", void 0);

    _defineProperty(_assertThisInitialized(_this), "_onBeforeInput", void 0);

    _defineProperty(_assertThisInitialized(_this), "_onBlur", void 0);

    _defineProperty(_assertThisInitialized(_this), "_onCharacterData", void 0);

    _defineProperty(_assertThisInitialized(_this), "_onCompositionEnd", void 0);

    _defineProperty(_assertThisInitialized(_this), "_onCompositionStart", void 0);

    _defineProperty(_assertThisInitialized(_this), "_onCopy", void 0);

    _defineProperty(_assertThisInitialized(_this), "_onCut", void 0);

    _defineProperty(_assertThisInitialized(_this), "_onDragEnd", void 0);

    _defineProperty(_assertThisInitialized(_this), "_onDragOver", void 0);

    _defineProperty(_assertThisInitialized(_this), "_onDragStart", void 0);

    _defineProperty(_assertThisInitialized(_this), "_onDrop", void 0);

    _defineProperty(_assertThisInitialized(_this), "_onInput", void 0);

    _defineProperty(_assertThisInitialized(_this), "_onFocus", void 0);

    _defineProperty(_assertThisInitialized(_this), "_onKeyDown", void 0);

    _defineProperty(_assertThisInitialized(_this), "_onKeyPress", void 0);

    _defineProperty(_assertThisInitialized(_this), "_onKeyUp", void 0);

    _defineProperty(_assertThisInitialized(_this), "_onMouseDown", void 0);

    _defineProperty(_assertThisInitialized(_this), "_onMouseUp", void 0);

    _defineProperty(_assertThisInitialized(_this), "_onPaste", void 0);

    _defineProperty(_assertThisInitialized(_this), "_onSelect", void 0);

    _defineProperty(_assertThisInitialized(_this), "editor", void 0);

    _defineProperty(_assertThisInitialized(_this), "editorContainer", void 0);

    _defineProperty(_assertThisInitialized(_this), "focus", void 0);

    _defineProperty(_assertThisInitialized(_this), "blur", void 0);

    _defineProperty(_assertThisInitialized(_this), "setMode", void 0);

    _defineProperty(_assertThisInitialized(_this), "exitCurrentMode", void 0);

    _defineProperty(_assertThisInitialized(_this), "restoreEditorDOM", void 0);

    _defineProperty(_assertThisInitialized(_this), "restoreBlockDOM", void 0);

    _defineProperty(_assertThisInitialized(_this), "setClipboard", void 0);

    _defineProperty(_assertThisInitialized(_this), "getClipboard", void 0);

    _defineProperty(_assertThisInitialized(_this), "getEditorKey", void 0);

    _defineProperty(_assertThisInitialized(_this), "update", void 0);

    _defineProperty(_assertThisInitialized(_this), "onDragEnter", void 0);

    _defineProperty(_assertThisInitialized(_this), "onDragLeave", void 0);

    _defineProperty(_assertThisInitialized(_this), "state", {
      contentsKey: 0
    });

    _defineProperty(_assertThisInitialized(_this), "_handleEditorContainerRef", function (node) {
      _this.editorContainer = node; // Instead of having a direct ref on the child, we'll grab it here.
      // This is safe as long as the rendered structure is static (which it is).
      // This lets the child support ref={props.editorRef} without merging refs.

      _this.editor = node !== null ? node.firstChild : null;
    });

    _defineProperty(_assertThisInitialized(_this), "focus", function (scrollPosition) {
      var editorState = _this.props.editorState;
      var alreadyHasFocus = editorState.getSelection().getHasFocus();
      var editorNode = _this.editor;

      if (!editorNode) {
        // once in a while people call 'focus' in a setTimeout, and the node has
        // been deleted, so it can be null in that case.
        return;
      }

      var scrollParent = Style.getScrollParent(editorNode);

      var _ref = scrollPosition || getScrollPosition(scrollParent),
          x = _ref.x,
          y = _ref.y;

      !isHTMLElement(editorNode) ? process.env.NODE_ENV !== "production" ? invariant(false, 'editorNode is not an HTMLElement') : invariant(false) : void 0;
      editorNode.focus(); // Restore scroll position

      if (scrollParent === window) {
        window.scrollTo(x, y);
      } else {
        Scroll.setTop(scrollParent, y);
      } // On Chrome and Safari, calling focus on contenteditable focuses the
      // cursor at the first character. This is something you don't expect when
      // you're clicking on an input element but not directly on a character.
      // Put the cursor back where it was before the blur.


      if (!alreadyHasFocus) {
        _this.update(EditorState.forceSelection(editorState, editorState.getSelection()));
      }
    });

    _defineProperty(_assertThisInitialized(_this), "blur", function () {
      var editorNode = _this.editor;

      if (!editorNode) {
        return;
      }

      !isHTMLElement(editorNode) ? process.env.NODE_ENV !== "production" ? invariant(false, 'editorNode is not an HTMLElement') : invariant(false) : void 0;
      editorNode.blur();
    });

    _defineProperty(_assertThisInitialized(_this), "setMode", function (mode) {
      var _this$props = _this.props,
          onPaste = _this$props.onPaste,
          onCut = _this$props.onCut,
          onCopy = _this$props.onCopy;

      var editHandler = _objectSpread({}, handlerMap.edit);

      if (onPaste) {
        /* $FlowFixMe[incompatible-type] (>=0.117.0 site=www,mobile) This comment
         * suppresses an error found when Flow v0.117 was deployed. To see the
         * error delete this comment and run Flow. */
        editHandler.onPaste = onPaste;
      }

      if (onCut) {
        editHandler.onCut = onCut;
      }

      if (onCopy) {
        editHandler.onCopy = onCopy;
      }

      var handler = _objectSpread({}, handlerMap, {
        edit: editHandler
      });

      _this._handler = handler[mode];
    });

    _defineProperty(_assertThisInitialized(_this), "exitCurrentMode", function () {
      _this.setMode('edit');
    });

    _defineProperty(_assertThisInitialized(_this), "restoreBlockDOM", function (key, scrollPosition) {
      var blockKeyMap = _this.state.blockKeyMap;

      _this.setState({
        blockKeyMap: blockKeyMap.set(key, blockKeyMap.has(key) ? blockKeyMap.get(key) + 1 : 1)
      }, function () {
        _this.focus(scrollPosition);
      });
    });

    _defineProperty(_assertThisInitialized(_this), "restoreEditorDOM", function (scrollPosition) {
      // Wrap state updates in `flushControlled`. In sync mode, this is
      // effectively a no-op. In async mode, this ensures all updates scheduled
      // inside are flushed before React yields to the browser.
      if (flushControlled) {
        flushControlled(function () {
          return _this.setState({
            contentsKey: _this.state.contentsKey + 1
          }, function () {
            _this.focus(scrollPosition);
          });
        });
      } else {
        _this.setState({
          contentsKey: _this.state.contentsKey + 1
        }, function () {
          _this.focus(scrollPosition);
        });
      }
    });

    _defineProperty(_assertThisInitialized(_this), "setClipboard", function (clipboard) {
      _this._clipboard = clipboard;
    });

    _defineProperty(_assertThisInitialized(_this), "getClipboard", function () {
      return _this._clipboard;
    });

    _defineProperty(_assertThisInitialized(_this), "update", function (editorState) {
      var onChange = _this.props.onChange;
      _this._latestEditorState = editorState; // Wrap state updates in `flushControlled`. In sync mode, this is
      // effectively a no-op. In async mode, this ensures all updates scheduled
      // inside are flushed before React yields to the browser.

      if (flushControlled) {
        flushControlled(function () {
          return onChange(editorState);
        });
      } else {
        onChange(editorState);
      }
    });

    _defineProperty(_assertThisInitialized(_this), "onDragEnter", function () {
      _this._dragCount++;
    });

    _defineProperty(_assertThisInitialized(_this), "onDragLeave", function () {
      _this._dragCount--;

      if (_this._dragCount === 0) {
        _this.exitCurrentMode();
      }
    });

    _this._blockSelectEvents = false;
    _this._clipboard = null;
    _this._handler = null;
    _this._dragCount = 0;
    _this._editorKey = props.editorKey || generateRandomKey();
    _this._placeholderAccessibilityID = 'placeholder-' + _this._editorKey;
    _this._latestEditorState = props.editorState;
    _this._latestCommittedEditorState = props.editorState;
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

    _this.getEditorKey = function () {
      return _this._editorKey;
    };

    if (process.env.NODE_ENV !== "production") {
      ['onDownArrow', 'onEscape', 'onLeftArrow', 'onRightArrow', 'onTab', 'onUpArrow'].forEach(function (propName) {
        if (props.hasOwnProperty(propName)) {
          console.warn("Supplying an `".concat(propName, "` prop to `DraftEditor` has ") + 'been deprecated. If your handler needs access to the keyboard ' + 'event, supply a custom `keyBindingFn` prop that falls back to ' + 'the default one (eg. https://is.gd/wHKQ3W).');
        }
      });
    } // See `restoreEditorDOM()` and `restoreBlockDOM()`


    _this.state = {
      contentsKey: 0,
      blockKeyMap: new Map({})
    };
    return _this;
  }
  /**
   * Build a method that will pass the event to the specified handler method.
   * This allows us to look up the correct handler function for the current
   * editor mode, if any has been specified.
   */


  var _proto2 = DraftEditor.prototype;

  _proto2._buildHandler = function _buildHandler(eventName) {
    var _this2 = this;

    // Wrap event handlers in `flushControlled`. In sync mode, this is
    // effectively a no-op. In async mode, this ensures all updates scheduled
    // inside the handler are flushed before React yields to the browser.
    return function (e) {
      if (!_this2.props.readOnly) {
        var method = _this2._handler && _this2._handler[eventName];

        if (method) {
          if (flushControlled) {
            flushControlled(function () {
              return method(_this2, e);
            });
          } else {
            method(_this2, e);
          }
        }
      }
    };
  };

  _proto2._showPlaceholder = function _showPlaceholder() {
    return !!this.props.placeholder && !this.props.editorState.isInCompositionMode() && !this.props.editorState.getCurrentContent().hasText();
  };

  _proto2._renderPlaceholder = function _renderPlaceholder() {
    if (this._showPlaceholder()) {
      var placeHolderProps = {
        accessibilityID: this._placeholderAccessibilityID,
        className: this.props.placeholderClassName,
        editorState: this.props.editorState,
        text: nullthrows(this.props.placeholder),
        textAlignment: this.props.textAlignment
      };
      /* $FlowFixMe[incompatible-type] (>=0.112.0 site=www,mobile) This comment
       * suppresses an error found when Flow v0.112 was deployed. To see the
       * error delete this comment and run Flow. */

      return React.createElement(DraftEditorPlaceholder, placeHolderProps);
    }

    return null;
  }
  /**
   * returns ariaDescribedBy prop with '{{editor_id_placeholder}}' replaced with
   * the DOM id of the placeholder (if it exists)
   * @returns aria-describedby attribute value
   */
  ;

  _proto2._renderARIADescribedBy = function _renderARIADescribedBy() {
    var describedBy = this.props.ariaDescribedBy || '';
    var placeholderID = this._showPlaceholder() ? this._placeholderAccessibilityID : '';
    return describedBy.replace('{{editor_id_placeholder}}', placeholderID) || undefined;
  };

  _proto2.render = function render() {
    var _this$props2 = this.props,
        blockRenderMap = _this$props2.blockRenderMap,
        blockRendererFn = _this$props2.blockRendererFn,
        blockStyleFn = _this$props2.blockStyleFn,
        customStyleFn = _this$props2.customStyleFn,
        customStyleMap = _this$props2.customStyleMap,
        editorState = _this$props2.editorState,
        preventScroll = _this$props2.preventScroll,
        readOnly = _this$props2.readOnly,
        textAlignment = _this$props2.textAlignment,
        textDirectionality = _this$props2.textDirectionality;
    var _this$state = this.state,
        contentsKey = _this$state.contentsKey,
        blockKeyMap = _this$state.blockKeyMap;
    var rootClass = cx({
      'DraftEditor/root': true,
      'DraftEditor/alignLeft': textAlignment === 'left',
      'DraftEditor/alignRight': textAlignment === 'right',
      'DraftEditor/alignCenter': textAlignment === 'center'
    });
    var contentStyle = {
      outline: 'none',
      // fix parent-draggable Safari bug. #1326
      userSelect: 'text',
      WebkitUserSelect: 'text',
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word'
    }; // The aria-expanded and aria-haspopup properties should only be rendered
    // for a combobox.

    /* $FlowFixMe[prop-missing] (>=0.68.0 site=www,mobile) This comment
     * suppresses an error found when Flow v0.68 was deployed. To see the error
     * delete this comment and run Flow. */

    var ariaRole = this.props.role || 'textbox';
    var ariaExpanded = ariaRole === 'combobox' ? !!this.props.ariaExpanded : null;
    var editorContentsProps = {
      blockRenderMap: blockRenderMap,
      blockRendererFn: blockRendererFn,
      blockStyleFn: blockStyleFn,
      customStyleMap: _objectSpread({}, DefaultDraftInlineStyle, customStyleMap),
      customStyleFn: customStyleFn,
      editorKey: this._editorKey,
      editorState: editorState,
      preventScroll: preventScroll,
      textDirectionality: textDirectionality,
      blockKeyMap: blockKeyMap
    };
    var contentClassName = this.props.contentClassName != null ? this.props.contentClassName + ' ' : '';
    return React.createElement("div", {
      className: rootClass
    }, this._renderPlaceholder(), React.createElement("div", {
      className: cx('DraftEditor/editorContainer'),
      ref: this._handleEditorContainerRef
    }, React.createElement("div", {
      "aria-activedescendant": readOnly ? null : this.props.ariaActiveDescendantID,
      "aria-autocomplete": readOnly ? null : this.props.ariaAutoComplete,
      "aria-controls": readOnly ? null : this.props.ariaControls,
      "aria-describedby": this._renderARIADescribedBy(),
      "aria-expanded": readOnly ? null : ariaExpanded,
      "aria-label": this.props.ariaLabel,
      "aria-labelledby": this.props.ariaLabelledBy,
      "aria-multiline": this.props.ariaMultiline,
      "aria-owns": readOnly ? null : this.props.ariaOwneeID,
      autoCapitalize: this.props.autoCapitalize,
      autoComplete: this.props.autoComplete,
      autoCorrect: this.props.autoCorrect,
      className: contentClassName + cx({
        // Chrome's built-in translation feature mutates the DOM in ways
        // that Draft doesn't expect (ex: adding <font> tags inside
        // DraftEditorLeaf spans) and causes problems. We add notranslate
        // here which makes its autotranslation skip over this subtree.
        notranslate: !readOnly,
        'public/DraftEditor/content': true
      }),
      contentEditable: !readOnly,
      "data-testid": this.props.webDriverTestID,
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
      ref: this.props.editorRef,
      role: readOnly ? null : ariaRole,
      spellCheck: allowSpellCheck && this.props.spellCheck,
      style: contentStyle,
      suppressContentEditableWarning: true,
      tabIndex: this.props.tabIndex
    }, React.createElement(UpdateDraftEditorFlags, {
      editor: this,
      editorState: editorState
    }), React.createElement(DraftEditorContents, _extends({}, editorContentsProps, {
      key: 'contents' + this.state.contentsKey
    })))));
  };

  _proto2.componentDidMount = function componentDidMount() {
    this._blockSelectEvents = false;

    if (!didInitODS && gkx('draft_ods_enabled')) {
      didInitODS = true;
      DraftEffects.initODS();
    }

    this.setMode('edit');
    /**
     * IE has a hardcoded "feature" that attempts to convert link text into
     * anchors in contentEditable DOM. This breaks the editor's expectations of
     * the DOM, and control is lost. Disable it to make IE behave.
     * See: http://blogs.msdn.com/b/ieinternals/archive/2010/09/15/
     * ie9-beta-minor-change-list.aspx
     */

    if (isIE) {
      // editor can be null after mounting
      // https://stackoverflow.com/questions/44074747/componentdidmount-called-before-ref-callback
      if (!this.editor) {
        global.execCommand('AutoUrlDetect', false, false);
      } else {
        this.editor.ownerDocument.execCommand('AutoUrlDetect', false, false);
      }
    }
  };

  _proto2.componentDidUpdate = function componentDidUpdate() {
    this._blockSelectEvents = false;
    this._latestEditorState = this.props.editorState;
    this._latestCommittedEditorState = this.props.editorState;
  }
  /**
   * Used via `this.focus()`.
   *
   * Force focus back onto the editor node.
   *
   * We attempt to preserve scroll position when focusing. You can also pass
   * a specified scroll position (for cases like `cut` behavior where it should
   * be restored to a known position).
   */
  ;

  return DraftEditor;
}(React.Component);

_defineProperty(DraftEditor, "defaultProps", {
  ariaDescribedBy: '{{editor_id_placeholder}}',
  blockRenderMap: DefaultDraftBlockRenderMap,
  blockRendererFn: function blockRendererFn() {
    return null;
  },
  blockStyleFn: function blockStyleFn() {
    return '';
  },
  keyBindingFn: getDefaultKeyBinding,
  readOnly: false,
  spellCheck: false,
  stripPastedStyles: false
});

module.exports = DraftEditor;