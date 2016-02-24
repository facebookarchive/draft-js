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

jest.autoMockOff();

describe('sanitizeDraftText', () => {
  const sanitizeDraftText = require('sanitizeDraftText');
  it('must strip carriage returns', () => {
    const trailing = 'test\u000d';
    expect(sanitizeDraftText(trailing)).toBe('test');
    const twoTrailing = 'test\u000d\u000d';
    expect(sanitizeDraftText(twoTrailing)).toBe('test');
    const within = 'te\u000dst';
    expect(sanitizeDraftText(within)).toBe('test');
    const leading = '\u000dtest';
    expect(sanitizeDraftText(leading)).toBe('test');
    const all = '\u000dt\u000des\u000dt\u000d\u000d';
    expect(sanitizeDraftText(all)).toBe('test');
  });
});
