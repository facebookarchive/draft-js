/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails isaac, oncall+ui_infra
 * @typechecks
 */

jest.dontMock('generateKey');

var generateKey = require('generateKey');

describe('generateKey', () => {
  it('increments lastKey each time it is called, and returns padded output', () => {
    expect(generateKey()).toEqual('00001');
    expect(generateKey()).toEqual('00002');
  });
});
