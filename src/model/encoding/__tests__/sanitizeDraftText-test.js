/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+ui_infra
 * @format
 */

jest.disableAutomock();

describe('sanitizeDraftText', () => {
  var sanitizeDraftText = require('sanitizeDraftText');
  it('must strip carriage returns', () => {
    var trailing = 'test\u000d';
    expect(sanitizeDraftText(trailing)).toBe('test');
    var twoTrailing = 'test\u000d\u000d';
    expect(sanitizeDraftText(twoTrailing)).toBe('test');
    var within = 'te\u000dst';
    expect(sanitizeDraftText(within)).toBe('test');
    var leading = '\u000dtest';
    expect(sanitizeDraftText(leading)).toBe('test');
    var all = '\u000dt\u000des\u000dt\u000d\u000d';
    expect(sanitizeDraftText(all)).toBe('test');
  });
});
