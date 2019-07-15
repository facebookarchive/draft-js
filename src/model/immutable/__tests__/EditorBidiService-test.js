/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+draft_js
 * @flow strict-local
 * @format
 */

'use strict';

jest.disableAutomock();

const ContentBlock = require('ContentBlock');
const ContentState = require('ContentState');
const EditorBidiService = require('EditorBidiService');

const Immutable = require('immutable');

const {OrderedMap, Seq} = Immutable;

const ltr = new ContentBlock({
  key: 'a',
  text: 'hello',
});
const rtl = new ContentBlock({
  key: 'b',
  text: '\u05e9\u05d1\u05ea',
});
const empty = new ContentBlock({
  key: 'c',
  text: '',
});

const getContentState = blocks => {
  const keys = Seq(blocks.map(b => b.getKey()));
  const values = Seq(blocks);
  const blockMap = OrderedMap(keys.zip(values));
  return new ContentState({blockMap});
};

test('must create a new map', () => {
  const state = getContentState([ltr]);
  const directions = EditorBidiService.getDirectionMap(state);
  expect(directions.toJS()).toMatchSnapshot();
});

test('must return the same map if no changes', () => {
  const state = getContentState([ltr]);
  const directions = EditorBidiService.getDirectionMap(state);

  const nextState = getContentState([ltr]);
  const nextDirections = EditorBidiService.getDirectionMap(
    nextState,
    directions,
  );

  expect(state !== nextState).toMatchSnapshot();
  expect(directions === nextDirections.toJS()).toMatchSnapshot();

  expect(directions.toJS()).toMatchSnapshot();
  expect(nextDirections.toJS()).toMatchSnapshot();
});

test('must return the same map if no text changes', () => {
  const state = getContentState([ltr]);
  const directions = EditorBidiService.getDirectionMap(state);

  const newLTR = new ContentBlock({
    key: 'a',
    text: 'hello',
  });
  expect(newLTR !== ltr).toMatchSnapshot();

  const nextState = getContentState([newLTR]);
  const nextDirections = EditorBidiService.getDirectionMap(
    nextState,
    directions,
  );

  expect(state !== nextState).toMatchSnapshot();
  expect(directions === nextDirections.toJS()).toMatchSnapshot();

  expect(directions.toJS()).toMatchSnapshot();
  expect(nextDirections.toJS()).toMatchSnapshot();
});

test('must return the same map if no directions change', () => {
  const state = getContentState([ltr]);
  const directions = EditorBidiService.getDirectionMap(state);

  const newLTR = new ContentBlock({
    key: 'a',
    text: 'asdf',
  });

  const nextState = getContentState([newLTR]);
  const nextDirections = EditorBidiService.getDirectionMap(
    nextState,
    directions,
  );

  expect(newLTR !== ltr).toMatchSnapshot();
  expect(state !== nextState).toMatchSnapshot();
  expect(directions === nextDirections.toJS()).toMatchSnapshot();

  expect(directions.toJS()).toMatchSnapshot();
  expect(nextDirections.toJS()).toMatchSnapshot();
});

test('must return a new map if block keys change', () => {
  const state = getContentState([ltr]);
  const directions = EditorBidiService.getDirectionMap(state);

  const newLTR = new ContentBlock({
    key: 'asdf',
    text: 'asdf',
  });

  const nextState = getContentState([newLTR]);
  const nextDirections = EditorBidiService.getDirectionMap(
    nextState,
    directions,
  );

  expect(state !== nextState).toMatchSnapshot();
  expect(directions !== nextDirections.toJS()).toMatchSnapshot();

  expect(directions.toJS()).toMatchSnapshot();
  expect(nextDirections.toJS()).toMatchSnapshot();
});

test('must return a new map if direction changes', () => {
  const state = getContentState([ltr, empty]);
  const directions = EditorBidiService.getDirectionMap(state);
  const nextState = getContentState([ltr, rtl]);
  const nextDirections = EditorBidiService.getDirectionMap(
    nextState,
    directions,
  );

  expect(state !== nextState).toMatchSnapshot();
  expect(directions !== nextDirections.toJS()).toMatchSnapshot();

  expect(directions.toJS()).toMatchSnapshot();
  expect(nextDirections.toJS()).toMatchSnapshot();
});
