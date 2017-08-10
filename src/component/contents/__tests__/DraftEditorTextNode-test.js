/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails isaac, oncall+ui_infra
 */

'use strict';

jest.disableAutomock().mock('UserAgent')
  .mock('UserAgent');

var BLOCK_DELIMITER_CHAR = '\n';
var TEST_A = 'Hello';
var TEST_B = ' World!';

var DraftEditorTextNode = require('DraftEditorTextNode.react');
var React = require('React');
var ReactDOM = require('ReactDOM');
var UserAgent = require('UserAgent');

describe('DraftEditorTextNode', function() {
  var container;

  beforeEach(function() {
    jest.resetModules();
    container = document.createElement('div');
  });

  function renderIntoContainer(element) {
    return ReactDOM.render(element, container);
  }

  function initializeAsIE() {
    UserAgent.isBrowser.mockImplementation(() => true);
  }

  function initializeAsNonIE() {
    UserAgent.isBrowser.mockImplementation(() => false);
  }

  function expectPopulatedSpan(stub, testString) {
    var node = ReactDOM.findDOMNode(stub);
    expect(node.tagName).toBe('SPAN');
    expect(node.childNodes.length).toBe(1);
    expect(node.firstChild.textContent).toBe(testString);
  }

  it('must initialize correctly with an empty string, non-IE', function() {
    initializeAsNonIE();
    var stub = renderIntoContainer(
      <DraftEditorTextNode>{''}</DraftEditorTextNode>,
    );
    expect(ReactDOM.findDOMNode(stub).tagName).toBe('BR');
  });

  it('must initialize correctly with an empty string, IE', function() {
    initializeAsIE();
    var stub = renderIntoContainer(
      <DraftEditorTextNode>{''}</DraftEditorTextNode>,
    );
    expectPopulatedSpan(stub, BLOCK_DELIMITER_CHAR);
  });

  it('must initialize correctly with a string, non-IE', function() {
    initializeAsNonIE();
    var stub = renderIntoContainer(
      <DraftEditorTextNode>{TEST_A}</DraftEditorTextNode>,
    );
    expectPopulatedSpan(stub, TEST_A);
  });

  it('must initialize correctly with a string, IE', function() {
    initializeAsIE();
    var stub = renderIntoContainer(
      <DraftEditorTextNode>{TEST_A}</DraftEditorTextNode>,
    );
    expectPopulatedSpan(stub, TEST_A);
  });

  it('must update from empty to non-empty, non-IE', function() {
    initializeAsNonIE();
    var stub = renderIntoContainer(
      <DraftEditorTextNode>{''}</DraftEditorTextNode>,
    );

    renderIntoContainer(<DraftEditorTextNode>{TEST_A}</DraftEditorTextNode>);
    expectPopulatedSpan(stub, TEST_A);
  });

  it('must update from empty to non-empty, IE', function() {
    initializeAsIE();
    var stub = renderIntoContainer(
      <DraftEditorTextNode>{''}</DraftEditorTextNode>,
    );

    renderIntoContainer(<DraftEditorTextNode>{TEST_A}</DraftEditorTextNode>);
    expectPopulatedSpan(stub, TEST_A);
  });

  it('must update from non-empty to non-empty, non-IE', function() {
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

  it('must update from non-empty to non-empty, non-IE', function() {
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

  it('must skip updates if text already matches DOM, non-IE', function() {
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

  it('must skip updates if text already matches DOM, IE', function() {
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

  it('must update from non-empty to empty, non-IE', function() {
    initializeAsNonIE();
    var stub = renderIntoContainer(
      <DraftEditorTextNode>{TEST_A}</DraftEditorTextNode>,
    );

    renderIntoContainer(<DraftEditorTextNode>{''}</DraftEditorTextNode>);

    expect(ReactDOM.findDOMNode(stub).tagName).toBe('BR');
  });

  it('must update from non-empty to empty, IE', function() {
    initializeAsIE();
    var stub = renderIntoContainer(
      <DraftEditorTextNode>{TEST_A}</DraftEditorTextNode>,
    );

    renderIntoContainer(<DraftEditorTextNode>{''}</DraftEditorTextNode>);

    expectPopulatedSpan(stub, BLOCK_DELIMITER_CHAR);
  });

  it('must render properly into a parent DOM node', function() {
    initializeAsNonIE();
    renderIntoContainer(
      <div><DraftEditorTextNode>{TEST_A}</DraftEditorTextNode></div>,
    );
  });

  it('must force unchanged text back into the DOM', function() {
    initializeAsNonIE();
    var stub = renderIntoContainer(
      <DraftEditorTextNode>{TEST_A}</DraftEditorTextNode>,
    );

    ReactDOM.findDOMNode(stub).textContent = TEST_B;

    renderIntoContainer(<DraftEditorTextNode>{TEST_A}</DraftEditorTextNode>);

    expect(ReactDOM.findDOMNode(stub).textContent).toBe(TEST_A);
  });
});
