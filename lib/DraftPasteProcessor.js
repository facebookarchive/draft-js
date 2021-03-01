/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * 
 * @emails oncall+draft_js
 */
'use strict';

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? Object(arguments[i]) : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ContentBlock = require("./ContentBlock");

var ContentBlockNode = require("./ContentBlockNode");

var convertFromHTMLToContentBlocks = require("./convertFromHTMLToContentBlocks");

var generateRandomKey = require("./generateRandomKey");

var getSafeBodyFromHTML = require("./getSafeBodyFromHTML");

var gkx = require("./gkx");

var Immutable = require("immutable");

var sanitizeDraftText = require("./sanitizeDraftText");

var List = Immutable.List,
    Repeat = Immutable.Repeat;
var experimentalTreeDataSupport = gkx('draft_tree_data_support');
var ContentBlockRecord = experimentalTreeDataSupport ? ContentBlockNode : ContentBlock;
var DraftPasteProcessor = {
  processHTML: function processHTML(html, blockRenderMap) {
    return convertFromHTMLToContentBlocks(html, getSafeBodyFromHTML, blockRenderMap);
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
      }; // next block updates previous block

      if (experimentalTreeDataSupport && index !== 0) {
        var prevSiblingIndex = index - 1; // update previous block

        var previousBlock = acc[prevSiblingIndex] = acc[prevSiblingIndex].merge({
          nextSibling: key
        });
        blockNodeConfig = _objectSpread({}, blockNodeConfig, {
          prevSibling: previousBlock.getKey()
        });
      }

      acc.push(new ContentBlockRecord(blockNodeConfig));
      return acc;
    }, []);
  }
};
module.exports = DraftPasteProcessor;