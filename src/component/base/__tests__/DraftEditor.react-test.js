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

jest.mock('generateRandomKey');

const DraftEditor = require('DraftEditor.react');
const React = require('React');

const ReactShallowRenderer = require('react-test-renderer/shallow');

let shallow;

beforeEach(() => {
  shallow = new ReactShallowRenderer();
});

test('must has generated editorKey', () => {
  shallow.render(<DraftEditor />);

  // internally at Facebook we use a newer version of the shallowRenderer
  // which has a different level of wrapping of the '_instance'
  // long term we should rewrite this test to not depend on private
  // properties
  const getEditorKey =
    shallow._instance.getEditorKey || shallow._instance._instance.getEditorKey;
  expect(getEditorKey()).toMatchSnapshot();
});

test('must has editorKey same as props', () => {
  shallow.render(<DraftEditor editorKey="hash" />);

  // internally at Facebook we use a newer version of the shallowRenderer
  // which has a different level of wrapping of the '_instance'
  // long term we should rewrite this test to not depend on private
  // properties
  const getEditorKey =
    shallow._instance.getEditorKey || shallow._instance._instance.getEditorKey;
  expect(getEditorKey()).toMatchSnapshot();
});
