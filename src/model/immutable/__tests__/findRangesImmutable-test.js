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

var findRangesImmutable = require('findRangesImmutable');

describe('findRangesImmutable', () => {
  var returnTrue = () => true;

  it('must be a no-op for an empty list', () => {
    var cb = jest.fn();
    findRangesImmutable(
      Immutable.List(),
      returnTrue,
      returnTrue,
      cb,
    );
    expect(cb.mock.calls.length).toBe(0);
  });

  describe('Function usage', () => {
    var list = Immutable.List.of(1, 1, 1, 1, 1);

    it('must identify the full list as a single range', () => {
      var cb = jest.fn();
      findRangesImmutable(list, returnTrue, returnTrue, cb);
      var calls = cb.mock.calls;
      expect(calls.length).toBe(1);
      expect(calls[0]).toEqual([0, 5]);
    });

    it('must properly use `areEqualFn`', () => {
      var cb = jest.fn();
      var areEqual = () => false;
      findRangesImmutable(
        list,
        areEqual, // never equal
        returnTrue,
        cb,
      );
      var calls = cb.mock.calls;
      expect(calls.length).toBe(5);
      expect(calls[0]).toEqual([0, 1]);
      expect(calls[1]).toEqual([1, 2]);
      expect(calls[2]).toEqual([2, 3]);
      expect(calls[3]).toEqual([3, 4]);
      expect(calls[4]).toEqual([4, 5]);
    });

    it('must properly use `filterFn`', () => {
      var cb = jest.fn();
      findRangesImmutable(
        list,
        returnTrue,
        () => false, // never an accepted filter result
        cb,
      );
      var calls = cb.mock.calls;
      expect(calls.length).toBe(0);
    });
  });

  describe('Range finding for multi-value list', () => {
    var list = Immutable.List.of(0, 0, 1, 1, 0, 0, 2, 2);

    it('must identify each range', () => {
      var cb = jest.fn();
      findRangesImmutable(
        list,
        (a, b) => a === b,
        returnTrue,
        cb,
      );
      var calls = cb.mock.calls;
      expect(calls.length).toBe(4);
      expect(calls[0]).toEqual([0, 2]);
      expect(calls[1]).toEqual([2, 4]);
      expect(calls[2]).toEqual([4, 6]);
      expect(calls[3]).toEqual([6, 8]);
    });
  });
});
