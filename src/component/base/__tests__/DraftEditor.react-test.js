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

jest.disableAutomock().mock('generateRandomKey');

const DraftEditor = require('DraftEditor.react');
const React = require('React');
const ReactDOM = require('ReactDOM');
const EditorState = require('EditorState');
const ContentState = require('ContentState');

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

describe('focus', function() {
  let props;
  beforeEach(function() {
    props = {editorState: EditorState.createEmpty(), onChange: jest.fn()};
  });

  describe('when already focused', function() {
    beforeEach(function() {
      const selection = props.editorState.getSelection();
      props.editorState = EditorState.forceSelection(
        props.editorState,
        selection.merge({hasFocus: true}),
      );
    });

    test('must not call update', function() {
      const selection = props.editorState.getSelection();
      props.editorState = EditorState.forceSelection(
        props.editorState,
        selection.merge({hasFocus: true}),
      );
      const instance = renderEditorInContainer(props);
      instance.focus();
      expect(props.onChange.mock.calls.length).toMatchSnapshot();
    });

    test('with newEditorState must call update with newEditorState', function() {
      const selection = props.editorState.getSelection();
      const testText = 'example content text';
      const content = ContentState.createFromText(testText);
      const newEditorState = EditorState.forceSelection(
        EditorState.createWithContent(content),
        selection.merge({hasFocus: true}),
      );
      const instance = renderEditorInContainer(props);
      instance.focus(null, newEditorState);
      expect(props.onChange.mock.calls.length).toMatchSnapshot();
      const updatedEditorState = props.onChange.mock.calls[0][0];
      expect(
        updatedEditorState.getCurrentContent().getPlainText(),
      ).toMatchSnapshot();
    });
  });

  test('must call update', function() {
    const instance = renderEditorInContainer(props);
    instance.focus();
    expect(props.onChange.mock.calls.length).toMatchSnapshot();
  });
});

function renderEditorInContainer(props) {
  const container = document.createElement('div');
  let instance;
  const element = <DraftEditor ref={e => (instance = e)} {...props} />;
  ReactDOM.render(element, container);
  return instance;
}
