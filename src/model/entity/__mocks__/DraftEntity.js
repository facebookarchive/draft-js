// Copyright 2004-present Facebook. All Rights Reserved.

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
