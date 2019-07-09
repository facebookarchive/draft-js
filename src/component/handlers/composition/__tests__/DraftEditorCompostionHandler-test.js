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

// DraftEditorComposition uses timers to detect duplicate `compositionend`
// events.
jest.useFakeTimers();

const ContentBlock = require('ContentBlock');
const ContentState = require('ContentState');
const EditorState = require('EditorState');
const SelectionState = require('SelectionState');

const convertFromHTMLToContentBlocks = require('convertFromHTMLToContentBlocks');
const editOnCompositionStart = require('editOnCompositionStart');
const {Map} = require('immutable');

jest.mock('DOMObserver', () => {
  function DOMObserver() {}
  DOMObserver.prototype.start = jest.fn();
  DOMObserver.prototype.stopAndFlushMutations = jest
    .fn()
    .mockReturnValue(Map({}));
  return DOMObserver;
});
jest.mock('getContentEditableContainer');
jest.mock('getDraftEditorSelection', () => {
  return jest.fn().mockReturnValue({
    selectionState: SelectionState.createEmpty('anchor-key'),
  });
});

// The DraftEditorCompositionHandler contains some global state
// (internally used to make the code simpler given that only one
// composition can be happening at a given time), so to avoid
// false-positive failures stemming from test cases putting
// the module in a bad state we forcibly reload it each test.
let compositionHandler = null;
// Initialization of mock editor component that will be used for all tests
let editor;

function getEditorState(blocks) {
  const contentBlocks = Object.keys(blocks).map(blockKey => {
    return new ContentBlock({
      key: blockKey,
      text: blocks[String(blockKey)],
    });
  });
  return EditorState.createWithContent(
    ContentState.createFromBlockArray(contentBlocks),
  );
}

function getEditorStateFromHTML(html: string) {
  const blocksFromHTML = convertFromHTMLToContentBlocks(html);
  const state =
    blocksFromHTML != null
      ? ContentState.createFromBlockArray(
          blocksFromHTML.contentBlocks ?? [],
          blocksFromHTML.entityMap,
        )
      : ContentState.createEmpty();
  return EditorState.createWithContent(state);
}

function editorTextContent() {
  return editor._latestEditorState.getCurrentContent().getPlainText();
}

function withGlobalGetSelectionAs(getSelectionValue, callback) {
  const oldGetSelection = global.getSelection;
  try {
    global.getSelection = () => getSelectionValue;
    callback();
  } finally {
    global.getSelection = oldGetSelection;
  }
}

beforeEach(() => {
  jest.resetModules();
  compositionHandler = require('DraftEditorCompositionHandler');
  editor = {
    _latestEditorState: EditorState.createEmpty(),
    _onCompositionStart: compositionHandler.onCompositionStart,
    _onKeyDown: jest.fn(),
    setMode: jest.fn(),
    restoreEditorDOM: jest.fn(),
    exitCurrentMode: jest.fn(),
    update: jest.fn(state => (editor._latestEditorState = state)),
  };
});

test('isInCompositionMode is properly updated on composition events', () => {
  // `inCompositionMode` is updated inside editOnCompositionStart,
  // which is why we can't just call compositionHandler.onCompositionStart.
  // $FlowExpectedError
  editOnCompositionStart(editor, {});
  expect(editor.setMode).toHaveBeenLastCalledWith('composite');
  expect(editor._latestEditorState.isInCompositionMode()).toBe(true);
  // $FlowExpectedError
  compositionHandler.onCompositionEnd(editor);
  jest.runAllTimers();
  expect(editor._latestEditorState.isInCompositionMode()).toBe(false);
  expect(editor.exitCurrentMode).toHaveBeenCalled();
});

test('Can handle a single mutation', () => {
  withGlobalGetSelectionAs({}, () => {
    editor._latestEditorState = getEditorState({blockkey0: ''});
    const mutations = Map({'blockkey0-0-0': '\u79c1'});
    require('DOMObserver').prototype.stopAndFlushMutations.mockReturnValue(
      mutations,
    );
    // $FlowExpectedError
    compositionHandler.onCompositionStart(editor);
    // $FlowExpectedError
    compositionHandler.onCompositionEnd(editor);
    jest.runAllTimers();

    expect(editorTextContent()).toBe('\u79c1');
  });
});

test('Can handle mutations in multiple blocks', () => {
  withGlobalGetSelectionAs({}, () => {
    editor._latestEditorState = getEditorState({
      blockkey0: 'react',
      blockkey1: 'draft',
    });
    const mutations = Map({
      'blockkey0-0-0': 'reactjs',
      'blockkey1-0-0': 'draftjs',
    });
    require('DOMObserver').prototype.stopAndFlushMutations.mockReturnValue(
      mutations,
    );
    // $FlowExpectedError
    compositionHandler.onCompositionStart(editor);
    // $FlowExpectedError
    compositionHandler.onCompositionEnd(editor);
    jest.runAllTimers();

    expect(editorTextContent()).toBe('reactjs\ndraftjs');
  });
});

test('Can handle mutations in the same block in multiple leaf nodes', () => {
  withGlobalGetSelectionAs({}, () => {
    const editorState = (editor._latestEditorState = getEditorStateFromHTML(
      '<div>react <b>draft</b> graphql</div>',
    ));
    const blockKey = editorState
      .getCurrentContent()
      .getBlockMap()
      .first()
      .getKey();
    const mutations = Map({
      [`${blockKey}-0-0`]: 'reacta ',
      [`${blockKey}-0-1`]: 'draftbb',
      [`${blockKey}-0-2`]: ' graphqlccc',
    });
    require('DOMObserver').prototype.stopAndFlushMutations.mockReturnValue(
      mutations,
    );
    // $FlowExpectedError
    compositionHandler.onCompositionStart(editor);
    // $FlowExpectedError
    compositionHandler.onCompositionEnd(editor);
    jest.runAllTimers();

    expect(editorTextContent()).toBe('reacta draftbb graphqlccc');
  });
});
