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

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var CharacterMetadata = require("./CharacterMetadata");

var findRangesImmutable = require("./findRangesImmutable");

var Immutable = require("immutable");

var List = Immutable.List,
    Map = Immutable.Map,
    OrderedSet = Immutable.OrderedSet,
    Record = Immutable.Record,
    Repeat = Immutable.Repeat;
var EMPTY_SET = OrderedSet();
var defaultRecord = {
  key: '',
  type: 'unstyled',
  text: '',
  characterList: List(),
  depth: 0,
  data: Map()
};
var ContentBlockRecord = Record(defaultRecord);

var decorateCharacterList = function decorateCharacterList(config) {
  if (!config) {
    return config;
  }

  var characterList = config.characterList,
      text = config.text;

  if (text && !characterList) {
    config.characterList = List(Repeat(CharacterMetadata.EMPTY, text.length));
  }

  return config;
};

var ContentBlock = /*#__PURE__*/function (_ContentBlockRecord) {
  _inheritsLoose(ContentBlock, _ContentBlockRecord);

  function ContentBlock(config) {
    return _ContentBlockRecord.call(this, decorateCharacterList(config)) || this;
  }

  var _proto = ContentBlock.prototype;

  _proto.getKey = function getKey() {
    return this.get('key');
  };

  _proto.getType = function getType() {
    return this.get('type');
  };

  _proto.getText = function getText() {
    return this.get('text');
  };

  _proto.getCharacterList = function getCharacterList() {
    return this.get('characterList');
  };

  _proto.getLength = function getLength() {
    return this.getText().length;
  };

  _proto.getDepth = function getDepth() {
    return this.get('depth');
  };

  _proto.getData = function getData() {
    return this.get('data');
  };

  _proto.getInlineStyleAt = function getInlineStyleAt(offset) {
    var character = this.getCharacterList().get(offset);
    return character ? character.getStyle() : EMPTY_SET;
  };

  _proto.getEntityAt = function getEntityAt(offset) {
    var character = this.getCharacterList().get(offset);
    return character ? character.getEntity() : null;
  }
  /**
   * Execute a callback for every contiguous range of styles within the block.
   */
  ;

  _proto.findStyleRanges = function findStyleRanges(filterFn, callback) {
    findRangesImmutable(this.getCharacterList(), haveEqualStyle, filterFn, callback);
  }
  /**
   * Execute a callback for every contiguous range of entities within the block.
   */
  ;

  _proto.findEntityRanges = function findEntityRanges(filterFn, callback) {
    findRangesImmutable(this.getCharacterList(), haveEqualEntity, filterFn, callback);
  };

  return ContentBlock;
}(ContentBlockRecord);

function haveEqualStyle(charA, charB) {
  return charA.getStyle() === charB.getStyle();
}

function haveEqualEntity(charA, charB) {
  return charA.getEntity() === charB.getEntity();
}

module.exports = ContentBlock;