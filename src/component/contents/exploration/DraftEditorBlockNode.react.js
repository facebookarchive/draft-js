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
 * @flow
 *
 * This file is a fork of DraftEditorBlock.react.js and DraftEditorContents.react.js
 *
 * This is unstable and not part of the public API and should not be used by
 * production systems. This file may be update/removed without notice.
 */

'use strict';

import type {BlockNodeRecord} from 'BlockNodeRecord';
import type ContentState from 'ContentState';
import type {DraftBlockRenderMap} from 'DraftBlockRenderMap';
import type {DraftDecoratorType} from 'DraftDecoratorType';
import type {DraftInlineStyle} from 'DraftInlineStyle';
import type SelectionState from 'SelectionState';
import type {BidiDirection} from 'UnicodeBidiDirection';

const DraftEditorNode = require('DraftEditorNode.react');
const DraftOffsetKey = require('DraftOffsetKey');
const EditorState = require('EditorState');
const Immutable = require('immutable');
const React = require('React');
const ReactDOM = require('ReactDOM');
const Scroll = require('Scroll');
const Style = require('Style');

const wrapBlockNodes = require('wrapBlockNodes');

const getCustomRenderConfig = require('getCustomRenderConfig');
const getDraftRenderConfig = require('getDraftRenderConfig');
const getElementPropsConfig = require('getElementPropsConfig');
const getElementPosition = require('getElementPosition');
const getScrollPosition = require('getScrollPosition');
const getViewportDimensions = require('getViewportDimensions');
const invariant = require('invariant');

const SCROLL_BUFFER = 10;

const {List} = Immutable;

// we should harden up the bellow flow types to make them more strict
type BlockRenderFn = (block: BlockNodeRecord) => ?Object;
type BlockStyleFn = (block: BlockNodeRecord) => string;

type Props = {
  block: BlockNodeRecord,
  blockProps?: Object,
  blockRenderMap: DraftBlockRenderMap,
  blockRendererFn: BlockRenderFn,
  blockStyleFn: BlockStyleFn,
  contentState: ContentState,
  customStyleFn: (style: DraftInlineStyle, block: BlockNodeRecord) => ?Object,
  customStyleMap: Object,
  decorator: ?DraftDecoratorType,
  direction: BidiDirection,
  editorKey: string,
  editorState: EditorState,
  forceSelection: boolean,
  selection: SelectionState,
  startIndent?: boolean,
  tree: List<any>,
};

/**
 * Return whether a block overlaps with either edge of the `SelectionState`.
 */
const isBlockOnSelectionEdge = (
  selection: SelectionState,
  key: string,
): boolean => {
  return selection.getAnchorKey() === key || selection.getFocusKey() === key;
};

class DraftEditorBlockNode extends React.Component<Props> {
  shouldComponentUpdate(nextProps: Props): boolean {
    const {block, direction, tree} = this.props;
    const isContainerNode = !block.getChildKeys().isEmpty();
    const blockHasChanged =
      block !== nextProps.block ||
      tree !== nextProps.tree ||
      direction !== nextProps.direction ||
      (isBlockOnSelectionEdge(nextProps.selection, nextProps.block.getKey()) &&
        nextProps.forceSelection);

    // if we have children at this stage we always re-render container nodes
    // else if its a root node we avoid re-rendering by checking for block updates
    return isContainerNode || blockHasChanged;
  }

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
  componentDidMount(): void {
    const selection = this.props.selection;
    const endKey = selection.getEndKey();
    if (!selection.getHasFocus() || endKey !== this.props.block.getKey()) {
      return;
    }

    const blockNode = ReactDOM.findDOMNode(this);
    const scrollParent = Style.getScrollParent(blockNode);
    const scrollPosition = getScrollPosition(scrollParent);
    let scrollDelta;

    if (scrollParent === window) {
      const nodePosition = getElementPosition(blockNode);
      const nodeBottom = nodePosition.y + nodePosition.height;
      const viewportHeight = getViewportDimensions().height;
      scrollDelta = nodeBottom - viewportHeight;
      if (scrollDelta > 0) {
        window.scrollTo(
          scrollPosition.x,
          scrollPosition.y + scrollDelta + SCROLL_BUFFER,
        );
      }
    } else {
      invariant(
        blockNode instanceof HTMLElement,
        'blockNode is not an HTMLElement',
      );
      const blockBottom = blockNode.offsetHeight + blockNode.offsetTop;
      const scrollBottom = scrollParent.offsetHeight + scrollPosition.y;
      scrollDelta = blockBottom - scrollBottom;
      if (scrollDelta > 0) {
        Scroll.setTop(
          scrollParent,
          Scroll.getTop(scrollParent) + scrollDelta + SCROLL_BUFFER,
        );
      }
    }
  }

  render(): React.Node {
    const {
      block,
      blockRenderMap,
      blockRendererFn,
      blockStyleFn,
      contentState,
      decorator,
      editorKey,
      editorState,
      customStyleFn,
      customStyleMap,
      direction,
      forceSelection,
      selection,
      tree,
    } = this.props;

    let children = null;

    if (block.children.size) {
      children = block.children.map(key => {
        const offsetKey = DraftOffsetKey.encode(key, 0, 0);
        const child = contentState.getBlockForKey(key);
        const customConfig = getCustomRenderConfig(child, blockRendererFn);
        const Component = customConfig.CustomComponent || DraftEditorBlockNode;
        const {Element, wrapperTemplate} = getDraftRenderConfig(
          child,
          blockRenderMap,
        );

        const elementProps = getElementPropsConfig(
          child,
          editorKey,
          offsetKey,
          blockStyleFn,
          customConfig,
        );

        const childProps = {
          ...this.props,
          tree: editorState.getBlockTree(key),
          blockProps: customConfig.customProps,
          offsetKey,
          wrapperTemplate,
          block: child,
        };

        return {
          wrapperTemplate,
          block: child,
          element: React.createElement(
            Element,
            elementProps,
            <Component {...childProps} />,
          ),
        };
      }, []);
      children = wrapBlockNodes(children, contentState);
    }

    const blockKey = block.getKey();
    const offsetKey = DraftOffsetKey.encode(blockKey, 0, 0);

    const blockNode = (
      <DraftEditorNode
        block={block}
        children={children}
        contentState={contentState}
        customStyleFn={customStyleFn}
        customStyleMap={customStyleMap}
        decorator={decorator}
        direction={direction}
        forceSelection={forceSelection}
        hasSelection={isBlockOnSelectionEdge(selection, blockKey)}
        selection={selection}
        tree={tree}
      />
    );

    if (block.getParentKey()) {
      return blockNode;
    }

    const {Element} = getDraftRenderConfig(block, blockRenderMap);
    const elementProps = getElementPropsConfig(
      block,
      editorKey,
      offsetKey,
      blockStyleFn,
      getCustomRenderConfig(block, blockRendererFn),
    );

    // root block nodes needs to be wrapped
    return React.createElement(Element, elementProps, blockNode);
  }
}

module.exports = DraftEditorBlockNode;
