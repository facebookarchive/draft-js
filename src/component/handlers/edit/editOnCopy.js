/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 * @flow
 */

'use strict';

import type DraftEditor from 'DraftEditor.react';

const ContentState = require('ContentState');
const convertFromDraftStateToRaw = require('convertFromDraftStateToRaw');
const getFragmentFromSelection = require('getFragmentFromSelection');

/**
 * If we have a selection, create a ContentState fragment and store
 * it in our internal clipboard. Subsequent paste events will use this
 * fragment if no external clipboard data is supplied.
 */
function editOnCopy(editor: DraftEditor, e: SyntheticClipboardEvent<>): void {
  const editorState = editor._latestEditorState;
  const selection = editorState.getSelection();

  // No selection, so there's nothing to copy.
  if (selection.isCollapsed()) {
    e.preventDefault();
    return;
  }

  const fragment = getFragmentFromSelection(editor._latestEditorState);

  editor.setClipboard(fragment);

  // IE11 does not support ClipboardEvent.clipboardData.
  if (e.clipboardData && fragment) {
    const content = ContentState.createFromBlockArray(fragment.toArray());
    const serialisedContent = JSON.stringify(
      convertFromDraftStateToRaw(content),
    );

    const fragmentElt = document.createElement('div');
    const domSelection = window.getSelection();
    fragmentElt.appendChild(domSelection.getRangeAt(0).cloneContents());
    fragmentElt.setAttribute('data-editor-content', serialisedContent);
    // We set the style property to replicate the browser's behavior of inline
    // styles in rich text copy-paste. This is important for line breaks to be
    // interpreted correctly when pasted into another word processor.
    fragmentElt.setAttribute('style', 'white-space: pre-wrap;');

    e.clipboardData.setData('text/plain', domSelection.toString());
    const el = fragmentElt.cloneNode(true);
    Array
    .from(
      // contenteditable=false does nothing special here,
      // it's just whatever elements we want to remove have it set to false
      el.querySelectorAll('[contenteditable=false]')
    )
    .forEach(e => e.remove())
    e.clipboardData.setData('text/html', el.outerHTML);

    const fragmentKeys = fragment.keySeq().toJS()
    const startKey = selection.getStartKey()
    const endKey = selection.getEndKey()
    const selectedBlockKeys = editorState.getCurrentContent().getBlockMap().keySeq().skipUntil(item => item === startKey).takeUntil(item => item === endKey).concat([endKey]).toJS()
      var keyMap= selectedBlockKeys.reduce((acc, item, index) => {
          return {...acc, [fragmentKeys[index]]: item}
      }, {})
    const blockKeyToElementMap = fragment.keySeq().toJS().reduce((acc, item) => {
        const selector = `[data-block="true"][data-offset-key="${keyMap[item]}1-0"]`
        const element = el.querySelector(selector) || document.createElement('div');
        return {...acc, [item]: element}
    }, {})
    const outputElement = document.createElement('div');
    outputElement.setAttribute('data-editor-content', serialisedContent);
    fragmentElt.setAttribute('style', 'white-space: pre-wrap;');

    const getHasChild = (contentState, block) => {
      const blockAfter = contentState.getBlockAfter(block.getKey())
      if (!blockAfter) {
        return false
      }
      return blockAfter.getIn(['data', 'indent'], 0) > block.getIn(['data', 'indent'], 0)
    }
    const getIsLastChild = (contentState, block) => {
      const blockAfter = contentState.getBlockAfter(block.getKey())
      if (!blockAfter) {
        return false
      }
      return blockAfter.getIn(['data', 'indent'], 0) < block.getIn(['data', 'indent'], 0)
    }
    const inner = content.getBlocksAsArray().reduce((acc, item) => {
      const hasChild = getHasChild(content, item);
      const isLastChild = getIsLastChild(content, item);
      let { level, html } = acc;
      const itemElement = blockKeyToElementMap[item.getKey()];
      if (["todo", "agenda"].includes(item.getType())) {
        const checkbox = document.createElement("input")
        checkbox.setAttribute("type", "checkbox")
        if (item.getIn(['data', 'done'])) {
          checkbox.setAttribute('checked', '')
        }
        itemElement.prepend(checkbox)
      }
      let currentItemHtml = itemElement.outerHTML
      if (hasChild) {
        currentItemHtml = currentItemHtml + '<ul>'
      }
      if (level) {
        currentItemHtml = `<li>${currentItemHtml}</li>`
      }
      if (hasChild) {
        level = level + 1
      }
      if (isLastChild) {
        currentItemHtml = `${currentItemHtml}</ul>`
        level = level - 1
      }
      return {
        level,
        html: html + currentItemHtml,
      }
    }, {level: 0, html: ''})
    outputElement.innerHTML = inner.html;
    e.clipboardData.setData('text/html', outputElement.outerHTML);
    e.preventDefault();
  }
}

module.exports = editOnCopy;
