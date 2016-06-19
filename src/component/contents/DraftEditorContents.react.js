/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule DraftEditorContents.react
 * @typechecks
 * @flow
 */

'use strict';

const DraftEditorBlocks = require('DraftEditorBlocks.react');
const EditorState = require('EditorState');
const React = require('React');
const nullthrows = require('nullthrows');

import type ContentBlock from 'ContentBlock';

type Props = {
  blockRendererFn: Function,
  blockStyleFn: (block: ContentBlock) => string,
  editorState: EditorState,
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
class DraftEditorContents extends React.Component {
  shouldComponentUpdate(nextProps: Props): boolean {
    const prevEditorState = this.props.editorState;
    const nextEditorState = nextProps.editorState;

    const prevDirectionMap = prevEditorState.getDirectionMap();
    const nextDirectionMap = nextEditorState.getDirectionMap();

    // Text direction has changed for one or more blocks. We must re-render.
    if (prevDirectionMap !== nextDirectionMap) {
      return true;
    }

    const didHaveFocus = prevEditorState.getSelection().getHasFocus();
    const nowHasFocus = nextEditorState.getSelection().getHasFocus();

    if (didHaveFocus !== nowHasFocus) {
      return true;
    }

    const nextNativeContent = nextEditorState.getNativelyRenderedContent();

    const wasComposing = prevEditorState.isInCompositionMode();
    const nowComposing = nextEditorState.isInCompositionMode();

    // If the state is unchanged or we're currently rendering a natively
    // rendered state, there's nothing new to be done.
    if (
      prevEditorState === nextEditorState ||
      (
        nextNativeContent !== null &&
        nextEditorState.getCurrentContent() === nextNativeContent
      ) ||
      (wasComposing && nowComposing)
    ) {
      return false;
    }

    const prevContent = prevEditorState.getCurrentContent();
    const nextContent = nextEditorState.getCurrentContent();
    const prevDecorator = prevEditorState.getDecorator();
    const nextDecorator = nextEditorState.getDecorator();
    return (
      wasComposing !== nowComposing ||
      prevContent !== nextContent ||
      prevDecorator !== nextDecorator ||
      nextEditorState.mustForceSelection()
    );
  }

  render(): React.Element<any> {
    const {
      blockRenderMap,
      blockRendererFn,
      blockStyleFn,
      customStyleMap,
      editorState,
    } = this.props;

    const content = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const forceSelection = editorState.mustForceSelection();
    const decorator = editorState.getDecorator();
    const directionMap = nullthrows(editorState.getDirectionMap());
    const blockMapTree = content.getBlockDescendants();
    const blockMap = blockMapTree.getIn(['__ROOT__', 'firstLevelBlocks']);

    return <DraftEditorBlocks
        type="contents"
        selection={selection}
        forceSelection={forceSelection}
        decorator={decorator}
        directionMap={directionMap}
        blockMap={blockMap}
        blockMapTree={blockMapTree}
        blockStyleFn={blockStyleFn}
        blockRendererFn={blockRendererFn}
        blockRenderMap={blockRenderMap}
        customStyleMap={customStyleMap}
        getBlockTree={editorState.getBlockTree.bind(editorState)}
        getBlockChildren={content.getBlockChildren.bind(content)}
        getBlockDescendants={content.getBlockDescendants.bind(content)}
      />;
  }
}

module.exports = DraftEditorContents;
