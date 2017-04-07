/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule DraftPasteProcessor
 * @typechecks
 * 
 */

'use strict';

var CharacterMetadata = require('./CharacterMetadata');
var ContentBlock = require('./ContentBlock');
var Immutable = require('immutable');

var convertFromHTMLtoContentBlocks = require('./convertFromHTMLToContentBlocks');
var generateRandomKey = require('./generateRandomKey');
var getSafeBodyFromHTML = require('./getSafeBodyFromHTML');
var sanitizeDraftText = require('./sanitizeDraftText');

var List = Immutable.List,
    Repeat = Immutable.Repeat;


var DraftPasteProcessor = {
  processHTML: function processHTML(html, blockRenderMap) {
    return convertFromHTMLtoContentBlocks(html, getSafeBodyFromHTML, blockRenderMap);
  },
  processText: function processText(textBlocks, character) {
    return textBlocks.map(function (textLine) {
      textLine = sanitizeDraftText(textLine);
      return new ContentBlock({
        key: generateRandomKey(),
        type: 'unstyled',
        text: textLine,
        characterList: List(Repeat(character, textLine.length))
      });
    });
  }
};

module.exports = DraftPasteProcessor;