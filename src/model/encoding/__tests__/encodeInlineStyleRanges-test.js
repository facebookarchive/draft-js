/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+draft_js
 * @flow strict-local
 * @format
 */

'use strict';

jest.disableAutomock();

const ContentBlock = require('ContentBlock');
const SampleDraftInlineStyle = require('SampleDraftInlineStyle');

const createCharacterList = require('createCharacterList');
const encodeInlineStyleRanges = require('encodeInlineStyleRanges');
const Immutable = require('immutable');

const {
  BOLD,
  BOLD_ITALIC,
  BOLD_UNDERLINE,
  BOLD_ITALIC_UNDERLINE,
  ITALIC,
  ITALIC_UNDERLINE,
  NONE,
} = SampleDraftInlineStyle;

const {List, OrderedSet, Repeat} = Immutable;

const FOO = OrderedSet.of('foo');
const FOO_BAR = OrderedSet.of('foo', 'bar');

const createBlock = (text, inlineStyles) => {
  return new ContentBlock({
    key: 'a',
    text,
    type: 'unstyled',
    characterList: createCharacterList(
      inlineStyles.toArray(),
      Repeat(null, text.length).toArray(),
    ),
  });
};

test('must encode for an unstyled document', () => {
  expect(
    encodeInlineStyleRanges(createBlock(' '.repeat(2), Repeat(NONE, 2))),
  ).toMatchSnapshot();
  expect(
    encodeInlineStyleRanges(createBlock(' '.repeat(20), Repeat(NONE, 20))),
  ).toMatchSnapshot();
  expect(
    encodeInlineStyleRanges(createBlock(' '.repeat(200), Repeat(NONE, 200))),
  ).toMatchSnapshot();
  expect(
    encodeInlineStyleRanges(createBlock(' '.repeat(2000), Repeat(NONE, 2000))),
  ).toMatchSnapshot();
});

test('must encode for a flat styled document', () => {
  const all = BOLD_ITALIC_UNDERLINE;
  expect(
    encodeInlineStyleRanges(createBlock(' '.repeat(20), Repeat(BOLD, 20))),
  ).toMatchSnapshot();
  expect(
    encodeInlineStyleRanges(
      createBlock(' '.repeat(20), Repeat(BOLD_ITALIC, 20)),
    ),
  ).toMatchSnapshot();
  expect(
    encodeInlineStyleRanges(createBlock(' '.repeat(20), Repeat(all, 20))),
  ).toMatchSnapshot();
});

test('must encode custom styles', () => {
  const custom = List([FOO, FOO, FOO_BAR, FOO_BAR, BOLD, BOLD]);
  expect(
    encodeInlineStyleRanges(createBlock(' '.repeat(6), custom)),
  ).toMatchSnapshot();
});

test('must encode for a complex styled document', () => {
  // prettier-ignore
  const complex = List([
      BOLD, BOLD, BOLD, BOLD, NONE,     // "four "
      BOLD_ITALIC, BOLD_ITALIC,         // "sc"
      ITALIC_UNDERLINE, BOLD_UNDERLINE, // "or"
      BOLD_ITALIC_UNDERLINE,            // "e"
    ]);

  expect(
    encodeInlineStyleRanges(createBlock(' '.repeat(10), complex)),
  ).toMatchSnapshot();
});

test('must encode for strings with surrogate pairs', () => {
  const str = 'Take a \uD83D\uDCF7 #selfie';
  // prettier-ignore
  const styles = List([
      NONE, NONE, NONE, NONE,                            // `Take`
      BOLD, BOLD, BOLD_ITALIC, BOLD_ITALIC, BOLD_ITALIC, // ` a [camera]`
      ITALIC, ITALIC, ITALIC, ITALIC, ITALIC, ITALIC,    // ` #self`
      NONE, NONE,                                        // `ie`
    ]);

  expect(encodeInlineStyleRanges(createBlock(str, styles))).toMatchSnapshot();
});
