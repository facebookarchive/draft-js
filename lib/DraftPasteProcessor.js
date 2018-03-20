/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule DraftPasteProcessor
 * @format
 * 
 */

'use strict';

var _assign = require('object-assign');

var _extends = _assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var CharacterMetadata = require('./CharacterMetadata');
var ContentBlock = require('./ContentBlock');
var ContentBlockNode = require('./ContentBlockNode');
var DraftFeatureFlags = require('./DraftFeatureFlags');
var Immutable = require('immutable');

var convertFromHTMLtoContentBlocks = require('./convertFromHTMLToContentBlocks');
var generateRandomKey = require('./generateRandomKey');
var getSafeBodyFromHTML = require('./getSafeBodyFromHTML');
var sanitizeDraftText = require('./sanitizeDraftText');

var List = Immutable.List,
    Repeat = Immutable.Repeat;


var experimentalTreeDataSupport = DraftFeatureFlags.draft_tree_data_support;
var ContentBlockRecord = experimentalTreeDataSupport ? ContentBlockNode : ContentBlock;

var DraftPasteProcessor = {
  processHTML: function processHTML(html, blockRenderMap) {
    return convertFromHTMLtoContentBlocks(html, getSafeBodyFromHTML, blockRenderMap);
  },
  processText: function processText(textBlocks, character, type) {
    return textBlocks.reduce(function (acc, textLine, index) {
      textLine = sanitizeDraftText(textLine);
      var key = generateRandomKey();

      var blockNodeConfig = {
        key: key,
        type: type,
        text: textLine,
        characterList: List(Repeat(character, textLine.length))
      };

      // next block updates previous block
      if (experimentalTreeDataSupport && index !== 0) {
        var prevSiblingIndex = index - 1;
        // update previous block
        var previousBlock = acc[prevSiblingIndex] = acc[prevSiblingIndex].merge({
          nextSibling: key
        });
        blockNodeConfig = _extends({}, blockNodeConfig, {
          prevSibling: previousBlock.getKey()
        });
      }

      acc.push(new ContentBlockRecord(blockNodeConfig));

      return acc;
    }, []);
  }
};

module.exports = DraftPasteProcessor;