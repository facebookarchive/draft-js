/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * 
 * @emails oncall+draft_js
 *
 * This file is a fork of ContentBlock adding support for nesting references by
 * providing links to children, parent, prevSibling, and nextSibling.
 *
 * This is unstable and not part of the public API and should not be used by
 * production systems. This file may be update/removed without notice.
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
  parent: null,
  characterList: List(),
  data: Map(),
  depth: 0,
  key: '',
  text: '',
  type: 'unstyled',
  children: List(),
  prevSibling: null,
  nextSibling: null
};

var haveEqualStyle = function haveEqualStyle(charA, charB) {
  return charA.getStyle() === charB.getStyle();
};

var haveEqualEntity = function haveEqualEntity(charA, charB) {
  return charA.getEntity() === charB.getEntity();
};

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

var ContentBlockNode = /*#__PURE__*/function (_ref) {
  _inheritsLoose(ContentBlockNode, _ref);

  function ContentBlockNode() {
    var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultRecord;

    /* eslint-disable-next-line constructor-super */
    return _ref.call(this, decorateCharacterList(props)) || this;
  }

  var _proto = ContentBlockNode.prototype;

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
  };

  _proto.getChildKeys = function getChildKeys() {
    return this.get('children');
  };

  _proto.getParentKey = function getParentKey() {
    return this.get('parent');
  };

  _proto.getPrevSiblingKey = function getPrevSiblingKey() {
    return this.get('prevSibling');
  };

  _proto.getNextSiblingKey = function getNextSiblingKey() {
    return this.get('nextSibling');
  };

  _proto.findStyleRanges = function findStyleRanges(filterFn, callback) {
    findRangesImmutable(this.getCharacterList(), haveEqualStyle, filterFn, callback);
  };

  _proto.findEntityRanges = function findEntityRanges(filterFn, callback) {
    findRangesImmutable(this.getCharacterList(), haveEqualEntity, filterFn, callback);
  };

  return ContentBlockNode;
}(Record(defaultRecord));

module.exports = ContentBlockNode;