/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule DraftEditorBlocks.react
 * @typechecks
 * @flow
 */

'use strict';

const DraftEditorBlock = require('DraftEditorBlock.react');
const DraftOffsetKey = require('DraftOffsetKey');
const React = require('React');

const cx = require('cx');
const joinClasses = require('joinClasses');
const nullthrows = require('nullthrows');

import type {BidiDirection} from 'UnicodeBidiDirection';

/**
 * `DraftEditorBlocks` is the container component for all block components
 * rendered for a `DraftEditor`. It is optimized to aggressively avoid
 * re-rendering blocks whenever possible.
 *
 * This component is separate from `DraftEditor` because certain props
 * (for instance, ARIA props) must be allowed to update without affecting
 * the contents of the editor.
 */
class DraftEditorBlocks extends React.Component {
  render(): React.Element {
    const {
      type,
      blockRenderMap,
      blockRendererFn,
      blockStyleFn,
      customStyleMap,
      blockMap,
      blockMapTree,
      selection,
      forceSelection,
      decorator,
      directionMap,
      getBlockTree,
      getBlockChildren,
      getBlockDescendants
    } = this.props;

    const blocks = [];
    let currentWrapperElement = null;
    let currentWrapperTemplate = null;
    let currentDepth = null;
    let currentWrappedBlocks;
    let key, blockType, child, childProps, wrapperTemplate;

    blockMap.forEach((block) => {
      key = block.getKey();
      blockType = block.getType();

      const customRenderer = blockRendererFn(block);
      let CustomComponent, customProps, customEditable;
      if (customRenderer) {
        CustomComponent = customRenderer.component;
        customProps = customRenderer.props;
        customEditable = customRenderer.editable;
      }

      const direction = directionMap.get(key);
      const offsetKey = DraftOffsetKey.encode(key, 0, 0);
      const blockChildren = blockMapTree.getIn([key, 'firstLevelBlocks']);

      const componentProps = {
        block,
        blockProps: customProps,
        customStyleMap,
        decorator,
        direction,
        directionMap,
        forceSelection,
        key,
        offsetKey,
        selection,
        blockRenderMap,
        blockRendererFn,
        blockStyleFn,
        blockMapTree,
        blockMap: blockChildren,
        getBlockTree,
        getBlockChildren,
        getBlockDescendants,
        DraftEditorBlocks: DraftEditorBlocks,
        tree: getBlockTree(key)
      };

      // Block render map must have a configuration specified for this
      // block type.
      const configForType = nullthrows(blockRenderMap.get(blockType));

      wrapperTemplate = configForType.wrapper;

      const useNewWrapper = wrapperTemplate !== currentWrapperTemplate;

      const Element = (
        blockRenderMap.get(blockType).element ||
        blockRenderMap.get('unstyled').element
      );

      const depth = block.getDepth();
      let className = blockStyleFn(block);

      // List items are special snowflakes, since we handle nesting and
      // counters manually.
      if (Element === 'li') {
        const shouldResetCount = (
          useNewWrapper ||
          currentDepth === null ||
          depth > currentDepth
        );
        className = joinClasses(
          className,
          getListItemClasses(blockType, depth, shouldResetCount, direction)
        );
      }

      const Component = CustomComponent || DraftEditorBlock;
      childProps = {
        className,
        'data-block': true,
        'data-editor': this.props.editorKey,
        'data-offset-key': offsetKey,
        key,
      };
      if (customEditable !== undefined) {
        childProps = {
          ...childProps,
          contentEditable: customEditable,
          suppressContentEditableWarning: true,
        };
      }

      child = React.createElement(
        Element,
        childProps,
        <Component {...componentProps} />,
      );

      if (wrapperTemplate) {
        if (useNewWrapper) {
          currentWrappedBlocks = [];
          currentWrapperElement = React.cloneElement(
            wrapperTemplate,
            {
              key: key + '-wrap',
              'data-offset-key': offsetKey,
            },
            currentWrappedBlocks
          );
          currentWrapperTemplate = wrapperTemplate;
          blocks.push(currentWrapperElement);
        }
        currentDepth = block.getDepth();
        nullthrows(currentWrappedBlocks).push(child);
      } else {
        currentWrappedBlocks = null;
        currentWrapperElement = null;
        currentWrapperTemplate = null;
        currentDepth = null;
        blocks.push(child);
      }
    });

    const dataContents = type === 'contents' ? true : null;
    const dataBlocks = dataContents ? null : true;

    return (
      // data-contents will be true for the root level block otherwise
      // it will just be a block container
      <div data-contents={dataContents} data-blocks={dataBlocks} >{blocks}</div>
    );
  }
}

/**
 * Provide default styling for list items. This way, lists will be styled with
 * proper counters and indentation even if the caller does not specify
 * their own styling at all. If more than five levels of nesting are needed,
 * the necessary CSS classes can be provided via `blockStyleFn` configuration.
 */
function getListItemClasses(
  type: string,
  depth: number,
  shouldResetCount: boolean,
  direction: BidiDirection
): string {
  return cx({
    'public/DraftStyleDefault/unorderedListItem':
      type === 'unordered-list-item',
    'public/DraftStyleDefault/orderedListItem':
      type === 'ordered-list-item',
    'public/DraftStyleDefault/reset': shouldResetCount,
    'public/DraftStyleDefault/depth0': depth === 0,
    'public/DraftStyleDefault/depth1': depth === 1,
    'public/DraftStyleDefault/depth2': depth === 2,
    'public/DraftStyleDefault/depth3': depth === 3,
    'public/DraftStyleDefault/depth4': depth === 4,
    'public/DraftStyleDefault/listLTR': direction === 'LTR',
    'public/DraftStyleDefault/listRTL': direction === 'RTL',
  });
}

module.exports = DraftEditorBlocks;
