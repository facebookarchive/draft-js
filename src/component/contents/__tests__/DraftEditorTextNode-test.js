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
 * @flow
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
  // $FlowExpectedError node could be null
  const node: Element = ReactDOM.findDOMNode(stub);
  expect(node.tagName).toBe('SPAN');
  expect(node.childNodes.length).toBe(1);
  expect(node.firstChild && node.firstChild.textContent).toBe(testString);
};

test('must initialize correctly with an empty string', function() {
  initializeAsIE();
  const stub = renderIntoContainer(
    <DraftEditorTextNode>{''}</DraftEditorTextNode>,
  );
  expectPopulatedSpan(stub, BLOCK_DELIMITER_CHAR);
});

test('must initialize correctly with a string', function() {
  initializeAsIE();
  const stub = renderIntoContainer(
    <DraftEditorTextNode>{TEST_A}</DraftEditorTextNode>,
  );
  expectPopulatedSpan(stub, TEST_A);
});

test('must update from empty to non-empty', function() {
  initializeAsIE();
  const stub = renderIntoContainer(
    <DraftEditorTextNode>{''}</DraftEditorTextNode>,
  );

  renderIntoContainer(<DraftEditorTextNode>{TEST_A}</DraftEditorTextNode>);
  expectPopulatedSpan(stub, TEST_A);
});

test('must update from non-empty to non-empty', function() {
  initializeAsIE();
  const stub = renderIntoContainer(
    <DraftEditorTextNode>{TEST_A}</DraftEditorTextNode>,
  );

  renderIntoContainer(
    <DraftEditorTextNode>{TEST_A + TEST_B}</DraftEditorTextNode>,
  );
  expectPopulatedSpan(stub, TEST_A + TEST_B);

  renderIntoContainer(<DraftEditorTextNode>{TEST_B}</DraftEditorTextNode>);
  expectPopulatedSpan(stub, TEST_B);
});

test('must skip updates if text already matches DOM', function() {
  initializeAsIE();
  const stub = renderIntoContainer(
    <DraftEditorTextNode>{TEST_A}</DraftEditorTextNode>,
  );

  jest.spyOn(stub, 'render');

  renderIntoContainer(<DraftEditorTextNode>{TEST_A}</DraftEditorTextNode>);

  // $FlowExpectedError property render is missing in HTMLDivElement
  expect(stub.render.mock.calls.length).toBe(0);

  // Sanity check that updating is performed when appropriate.
  renderIntoContainer(<DraftEditorTextNode>{TEST_B}</DraftEditorTextNode>);

  // $FlowExpectedError property render is missing in HTMLDivElement
  expect(stub.render.mock.calls.length).toBe(1);
});

test('must update from non-empty to empty', function() {
  initializeAsIE();
  const stub = renderIntoContainer(
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
  const stub = renderIntoContainer(
    <DraftEditorTextNode>{TEST_A}</DraftEditorTextNode>,
  );

  // $FlowExpectedError we know node is not null
  ReactDOM.findDOMNode(stub).textContent = TEST_B;

  renderIntoContainer(<DraftEditorTextNode>{TEST_A}</DraftEditorTextNode>);

  // $FlowExpectedError we know node is not null
  expect(ReactDOM.findDOMNode(stub).textContent).toBe(TEST_A);
});
