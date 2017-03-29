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

var ContentBlock = require('ContentBlock');
var Immutable = require('immutable');
var SampleDraftInlineStyle = require('SampleDraftInlineStyle');

var createCharacterList = require('createCharacterList');
var encodeInlineStyleRanges = require('encodeInlineStyleRanges');

var {
  BOLD,
  BOLD_ITALIC,
  BOLD_UNDERLINE,
  BOLD_ITALIC_UNDERLINE,
  ITALIC,
  ITALIC_UNDERLINE,
  NONE,
} = SampleDraftInlineStyle;

const {
  List,
  OrderedSet,
  Repeat,
} = Immutable;

const FOO = OrderedSet.of('foo');
const FOO_BAR = OrderedSet.of('foo', 'bar');

describe('encodeInlineStyleRanges', () => {
  function createBlock(text, inlineStyles) {
    return new ContentBlock({
      key: 'a',
      text,
      type: 'unstyled',
      characterList: createCharacterList(
        inlineStyles.toArray(),
        Repeat(null, text.length).toArray(),
      ),
    });
  }

  it('must encode for an unstyled document', () => {
    expect(
      encodeInlineStyleRanges(createBlock(' '.repeat(2), Repeat(NONE, 2))),
    ).toEqual([]);
    expect(
      encodeInlineStyleRanges(createBlock(' '.repeat(20), Repeat(NONE, 20))),
    ).toEqual([]);
    expect(
      encodeInlineStyleRanges(createBlock(' '.repeat(200), Repeat(NONE, 200))),
    ).toEqual([]);
    expect(
      encodeInlineStyleRanges(createBlock(' '.repeat(2000), Repeat(NONE, 2000))),
    ).toEqual([]);
  });

  it('must encode for a flat styled document', () => {
    expect(
      encodeInlineStyleRanges(createBlock(' '.repeat(20), Repeat(BOLD, 20))),
    ).toEqual([
      {offset: 0, length: 20, style: 'BOLD'},
    ]);
    expect(
      encodeInlineStyleRanges(
        createBlock(
          ' '.repeat(20),
          Repeat(BOLD_ITALIC, 20),
        ),
      ),
    ).toEqual([
      {offset: 0, length: 20, style: 'BOLD'},
      {offset: 0, length: 20, style: 'ITALIC'},
    ]);

    var all = BOLD_ITALIC_UNDERLINE;
    expect(
      encodeInlineStyleRanges(createBlock(' '.repeat(20), Repeat(all, 20))),
    ).toEqual([
      {offset: 0, length: 20, style: 'BOLD'},
      {offset: 0, length: 20, style: 'ITALIC'},
      {offset: 0, length: 20, style: 'UNDERLINE'},
    ]);
  });

  it('must encode custom styles', () => {
    const custom = List([FOO, FOO, FOO_BAR, FOO_BAR, BOLD, BOLD]);
    expect(
      encodeInlineStyleRanges(createBlock(' '.repeat(6), custom)),
    ).toEqual([
      {offset: 0, length: 4, style: 'foo'},
      {offset: 2, length: 2, style: 'bar'},
      {offset: 4, length: 2, style: 'BOLD'},
    ]);
  });

  it('must encode for a complex styled document', () => {
    var complex = List([
      BOLD, BOLD, BOLD, BOLD, NONE,         // "four "
      BOLD_ITALIC, BOLD_ITALIC,         // "sc"
      ITALIC_UNDERLINE, BOLD_UNDERLINE, // "or"
      BOLD_ITALIC_UNDERLINE,            // "e"
    ]);

    expect(
      encodeInlineStyleRanges(createBlock(' '.repeat(10), complex)),
    ).toEqual([
      {offset: 0, length: 4, style: 'BOLD'},
      {offset: 5, length: 2, style: 'BOLD'},
      {offset: 8, length: 2, style: 'BOLD'},
      {offset: 5, length: 3, style: 'ITALIC'},
      {offset: 9, length: 1, style: 'ITALIC'},
      {offset: 7, length: 3, style: 'UNDERLINE'},
    ]);
  });

  it('must encode for strings with surrogate pairs', () => {
    var str = 'Take a \uD83D\uDCF7 #selfie';
    var styles = List([
      NONE, NONE, NONE, NONE, // `Take`
      BOLD, BOLD, BOLD_ITALIC, BOLD_ITALIC, BOLD_ITALIC, // ` a [camera]`
      ITALIC, ITALIC, ITALIC, ITALIC, ITALIC, ITALIC,  // ` #self`
      NONE, NONE, // `ie`
    ]);

    expect(
      encodeInlineStyleRanges(createBlock(str, styles)),
    ).toEqual([
      {offset: 4, length: 4, style: 'BOLD'},
      {offset: 6, length: 8, style: 'ITALIC'},
    ]);
  });
});
