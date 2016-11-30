/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule DraftEditorLeaf.react
 * @typechecks
 * @flow
 */

'use strict';

var ContentBlock = require('ContentBlock');
var DraftEditorTextNode = require('DraftEditorTextNode.react');
var React = require('React');
var ReactDOM = require('ReactDOM');
var SelectionState = require('SelectionState');

var setDraftEditorSelection = require('setDraftEditorSelection');

import type {DraftInlineStyle} from 'DraftInlineStyle';

type Props = {
  // The block that contains this leaf.
  block: ContentBlock,

  // Mapping of style names to CSS declarations.
  customStyleMap: Object,

  // Function that maps style names to CSS style objects.
  customStyleFn: Function,

  // Whether to force the DOM selection after render.
  forceSelection: boolean,

  // Whether this leaf is the last in its block. Used for a DOM hack.
  isLast: boolean,

  offsetKey: string,

  // The current `SelectionState`, used to
  selection: SelectionState,

  // The offset of this string within its block.
  start: number,

  // The set of style(s) names to apply to the node.
  styleSet: DraftInlineStyle,

  // The full text to be rendered within this node.
  text: string,
};

/**
 * All leaf nodes in the editor are spans with single text nodes. Leaf
 * elements are styled based on the merging of an optional custom style map
 * and a default style map.
 *
 * `DraftEditorLeaf` also provides a wrapper for calling into the imperative
 * DOM Selection API. In this way, top-level components can declaratively
 * maintain the selection state.
 */
class DraftEditorLeaf extends React.Component {
  /**
   * By making individual leaf instances aware of their context within
   * the text of the editor, we can set our selection range more
   * easily than we could in the non-React world.
   *
   * Note that this depends on our maintaining tight control over the
   * DOM structure of the TextEditor component. If leaves had multiple
   * text nodes, this would be harder.
   */
  _setSelection(): void {
    const {selection} = this.props;

    // If selection state is irrelevant to the parent block, no-op.
    if (selection == null || !selection.getHasFocus()) {
      return;
    }

    const {block, start, text} = this.props;
    const blockKey = block.getKey();
    const end = start + text.length;
    if (!selection.hasEdgeWithin(blockKey, start, end)) {
      return;
    }

    // Determine the appropriate target node for selection. If the child
    // is not a text node, it is a <br /> spacer. In this case, use the
    // <span> itself as the selection target.
    const node = ReactDOM.findDOMNode(this);
    const child = node.firstChild;
    let targetNode;

    if (child.nodeType === Node.TEXT_NODE) {
      targetNode = child;
    } else if (child.tagName === 'BR') {
      targetNode = node;
    } else {
      targetNode = child.firstChild;
    }

    setDraftEditorSelection(selection, targetNode, blockKey, start, end);
  }

  shouldComponentUpdate(nextProps: Props): boolean {
    return (
      ReactDOM.findDOMNode(this.refs.leaf).textContent !== nextProps.text ||
      nextProps.styleSet !== this.props.styleSet ||
      nextProps.forceSelection
    );
  }

  componentDidUpdate(): void {
    this._setSelection();
  }

  componentDidMount(): void {
    this._setSelection();
  }

  render(): React.Element<any> {
    const {block} = this.props;
    let {text} = this.props;

    // If the leaf is at the end of its block and ends in a soft newline, append
    // an extra line feed character. Browsers collapse trailing newline
    // characters, which leaves the cursor in the wrong place after a
    // shift+enter. The extra character repairs this.
    if (text.endsWith('\n') && this.props.isLast) {
      text += '\n';
    }

    const {customStyleMap, customStyleFn, offsetKey, styleSet} = this.props;
    let styleObj = styleSet.reduce((map, styleName) => {
      const mergedStyles = {};
      const style = customStyleMap[styleName];

      if (
        style !== undefined &&
        map.textDecoration !== style.textDecoration
      ) {
        // .trim() is necessary for IE9/10/11 and Edge
        mergedStyles.textDecoration =
          [map.textDecoration, style.textDecoration].join(' ').trim();
      }

      return Object.assign(map, style, mergedStyles);
    }, {});

    if (customStyleFn) {
      const newStyles = customStyleFn(styleSet, block);
      styleObj = Object.assign(styleObj, newStyles);
    }

    return (
      <span
        data-offset-key={offsetKey}
        ref="leaf"
        style={styleObj}>
        <DraftEditorTextNode>{text}</DraftEditorTextNode>
      </span>
    );
  }
}

module.exports = DraftEditorLeaf;
