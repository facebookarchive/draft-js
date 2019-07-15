/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+draft_js
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
