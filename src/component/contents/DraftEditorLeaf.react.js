/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 * @emails oncall+draft_js
 */

'use strict';

import type {BlockNodeRecord} from 'BlockNodeRecord';
import type {DraftInlineStyle} from 'DraftInlineStyle';
import type SelectionState from 'SelectionState';

const DraftEditorTextNode = require('DraftEditorTextNode.react');

const invariant = require('invariant');
const isHTMLBRElement = require('isHTMLBRElement');
const React = require('react');
const setDraftEditorSelection =
  require('setDraftEditorSelection').setDraftEditorSelection;

type CSSStyleObject = {[property: string]: string | number, ...};

type CustomStyleMap = {[name: string]: CSSStyleObject, ...};
type CustomStyleFn = (
  style: DraftInlineStyle,
  block: BlockNodeRecord,
) => ?CSSStyleObject;

type Props = {
  // The block that contains this leaf.
  block: BlockNodeRecord,
  // Mapping of style names to CSS declarations.
  customStyleMap: CustomStyleMap,
  // Function that maps style names to CSS style objects.
  customStyleFn?: CustomStyleFn,
  // Whether to force the DOM selection after render.
  forceSelection: boolean,
  // Whether this leaf is the last in its block. Used for a DOM hack.
  isLast: boolean,
  offsetKey: string,
  // The current `SelectionState`, used to represent a selection range in the
  // editor
  selection: ?SelectionState,
  // The offset of this string within its block.
  start: number,
  // The set of style(s) names to apply to the node.
  styleSet: DraftInlineStyle,
  // The full text to be rendered within this node.
  text: string,
  ...
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
class DraftEditorLeaf extends React.Component<Props> {
  /**
   * By making individual leaf instances aware of their context within
   * the text of the editor, we can set our selection range more
   * easily than we could in the non-React world.
   *
   * Note that this depends on our maintaining tight control over the
   * DOM structure of the DraftEditor component. If leaves had multiple
   * text nodes, this would be harder.
   */

  leaf: ?HTMLElement;

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
    const node = this.leaf;
    invariant(node, 'Missing node');
    const child = node.firstChild;
    invariant(child, 'Missing child');
    let targetNode;

    if (child.nodeType === Node.TEXT_NODE) {
      targetNode = child;
    } else if (isHTMLBRElement(child)) {
      targetNode = node;
    } else {
      targetNode = child.firstChild;
      invariant(targetNode, 'Missing targetNode');
    }

    setDraftEditorSelection(selection, targetNode, blockKey, start, end);
  }

  shouldComponentUpdate(nextProps: Props): boolean {
    const leafNode = this.leaf;
    invariant(leafNode, 'Missing leafNode');
    const shouldUpdate =
      leafNode.textContent !== nextProps.text ||
      nextProps.styleSet !== this.props.styleSet ||
      nextProps.forceSelection;
    return shouldUpdate;
  }

  componentDidUpdate(): void {
    this._setSelection();
  }

  componentDidMount(): void {
    this._setSelection();
  }

  render(): React.Node {
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

      if (style !== undefined && map.textDecoration !== style.textDecoration) {
        // .trim() is necessary for IE9/10/11 and Edge
        mergedStyles.textDecoration = [map.textDecoration, style.textDecoration]
          .join(' ')
          .trim();
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
        ref={ref => (this.leaf = ref)}
        style={styleObj}>
        <DraftEditorTextNode>{text}</DraftEditorTextNode>
      </span>
    );
  }
}

module.exports = DraftEditorLeaf;
