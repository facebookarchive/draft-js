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

jest.mock('generateRandomKey');

const DraftEditor = require('DraftEditor.react');
const EditorState = require('EditorState');
const React = require('React');

// $FlowFixMe[cannot-resolve-module]
const ReactShallowRenderer = require('react-test-renderer/shallow');

let shallow;
let editorState;

beforeEach(() => {
  shallow = new ReactShallowRenderer();
  editorState = EditorState.createEmpty();
});

test('must has generated editorKey', () => {
  shallow.render(<DraftEditor editorState={editorState} onChange={() => {}} />);

  // internally at Facebook we use a newer version of the shallowRenderer
  // which has a different level of wrapping of the '_instance'
  // long term we should rewrite this test to not depend on private
  // properties
  const getEditorKey =
    shallow._instance.getEditorKey || shallow._instance._instance.getEditorKey;
  expect(getEditorKey()).toMatchSnapshot();
});

test('must has editorKey same as props', () => {
  shallow.render(
    <DraftEditor
      editorState={editorState}
      onChange={() => {}}
      editorKey="hash"
    />,
  );

  // internally at Facebook we use a newer version of the shallowRenderer
  // which has a different level of wrapping of the '_instance'
  // long term we should rewrite this test to not depend on private
  // properties
  const getEditorKey =
    shallow._instance.getEditorKey || shallow._instance._instance.getEditorKey;
  expect(getEditorKey()).toMatchSnapshot();
});

describe('ariaDescribedBy', () => {
  function getProps(elem) {
    const r = shallow.render(elem);
    const ec = r.props.children[1].props.children;
    return ec.props;
  }

  describe('without placeholder', () => {
    test('undefined by default', () => {
      const props = getProps(
        <DraftEditor editorState={editorState} onChange={() => {}} />,
      );
      expect(props).toHaveProperty('aria-describedby', undefined);
    });

    test('can be set to something arbitrary', () => {
      const props = getProps(
        <DraftEditor
          editorState={editorState}
          onChange={() => {}}
          ariaDescribedBy="abc"
        />,
      );
      expect(props).toHaveProperty('aria-describedby', 'abc');
    });

    test('can use special token', () => {
      const props = getProps(
        <DraftEditor
          editorState={editorState}
          onChange={() => {}}
          ariaDescribedBy="abc {{editor_id_placeholder}} xyz"
        />,
      );
      expect(props).toHaveProperty('aria-describedby', 'abc  xyz');
    });
  });

  describe('with placeholder', () => {
    test('has placeholder id by default', () => {
      const props = getProps(
        <DraftEditor
          editorState={editorState}
          onChange={() => {}}
          editorKey="X"
          placeholder="place"
        />,
      );
      expect(props).toHaveProperty('aria-describedby', 'placeholder-X');
    });

    test('can be set to something arbitrary', () => {
      const props = getProps(
        <DraftEditor
          editorState={editorState}
          onChange={() => {}}
          editorKey="X"
          placeholder="place"
          ariaDescribedBy="abc"
        />,
      );
      expect(props).toHaveProperty('aria-describedby', 'abc');
    });

    test('can use special token', () => {
      const props = getProps(
        <DraftEditor
          editorState={editorState}
          onChange={() => {}}
          editorKey="X"
          placeholder="place"
          ariaDescribedBy="abc {{editor_id_placeholder}} xyz"
        />,
      );
      expect(props).toHaveProperty('aria-describedby', 'abc placeholder-X xyz');
    });
  });
});
