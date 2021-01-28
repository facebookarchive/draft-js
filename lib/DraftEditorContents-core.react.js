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

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var DraftEditorBlock = require("./DraftEditorBlock.react");

var DraftOffsetKey = require("./DraftOffsetKey");

var React = require("react");

var cx = require("fbjs/lib/cx");

var joinClasses = require("fbjs/lib/joinClasses");

var nullthrows = require("fbjs/lib/nullthrows");

/**
 * Provide default styling for list items. This way, lists will be styled with
 * proper counters and indentation even if the caller does not specify
 * their own styling at all. If more than five levels of nesting are needed,
 * the necessary CSS classes can be provided via `blockStyleFn` configuration.
 */
var getListItemClasses = function getListItemClasses(type, depth, shouldResetCount, direction) {
  return cx({
    'public/DraftStyleDefault/unorderedListItem': type === 'unordered-list-item',
    'public/DraftStyleDefault/orderedListItem': type === 'ordered-list-item',
    'public/DraftStyleDefault/reset': shouldResetCount,
    'public/DraftStyleDefault/depth0': depth === 0,
    'public/DraftStyleDefault/depth1': depth === 1,
    'public/DraftStyleDefault/depth2': depth === 2,
    'public/DraftStyleDefault/depth3': depth === 3,
    'public/DraftStyleDefault/depth4': depth >= 4,
    'public/DraftStyleDefault/listLTR': direction === 'LTR',
    'public/DraftStyleDefault/listRTL': direction === 'RTL'
  });
};
/**
 * `DraftEditorContents` is the container component for all block components
 * rendered for a `DraftEditor`. It is optimized to aggressively avoid
 * re-rendering blocks whenever possible.
 *
 * This component is separate from `DraftEditor` because certain props
 * (for instance, ARIA props) must be allowed to update without affecting
 * the contents of the editor.
 */


var DraftEditorContents = /*#__PURE__*/function (_React$Component) {
  _inheritsLoose(DraftEditorContents, _React$Component);

  function DraftEditorContents() {
    return _React$Component.apply(this, arguments) || this;
  }

  var _proto = DraftEditorContents.prototype;

  _proto.shouldComponentUpdate = function shouldComponentUpdate(nextProps) {
    var prevEditorState = this.props.editorState;
    var nextEditorState = nextProps.editorState;
    var prevDirectionMap = prevEditorState.getDirectionMap();
    var nextDirectionMap = nextEditorState.getDirectionMap();
    var prevBlockKeyMap = this.props.blockKeyMap;
    var nextBlockKeyMap = nextProps.blockKeyMap; // Text direction has changed for one or more blocks. We must re-render.

    if (prevDirectionMap !== nextDirectionMap) {
      return true;
    } // blockKeyMap has chaged. We must re-render on block level.


    if (prevBlockKeyMap !== nextBlockKeyMap) {
      return true;
    }

    var didHaveFocus = prevEditorState.getSelection().getHasFocus();
    var nowHasFocus = nextEditorState.getSelection().getHasFocus();

    if (didHaveFocus !== nowHasFocus) {
      return true;
    }

    var nextNativeContent = nextEditorState.getNativelyRenderedContent();
    var wasComposing = prevEditorState.isInCompositionMode();
    var nowComposing = nextEditorState.isInCompositionMode(); // If the state is unchanged or we're currently rendering a natively
    // rendered state, there's nothing new to be done.

    if (prevEditorState === nextEditorState || nextNativeContent !== null && nextEditorState.getCurrentContent() === nextNativeContent || wasComposing && nowComposing) {
      return false;
    }

    var prevContent = prevEditorState.getCurrentContent();
    var nextContent = nextEditorState.getCurrentContent();
    var prevDecorator = prevEditorState.getDecorator();
    var nextDecorator = nextEditorState.getDecorator();
    return wasComposing !== nowComposing || prevContent !== nextContent || prevDecorator !== nextDecorator || nextEditorState.mustForceSelection();
  };

  _proto.render = function render() {
    var _this$props = this.props,
        blockRenderMap = _this$props.blockRenderMap,
        blockRendererFn = _this$props.blockRendererFn,
        blockStyleFn = _this$props.blockStyleFn,
        customStyleMap = _this$props.customStyleMap,
        customStyleFn = _this$props.customStyleFn,
        editorState = _this$props.editorState,
        editorKey = _this$props.editorKey,
        preventScroll = _this$props.preventScroll,
        textDirectionality = _this$props.textDirectionality,
        blockKeyMap = _this$props.blockKeyMap;
    var content = editorState.getCurrentContent();
    var selection = editorState.getSelection();
    var forceSelection = editorState.mustForceSelection();
    var decorator = editorState.getDecorator();
    var directionMap = nullthrows(editorState.getDirectionMap());
    var blocksAsArray = content.getBlocksAsArray();
    var processedBlocks = [];
    var currentDepth = null;
    var lastWrapperTemplate = null;

    for (var ii = 0; ii < blocksAsArray.length; ii++) {
      var _block = blocksAsArray[ii];

      var key = _block.getKey();

      var blockType = _block.getType();

      var customRenderer = blockRendererFn(_block);
      var CustomComponent = void 0,
          customProps = void 0,
          customEditable = void 0;

      if (customRenderer) {
        CustomComponent = customRenderer.component;
        customProps = customRenderer.props;
        customEditable = customRenderer.editable;
      }

      var direction = textDirectionality ? textDirectionality : directionMap.get(key);
      var offsetKey = DraftOffsetKey.encode(key, 0, 0);
      var componentProps = {
        contentState: content,
        block: _block,
        blockProps: customProps,
        blockStyleFn: blockStyleFn,
        customStyleMap: customStyleMap,
        customStyleFn: customStyleFn,
        decorator: decorator,
        direction: direction,
        forceSelection: forceSelection,
        offsetKey: offsetKey,
        preventScroll: preventScroll,
        selection: selection,
        tree: editorState.getBlockTree(key),
        key: "".concat(key, "-").concat(blockKeyMap.get(key) || '0')
      };
      var configForType = blockRenderMap.get(blockType) || blockRenderMap.get('unstyled');
      var wrapperTemplate = configForType.wrapper;
      var Element = configForType.element || blockRenderMap.get('unstyled').element;

      var depth = _block.getDepth();

      var _className = '';

      if (blockStyleFn) {
        _className = blockStyleFn(_block);
      } // List items are special snowflakes, since we handle nesting and
      // counters manually.


      if (Element === 'li') {
        var shouldResetCount = lastWrapperTemplate !== wrapperTemplate || currentDepth === null || depth > currentDepth;
        _className = joinClasses(_className, getListItemClasses(blockType, depth, shouldResetCount, direction));
      }

      var Component = CustomComponent || DraftEditorBlock;
      var childProps = {
        className: _className,
        'data-block': true,
        'data-editor': editorKey,
        'data-offset-key': offsetKey,
        key: key
      };

      if (customEditable !== undefined) {
        childProps = _objectSpread(_objectSpread({}, childProps), {}, {
          contentEditable: customEditable,
          suppressContentEditableWarning: true
        });
      }

      var child = React.createElement(Element, childProps,
      /*#__PURE__*/

      /* $FlowFixMe(>=0.112.0 site=www,mobile) This comment suppresses an
       * error found when Flow v0.112 was deployed. To see the error delete
       * this comment and run Flow. */
      React.createElement(Component, componentProps));
      processedBlocks.push({
        block: child,
        wrapperTemplate: wrapperTemplate,
        key: key,
        offsetKey: offsetKey
      });

      if (wrapperTemplate) {
        currentDepth = _block.getDepth();
      } else {
        currentDepth = null;
      }

      lastWrapperTemplate = wrapperTemplate;
    } // Group contiguous runs of blocks that have the same wrapperTemplate


    var outputBlocks = [];

    for (var _ii = 0; _ii < processedBlocks.length;) {
      var info = processedBlocks[_ii];

      if (info.wrapperTemplate) {
        var blocks = [];

        do {
          blocks.push(processedBlocks[_ii].block);
          _ii++;
        } while (_ii < processedBlocks.length && processedBlocks[_ii].wrapperTemplate === info.wrapperTemplate);

        var wrapperElement = React.cloneElement(info.wrapperTemplate, {
          key: info.key + '-wrap',
          'data-offset-key': info.offsetKey
        }, blocks);
        outputBlocks.push(wrapperElement);
      } else {
        outputBlocks.push(info.block);
        _ii++;
      }
    }

    return /*#__PURE__*/React.createElement("div", {
      "data-contents": "true"
    }, outputBlocks);
  };

  return DraftEditorContents;
}(React.Component);

module.exports = DraftEditorContents;