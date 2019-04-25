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

const DraftRemovableWord = require('DraftRemovableWord');

let forward;
let backward;

const accents = 'th\u00e9 f\u00e0bregas';
const arabic = '\u0637\u0638\u0639 \u063A\u063B\u063C';
const cyrillic = '\u0430\u0448\u043e\u043a \u0431\u0414\u0416\u0426';
const english = 'the animals';
const halfWidthHangul = '\uffa3\uffa6\uffb0 \uffa1\uffa2\uffb2';
const japanese = '\u4f1a\u8b70\u4e2d \u30cf\u30c3\u30b7\u30e5';
const korean = '\ud2b8\uc704\ud130 \ud2b8\uc704\ud130';
const withNumbers = 'f14 tomcat';

beforeEach(() => {
  jest.resetModules();
  forward = DraftRemovableWord.getForward;
  backward = DraftRemovableWord.getBackward;
});

test('must identify words looking forward', () => {
  expect(forward(english)).toMatchSnapshot();
  expect(forward(accents)).toMatchSnapshot();
  expect(forward(arabic)).toMatchSnapshot();
  expect(forward(japanese)).toMatchSnapshot();
  expect(forward(korean)).toMatchSnapshot();
  expect(forward(halfWidthHangul)).toMatchSnapshot();
  expect(forward(cyrillic)).toMatchSnapshot();
  expect(forward(withNumbers)).toMatchSnapshot();
});

test('must identify words with apostrophes looking forward', () => {
  expect(forward("you're correct.")).toMatchSnapshot();
});

test('must identify words with curly quotes looking forward', () => {
  expect(forward('you\u2019re correct.')).toMatchSnapshot();
});

test('must identify punctuation with apostrophes', () => {
  expect(forward("'hello'")).toMatchSnapshot();
  expect(backward("'hello'")).toMatchSnapshot();
  expect(forward('\u2018hello\u2019')).toMatchSnapshot();
  expect(backward('\u2018hello\u2019')).toMatchSnapshot();

  expect(forward("('hello')")).toMatchSnapshot();
  expect(backward("('hello')")).toMatchSnapshot();
  expect(forward(".'.")).toMatchSnapshot();
  expect(backward(".'.")).toMatchSnapshot();
});

test('must identify words with underscores', () => {
  expect(forward('under_score hey')).toMatchSnapshot();
  expect(backward('hey under_score')).toMatchSnapshot();
});

test('must identify words led by spaces looking forward', () => {
  expect(forward('  ' + english)).toMatchSnapshot();
  expect(forward('    ' + accents)).toMatchSnapshot();
  expect(forward('      ' + arabic)).toMatchSnapshot();
});

test('must identify words led by punctuation looking forward', () => {
  expect(forward('.' + english)).toMatchSnapshot();
  expect(forward('|' + english)).toMatchSnapshot();
  expect(forward('^' + english)).toMatchSnapshot();
  expect(forward('\u060d\uFD3e\uFD3F' + english)).toMatchSnapshot();
  expect(forward('.. .. ..' + english)).toMatchSnapshot();
});

test('must identify punct/whitespace strings looking forward', () => {
  expect(forward('    ')).toMatchSnapshot();
  expect(forward('\u060d\uFD3e\uFD3F')).toMatchSnapshot();
  expect(forward('. . . . .')).toMatchSnapshot();
  expect(forward('   !!!???   ')).toMatchSnapshot();
});

test('must identify words looking backward', () => {
  expect(backward(english)).toMatchSnapshot();
  expect(backward(accents)).toMatchSnapshot();
  expect(backward(arabic)).toMatchSnapshot();
  expect(backward(japanese)).toMatchSnapshot();
  expect(backward(korean)).toMatchSnapshot();
  expect(backward(halfWidthHangul)).toMatchSnapshot();
  expect(backward(cyrillic)).toMatchSnapshot();
  expect(backward(withNumbers)).toMatchSnapshot();
});

test('must identify words with apostrophes looking backward', () => {
  expect(backward("you don't")).toMatchSnapshot();
});

test('must identify words ended by spaces looking backward', () => {
  expect(backward(english + '  ')).toMatchSnapshot();
  expect(backward(accents + '    ')).toMatchSnapshot();
  expect(backward(arabic + '      ')).toMatchSnapshot();
});

test('must identify words ended by punctuation looking backward', () => {
  expect(backward(english + '.')).toMatchSnapshot();
  expect(backward(english + '|')).toMatchSnapshot();
  expect(backward(english + '^')).toMatchSnapshot();
  expect(backward(english + '\u060d\uFD3e\uFD3F')).toMatchSnapshot();
  expect(backward(english + '.. .. ..')).toMatchSnapshot();
});

test('must identify punct/whitespace strings looking backward', () => {
  expect(backward('    ')).toMatchSnapshot();
  expect(backward('\u060d\uFD3e\uFD3F')).toMatchSnapshot();
  expect(backward('. . . . .')).toMatchSnapshot();
  expect(backward('   !!!???   ')).toMatchSnapshot();
});

test('must identify nothing in an empty string', () => {
  expect(forward('')).toMatchSnapshot();
  expect(backward('')).toMatchSnapshot();
});
