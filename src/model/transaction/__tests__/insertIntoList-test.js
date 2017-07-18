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

var Immutable = require('immutable');

var insertIntoList = require('insertIntoList');

describe('insertIntoList', () => {
  var list = Immutable.List.of(0, 1, 2, 3, 4);

  it('must insert at end of list', () => {
    var result = insertIntoList(
      list,
      Immutable.List.of(100, 101, 102),
      list.size,
    );
    expect(result.size).toBe(8);
    expect(result.toJS()).toEqual([0, 1, 2, 3, 4, 100, 101, 102]);
  });

  it('must insert at beginning of list', () => {
    var result = insertIntoList(
      list,
      Immutable.List.of(100, 101, 102),
      0,
    );
    expect(result.size).toBe(8);
    expect(result.toJS()).toEqual([100, 101, 102, 0, 1, 2, 3, 4]);
  });

  it('must insert within a list', () => {
    var result = insertIntoList(
      list,
      Immutable.List.of(100, 101, 102),
      3,
    );
    expect(result.size).toBe(8);
    expect(result.toJS()).toEqual([0, 1, 2, 100, 101, 102, 3, 4]);
  });
});
