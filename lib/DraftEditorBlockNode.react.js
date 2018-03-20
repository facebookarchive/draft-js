/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule DraftEditorBlockNode.react
 * @format
 * 
 *
 * This file is a fork of DraftEditorBlock.react.js and DraftEditorContents.react.js
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

var DraftEditorNode = require('./DraftEditorNode.react');
var DraftOffsetKey = require('./DraftOffsetKey');
var EditorState = require('./EditorState');
var Immutable = require('immutable');
var React = require('react');
var ReactDOM = require('react-dom');
var Scroll = require('fbjs/lib/Scroll');
var Style = require('fbjs/lib/Style');

var getElementPosition = require('fbjs/lib/getElementPosition');
var getScrollPosition = require('fbjs/lib/getScrollPosition');
var getViewportDimensions = require('fbjs/lib/getViewportDimensions');
var invariant = require('fbjs/lib/invariant');

var SCROLL_BUFFER = 10;

var List = Immutable.List;

// we should harden up the bellow flow types to make them more strict

/**
 * Return whether a block overlaps with either edge of the `SelectionState`.
 */
var isBlockOnSelectionEdge = function isBlockOnSelectionEdge(selection, key) {
  return selection.getAnchorKey() === key || selection.getFocusKey() === key;
};

/**
 * We will use this helper to identify blocks that need to be wrapped but have siblings that
 * also share the same wrapper element, this way we can do the wrapping once the last sibling
 * is added.
 */
var shouldNotAddWrapperElement = function shouldNotAddWrapperElement(block, contentState) {
  var nextSiblingKey = block.getNextSiblingKey();

  return nextSiblingKey ? contentState.getBlockForKey(nextSiblingKey).getType() === block.getType() : false;
};

var applyWrapperElementToSiblings = function applyWrapperElementToSiblings(wrapperTemplate, Element, nodes) {
  var wrappedSiblings = [];

  // we check back until we find a sibbling that does not have same wrapper
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = nodes.reverse()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var sibling = _step.value;

      if (sibling.type !== Element) {
        break;
      }
      wrappedSiblings.push(sibling);
    }

    // we now should remove from acc the wrappedSiblings and add them back under same wrap
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator['return']) {
        _iterator['return']();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  nodes.splice(nodes.indexOf(wrappedSiblings[0]), wrappedSiblings.length + 1);

  var childrenIs = wrappedSiblings.reverse();

  var key = childrenIs[0].key;

  nodes.push(React.cloneElement(wrapperTemplate, {
    key: key + '-wrap',
    'data-offset-key': DraftOffsetKey.encode(key, 0, 0)
  }, childrenIs));

  return nodes;
};

var getDraftRenderConfig = function getDraftRenderConfig(block, blockRenderMap) {
  var configForType = blockRenderMap.get(block.getType()) || blockRenderMap.get('unstyled');

  var wrapperTemplate = configForType.wrapper;
  var Element = configForType.element || blockRenderMap.get('unstyled').element;

  return {
    Element: Element,
    wrapperTemplate: wrapperTemplate
  };
};

var getCustomRenderConfig = function getCustomRenderConfig(block, blockRendererFn) {
  var customRenderer = blockRendererFn(block);

  if (!customRenderer) {
    return {};
  }

  var CustomComponent = customRenderer.component,
      customProps = customRenderer.props,
      customEditable = customRenderer.editable;


  return {
    CustomComponent: CustomComponent,
    customProps: customProps,
    customEditable: customEditable
  };
};

var getElementPropsConfig = function getElementPropsConfig(block, editorKey, offsetKey, blockStyleFn, customConfig) {
  var elementProps = {
    'data-block': true,
    'data-editor': editorKey,
    'data-offset-key': offsetKey,
    key: block.getKey()
  };
  var customClass = blockStyleFn(block);

  if (customClass) {
    elementProps.className = customClass;
  }

  if (customConfig.customEditable !== undefined) {
    elementProps = _extends({}, elementProps, {
      contentEditable: customConfig.customEditable,
      suppressContentEditableWarning: true
    });
  }

  return elementProps;
};

var DraftEditorBlockNode = function (_React$Component) {
  _inherits(DraftEditorBlockNode, _React$Component);

  function DraftEditorBlockNode() {
    _classCallCheck(this, DraftEditorBlockNode);

    return _possibleConstructorReturn(this, _React$Component.apply(this, arguments));
  }

  DraftEditorBlockNode.prototype.shouldComponentUpdate = function shouldComponentUpdate(nextProps) {
    var _props = this.props,
        block = _props.block,
        direction = _props.direction,
        tree = _props.tree;

    var isContainerNode = !block.getChildKeys().isEmpty();
    var blockHasChanged = block !== nextProps.block || tree !== nextProps.tree || direction !== nextProps.direction || isBlockOnSelectionEdge(nextProps.selection, nextProps.block.getKey()) && nextProps.forceSelection;

    // if we have children at this stage we always re-render container nodes
    // else if its a root node we avoid re-rendering by checking for block updates
    return isContainerNode || blockHasChanged;
  };

  /**
   * When a block is mounted and overlaps the selection state, we need to make
   * sure that the cursor is visible to match native behavior. This may not
   * be the case if the user has pressed `RETURN` or pasted some content, since
   * programatically creating these new blocks and setting the DOM selection
   * will miss out on the browser natively scrolling to that position.
   *
   * To replicate native behavior, if the block overlaps the selection state
   * on mount, force the scroll position. Check the scroll state of the scroll
   * parent, and adjust it to align the entire block to the bottom of the
   * scroll parent.
   */


  DraftEditorBlockNode.prototype.componentDidMount = function componentDidMount() {
    var selection = this.props.selection;
    var endKey = selection.getEndKey();
    if (!selection.getHasFocus() || endKey !== this.props.block.getKey()) {
      return;
    }

    var blockNode = ReactDOM.findDOMNode(this);
    var scrollParent = Style.getScrollParent(blockNode);
    var scrollPosition = getScrollPosition(scrollParent);
    var scrollDelta = void 0;

    if (scrollParent === window) {
      var nodePosition = getElementPosition(blockNode);
      var nodeBottom = nodePosition.y + nodePosition.height;
      var viewportHeight = getViewportDimensions().height;
      scrollDelta = nodeBottom - viewportHeight;
      if (scrollDelta > 0) {
        window.scrollTo(scrollPosition.x, scrollPosition.y + scrollDelta + SCROLL_BUFFER);
      }
    } else {
      !(blockNode instanceof HTMLElement) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'blockNode is not an HTMLElement') : invariant(false) : void 0;
      var blockBottom = blockNode.offsetHeight + blockNode.offsetTop;
      var scrollBottom = scrollParent.offsetHeight + scrollPosition.y;
      scrollDelta = blockBottom - scrollBottom;
      if (scrollDelta > 0) {
        Scroll.setTop(scrollParent, Scroll.getTop(scrollParent) + scrollDelta + SCROLL_BUFFER);
      }
    }
  };

  DraftEditorBlockNode.prototype.render = function render() {
    var _this2 = this;

    var _props2 = this.props,
        block = _props2.block,
        blockRenderMap = _props2.blockRenderMap,
        blockRendererFn = _props2.blockRendererFn,
        blockStyleFn = _props2.blockStyleFn,
        contentState = _props2.contentState,
        decorator = _props2.decorator,
        editorKey = _props2.editorKey,
        editorState = _props2.editorState,
        customStyleFn = _props2.customStyleFn,
        customStyleMap = _props2.customStyleMap,
        direction = _props2.direction,
        forceSelection = _props2.forceSelection,
        selection = _props2.selection,
        tree = _props2.tree;


    var children = null;

    if (block.children.size) {
      children = block.children.reduce(function (acc, key) {
        var offsetKey = DraftOffsetKey.encode(key, 0, 0);
        var child = contentState.getBlockForKey(key);
        var customConfig = getCustomRenderConfig(child, blockRendererFn);
        var Component = customConfig.CustomComponent || DraftEditorBlockNode;

        var _getDraftRenderConfig = getDraftRenderConfig(child, blockRenderMap),
            Element = _getDraftRenderConfig.Element,
            wrapperTemplate = _getDraftRenderConfig.wrapperTemplate;

        var elementProps = getElementPropsConfig(child, editorKey, offsetKey, blockStyleFn, customConfig);
        var childProps = _extends({}, _this2.props, {
          tree: editorState.getBlockTree(key),
          blockProps: customConfig.customProps,
          offsetKey: offsetKey,
          block: child
        });

        acc.push(React.createElement(Element, elementProps, React.createElement(Component, childProps)));

        if (!wrapperTemplate || shouldNotAddWrapperElement(child, contentState)) {
          return acc;
        }

        // if we are here it means we are the last block
        // that has a wrapperTemplate so we should wrap itself
        // and all other previous siblings that share the same wrapper
        applyWrapperElementToSiblings(wrapperTemplate, Element, acc);

        return acc;
      }, []);
    }

    var blockKey = block.getKey();
    var offsetKey = DraftOffsetKey.encode(blockKey, 0, 0);

    var blockNode = React.createElement(DraftEditorNode, {
      block: block,
      children: children,
      contentState: contentState,
      customStyleFn: customStyleFn,
      customStyleMap: customStyleMap,
      decorator: decorator,
      direction: direction,
      forceSelection: forceSelection,
      hasSelection: isBlockOnSelectionEdge(selection, blockKey),
      selection: selection,
      tree: tree
    });

    if (block.getParentKey()) {
      return blockNode;
    }

    var _getDraftRenderConfig2 = getDraftRenderConfig(block, blockRenderMap),
        Element = _getDraftRenderConfig2.Element;

    var elementProps = getElementPropsConfig(block, editorKey, offsetKey, blockStyleFn, getCustomRenderConfig(block, blockRendererFn));

    // root block nodes needs to be wrapped
    return React.createElement(Element, elementProps, blockNode);
  };

  return DraftEditorBlockNode;
}(React.Component);

module.exports = DraftEditorBlockNode;