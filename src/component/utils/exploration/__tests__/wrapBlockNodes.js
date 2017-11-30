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

const React = require('react');
const EditorState = require('EditorState');
const ContentState = require('ContentState');
const ContentBlockNode = require('ContentBlockNode');
const DraftEditorBlockNode = require('DraftEditorBlockNode.react');
const wrapBlockNodes = require('wrapBlockNodes');

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


test('renders ContentBlockNodes with root blocks that have wrapperTemplate', () => {
  const content = ContentState.createFromBlockArray([
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

  const nodes = content.getBlocksAsArray().map(block => ({
    wrapperTemplate: 'div',
    block,
    element: <DraftEditorBlockNode {...block.toJS()} />,
  }));

  // console.log(wrapBlockNodes(nodes, content));

  // assertDraftEditorContentsRendering({
  //   ...PROPS,
  //   contentState,
  // });
});
