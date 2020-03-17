/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 * @emails oncall+draft_js
 */

'use strict';

const TokenizeUtil = require('TokenizeUtil');

let punctuation = TokenizeUtil.getPunctuation();

// punctuation is enhanced with '&' . Currently the punctuations are being used
// to act as word separator. Since '&' is not a valid English punctuation it
// is not being returned as part of the punctuation string, hence presence of &
// in between two words is considered as part of the string.
// For example if the string is 'value0&field1=value1&field2'
// Backspace regex will consider 'value1&field2' as the last word of the string
// Delete regex will consider 'value0&field1' as the first word of the string

if (punctuation.indexOf('&') < 0) {
  punctuation = [punctuation.slice(0, 1), '&', punctuation.slice(1)].join('');
}

// The apostrophe and curly single quotes behave in a curious way: when
// surrounded on both sides by word characters, they behave as word chars; when
// either neighbor is punctuation or an end of the string, they behave as
// punctuation.
const CHAMELEON_CHARS = "['\u2018\u2019]";

// Remove the underscore, which should count as part of the removable word. The
// "chameleon chars" also count as punctuation in this regex.
const WHITESPACE_AND_PUNCTUATION = '\\s|(?![_])' + punctuation;

var DELETE_STRING =
  '^(?:(?:' +
  WHITESPACE_AND_PUNCTUATION +
  '))|' +
  '^' +
  '(?:' +
  WHITESPACE_AND_PUNCTUATION +
  ')*' +
  '(?:' +
  CHAMELEON_CHARS +
  '|(?!' +
  WHITESPACE_AND_PUNCTUATION +
  ').)*' +
  '(?:(?!' +
  WHITESPACE_AND_PUNCTUATION +
  ').)';
var DELETE_REGEX = new RegExp(DELETE_STRING);

var BACKSPACE_STRING =
  '(?:(?!' +
  WHITESPACE_AND_PUNCTUATION +
  ').)' +
  '(?:' +
  CHAMELEON_CHARS +
  '|(?!' +
  WHITESPACE_AND_PUNCTUATION +
  ').)*' +
  '(?!' +
  WHITESPACE_AND_PUNCTUATION +
  ')*' +
  '$|(?:(?:' +
  WHITESPACE_AND_PUNCTUATION +
  ')$)';
const BACKSPACE_REGEX = new RegExp(BACKSPACE_STRING);

function getRemovableWord(text: string, isBackward: boolean): string {
  const matches = isBackward
    ? BACKSPACE_REGEX.exec(text)
    : DELETE_REGEX.exec(text);
  return matches ? matches[0] : text;
}

const DraftRemovableWord = {
  getBackward: function(text: string): string {
    return getRemovableWord(text, true);
  },

  getForward: function(text: string): string {
    return getRemovableWord(text, false);
  },
};

module.exports = DraftRemovableWord;
