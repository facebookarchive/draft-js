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

var DraftRemovableWord = require('DraftRemovableWord');

describe('DraftRemovableWord', function() {
  var forward;
  var backward;

  var english = 'the animals';
  var accents = 'th\u00e9 f\u00e0bregas';
  var arabic = '\u0637\u0638\u0639 \u063A\u063B\u063C';
  var japanese = '\u4f1a\u8b70\u4e2d \u30cf\u30c3\u30b7\u30e5';
  var korean = '\ud2b8\uc704\ud130 \ud2b8\uc704\ud130';
  var halfWidthHangul = '\uffa3\uffa6\uffb0 \uffa1\uffa2\uffb2';
  var cyrillic = '\u0430\u0448\u043e\u043a \u0431\u0414\u0416\u0426';
  var withNumbers = 'f14 tomcat';

  beforeEach(function() {
    jest.resetModules();
    forward = DraftRemovableWord.getForward;
    backward = DraftRemovableWord.getBackward;
  });

  it('must identify words looking forward', function() {
    expect(forward(english)).toBe(english.split(' ')[0]);
    expect(forward(accents)).toBe(accents.split(' ')[0]);
    expect(forward(arabic)).toBe(arabic.split(' ')[0]);
    expect(forward(japanese)).toBe(japanese.split(' ')[0]);
    expect(forward(korean)).toBe(korean.split(' ')[0]);
    expect(forward(halfWidthHangul)).toBe(halfWidthHangul.split(' ')[0]);
    expect(forward(cyrillic)).toBe(cyrillic.split(' ')[0]);
    expect(forward(withNumbers)).toBe(withNumbers.split(' ')[0]);
  });

  it('must identify words with apostrophes looking forward', function() {
    expect(forward('you\'re correct.')).toBe('you\'re');
  });

  it('must identify words with curly quotes looking forward', function() {
    expect(forward('you\u2019re correct.')).toBe('you\u2019re');
  });

  it('must identify punctuation with apostrophes', function() {
    expect(forward("'hello'")).toBe("'hello");
    expect(backward("'hello'")).toBe("hello'");
    expect(forward('\u2018hello\u2019')).toBe('\u2018hello');
    expect(backward('\u2018hello\u2019')).toBe('hello\u2019');

    expect(forward("('hello')")).toBe("('hello");
    expect(backward("('hello')")).toBe("hello')");
    expect(forward(".'.")).toBe(".'.");
    expect(backward(".'.")).toBe(".'.");
  });

  it('must identify words with underscores', () => {
    expect(forward('under_score hey')).toBe('under_score');
    expect(backward('hey under_score')).toBe('under_score');
  });

  it('must identify words led by spaces looking forward', function() {
    expect(forward('  ' + english)).toBe('  ' + english.split(' ')[0]);
    expect(forward('    ' + accents)).toBe('    ' + accents.split(' ')[0]);
    expect(forward('      ' + arabic)).toBe('      ' + arabic.split(' ')[0]);
  });

  it('must identify words led by punctuation looking forward', function() {
    var match = english.split(' ')[0];
    expect(forward('.' + english)).toBe('.' + match);
    expect(forward('|' + english)).toBe('|' + match);
    expect(forward('^' + english)).toBe('^' + match);
    expect(forward('\u060d\uFD3e\uFD3F' + english)).toBe(
      '\u060d\uFD3e\uFD3F' + match,
    );
    expect(forward('.. .. ..' + english)).toBe('.. .. ..' + match);
  });

  it('must identify punct/whitespace strings looking forward', function() {
    expect(forward('    ')).toBe('    ');
    expect(forward('\u060d\uFD3e\uFD3F')).toBe('\u060d\uFD3e\uFD3F');
    expect(forward('. . . . .')).toBe('. . . . .');
    expect(forward('   !!!???   ')).toBe('   !!!???   ');
  });

  it('must identify words looking backward', function() {
    expect(backward(english)).toBe(english.split(' ')[1]);
    expect(backward(accents)).toBe(accents.split(' ')[1]);
    expect(backward(arabic)).toBe(arabic.split(' ')[1]);
    expect(backward(japanese)).toBe(japanese.split(' ')[1]);
    expect(backward(korean)).toBe(korean.split(' ')[1]);
    expect(backward(halfWidthHangul)).toBe(halfWidthHangul.split(' ')[1]);
    expect(backward(cyrillic)).toBe(cyrillic.split(' ')[1]);
    expect(backward(withNumbers)).toBe(withNumbers.split(' ')[1]);
  });

  it('must identify words with apostrophes looking backward', function() {
    expect(backward('you don\'t')).toBe('don\'t');
  });

  it('must identify words ended by spaces looking backward', function() {
    expect(backward(english + '  ')).toBe(english.split(' ')[1] + '  ');
    expect(backward(accents + '    ')).toBe(accents.split(' ')[1] + '    ');
    expect(backward(arabic + '      ')).toBe(arabic.split(' ')[1] + '      ');
  });

  it('must identify words ended by punctuation looking backward', function() {
    var match = english.split(' ')[1];
    expect(backward(english + '.')).toBe(match + '.');
    expect(backward(english + '|')).toBe(match + '|');
    expect(backward(english + '^')).toBe(match + '^');
    expect(backward(english + '\u060d\uFD3e\uFD3F')).toBe(
      match + '\u060d\uFD3e\uFD3F',
    );
    expect(backward(english + '.. .. ..')).toBe(match + '.. .. ..');
  });

  it('must identify punct/whitespace strings looking backward', function() {
    expect(backward('    ')).toBe('    ');
    expect(backward('\u060d\uFD3e\uFD3F')).toBe('\u060d\uFD3e\uFD3F');
    expect(backward('. . . . .')).toBe('. . . . .');
    expect(backward('   !!!???   ')).toBe('   !!!???   ');
  });

  it('must identify nothing in an empty string', function() {
    expect(forward('')).toBe('');
    expect(backward('')).toBe('');
  });
});
