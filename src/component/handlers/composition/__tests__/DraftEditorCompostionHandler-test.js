/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @typechecks
 */

'use strict';

jest.disableAutomock();

// DraftEditorComposition uses timers to detect duplicate `compositionend` 
// events.
jest.useFakeTimers();

var EditorState = require('EditorState');
const DraftFeatureFlags = require('DraftFeatureFlags');
const originalEnableCompositionFixesValue = DraftFeatureFlags.draft_enable_composition_fixes;

describe('DraftEditorCompositionHandler', () => {
  // The DraftEditorCompositionHandler contains some global state
  // (internally used to make the code simpler given that only one
  // composition can be happening at a given time), so to avoid
  // false-positive failures stemming from test cases putting
  // the module in a bad state we forcibly reload it each test.
  let compositionHandler = null;

  beforeEach(() => {
    jest.resetModules();
    compositionHandler = require('DraftEditorCompositionHandler');
  });

  // Initialization of mock editor component that will be used for all tests
  let editor;

  beforeEach(() => {
    editor = {
      _latestEditorState: EditorState.createEmpty(),

      _onKeyDown: jest.fn(),

      restoreEditorDOM: jest.fn(),
      exitCurrentMode: jest.fn(),

      update: jest.fn(state => editor._latestEditorState = state),
    };
  });

  // newly added tests require feature flagged behaviors
  beforeEach(() => {
    DraftFeatureFlags
      .draft_enable_composition_fixes = true;
  });
  afterEach(() => {
    DraftFeatureFlags
      .draft_enable_composition_fixes = originalEnableCompositionFixesValue;
  });

  const editorTextContent = () => {
    const newState = editor._latestEditorState;
    const newContent = newState.getCurrentContent();

    return newContent.getFirstBlock().getText();
  };

  // Test cases proper

  it('Can handle compositionend', () => {
    const TEST_STRING = 'Testing';

    compositionHandler.onCompositionEnd(editor, {data: TEST_STRING});

    jest.runAllTimers();

    expect(editorTextContent()).toBe(TEST_STRING); 
  });

  it('Can handle compositionend with IME processed keycode keydown events ' +
     '(e.g. Android Chrome + GBoard)', () => {
    // See http://lists.w3.org/Archives/Public/www-dom/2010JulSep/att-0182/keyCode-spec.html
    const TEST_STRING = 'Testing';

    for (let i = 0; i < 7; i++) {
      compositionHandler.onKeyDown(editor, {which: 229});
    }
    compositionHandler.onCompositionEnd(editor, {data: TEST_STRING});

    jest.runAllTimers();

    expect(editorTextContent()).toBe(TEST_STRING); 
  });

  it('Can handle compositionend + beforeInput ' +
     '(e.g. Desktop Japanese IME)', () => {
    const TEST_STRING = '私';

    compositionHandler.onCompositionEnd(editor, {data: TEST_STRING});
    compositionHandler.onBeforeInput(editor, {data: TEST_STRING});

    jest.runAllTimers();

    expect(editorTextContent()).toBe(TEST_STRING); 
  });

  it('Can handle multiple onBeforeInput events ' +
     '(e.g. Android firefox + GBoard)', () => {
    const TEST_HALF_1 = 'test';
    const TEST_HALF_2 = 'ing';
    const TEST_STRING = TEST_HALF_1 + TEST_HALF_2;

    compositionHandler.onCompositionEnd(editor, {data: TEST_HALF_1});
    compositionHandler.onBeforeInput(editor, {data: TEST_HALF_1});
    compositionHandler.onCompositionEnd(editor, {data: TEST_HALF_2});
    compositionHandler.onBeforeInput(editor, {data: TEST_HALF_2});

    jest.runAllTimers();

    expect(editorTextContent()).toBe(TEST_STRING); 
  });

  it('Can handle onKeyDown after compositionEnd ' +
     '(e.g. Android Firefox + GBoard, autocorrect one char)', () => {
    const TEST_STRING = 'testin';
    const TEST_KEYCODE = 71; // keycode for 'G' 

    compositionHandler.onCompositionEnd(editor, {data: TEST_STRING});
    compositionHandler.onBeforeInput(editor, {data: TEST_STRING});
    compositionHandler.onKeyDown(editor, {which: TEST_KEYCODE});

    jest.runAllTimers();

    expect(editorTextContent()).toBe(TEST_STRING);

    expect(editor._onKeyDown.mock.calls[0][0].which).toBe(71);
  });

  it('Can handle multiple composition resolutions', () => {
    const TEST_HALF_1 = 'test';
    const TEST_HALF_2 = ' string';
    const TEST_STRING = TEST_HALF_1 + TEST_HALF_2;

    compositionHandler.onCompositionEnd(editor, {data: TEST_HALF_1});
    compositionHandler.onBeforeInput(editor, {data: TEST_HALF_1});

    jest.runAllTimers();

    expect(editor.exitCurrentMode).toBeCalled();
    expect(editor.update).toBeCalled();

    editor.exitCurrentMode.mockClear();
    editor.update.mockClear();

    compositionHandler.onCompositionEnd(editor, {data: TEST_HALF_2});
    compositionHandler.onBeforeInput(editor, {data: TEST_HALF_2});

    jest.runAllTimers();

    expect(editor.exitCurrentMode).toBeCalled();
    expect(editor.update).toBeCalled();

    expect(editorTextContent()).toBe(TEST_STRING); 
  });

  it('Properly handles duplicate compositionend event ' +
     '(e.g. Arabic Google Input Tools on Win 8.1)', () => {
    const TEST_STRING = '私';

    compositionHandler.onCompositionEnd(editor, {data: TEST_STRING});
    compositionHandler.onCompositionEnd(editor, {data: TEST_STRING});

    jest.runAllTimers();

    // If compositionstart occurs immediately after compositionend, we should
    // still be in compositionMode, and should not have updated
    expect(editorTextContent()).toBe(TEST_STRING);
  });

  it('Can handle compositionstart after compositionend (e.g. CJK IMEs)', () => {
    const TEST_STRING = '私';

    compositionHandler.onCompositionEnd(editor, {data: TEST_STRING});
    compositionHandler.onCompositionStart(editor, {data: null});

    jest.runAllTimers();

    // If compositionstart occurs immediately after compositionend, we should
    // still be in compositionMode, and should not have updated
    expect(editor.exitCurrentMode).not.toBeCalled();
    expect(editor.update).not.toBeCalled();
  });

  it('Can handle a delayed compositionstart after compositionend ' +
     '(e.g. CJK IMEs on Safari)', () => {
    const TEST_STRING = '私';

    compositionHandler.onCompositionEnd(editor, {data: TEST_STRING});
    setTimeout(() => {
      compositionHandler.onCompositionStart(editor, {data: null});
    }, 15);

    jest.runAllTimers();

    // If compositionstart occurs immediately after compositionend, we should
    // still be in compositionMode, and should not have updated
    expect(editor.exitCurrentMode).not.toBeCalled();
    expect(editor.update).not.toBeCalled();
  });

  it('Can handle a cancellation compositionend event', () => {
    const TEST_STRING = 'testing';

    // A cancellation compositionEnd event will have data null 
    compositionHandler.onCompositionEnd(editor, {data: null});
    
    jest.runAllTimers();

    expect(editor.exitCurrentMode).toBeCalled();
    expect(editorTextContent()).toBe('');

    // After cancellation, the next composition should resolve correctly.
    compositionHandler.onCompositionEnd(editor, {data: TEST_STRING});

    jest.runAllTimers();

    expect(editorTextContent()).toBe(TEST_STRING);
  });

  it('Can handle Korean composition', () => {
    const TEST_STRING = '하';

    compositionHandler.onCompositionUpdate(editor, {data: 'ㅎ'});
    compositionHandler.onCompositionUpdate(editor, {data: '하'});
    compositionHandler.onCompositionUpdate(editor, {data: '한'});
    compositionHandler.onCompositionUpdate(editor, {data: '하'});
    compositionHandler.onBeforeInput(editor, {data: '하'});
    compositionHandler.onCompositionEnd(editor, {data: '하'});

    jest.runAllTimers();

    expect(editorTextContent()).toBe(TEST_STRING);
  });

  it('Can handle Japanese composition', () => {
    const TEST_STRING = '日本語';
    
    compositionHandler.onCompositionUpdate(editor, {data: 'ｎ'});
    compositionHandler.onCompositionUpdate(editor, {data: 'に'});
    compositionHandler.onCompositionUpdate(editor, {data: 'にｈ'});
    compositionHandler.onCompositionUpdate(editor, {data: 'にほ'});
    compositionHandler.onCompositionUpdate(editor, {data: 'にほｎ'});
    compositionHandler.onCompositionUpdate(editor, {data: 'にほんｇ'});
    compositionHandler.onCompositionUpdate(editor, {data: 'にほんご'});
    compositionHandler.onCompositionUpdate(editor, {data: '日本語'});
    compositionHandler.onBeforeInput(editor, {data: '日本語'});
    compositionHandler.onCompositionEnd(editor, {data: '日本語'});

    jest.runAllTimers();

    expect(editorTextContent()).toBe(TEST_STRING);
  });

  it('Can handle Chinese (simplified) composition', () => {
    const TEST_STRING = '推土机';

    compositionHandler.onCompositionUpdate(editor, {data: 't'});
    compositionHandler.onCompositionUpdate(editor, {data: 't\'t'});
    compositionHandler.onCompositionUpdate(editor, {data: 't\'t\'j'});
    compositionHandler.onCompositionUpdate(editor, {data: '推土机'});
    compositionHandler.onBeforeInput(editor, {data: '推土机'});
    compositionHandler.onCompositionEnd(editor, {data: '推土机'});

    jest.runAllTimers();

    expect(editorTextContent()).toBe(TEST_STRING);
  });

  it('Can handle input case where beforeInput is never fired,' +
     'but composition update is', () => {
    const TEST_STRING = 'foo bar';
    compositionHandler.onCompositionUpdate(editor, {data: TEST_STRING});
    compositionHandler.onCompositionEnd(editor, {data: TEST_STRING});

    jest.runAllTimers();

    expect(editorTextContent()).toBe(TEST_STRING);
  });
});
