/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+ui_infra
 */

'use strict';

jest.disableAutomock();

var ContentBlock = require('ContentBlock');
var ContentState = require('ContentState');
var EditorBidiService = require('EditorBidiService');
var Immutable = require('immutable');
var UnicodeBidiDirection = require('UnicodeBidiDirection');

var {
  OrderedMap,
  Seq,
} = Immutable;

var {
  LTR,
  RTL,
} = UnicodeBidiDirection;

var ltr = new ContentBlock({
  key: 'a',
  text: 'hello',
});
var rtl = new ContentBlock({
  key: 'b',
  text: '\u05e9\u05d1\u05ea',
});
var empty = new ContentBlock({
  key: 'c',
  text: '',
});

describe('EditorBidiService', () => {
  function getContentState(blocks) {
    var keys = Seq(blocks.map(b => b.getKey()));
    var values = Seq(blocks);
    var blockMap = OrderedMap(keys.zip(values));
    return new ContentState({blockMap});
  }

  it('must create a new map', () => {
    var state = getContentState([ltr]);
    var directions = EditorBidiService.getDirectionMap(state);
    expect(
      directions.keySeq().toArray(),
    ).toEqual(
      ['a'],
    );
    expect(
      directions.valueSeq().toArray(),
    ).toEqual(
      [LTR],
    );
  });

  it('must return the same map if no changes', () => {
    var state = getContentState([ltr]);
    var directions = EditorBidiService.getDirectionMap(state);

    var nextState = getContentState([ltr]);
    var nextDirections = EditorBidiService.getDirectionMap(
      nextState,
      directions,
    );

    expect(state).not.toBe(nextState);
    expect(directions).toBe(nextDirections);
  });

  it('must return the same map if no text changes', () => {
    var state = getContentState([ltr]);
    var directions = EditorBidiService.getDirectionMap(state);

    var newLTR = new ContentBlock({
      key: 'a',
      text: 'hello',
    });
    expect(newLTR).not.toBe(ltr);

    var nextState = getContentState([newLTR]);
    var nextDirections = EditorBidiService.getDirectionMap(
      nextState,
      directions,
    );

    expect(state).not.toBe(nextState);
    expect(directions).toBe(nextDirections);
  });

  it('must return the same map if no directions change', () => {
    var state = getContentState([ltr]);
    var directions = EditorBidiService.getDirectionMap(state);

    var newLTR = new ContentBlock({
      key: 'a',
      text: 'asdf',
    });
    expect(newLTR).not.toBe(ltr);

    var nextState = getContentState([newLTR]);
    var nextDirections = EditorBidiService.getDirectionMap(
      nextState,
      directions,
    );

    expect(state).not.toBe(nextState);
    expect(directions).toBe(nextDirections);
  });

  it('must return a new map if block keys change', () => {
    var state = getContentState([ltr]);
    var directions = EditorBidiService.getDirectionMap(state);

    var newLTR = new ContentBlock({
      key: 'asdf',
      text: 'asdf',
    });

    var nextState = getContentState([newLTR]);
    var nextDirections = EditorBidiService.getDirectionMap(
      nextState,
      directions,
    );

    expect(state).not.toBe(nextState);
    expect(directions).not.toBe(nextDirections);

    expect(
      nextDirections.keySeq().toArray(),
    ).toEqual(
      ['asdf'],
    );
    expect(
      nextDirections.valueSeq().toArray(),
    ).toEqual(
      [LTR],
    );
  });

  it('must return a new map if direction changes', () => {
    var state = getContentState([ltr, empty]);
    var directions = EditorBidiService.getDirectionMap(state);

    expect(
      directions.valueSeq().toArray(),
    ).toEqual(
      [LTR, LTR],
    );

    var nextState = getContentState([ltr, rtl]);
    var nextDirections = EditorBidiService.getDirectionMap(
      nextState,
      directions,
    );

    expect(state).not.toBe(nextState);
    expect(directions).not.toBe(nextDirections);
    expect(
      nextDirections.valueSeq().toArray(),
    ).toEqual(
      [LTR, RTL],
    );
  });
});
