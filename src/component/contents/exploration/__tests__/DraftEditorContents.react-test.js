/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+ui_infra
 * @format
 */

'use strict';

jest.disableAutomock();

const ContentBlockNode = require('ContentBlockNode');
const ContentBlock = require('ContentBlock');
const ContentState = require('ContentState');
const DefaultDraftBlockRenderMap = require('DefaultDraftBlockRenderMap');
const EditorState = require('EditorState');
const React = require('React');
const ReactDOM = require('ReactDOM');
const ReactTestUtils = require('ReactTestUtils');
const SelectionState = require('SelectionState');
const DraftEditorContents = require('DraftEditorContents.react');
const Immutable = require('immutable');

const {List} = Immutable;

const selectionState = new SelectionState({
  anchorKey: 'A',
  anchorOffset: 0,
  focusKey: 'A',
  focusOffset: 0,
  isBackward: false,
  hasFocus: true,
});

const contentState = ContentState.createFromBlockArray([
  new ContentBlock({
    key: 'A',
    text: 'Alpha',
    type: 'blockquote',
  }),
  new ContentBlockNode({
    key: 'B',
    text: 'Beta',
    type: 'header-one',
  }),
  new ContentBlockNode({
    key: 'C',
    text: 'Charlie',
    type: 'ordered-list',
  }),
]);

const PROPS = {
  blockRenderMap: DefaultDraftBlockRenderMap,
  blockRendererFn: block => null,
  blockStyleFn: block => '',
  contentState,
  customStyleFn: (style, block) => null,
  editorKey: 'editor',
  editorState: EditorState.createWithContent(contentState),
  selection: selectionState,
};

const assertDraftEditorContentsRendering = props => {
  const childProps = {
    ...props,
    editorState: EditorState.createWithContent(props.contentState),
  };

  const blockNode = ReactTestUtils.renderIntoDocument(
    <DraftEditorContents {...childProps} />,
  );

  expect(ReactDOM.findDOMNode(blockNode)).toMatchSnapshot();
};

test('renders ContentBlocks', () => {
  assertDraftEditorContentsRendering(PROPS);
});

test('renders ContentBlockNodes', () => {
  const contentState = ContentState.createFromBlockArray([
    new ContentBlockNode({
      key: 'A',
      text: '',
      type: 'blockquote',
      children: List(['B']),
      nextSibling: 'D',
    }),
    new ContentBlockNode({
      parent: 'A',
      key: 'B',
      text: 'fist list item',
      type: 'ordered-list-item',
      children: List(['C']),
    }),
    new ContentBlockNode({
      parent: 'B',
      key: 'C',
      text: 'header inside list',
      type: 'header-one',
    }),
    new ContentBlockNode({
      key: 'D',
      prevSibling: 'A',
      text: 'header two',
      type: 'header-two',
    }),
  ]);

  assertDraftEditorContentsRendering({
    ...PROPS,
    contentState,
  });
});

test('renders ContentBlockNodes with root blocks that have wrapperTemplate', () => {
  const contentState = ContentState.createFromBlockArray([
    new ContentBlockNode({
      key: 'A',
      text: 'list one',
      type: 'ordered-list-item',
      nextSibling: 'B',
    }),
    new ContentBlockNode({
      key: 'B',
      text: 'list two',
      type: 'ordered-list-item',
      prevSibling: 'A',
    }),
  ]);

  assertDraftEditorContentsRendering({
    ...PROPS,
    contentState,
  });
});
