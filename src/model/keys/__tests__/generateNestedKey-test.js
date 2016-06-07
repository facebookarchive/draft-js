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

const generateNestedKey = require('generateNestedKey');

describe('generateNestedKey', () => {
  const parentKey = 'foo';

  it('must generate a new nested key for a parentKey', () => {
    const newNestedKey = generateNestedKey(parentKey);
    const newNestedKeyArr = newNestedKey.split('/');

    expect(newNestedKey).not.toBe(parentKey);
    expect(newNestedKeyArr.length).toBe(2);
    expect(newNestedKeyArr[0]).toBe(parentKey);
  });

  it('must allow child key to be used to generate a a new nested key for a parentKey', () => {
    const childKey = 'bar';
    const newNestedKey = generateNestedKey(parentKey, childKey);
    const newNestedKeyArr = newNestedKey.split('/');

    expect(newNestedKey).not.toBe(parentKey);
    expect(newNestedKeyArr.length).toBe(2);
    expect(newNestedKeyArr[1]).toBe(childKey);
  });
});
