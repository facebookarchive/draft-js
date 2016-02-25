/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

var DraftEntity = jest.genMockFromModule('DraftEntity');

var DraftEntityInstance = {
  getType: jest.genMockFn().mockReturnValue(''),
  getMutability: jest.genMockFn().mockReturnValue(''),
  getData: jest.genMockFn().mockReturnValue({}),
};

var count = 0;

DraftEntity.create = jest.genMockFn().mockImplementation(function() {
  count++;
  return '' + count;
});

DraftEntity.get = jest.genMockFn().mockImplementation(function() {
  return DraftEntityInstance;
});

module.exports = DraftEntity;
