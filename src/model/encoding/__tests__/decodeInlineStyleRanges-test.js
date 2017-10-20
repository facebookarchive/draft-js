/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails isaac, oncall+ui_infra
 */

'use strict';

jest.disableAutomock();

var {List} = require('immutable');
var {
  BOLD,
  BOLD_ITALIC,
  BOLD_ITALIC_UNDERLINE,
  BOLD_UNDERLINE,
  ITALIC,
  NONE,
} = require('SampleDraftInlineStyle');

var decodeInlineStyleRanges = require('decodeInlineStyleRanges');

function areEqual(a, b) {
  expect(List(a).equals(List(b))).toBeTruthy();
}

describe('decodeInlineStyleRanges', function() {
  it('must decode for an unstyled block', function() {
    var block = {text: 'Hello'};
    var decoded = decodeInlineStyleRanges(block.text);
    areEqual(decoded, Array(block.text.length).fill(NONE));
  });

  it('must decode for a flat styled block', function() {
    var block = {
      text: 'Hello',
      inlineStyleRanges: [
        {style: 'BOLD', offset: 0, length: 5},
      ],
    };
    var decoded = decodeInlineStyleRanges(
      block.text,
      block.inlineStyleRanges,
    );
    areEqual(decoded, Array(block.text.length).fill(BOLD));
  });

  it('must decode for a mixed-style block', function() {
    var block = {
      text: 'Hello',
      inlineStyleRanges: [
        {style: 'BOLD', offset: 0, length: 3},
        {style: 'ITALIC', offset: 1, length: 3},
        {style: 'UNDERLINE', offset: 0, length: 2},
        {style: 'BOLD', offset: 4, length: 1},
      ],
    };
    var decoded = decodeInlineStyleRanges(
      block.text,
      block.inlineStyleRanges,
    );
    areEqual(decoded, [
      BOLD_UNDERLINE,
      BOLD_ITALIC_UNDERLINE,
      BOLD_ITALIC,
      ITALIC,
      BOLD,
    ]);
  });

  it('must decode for strings that contain surrogate pairs in UTF-16', () => {
    var block = {
      text: 'Take a \uD83D\uDCF7 #selfie',
      inlineStyleRanges: [
        {offset: 4, length: 4, style: 'BOLD'},
        {offset: 6, length: 8, style: 'ITALIC'},
      ],
    };

    var decoded = decodeInlineStyleRanges(
      block.text,
      block.inlineStyleRanges,
    );

    areEqual(decoded, [
      NONE, NONE, NONE, NONE,
      BOLD, BOLD, BOLD_ITALIC, BOLD_ITALIC, BOLD_ITALIC,
      ITALIC, ITALIC, ITALIC, ITALIC, ITALIC, ITALIC,
      NONE, NONE,
    ]);
  });

});
