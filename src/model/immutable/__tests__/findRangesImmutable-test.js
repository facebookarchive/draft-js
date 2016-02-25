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

jest.autoMockOff();

const Immutable = require('immutable');
const findRangesImmutable = require('findRangesImmutable');

describe('findRangesImmutable', () => {
  const returnTrue = () => true;

  it('must be a no-op for an empty list', () => {
    const cb = jest.genMockFn();
    findRangesImmutable(
      Immutable.List(),
      returnTrue,
      returnTrue,
      cb
    );
    expect(cb.mock.calls.length).toBe(0);
  });

  describe('Function usage', () => {
    const list = Immutable.List.of(1, 1, 1, 1, 1);

    it('must identify the full list as a single range', () => {
      const cb = jest.genMockFn();
      findRangesImmutable(list, returnTrue, returnTrue, cb);
      const calls = cb.mock.calls;
      expect(calls.length).toBe(1);
      expect(calls[0]).toEqual([0, 5]);
    });

    it('must properly use `areEqualFn`', () => {
      const cb = jest.genMockFn();
      const areEqual = () => false;
      findRangesImmutable(
        list,
        areEqual, // never equal
        returnTrue,
        cb
      );
      const calls = cb.mock.calls;
      expect(calls.length).toBe(5);
      expect(calls[0]).toEqual([0, 1]);
      expect(calls[1]).toEqual([1, 2]);
      expect(calls[2]).toEqual([2, 3]);
      expect(calls[3]).toEqual([3, 4]);
      expect(calls[4]).toEqual([4, 5]);
    });

    it('must properly use `filterFn`', () => {
      const cb = jest.genMockFn();
      findRangesImmutable(
        list,
        returnTrue,
        () => false, // never an accepted filter result
        cb
      );
      const calls = cb.mock.calls;
      expect(calls.length).toBe(0);
    });
  });

  describe('Range finding for multi-value list', () => {
    const list = Immutable.List.of(0, 0, 1, 1, 0, 0, 2, 2);

    it('must identify each range', () => {
      const cb = jest.genMockFn();
      findRangesImmutable(
        list,
        (a, b) => a === b,
        returnTrue,
        cb
      );
      const calls = cb.mock.calls;
      expect(calls.length).toBe(4);
      expect(calls[0]).toEqual([0, 2]);
      expect(calls[1]).toEqual([2, 4]);
      expect(calls[2]).toEqual([4, 6]);
      expect(calls[3]).toEqual([6, 8]);
    });
  });
});
