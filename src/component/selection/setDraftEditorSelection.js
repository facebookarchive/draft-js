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

import type {SelectionObject} from 'DraftDOMTypes';
import type SelectionState from 'SelectionState';

const DraftEffects = require('DraftEffects');
const DraftJsDebugLogging = require('DraftJsDebugLogging');
const UserAgent = require('UserAgent');

const containsNode = require('containsNode');
const getActiveElement = require('getActiveElement');
const getCorrectDocumentFromNode = require('getCorrectDocumentFromNode');
const invariant = require('invariant');
const isElement = require('isElement');

const isIE = UserAgent.isBrowser('IE');

function getAnonymizedDOM(
  node: Node,
  getNodeLabels?: (n: Node) => Array<string>,
): string {
  if (!node) {
    return '[empty]';
  }

  const anonymized = anonymizeTextWithin(node, getNodeLabels);
  if (anonymized.nodeType === Node.TEXT_NODE) {
    return anonymized.textContent;
  }

  invariant(
    isElement(anonymized),
    'Node must be an Element if it is not a text node.',
  );
  const castedElement: Element = (anonymized: any);
  return castedElement.outerHTML;
}

function anonymizeTextWithin(
  node: Node,
  getNodeLabels?: (n: Node) => Array<string>,
): Node {
  const labels = getNodeLabels !== undefined ? getNodeLabels(node) : [];

  if (node.nodeType === Node.TEXT_NODE) {
    const length = node.textContent.length;
    return getCorrectDocumentFromNode(node).createTextNode(
      '[text ' +
        length +
        (labels.length ? ' | ' + labels.join(', ') : '') +
        ']',
    );
  }

  const clone = node.cloneNode();
  if (clone.nodeType === 1 && labels.length) {
    ((clone: any): Element).setAttribute('data-labels', labels.join(', '));
  }
  const childNodes = node.childNodes;
  for (let ii = 0; ii < childNodes.length; ii++) {
    clone.appendChild(anonymizeTextWithin(childNodes[ii], getNodeLabels));
  }

  return clone;
}

function getAnonymizedEditorDOM(
  node: Node,
  getNodeLabels?: (n: Node) => Array<string>,
): string {
  // grabbing the DOM content of the Draft editor
  let currentNode: ?Node = node;
  // this should only be used after checking with isElement
  let castedNode: Element = (currentNode: any);
  while (currentNode) {
    if (isElement(currentNode) && castedNode.hasAttribute('contenteditable')) {
      // found the Draft editor container
      return getAnonymizedDOM(currentNode, getNodeLabels);
    } else {
      currentNode = currentNode.parentNode;
      castedNode = (currentNode: any);
    }
  }
  return 'Could not find contentEditable parent of node';
}

function getNodeLength(node: Node): number {
  return node.nodeValue === null
    ? node.childNodes.length
    : node.nodeValue.length;
}

/**
 * In modern non-IE browsers, we can support both forward and backward
 * selections.
 *
 * Note: IE10+ supports the Selection object, but it does not support
 * the `extend` method, which means that even in modern IE, it's not possible
 * to programatically create a backward selection. Thus, for all IE
 * versions, we use the old IE API to create our selections.
 */
function setDraftEditorSelection(
  selectionState: SelectionState,
  node: Node,
  blockKey: string,
  nodeStart: number,
  nodeEnd: number,
): void {
  // It's possible that the editor has been removed from the DOM but
  // our selection code doesn't know it yet. Forcing selection in
  // this case may lead to errors, so just bail now.
  const documentObject = getCorrectDocumentFromNode(node);
  if (!containsNode(documentObject.documentElement, node)) {
    return;
  }

  const selection: SelectionObject = documentObject.defaultView.getSelection();
  let anchorKey = selectionState.getAnchorKey();
  let anchorOffset = selectionState.getAnchorOffset();
  let focusKey = selectionState.getFocusKey();
  let focusOffset = selectionState.getFocusOffset();
  let isBackward = selectionState.getIsBackward();

  // IE doesn't support backward selection. Swap key/offset pairs.
  if (!selection.extend && isBackward) {
    const tempKey = anchorKey;
    const tempOffset = anchorOffset;
    anchorKey = focusKey;
    anchorOffset = focusOffset;
    focusKey = tempKey;
    focusOffset = tempOffset;
    isBackward = false;
  }

  const hasAnchor =
    anchorKey === blockKey &&
    nodeStart <= anchorOffset &&
    nodeEnd >= anchorOffset;

  const hasFocus =
    focusKey === blockKey && nodeStart <= focusOffset && nodeEnd >= focusOffset;

  // If the selection is entirely bound within this node, set the selection
  // and be done.
  if (hasAnchor && hasFocus) {
    selection.removeAllRanges();
    addPointToSelection(
      selection,
      node,
      anchorOffset - nodeStart,
      selectionState,
    );
    addFocusToSelection(
      selection,
      node,
      focusOffset - nodeStart,
      selectionState,
    );
    return;
  }

  if (!isBackward) {
    // If the anchor is within this node, set the range start.
    if (hasAnchor) {
      selection.removeAllRanges();
      addPointToSelection(
        selection,
        node,
        anchorOffset - nodeStart,
        selectionState,
      );
    }

    // If the focus is within this node, we can assume that we have
    // already set the appropriate start range on the selection, and
    // can simply extend the selection.
    if (hasFocus) {
      addFocusToSelection(
        selection,
        node,
        focusOffset - nodeStart,
        selectionState,
      );
    }
  } else {
    // If this node has the focus, set the selection range to be a
    // collapsed range beginning here. Later, when we encounter the anchor,
    // we'll use this information to extend the selection.
    if (hasFocus) {
      selection.removeAllRanges();
      addPointToSelection(
        selection,
        node,
        focusOffset - nodeStart,
        selectionState,
      );
    }

    // If this node has the anchor, we may assume that the correct
    // focus information is already stored on the selection object.
    // We keep track of it, reset the selection range, and extend it
    // back to the focus point.
    if (hasAnchor) {
      const storedFocusNode = selection.focusNode;
      const storedFocusOffset = selection.focusOffset;

      selection.removeAllRanges();
      addPointToSelection(
        selection,
        node,
        anchorOffset - nodeStart,
        selectionState,
      );
      addFocusToSelection(
        selection,
        storedFocusNode,
        storedFocusOffset,
        selectionState,
      );
    }
  }
}

/**
 * Extend selection towards focus point.
 */
function addFocusToSelection(
  selection: SelectionObject,
  node: ?Node,
  offset: number,
  selectionState: SelectionState,
): void {
  const activeElement = getActiveElement();
  const extend = selection.extend;
  // containsNode returns false if node is null.
  // Let's refine the type of this value out here so flow knows.
  if (extend && node != null && containsNode(activeElement, node)) {
    // If `extend` is called while another element has focus, an error is
    // thrown. We therefore disable `extend` if the active element is somewhere
    // other than the node we are selecting. This should only occur in Firefox,
    // since it is the only browser to support multiple selections.
    // See https://bugzilla.mozilla.org/show_bug.cgi?id=921444.

    // logging to catch bug that is being reported in t16250795
    if (offset > getNodeLength(node)) {
      // the call to 'selection.extend' is about to throw
      DraftJsDebugLogging.logSelectionStateFailure({
        anonymizedDom: getAnonymizedEditorDOM(node),
        extraParams: JSON.stringify({offset}),
        selectionState: JSON.stringify(selectionState.toJS()),
      });
    }

    // logging to catch bug that is being reported in t18110632
    const nodeWasFocus = node === selection.focusNode;
    try {
      // Fixes some reports of "InvalidStateError: Failed to execute 'extend' on
      // 'Selection': This Selection object doesn't have any Ranges."
      // Note: selection.extend does not exist in IE.
      if (selection.rangeCount > 0 && selection.extend) {
        selection.extend(node, offset);
      }
    } catch (e) {
      DraftJsDebugLogging.logSelectionStateFailure({
        anonymizedDom: getAnonymizedEditorDOM(node, function (n) {
          const labels = [];
          if (n === activeElement) {
            labels.push('active element');
          }
          if (n === selection.anchorNode) {
            labels.push('selection anchor node');
          }
          if (n === selection.focusNode) {
            labels.push('selection focus node');
          }
          return labels;
        }),
        extraParams: JSON.stringify(
          {
            activeElementName: activeElement ? activeElement.nodeName : null,
            nodeIsFocus: node === selection.focusNode,
            nodeWasFocus,
            selectionRangeCount: selection.rangeCount,
            selectionAnchorNodeName: selection.anchorNode
              ? selection.anchorNode.nodeName
              : null,
            selectionAnchorOffset: selection.anchorOffset,
            selectionFocusNodeName: selection.focusNode
              ? selection.focusNode.nodeName
              : null,
            selectionFocusOffset: selection.focusOffset,
            message: e ? '' + e : null,
            offset,
          },
          null,
          2,
        ),
        selectionState: JSON.stringify(selectionState.toJS(), null, 2),
      });
      // allow the error to be thrown -
      // better than continuing in a broken state
      throw e;
    }
  } else {
    // IE doesn't support extend. This will mean no backward selection.
    // Extract the existing selection range and add focus to it.
    // Additionally, clone the selection range. IE11 throws an
    // InvalidStateError when attempting to access selection properties
    // after the range is detached.
    if (node && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.setEnd(node, offset);
      selection.addRange(range.cloneRange());
    }
  }
}

function addPointToSelection(
  selection: SelectionObject,
  node: Node,
  offset: number,
  selectionState: SelectionState,
): void {
  const range = getCorrectDocumentFromNode(node).createRange();
  // logging to catch bug that is being reported in t16250795
  if (offset > getNodeLength(node)) {
    // in this case we know that the call to 'range.setStart' is about to throw
    DraftJsDebugLogging.logSelectionStateFailure({
      anonymizedDom: getAnonymizedEditorDOM(node),
      extraParams: JSON.stringify({offset}),
      selectionState: JSON.stringify(selectionState.toJS()),
    });
    DraftEffects.handleExtensionCausedError();
  }
  range.setStart(node, offset);

  // IE sometimes throws Unspecified Error when trying to addRange
  if (isIE) {
    try {
      selection.addRange(range);
    } catch (e) {
      if (__DEV__) {
        /* eslint-disable-next-line no-console */
        console.warn('Call to selection.addRange() threw exception: ', e);
      }
    }
  } else {
    selection.addRange(range);
  }
}

module.exports = {
  setDraftEditorSelection,
  addFocusToSelection,
};
