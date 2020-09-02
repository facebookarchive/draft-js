/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+draft-js
 * @flow strict-local
 * @format
 */

'use strict';

const isHTMLBRElement = require('isHTMLBRElement');

test('isHTMLBRElement recognizes null', () => {
  expect(isHTMLBRElement(null)).toBe(false);
});

test('isHTMLBRElement recognizes BR elements in same document', () => {
  const br = document.createElement('br');
  expect(isHTMLBRElement(br)).toBe(true);
});

test('isHTMLBRElement recognizes BR elements in iframed document', () => {
  const iframe = document.createElement('iframe');
  if (document.body != null) {
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument;
    const br = doc.createElement('br');
    expect(isHTMLBRElement(br)).toBe(true);
  }
});
