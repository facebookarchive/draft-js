/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall draft_js
 */

'use strict';

const TokenizeUtil = require('TokenizeUtil');

const punctuation = TokenizeUtil.getPunctuation();

// The apostrophe and curly single quotes behave in a curious way: when
// surrounded on both sides by word characters, they behave as word chars; when
// either neighbor is punctuation or an end of the string, they behave as
// punctuation.
const CHAMELEON_CHARS = "['\u2018\u2019]";

// Remove the underscore, which should count as part of the removable word. The
// "chameleon chars" also count as punctuation in this regex.
const WHITESPACE_AND_PUNCTUATION = '\\s|(?![_])' + punctuation;

const DELETE_STRING =
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
const DELETE_REGEX = new RegExp(DELETE_STRING);

const BACKSPACE_STRING =
  '(?:(?!' +
  WHITESPACE_AND_PUNCTUATION +
  ').)' +
  '(?:' +
  CHAMELEON_CHARS +
  '|(?!' +
  WHITESPACE_AND_PUNCTUATION +
  ').)*' +
  '(?:' +
  WHITESPACE_AND_PUNCTUATION +
  ')*' +
  '$';
const BACKSPACE_REGEX = new RegExp(BACKSPACE_STRING);

function getRemovableWord(text: string, isBackward: boolean): string {
  const matches = isBackward
    ? BACKSPACE_REGEX.exec(text)
    : DELETE_REGEX.exec(text);
  return matches ? matches[0] : text;
}

const DraftRemovableWord = {
  getBackward(text: string): string {
    return getRemovableWord(text, true);
  },

  getForward(text: string): string {
    return getRemovableWord(text, false);
  },
};

module.exports = DraftRemovableWord;
