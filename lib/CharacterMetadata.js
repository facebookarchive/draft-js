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

var _require = require("immutable"),
    Map = _require.Map,
    OrderedSet = _require.OrderedSet,
    Record = _require.Record; // Immutable.map is typed such that the value for every key in the map
// must be the same type


var EMPTY_SET = OrderedSet();
var defaultRecord = {
  style: EMPTY_SET,
  entity: null
};
var CharacterMetadataRecord = Record(defaultRecord);

var CharacterMetadata = /*#__PURE__*/function (_CharacterMetadataRec) {
  _inheritsLoose(CharacterMetadata, _CharacterMetadataRec);

  function CharacterMetadata() {
    return _CharacterMetadataRec.apply(this, arguments) || this;
  }

  var _proto = CharacterMetadata.prototype;

  _proto.getStyle = function getStyle() {
    return this.get('style');
  };

  _proto.getEntity = function getEntity() {
    return this.get('entity');
  };

  _proto.hasStyle = function hasStyle(style) {
    return this.getStyle().includes(style);
  };

  CharacterMetadata.applyStyle = function applyStyle(record, style) {
    var withStyle = record.set('style', record.getStyle().add(style));
    return CharacterMetadata.create(withStyle);
  };

  CharacterMetadata.removeStyle = function removeStyle(record, style) {
    var withoutStyle = record.set('style', record.getStyle().remove(style));
    return CharacterMetadata.create(withoutStyle);
  };

  CharacterMetadata.applyEntity = function applyEntity(record, entityKey) {
    var withEntity = record.getEntity() === entityKey ? record : record.set('entity', entityKey);
    return CharacterMetadata.create(withEntity);
  }
  /**
   * Use this function instead of the `CharacterMetadata` constructor.
   * Since most content generally uses only a very small number of
   * style/entity permutations, we can reuse these objects as often as
   * possible.
   */
  ;

  CharacterMetadata.create = function create(config) {
    if (!config) {
      return EMPTY;
    }

    var defaultConfig = {
      style: EMPTY_SET,
      entity: null
    }; // Fill in unspecified properties, if necessary.

    var configMap = Map(defaultConfig).merge(config);
    var existing = pool.get(configMap);

    if (existing) {
      return existing;
    }

    var newCharacter = new CharacterMetadata(configMap);
    pool = pool.set(configMap, newCharacter);
    return newCharacter;
  };

  CharacterMetadata.fromJS = function fromJS(_ref) {
    var style = _ref.style,
        entity = _ref.entity;
    return new CharacterMetadata({
      style: Array.isArray(style) ? OrderedSet(style) : style,
      entity: Array.isArray(entity) ? OrderedSet(entity) : entity
    });
  };

  return CharacterMetadata;
}(CharacterMetadataRecord);

var EMPTY = new CharacterMetadata();
var pool = Map([[Map(defaultRecord), EMPTY]]);
CharacterMetadata.EMPTY = EMPTY;
module.exports = CharacterMetadata;