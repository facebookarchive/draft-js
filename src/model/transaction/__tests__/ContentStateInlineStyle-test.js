/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+draft_js
 * @flow strict-local
 * @format
 */

'use strict';

jest.disableAutomock();

const ContentStateInlineStyle = require('ContentStateInlineStyle');

const getSampleStateForTesting = require('getSampleStateForTesting');

const {contentState, selectionState} = getSampleStateForTesting();

const initialSelection = selectionState.set(
  'focusOffset',
  contentState.getBlockForKey(selectionState.getStartKey()).getLength(),
);

const assertAddContentStateInlineStyle = (
  inlineStyle,
  selection = selectionState,
  content = contentState,
) => {
  const newContentState = ContentStateInlineStyle.add(
    content,
    selection,
    inlineStyle,
  );

  expect(newContentState.getBlockMap().toJS()).toMatchSnapshot();

  return newContentState;
};

const assertRemoveContentStateInlineStyle = (
  inlineStyle,
  selection = selectionState,
  content = contentState,
) => {
  const newContentState = ContentStateInlineStyle.remove(
    content,
    selection,
    inlineStyle,
  );

  expect(newContentState.getBlockMap().toJS()).toMatchSnapshot();

  return newContentState;
};

test('must add styles', () => {
  const modified = assertAddContentStateInlineStyle('BOLD', initialSelection);

  assertAddContentStateInlineStyle(
    'ITALIC',
    selectionState.set('focusOffset', 2),
    modified,
  );
});

test('must remove styles', () => {
  // Go ahead and add some styles that we'll then remove.
  let modified = assertAddContentStateInlineStyle('BOLD', initialSelection);
  modified = assertAddContentStateInlineStyle(
    'ITALIC',
    initialSelection,
    modified,
  );

  // we then remove the added styles
  modified = assertRemoveContentStateInlineStyle(
    'BOLD',
    initialSelection,
    modified,
  );
  assertRemoveContentStateInlineStyle(
    'ITALIC',
    initialSelection.set('focusOffset', 2),
    modified,
  );
});

test('must add and remove styles accross multiple blocks', () => {
  const nextBlock = contentState.getBlockAfter(selectionState.getStartKey());
  const selection = selectionState.merge({
    focusKey: nextBlock.getKey(),
    focusOffset: nextBlock.getLength(),
  });

  const modified = assertAddContentStateInlineStyle('BOLD', selection);
  assertRemoveContentStateInlineStyle('BOLD', selection, modified);
});
