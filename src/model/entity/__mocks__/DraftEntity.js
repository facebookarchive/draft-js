/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 */

const DraftEntity = jest.genMockFromModule('DraftEntity');

const DraftEntityInstance = {
  getType: jest.fn(() => ''),
  getMutability: jest.fn(() => ''),
  getData: jest.fn(() => ({})),
};

let count = 0;

DraftEntity.create = jest.fn(function() {
  count++;
  return '' + count;
});

DraftEntity.get = jest.fn(function() {
  return DraftEntityInstance;
});

module.exports = DraftEntity;
