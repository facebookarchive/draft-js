/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+draft_js
 * @flow
 * @format
 */

'use strict';

jest.disableAutomock();

jest.mock('ReactDOM');

const getContentEditableContainer = require('getContentEditableContainer');

test('fails if no Node is found for the editorContainer', () => {
  require('ReactDOM').findDOMNode.mockImplementation(() => null);
  // $FlowExpectedError
  expect(() => getContentEditableContainer({})).toThrow('Missing editorNode');
});

test('fails if the firstChild of editorConainer is not an HTMLElement', () => {
  const editor = {editorContainer: {}};
  const editableContainer = document.createTextNode('text');
  const editorContainerNode = {firstChild: editableContainer};
  require('ReactDOM').findDOMNode.mockImplementation(() => editorContainerNode);
  // $FlowExpectedError
  expect(() => getContentEditableContainer(editor)).toThrow(
    'editorNode.firstChild is not an HTMLElement',
  );
});

test(`returns the firstChild of editor.editorContainer's DOM node`, () => {
  const editor = {editorContainer: {}};
  const editableContainer = document.createElement('div');
  const editorContainerNode = {firstChild: editableContainer};
  require('ReactDOM').findDOMNode.mockImplementation(() => editorContainerNode);

  // $FlowExpectedError
  expect(getContentEditableContainer(editor)).toBe(editableContainer);
  expect(require('ReactDOM').findDOMNode).toHaveBeenCalledWith(
    editor.editorContainer,
  );
});
