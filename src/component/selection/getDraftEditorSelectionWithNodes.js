/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @oncall draft_js
 */

'use strict';

import type {DOMDerivedSelection} from 'DOMDerivedSelection';
import type EditorState from 'EditorState';

const findAncestorOffsetKey = require('findAncestorOffsetKey');
const getSelectionOffsetKeyForNode = require('getSelectionOffsetKeyForNode');
const getUpdatedSelectionState = require('getUpdatedSelectionState');
const invariant = require('invariant');
const isElement = require('isElement');
const nullthrows = require('nullthrows');

type SelectionPoint = {
  key: string,
  offset: number,
};

/**
 * Convert the current selection range to an anchor/focus pair of offset keys
 * and values that can be interpreted by components.
 */
function getDraftEditorSelectionWithNodes(
  editorState: EditorState,
  root: ?HTMLElement,
  anchorNode: Node,
  anchorOffset: number,
  focusNode: Node,
  focusOffset: number,
): DOMDerivedSelection {
  const anchorIsTextNode = anchorNode.nodeType === Node.TEXT_NODE;
  const focusIsTextNode = focusNode.nodeType === Node.TEXT_NODE;

  // If the selection range lies only on text nodes, the task is simple.
  // Find the nearest offset-aware elements and use the
  // offset values supplied by the selection range.
  if (anchorIsTextNode && focusIsTextNode) {
    return {
      selectionState: getUpdatedSelectionState(
        editorState,
        nullthrows(findAncestorOffsetKey(anchorNode)),
        anchorOffset,
        nullthrows(findAncestorOffsetKey(focusNode)),
        focusOffset,
      ),
      needsRecovery: false,
    };
  }

  let anchorPoint = null;
  let focusPoint = null;
  let needsRecovery = true;

  // An element is selected. Convert this selection range into leaf offset
  // keys and offset values for consumption at the component level. This
  // is common in Firefox, where select-all and triple click behavior leads
  // to entire elements being selected.
  //
  // Note that we use the `needsRecovery` parameter in the callback here. This
  // is because when certain elements are selected, the behavior for subsequent
  // cursor movement (e.g. via arrow keys) is uncertain and may not match
  // expectations at the component level. For example, if an entire <div> is
  // selected and the user presses the right arrow, Firefox keeps the selection
  // on the <div>. If we allow subsequent keypresses to insert characters
  // natively, they will be inserted into a browser-created text node to the
  // right of that <div>. This is obviously undesirable.
  //
  // With the `needsRecovery` flag, we inform the caller that it is responsible
  // for manually setting the selection state on the rendered document to
  // ensure proper selection state maintenance.

  if (anchorIsTextNode) {
    anchorPoint = {
      key: nullthrows(findAncestorOffsetKey(anchorNode)),
      offset: anchorOffset,
    };
    focusPoint = getPointForNonTextNode(root, focusNode, focusOffset);
  } else if (focusIsTextNode) {
    focusPoint = {
      key: nullthrows(findAncestorOffsetKey(focusNode)),
      offset: focusOffset,
    };
    anchorPoint = getPointForNonTextNode(root, anchorNode, anchorOffset);
  } else {
    anchorPoint = getPointForNonTextNode(root, anchorNode, anchorOffset);
    focusPoint = getPointForNonTextNode(root, focusNode, focusOffset);

    // If the selection is collapsed on an empty block, don't force recovery.
    // This way, on arrow key selection changes, the browser can move the
    // cursor from a non-zero offset on one block, through empty blocks,
    // to a matching non-zero offset on other text blocks.
    if (anchorNode === focusNode && anchorOffset === focusOffset) {
      needsRecovery =
        !!anchorNode.firstChild && anchorNode.firstChild.nodeName !== 'BR';
    }
  }

  return {
    selectionState: getUpdatedSelectionState(
      editorState,
      anchorPoint.key,
      anchorPoint.offset,
      focusPoint.key,
      focusPoint.offset,
    ),
    needsRecovery,
  };
}

/**
 * Identify the first leaf descendant for the given node.
 */
function getFirstLeaf(node: any): Node {
  while (
    node.firstChild &&
    // data-blocks has no offset
    ((isElement(node.firstChild) &&
      (node.firstChild: Element).getAttribute('data-blocks') === 'true') ||
      getSelectionOffsetKeyForNode(node.firstChild))
  ) {
    node = node.firstChild;
  }
  return node;
}

/**
 * Identify the last leaf descendant for the given node.
 */
function getLastLeaf(node: any): Node {
  while (
    node.lastChild &&
    // data-blocks has no offset
    ((isElement(node.lastChild) &&
      node.lastChild.getAttribute('data-blocks') === 'true') ||
      getSelectionOffsetKeyForNode(node.lastChild))
  ) {
    node = node.lastChild;
  }
  return node;
}

function getPointForNonTextNode(
  editorRoot: ?HTMLElement,
  startNode: Node,
  childOffset: number,
): SelectionPoint {
  let node: ?(Node | Element) = startNode;
  // $FlowFixMe[incompatible-call]
  const offsetKey: ?string = findAncestorOffsetKey(node);

  invariant(
    offsetKey != null ||
      (editorRoot && (editorRoot === node || editorRoot.firstChild === node)),
    'Unknown node in selection range.',
  );

  // If the editorRoot is the selection, step downward into the content
  // wrapper.
  if (editorRoot === node) {
    // $FlowFixMe[incompatible-use]
    node = node.firstChild;
    invariant(
      isElement(node),
      'Invalid DraftEditorContents node. Expected element but instead got a node with type of %s.',
      [node?.nodeType],
    );
    const castedNode: Element = (node: any);

    // assignment only added for flow :/
    // otherwise it throws in line 200 saying that node can be null or undefined
    node = castedNode;
    invariant(
      node.getAttribute('data-contents') === 'true',
      'Invalid DraftEditorContents structure.',
    );
    if (childOffset > 0) {
      childOffset = node.childNodes.length;
    }
  }

  // If the child offset is zero and we have an offset key, we're done.
  // If there's no offset key because the entire editor is selected,
  // find the leftmost ("first") leaf in the tree and use that as the offset
  // key.
  if (childOffset === 0) {
    let key: ?string = null;
    if (offsetKey != null) {
      key = offsetKey;
    } else {
      const firstLeaf = getFirstLeaf(node);
      key = nullthrows(getSelectionOffsetKeyForNode(firstLeaf));
    }
    return {key, offset: 0};
  }

  // $FlowFixMe[incompatible-use]
  const nodeBeforeCursor = node.childNodes[childOffset - 1];
  let leafKey: ?string = null;
  let textLength: ?number = null;

  if (!getSelectionOffsetKeyForNode(nodeBeforeCursor)) {
    // Our target node may be a leaf or a text node, in which case we're
    // already where we want to be and can just use the child's length as
    // our offset.
    leafKey = nullthrows(offsetKey);
    textLength = getTextContentLength(nodeBeforeCursor);
  } else {
    // Otherwise, we'll look at the child to the left of the cursor and find
    // the last leaf node in its subtree.
    const lastLeaf = getLastLeaf(nodeBeforeCursor);
    leafKey = nullthrows(getSelectionOffsetKeyForNode(lastLeaf));
    textLength = getTextContentLength(lastLeaf);
  }

  return {
    key: leafKey,
    offset: textLength,
  };
}

/**
 * Return the length of a node's textContent, regarding single newline
 * characters as zero-length. This allows us to avoid problems with identifying
 * the correct selection offset for empty blocks in IE, in which we
 * render newlines instead of break tags.
 */
function getTextContentLength(node: Node): number {
  const textContent = node.textContent;
  return textContent === '\n' ? 0 : textContent.length;
}

module.exports = getDraftEditorSelectionWithNodes;
