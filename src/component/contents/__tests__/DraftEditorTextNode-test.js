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

jest.disableAutomock().mock('UserAgent');

const BLOCK_DELIMITER_CHAR = '\n';
const TEST_A = 'Hello';
const TEST_B = ' World!';

const DraftEditorTextNode = require('DraftEditorTextNode.react');
const React = require('React');
const ReactDOM = require('ReactDOM');
const UserAgent = require('UserAgent');

let container;

beforeEach(() => {
  jest.resetModules();
  container = document.createElement('div');
});

const renderIntoContainer = element => {
  return ReactDOM.render(element, container);
};

const initializeAsIE = () => {
  UserAgent.isBrowser.mockImplementation(() => true);
};

const initializeAsNonIE = () => {
  UserAgent.isBrowser.mockImplementation(() => false);
};

const expectPopulatedSpan = (stub, testString) => {
  const node = ReactDOM.findDOMNode(stub);
  expect(node.tagName).toBe('SPAN');
  expect(node.childNodes.length).toBe(1);
  expect(node.firstChild.textContent).toBe(testString);
};

test('must initialize correctly with an empty string, non-IE', function() {
  initializeAsNonIE();
  var stub = renderIntoContainer(
    <DraftEditorTextNode>{''}</DraftEditorTextNode>,
  );
  expect(ReactDOM.findDOMNode(stub).tagName).toBe('BR');
});

test('must initialize correctly with an empty string, IE', function() {
  initializeAsIE();
  var stub = renderIntoContainer(
    <DraftEditorTextNode>{''}</DraftEditorTextNode>,
  );
  expectPopulatedSpan(stub, BLOCK_DELIMITER_CHAR);
});

test('must initialize correctly with a string, non-IE', function() {
  initializeAsNonIE();
  var stub = renderIntoContainer(
    <DraftEditorTextNode>{TEST_A}</DraftEditorTextNode>,
  );
  expectPopulatedSpan(stub, TEST_A);
});

test('must initialize correctly with a string, IE', function() {
  initializeAsIE();
  var stub = renderIntoContainer(
    <DraftEditorTextNode>{TEST_A}</DraftEditorTextNode>,
  );
  expectPopulatedSpan(stub, TEST_A);
});

test('must update from empty to non-empty, non-IE', function() {
  initializeAsNonIE();
  var stub = renderIntoContainer(
    <DraftEditorTextNode>{''}</DraftEditorTextNode>,
  );

  renderIntoContainer(<DraftEditorTextNode>{TEST_A}</DraftEditorTextNode>);
  expectPopulatedSpan(stub, TEST_A);
});

test('must update from empty to non-empty, IE', function() {
  initializeAsIE();
  var stub = renderIntoContainer(
    <DraftEditorTextNode>{''}</DraftEditorTextNode>,
  );

  renderIntoContainer(<DraftEditorTextNode>{TEST_A}</DraftEditorTextNode>);
  expectPopulatedSpan(stub, TEST_A);
});

test('must update from non-empty to non-empty, non-IE', function() {
  initializeAsNonIE();
  var stub = renderIntoContainer(
    <DraftEditorTextNode>{TEST_A}</DraftEditorTextNode>,
  );

  renderIntoContainer(
    <DraftEditorTextNode>{TEST_A + TEST_B}</DraftEditorTextNode>,
  );

  expectPopulatedSpan(stub, TEST_A + TEST_B);

  renderIntoContainer(<DraftEditorTextNode>{TEST_B}</DraftEditorTextNode>);
  expectPopulatedSpan(stub, TEST_B);
});

test('must update from non-empty to non-empty, non-IE', function() {
  initializeAsIE();
  var stub = renderIntoContainer(
    <DraftEditorTextNode>{TEST_A}</DraftEditorTextNode>,
  );

  renderIntoContainer(
    <DraftEditorTextNode>{TEST_A + TEST_B}</DraftEditorTextNode>,
  );
  expectPopulatedSpan(stub, TEST_A + TEST_B);

  renderIntoContainer(<DraftEditorTextNode>{TEST_B}</DraftEditorTextNode>);
  expectPopulatedSpan(stub, TEST_B);
});

test('must skip updates if text already matches DOM, non-IE', function() {
  initializeAsNonIE();
  var stub = renderIntoContainer(
    <DraftEditorTextNode>{TEST_A}</DraftEditorTextNode>,
  );

  spyOn(stub, 'render').and.callThrough();

  renderIntoContainer(<DraftEditorTextNode>{TEST_A}</DraftEditorTextNode>);

  expect(stub.render.calls.count()).toBe(0);

  // Sanity check that updating is performed when appropriate.
  renderIntoContainer(<DraftEditorTextNode>{TEST_B}</DraftEditorTextNode>);

  expect(stub.render.calls.count()).toBe(1);
});

test('must skip updates if text already matches DOM, IE', function() {
  initializeAsIE();
  var stub = renderIntoContainer(
    <DraftEditorTextNode>{TEST_A}</DraftEditorTextNode>,
  );

  spyOn(stub, 'render').and.callThrough();

  renderIntoContainer(<DraftEditorTextNode>{TEST_A}</DraftEditorTextNode>);

  expect(stub.render.calls.count()).toBe(0);

  // Sanity check that updating is performed when appropriate.
  renderIntoContainer(<DraftEditorTextNode>{TEST_B}</DraftEditorTextNode>);

  expect(stub.render.calls.count()).toBe(1);
});

test('must update from non-empty to empty, non-IE', function() {
  initializeAsNonIE();
  var stub = renderIntoContainer(
    <DraftEditorTextNode>{TEST_A}</DraftEditorTextNode>,
  );

  renderIntoContainer(<DraftEditorTextNode>{''}</DraftEditorTextNode>);

  expect(ReactDOM.findDOMNode(stub).tagName).toBe('BR');
});

test('must update from non-empty to empty, IE', function() {
  initializeAsIE();
  var stub = renderIntoContainer(
    <DraftEditorTextNode>{TEST_A}</DraftEditorTextNode>,
  );

  renderIntoContainer(<DraftEditorTextNode>{''}</DraftEditorTextNode>);

  expectPopulatedSpan(stub, BLOCK_DELIMITER_CHAR);
});

test('must render properly into a parent DOM node', function() {
  initializeAsNonIE();
  renderIntoContainer(
    <div>
      <DraftEditorTextNode>{TEST_A}</DraftEditorTextNode>
    </div>,
  );
});

test('must force unchanged text back into the DOM', function() {
  initializeAsNonIE();
  var stub = renderIntoContainer(
    <DraftEditorTextNode>{TEST_A}</DraftEditorTextNode>,
  );

  ReactDOM.findDOMNode(stub).textContent = TEST_B;

  renderIntoContainer(<DraftEditorTextNode>{TEST_A}</DraftEditorTextNode>);

  expect(ReactDOM.findDOMNode(stub).textContent).toBe(TEST_A);
});
