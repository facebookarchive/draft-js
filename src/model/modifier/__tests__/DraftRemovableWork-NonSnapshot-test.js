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

test('must identify words looking forward - non snapshot - non snapshot', () => {
  expect(forward(english)).toEqual('the');
  expect(forward(accents)).toEqual('th\u00e9');
  expect(forward(arabic)).toEqual('\u0637\u0638\u0639');
  expect(forward(japanese)).toEqual('\u4f1a\u8b70\u4e2d');
  expect(forward(korean)).toEqual('\ud2b8\uc704\ud130');
  expect(forward(halfWidthHangul)).toEqual('\uffa3\uffa6\uffb0');
  expect(forward(cyrillic)).toEqual('\u0430\u0448\u043e\u043a');
  expect(forward(withNumbers)).toEqual('f14');
});

test('must identify words with apostrophes looking forward - non snapshot', () => {
  expect(forward("you're correct.")).toEqual("you're");
});

test('must identify words with curly quotes looking forward - non snapshot', () => {
  expect(forward('you\u2019re correct.')).toEqual('you\u2019re');
});

test('must identify punctuation with apostrophes - non snapshot', () => {
  expect(forward("'hello'")).toEqual("'");
  expect(backward("'hello'")).toEqual("hello'");
  expect(forward('\u2018hello\u2019')).toEqual('\u2018');
  expect(backward('\u2018hello\u2019')).toEqual('hello\u2019');

  expect(forward("('hello')")).toEqual('(');
  expect(backward("('hello')")).toEqual(')');
  expect(forward(".'.")).toEqual('.');
  expect(backward(".'.")).toEqual('.');
});

test('must identify words with underscores - non snapshot', () => {
  expect(forward('under_score hey')).toEqual('under_score');
  expect(backward('hey under_score')).toEqual('under_score');
});

test('must identify words led by spaces looking forward - non snapshot', () => {
  expect(forward('  ' + english)).toEqual(' ');
  expect(forward('    ' + accents)).toEqual(' ');
  expect(forward('      ' + arabic)).toEqual(' ');
});

test('must identify words led by punctuation looking forward - non snapshot', () => {
  expect(forward('.' + english)).toEqual('.');
  expect(forward('|' + english)).toEqual('|');
  expect(forward('^' + english)).toEqual('^');
  expect(forward('\u060d\uFD3e\uFD3F' + english)).toEqual('\u060d');
  expect(forward('.. .. ..' + english)).toEqual('.');
});

test('must identify punct/whitespace strings looking forward - non snapshot', () => {
  expect(forward('    ')).toEqual(' ');
  expect(forward('\u060d\uFD3e\uFD3F')).toEqual('\u060d');
  expect(forward('. . . . .')).toEqual('.');
  expect(forward('   !!!???   ')).toEqual(' ');
});

test('must identify words looking backward - non snapshot', () => {
  expect(backward(english)).toEqual('animals');
  expect(backward(accents)).toEqual('f\u00e0bregas');
  expect(backward(arabic)).toEqual('\u063A\u063B\u063C');
  expect(backward(japanese)).toEqual('\u30cf\u30c3\u30b7\u30e5');
  expect(backward(korean)).toEqual('\ud2b8\uc704\ud130');
  expect(backward(halfWidthHangul)).toEqual('\uffa1\uffa2\uffb2');
  expect(backward(cyrillic)).toEqual('\u0431\u0414\u0416\u0426');
  expect(backward(withNumbers)).toEqual('tomcat');
});

test('must identify words with apostrophes looking backward - non snapshot', () => {
  expect(backward("you don't")).toEqual("don't");
});

test('must identify words ended by spaces looking backward - non snapshot', () => {
  expect(backward(english + '  ')).toEqual(' ');
  expect(backward(accents + '    ')).toEqual(' ');
  expect(backward(arabic + '      ')).toEqual(' ');
});

test('must identify words ended by punctuation looking backward - non snapshot', () => {
  expect(backward(english + '.')).toEqual('.');
  expect(backward(english + '|')).toEqual('|');
  expect(backward(english + '^')).toEqual('^');
  expect(backward(english + '\u060d\uFD3e\uFD3F')).toEqual('\uFD3F');
  expect(backward(english + '.. .. ..')).toEqual('.');
});

test('must identify punct/whitespace strings looking backward - non snapshot', () => {
  expect(backward('    ')).toEqual(' ');
  expect(backward('\u060d\uFD3e\uFD3F')).toEqual('\uFD3F');
  expect(backward('. . . . .')).toEqual('.');
  expect(backward('   !!!???   ')).toEqual(' ');
});

test('must identify nothing in an empty string - non snapshot', () => {
  expect(forward('')).toEqual('');
  expect(backward('')).toEqual('');
});

test('must identify key value param of the url - non snapshot', () => {
  expect(forward('field1=value1')).toEqual('field1');
  expect(backward('field1=value1')).toEqual('value1');
  expect(forward('&field1=value1')).toEqual('&');
  expect(backward('field1=value1&')).toEqual('&');
  expect(forward('=value1&')).toEqual('=');
  expect(backward('&field1=')).toEqual('=');
});
