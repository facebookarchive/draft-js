/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+draft_js
 * @format
 */

'use strict';

jest.disableAutomock();

const ContentBlockNode = require('ContentBlockNode');
const ContentState = require('ContentState');
const DefaultDraftBlockRenderMap = require('DefaultDraftBlockRenderMap');
const DraftEditorContents = require('DraftEditorContentsExperimental.react');
const EditorState = require('EditorState');
const React = require('React');
const SelectionState = require('SelectionState');

const TestHelper = require('_DraftTestHelper');
const Immutable = require('immutable');
const ReactTestRenderer = require('react-test-renderer');

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
  new ContentBlockNode({
    key: 'A',
    text: 'Alpha',
    type: 'blockquote',
    children: List(),
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

  const blockNode = ReactTestRenderer.create(
    <DraftEditorContents {...childProps} />,
  );

  expect(
    TestHelper.transformSnapshotProps(blockNode.toJSON()),
  ).toMatchSnapshot();
};

test('renders ContentBlockNode', () => {
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
