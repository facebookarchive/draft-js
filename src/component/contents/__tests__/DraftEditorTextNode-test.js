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

test('must initialize correctly with an empty string, non-IE', () => {
  initializeAsNonIE();
  const stub = renderIntoContainer(
    <DraftEditorTextNode>{''}</DraftEditorTextNode>,
  );
  expect(ReactDOM.findDOMNode(stub)).toMatchSnapshot();
});

test('must initialize correctly with an empty string, IE', () => {
  initializeAsIE();
  const stub = renderIntoContainer(
    <DraftEditorTextNode>{''}</DraftEditorTextNode>,
  );
  expect(ReactDOM.findDOMNode(stub)).toMatchSnapshot();
});

test('must initialize correctly with a string, non-IE', () => {
  initializeAsNonIE();
  const stub = renderIntoContainer(
    <DraftEditorTextNode>{TEST_A}</DraftEditorTextNode>,
  );
  expect(ReactDOM.findDOMNode(stub)).toMatchSnapshot();
});

test('must initialize correctly with a string, IE', () => {
  initializeAsIE();
  const stub = renderIntoContainer(
    <DraftEditorTextNode>{TEST_A}</DraftEditorTextNode>,
  );
  expect(ReactDOM.findDOMNode(stub)).toMatchSnapshot();
});

test('must update from empty to non-empty, non-IE', () => {
  initializeAsNonIE();
  const stub = renderIntoContainer(
    <DraftEditorTextNode>{''}</DraftEditorTextNode>,
  );

  renderIntoContainer(<DraftEditorTextNode>{TEST_A}</DraftEditorTextNode>);

  expect(ReactDOM.findDOMNode(stub)).toMatchSnapshot();
});

test('must update from empty to non-empty, IE', () => {
  initializeAsIE();
  const stub = renderIntoContainer(
    <DraftEditorTextNode>{''}</DraftEditorTextNode>,
  );

  renderIntoContainer(<DraftEditorTextNode>{TEST_A}</DraftEditorTextNode>);

  expect(ReactDOM.findDOMNode(stub)).toMatchSnapshot();
});

test('must update from non-empty to non-empty, non-IE', () => {
  initializeAsIE();
  const stub = renderIntoContainer(
    <DraftEditorTextNode>{TEST_A}</DraftEditorTextNode>,
  );

  renderIntoContainer(
    <DraftEditorTextNode>{TEST_A + TEST_B}</DraftEditorTextNode>,
  );

  expect(ReactDOM.findDOMNode(stub)).toMatchSnapshot();

  renderIntoContainer(<DraftEditorTextNode>{TEST_B}</DraftEditorTextNode>);

  expect(ReactDOM.findDOMNode(stub)).toMatchSnapshot();
});

test('must skip updates if text already matches DOM, non-IE', () => {
  initializeAsNonIE();
  const stub = renderIntoContainer(
    <DraftEditorTextNode>{TEST_A}</DraftEditorTextNode>,
  );

  spyOn(stub, 'render').and.callThrough();

  renderIntoContainer(<DraftEditorTextNode>{TEST_A}</DraftEditorTextNode>);

  expect(stub.render.calls.count()).toMatchSnapshot();

  // Sanity check that updating is performed when appropriate.
  renderIntoContainer(<DraftEditorTextNode>{TEST_B}</DraftEditorTextNode>);

  expect(stub.render.calls.count()).toMatchSnapshot();
});

test('must skip updates if text already matches DOM, IE', () => {
  initializeAsIE();
  const stub = renderIntoContainer(
    <DraftEditorTextNode>{TEST_A}</DraftEditorTextNode>,
  );

  spyOn(stub, 'render').and.callThrough();

  renderIntoContainer(<DraftEditorTextNode>{TEST_A}</DraftEditorTextNode>);

  expect(stub.render.calls.count()).toMatchSnapshot();

  // Sanity check that updating is performed when appropriate.
  renderIntoContainer(<DraftEditorTextNode>{TEST_B}</DraftEditorTextNode>);

  expect(stub.render.calls.count()).toMatchSnapshot();
});

test('must update from non-empty to empty, non-IE', () => {
  initializeAsNonIE();
  const stub = renderIntoContainer(
    <DraftEditorTextNode>{TEST_A}</DraftEditorTextNode>,
  );

  renderIntoContainer(<DraftEditorTextNode>{''}</DraftEditorTextNode>);

  expect(ReactDOM.findDOMNode(stub)).toMatchSnapshot();
});

test('must update from non-empty to empty, IE', () => {
  initializeAsIE();
  const stub = renderIntoContainer(
    <DraftEditorTextNode>{TEST_A}</DraftEditorTextNode>,
  );

  renderIntoContainer(<DraftEditorTextNode>{''}</DraftEditorTextNode>);

  expect(ReactDOM.findDOMNode(stub)).toMatchSnapshot();
});

test('must render properly into a parent DOM node', () => {
  initializeAsNonIE();

  const stub = renderIntoContainer(
    <div>
      <DraftEditorTextNode>{TEST_A}</DraftEditorTextNode>
    </div>,
  );

  expect(ReactDOM.findDOMNode(stub)).toMatchSnapshot();
});

test('must force unchanged text back into the DOM', () => {
  initializeAsNonIE();
  const stub = renderIntoContainer(
    <DraftEditorTextNode>{TEST_A}</DraftEditorTextNode>,
  );

  ReactDOM.findDOMNode(stub).textContent = TEST_B;

  renderIntoContainer(<DraftEditorTextNode>{TEST_A}</DraftEditorTextNode>);

  expect(ReactDOM.findDOMNode(stub)).toMatchSnapshot();
});
