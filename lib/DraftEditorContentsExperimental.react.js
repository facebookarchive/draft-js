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
 * This file is a fork of DraftEditorContents.react.js for tree nodes
 *
 * This is unstable and not part of the public API and should not be used by
 * production systems. This file may be update/removed without notice.
 */
'use strict';

var _assign = require("object-assign");

function _extends() { _extends = _assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var DraftEditorBlockNode = require("./DraftEditorBlockNode.react");

var DraftOffsetKey = require("./DraftOffsetKey");

var React = require("react");

var nullthrows = require("fbjs/lib/nullthrows");

/**
 * `DraftEditorContents` is the container component for all block components
 * rendered for a `DraftEditor`. It is optimized to aggressively avoid
 * re-rendering blocks whenever possible.
 *
 * This component is separate from `DraftEditor` because certain props
 * (for instance, ARIA props) must be allowed to update without affecting
 * the contents of the editor.
 */
var DraftEditorContentsExperimental = /*#__PURE__*/function (_React$Component) {
  _inheritsLoose(DraftEditorContentsExperimental, _React$Component);

  function DraftEditorContentsExperimental() {
    return _React$Component.apply(this, arguments) || this;
  }

  var _proto = DraftEditorContentsExperimental.prototype;

  _proto.shouldComponentUpdate = function shouldComponentUpdate(nextProps) {
    var prevEditorState = this.props.editorState;
    var nextEditorState = nextProps.editorState;
    var prevDirectionMap = prevEditorState.getDirectionMap();
    var nextDirectionMap = nextEditorState.getDirectionMap(); // Text direction has changed for one or more blocks. We must re-render.

    if (prevDirectionMap !== nextDirectionMap) {
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
        textDirectionality = _this$props.textDirectionality;
    var content = editorState.getCurrentContent();
    var selection = editorState.getSelection();
    var forceSelection = editorState.mustForceSelection();
    var decorator = editorState.getDecorator();
    var directionMap = nullthrows(editorState.getDirectionMap());
    var blocksAsArray = content.getBlocksAsArray();
    var rootBlock = blocksAsArray[0];
    var processedBlocks = [];
    var nodeBlock = rootBlock;

    while (nodeBlock) {
      var blockKey = nodeBlock.getKey();
      var blockProps = {
        blockRenderMap: blockRenderMap,
        blockRendererFn: blockRendererFn,
        blockStyleFn: blockStyleFn,
        contentState: content,
        customStyleFn: customStyleFn,
        customStyleMap: customStyleMap,
        decorator: decorator,
        editorKey: editorKey,
        editorState: editorState,
        forceSelection: forceSelection,
        selection: selection,
        block: nodeBlock,
        direction: textDirectionality ? textDirectionality : directionMap.get(blockKey),
        tree: editorState.getBlockTree(blockKey)
      };
      var configForType = blockRenderMap.get(nodeBlock.getType()) || blockRenderMap.get('unstyled');
      var wrapperTemplate = configForType.wrapper;
      processedBlocks.push({
        /* $FlowFixMe[incompatible-type] (>=0.112.0 site=www,mobile) This
         * comment suppresses an error found when Flow v0.112 was deployed. To
         * see the error delete this comment and run Flow. */
        block: React.createElement(DraftEditorBlockNode, _extends({
          key: blockKey
        }, blockProps)),
        wrapperTemplate: wrapperTemplate,
        key: blockKey,
        offsetKey: DraftOffsetKey.encode(blockKey, 0, 0)
      });
      var nextBlockKey = nodeBlock.getNextSiblingKey();
      nodeBlock = nextBlockKey ? content.getBlockForKey(nextBlockKey) : null;
    } // Group contiguous runs of blocks that have the same wrapperTemplate


    var outputBlocks = [];

    for (var ii = 0; ii < processedBlocks.length;) {
      var info = processedBlocks[ii];

      if (info.wrapperTemplate) {
        var blocks = [];

        do {
          blocks.push(processedBlocks[ii].block);
          ii++;
        } while (ii < processedBlocks.length && processedBlocks[ii].wrapperTemplate === info.wrapperTemplate);

        var wrapperElement = React.cloneElement(info.wrapperTemplate, {
          key: info.key + '-wrap',
          'data-offset-key': info.offsetKey
        }, blocks);
        outputBlocks.push(wrapperElement);
      } else {
        outputBlocks.push(info.block);
        ii++;
      }
    }

    return React.createElement("div", {
      "data-contents": "true"
    }, outputBlocks);
  };

  return DraftEditorContentsExperimental;
}(React.Component);

module.exports = DraftEditorContentsExperimental;