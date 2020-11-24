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

var DraftEffects = require("./DraftEffects");

var DraftJsDebugLogging = require("./DraftJsDebugLogging");

var UserAgent = require("fbjs/lib/UserAgent");

var containsNode = require("fbjs/lib/containsNode");

var getActiveElement = require("fbjs/lib/getActiveElement");

var getCorrectDocumentFromNode = require("./getCorrectDocumentFromNode");

var invariant = require("fbjs/lib/invariant");

var isElement = require("./isElement");

var isIE = UserAgent.isBrowser('IE');

function getAnonymizedDOM(node, getNodeLabels) {
  if (!node) {
    return '[empty]';
  }

  var anonymized = anonymizeTextWithin(node, getNodeLabels);

  if (anonymized.nodeType === Node.TEXT_NODE) {
    return anonymized.textContent;
  }

  !isElement(anonymized) ? process.env.NODE_ENV !== "production" ? invariant(false, 'Node must be an Element if it is not a text node.') : invariant(false) : void 0;
  var castedElement = anonymized;
  return castedElement.outerHTML;
}

function anonymizeTextWithin(node, getNodeLabels) {
  var labels = getNodeLabels !== undefined ? getNodeLabels(node) : [];

  if (node.nodeType === Node.TEXT_NODE) {
    var length = node.textContent.length;
    return getCorrectDocumentFromNode(node).createTextNode('[text ' + length + (labels.length ? ' | ' + labels.join(', ') : '') + ']');
  }

  var clone = node.cloneNode();

  if (clone.nodeType === 1 && labels.length) {
    clone.setAttribute('data-labels', labels.join(', '));
  }

  var childNodes = node.childNodes;

  for (var ii = 0; ii < childNodes.length; ii++) {
    clone.appendChild(anonymizeTextWithin(childNodes[ii], getNodeLabels));
  }

  return clone;
}

function getAnonymizedEditorDOM(node, getNodeLabels) {
  // grabbing the DOM content of the Draft editor
  var currentNode = node; // this should only be used after checking with isElement

  var castedNode = currentNode;

  while (currentNode) {
    if (isElement(currentNode) && castedNode.hasAttribute('contenteditable')) {
      // found the Draft editor container
      return getAnonymizedDOM(currentNode, getNodeLabels);
    } else {
      currentNode = currentNode.parentNode;
      castedNode = currentNode;
    }
  }

  return 'Could not find contentEditable parent of node';
}

function getNodeLength(node) {
  return node.nodeValue === null ? node.childNodes.length : node.nodeValue.length;
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


function setDraftEditorSelection(selectionState, node, blockKey, nodeStart, nodeEnd) {
  // It's possible that the editor has been removed from the DOM but
  // our selection code doesn't know it yet. Forcing selection in
  // this case may lead to errors, so just bail now.
  var documentObject = getCorrectDocumentFromNode(node);

  if (!containsNode(documentObject.documentElement, node)) {
    return;
  }

  var selection = documentObject.defaultView.getSelection();
  var anchorKey = selectionState.getAnchorKey();
  var anchorOffset = selectionState.getAnchorOffset();
  var focusKey = selectionState.getFocusKey();
  var focusOffset = selectionState.getFocusOffset();
  var isBackward = selectionState.getIsBackward(); // IE doesn't support backward selection. Swap key/offset pairs.

  if (!selection.extend && isBackward) {
    var tempKey = anchorKey;
    var tempOffset = anchorOffset;
    anchorKey = focusKey;
    anchorOffset = focusOffset;
    focusKey = tempKey;
    focusOffset = tempOffset;
    isBackward = false;
  }

  var hasAnchor = anchorKey === blockKey && nodeStart <= anchorOffset && nodeEnd >= anchorOffset;
  var hasFocus = focusKey === blockKey && nodeStart <= focusOffset && nodeEnd >= focusOffset; // If the selection is entirely bound within this node, set the selection
  // and be done.

  if (hasAnchor && hasFocus) {
    selection.removeAllRanges();
    addPointToSelection(selection, node, anchorOffset - nodeStart, selectionState);
    addFocusToSelection(selection, node, focusOffset - nodeStart, selectionState);
    return;
  }

  if (!isBackward) {
    // If the anchor is within this node, set the range start.
    if (hasAnchor) {
      selection.removeAllRanges();
      addPointToSelection(selection, node, anchorOffset - nodeStart, selectionState);
    } // If the focus is within this node, we can assume that we have
    // already set the appropriate start range on the selection, and
    // can simply extend the selection.


    if (hasFocus) {
      addFocusToSelection(selection, node, focusOffset - nodeStart, selectionState);
    }
  } else {
    // If this node has the focus, set the selection range to be a
    // collapsed range beginning here. Later, when we encounter the anchor,
    // we'll use this information to extend the selection.
    if (hasFocus) {
      selection.removeAllRanges();
      addPointToSelection(selection, node, focusOffset - nodeStart, selectionState);
    } // If this node has the anchor, we may assume that the correct
    // focus information is already stored on the selection object.
    // We keep track of it, reset the selection range, and extend it
    // back to the focus point.


    if (hasAnchor) {
      var storedFocusNode = selection.focusNode;
      var storedFocusOffset = selection.focusOffset;
      selection.removeAllRanges();
      addPointToSelection(selection, node, anchorOffset - nodeStart, selectionState);
      addFocusToSelection(selection, storedFocusNode, storedFocusOffset, selectionState);
    }
  }
}
/**
 * Extend selection towards focus point.
 */


function addFocusToSelection(selection, node, offset, selectionState) {
  var activeElement = getActiveElement();
  var extend = selection.extend; // containsNode returns false if node is null.
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
        extraParams: JSON.stringify({
          offset: offset
        }),
        selectionState: JSON.stringify(selectionState.toJS())
      });
    } // logging to catch bug that is being reported in t18110632


    var nodeWasFocus = node === selection.focusNode;

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
          var labels = [];

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
        extraParams: JSON.stringify({
          activeElementName: activeElement ? activeElement.nodeName : null,
          nodeIsFocus: node === selection.focusNode,
          nodeWasFocus: nodeWasFocus,
          selectionRangeCount: selection.rangeCount,
          selectionAnchorNodeName: selection.anchorNode ? selection.anchorNode.nodeName : null,
          selectionAnchorOffset: selection.anchorOffset,
          selectionFocusNodeName: selection.focusNode ? selection.focusNode.nodeName : null,
          selectionFocusOffset: selection.focusOffset,
          message: e ? '' + e : null,
          offset: offset
        }, null, 2),
        selectionState: JSON.stringify(selectionState.toJS(), null, 2)
      }); // allow the error to be thrown -
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
      var range = selection.getRangeAt(0);
      range.setEnd(node, offset);
      selection.addRange(range.cloneRange());
    }
  }
}

function addPointToSelection(selection, node, offset, selectionState) {
  var range = getCorrectDocumentFromNode(node).createRange(); // logging to catch bug that is being reported in t16250795

  if (offset > getNodeLength(node)) {
    // in this case we know that the call to 'range.setStart' is about to throw
    DraftJsDebugLogging.logSelectionStateFailure({
      anonymizedDom: getAnonymizedEditorDOM(node),
      extraParams: JSON.stringify({
        offset: offset
      }),
      selectionState: JSON.stringify(selectionState.toJS())
    });
    DraftEffects.handleExtensionCausedError();
  }

  range.setStart(node, offset); // IE sometimes throws Unspecified Error when trying to addRange

  if (isIE) {
    try {
      selection.addRange(range);
    } catch (e) {
      if (process.env.NODE_ENV !== "production") {
        /* eslint-disable-next-line no-console */
        console.warn('Call to selection.addRange() threw exception: ', e);
      }
    }
  } else {
    selection.addRange(range);
  }
}

module.exports = {
  setDraftEditorSelection: setDraftEditorSelection,
  addFocusToSelection: addFocusToSelection
};