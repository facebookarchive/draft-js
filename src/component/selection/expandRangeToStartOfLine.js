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

const UnicodeUtils = require('UnicodeUtils');

const getCorrectDocumentFromNode = require('getCorrectDocumentFromNode');
const getRangeClientRects = require('getRangeClientRects');
const invariant = require('invariant');
/**
 * Return the computed line height, in pixels, for the provided element.
 */
function getLineHeightPx(element: Element): number {
  const computed = getComputedStyle(element);
  const correctDocument = getCorrectDocumentFromNode(element);
  const div = correctDocument.createElement('div');
  div.style.fontFamily = computed.fontFamily;
  div.style.fontSize = computed.fontSize;
  div.style.fontStyle = computed.fontStyle;
  div.style.fontWeight = computed.fontWeight;
  div.style.lineHeight = computed.lineHeight;
  div.style.position = 'absolute';
  div.textContent = 'M';

  const documentBody = correctDocument.body;
  invariant(documentBody, 'Missing document.body');

  // forced layout here
  documentBody.appendChild(div);
  const rect = div.getBoundingClientRect();
  documentBody.removeChild(div);

  return rect.height;
}

/**
 * Return whether every ClientRect in the provided list lies on the same line.
 *
 * We assume that the rects on the same line all contain the baseline, so the
 * lowest top line needs to be above the highest bottom line (i.e., if you were
 * to project the rects onto the y-axis, their intersection would be nonempty).
 *
 * In addition, we require that no two boxes are lineHeight (or more) apart at
 * either top or bottom, which helps protect against false positives for fonts
 * with extremely large glyph heights (e.g., with a font size of 17px, Zapfino
 * produces rects of height 58px!).
 */
function areRectsOnOneLine(
  rects: Array<ClientRect>,
  lineHeight: number,
): boolean {
  let minTop = Infinity;
  let minBottom = Infinity;
  let maxTop = -Infinity;
  let maxBottom = -Infinity;

  for (let ii = 0; ii < rects.length; ii++) {
    const rect = rects[ii];
    if (rect.width === 0 || rect.width === 1) {
      // When a range starts or ends a soft wrap, many browsers (Chrome, IE,
      // Safari) include an empty rect on the previous or next line. When the
      // text lies in a container whose position is not integral (e.g., from
      // margin: auto), Safari makes these empty rects have width 1 (instead of
      // 0). Having one-pixel-wide characters seems unlikely (and most browsers
      // report widths in subpixel precision anyway) so it's relatively safe to
      // skip over them.
      continue;
    }
    minTop = Math.min(minTop, rect.top);
    minBottom = Math.min(minBottom, rect.bottom);
    maxTop = Math.max(maxTop, rect.top);
    maxBottom = Math.max(maxBottom, rect.bottom);
  }

  return (
    maxTop <= minBottom &&
    maxTop - minTop < lineHeight &&
    maxBottom - minBottom < lineHeight
  );
}

/**
 * Return the length of a node, as used by Range offsets.
 */
function getNodeLength(node: Node): number {
  // http://www.w3.org/TR/dom/#concept-node-length
  switch (node.nodeType) {
    case Node.DOCUMENT_TYPE_NODE:
      return 0;
    case Node.TEXT_NODE:
    case Node.PROCESSING_INSTRUCTION_NODE:
    case Node.COMMENT_NODE:
      return (node: any).length;
    default:
      return node.childNodes.length;
  }
}

/**
 * Given a collapsed range, move the start position backwards as far as
 * possible while the range still spans only a single line.
 */
function expandRangeToStartOfLine(range: Range): Range {
  invariant(
    range.collapsed,
    'expandRangeToStartOfLine: Provided range is not collapsed.',
  );
  range = range.cloneRange();

  let containingElement: ?Node = range.startContainer;
  // $FlowFixMe[incompatible-type]
  // $FlowFixMe[incompatible-use]
  if (containingElement.nodeType !== 1) {
    // $FlowFixMe[incompatible-use]
    containingElement = containingElement.parentNode;
  }
  const lineHeight = getLineHeightPx((containingElement: any));

  // Imagine our text looks like:
  //   <div><span>once upon a time, there was a <em>boy
  //   who lived</em> </span><q><strong>under^ the
  //   stairs</strong> in a small closet.</q></div>
  // where the caret represents the cursor. First, we crawl up the tree until
  // the range spans multiple lines (setting the start point to before
  // "<strong>", then before "<div>"), then at each level we do a search to
  // find the latest point which is still on a previous line. We'll find that
  // the break point is inside the span, then inside the <em>, then in its text
  // node child, the actual break point before "who".

  let bestContainer = range.endContainer;
  let bestOffset = range.endOffset;
  range.setStart(range.startContainer, 0);

  while (areRectsOnOneLine(getRangeClientRects(range), lineHeight)) {
    bestContainer = range.startContainer;
    bestOffset = range.startOffset;
    invariant(
      bestContainer.parentNode,
      'Found unexpected detached subtree when traversing.',
    );
    range.setStartBefore(bestContainer);
    if (
      bestContainer.nodeType === 1 &&
      getComputedStyle((bestContainer: any)).display !== 'inline'
    ) {
      // The start of the line is never in a different block-level container.
      break;
    }
  }

  // In the above example, range now spans from "<div>" to "under",
  // bestContainer is <div>, and bestOffset is 1 (index of <q> inside <div>)].
  // Picking out which child to recurse into here is a special case since we
  // don't want to check past <q> -- once we find that the final range starts
  // in <span>, we can look at all of its children (and all of their children)
  // to find the break point.

  // At all times, (bestContainer, bestOffset) is the latest single-line start
  // point that we know of.
  let currentContainer = bestContainer;
  let maxIndexToConsider = bestOffset - 1;

  do {
    const nodeValue = currentContainer.nodeValue;
    let ii = maxIndexToConsider;

    for (; ii >= 0; ii--) {
      if (
        nodeValue != null &&
        ii > 0 &&
        UnicodeUtils.isSurrogatePair(nodeValue, ii - 1)
      ) {
        // We're in the middle of a surrogate pair -- skip over so we never
        // return a range with an endpoint in the middle of a code point.
        continue;
      }

      range.setStart(currentContainer, ii);
      if (areRectsOnOneLine(getRangeClientRects(range), lineHeight)) {
        bestContainer = currentContainer;
        bestOffset = ii;
      } else {
        break;
      }
    }

    if (ii === -1 || currentContainer.childNodes.length === 0) {
      // If ii === -1, then (bestContainer, bestOffset), which is equal to
      // (currentContainer, 0), was a single-line start point but a start
      // point before currentContainer wasn't, so the line break seems to
      // have occurred immediately after currentContainer's start tag
      //
      // If currentContainer.childNodes.length === 0, we're already at a
      // terminal node (e.g., text node) and should return our current best.
      break;
    }

    currentContainer = currentContainer.childNodes[ii];
    maxIndexToConsider = getNodeLength(currentContainer);
  } while (true);

  range.setStart(bestContainer, bestOffset);
  return range;
}

module.exports = expandRangeToStartOfLine;
