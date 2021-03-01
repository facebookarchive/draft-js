/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @legacyServerCallableInstance
 * @format
 * 
 * @emails oncall+draft_js
 */
'use strict';

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var Immutable = require("immutable");

var Record = Immutable.Record;
var DraftEntityInstanceRecord = Record({
  type: 'TOKEN',
  mutability: 'IMMUTABLE',
  data: Object
});
/**
 * An instance of a document entity, consisting of a `type` and relevant
 * `data`, metadata about the entity.
 *
 * For instance, a "link" entity might provide a URI, and a "mention"
 * entity might provide the mentioned user's ID. These pieces of data
 * may be used when rendering the entity as part of a ContentBlock DOM
 * representation. For a link, the data would be used as an href for
 * the rendered anchor. For a mention, the ID could be used to retrieve
 * a hovercard.
 */

var DraftEntityInstance = /*#__PURE__*/function (_DraftEntityInstanceR) {
  _inheritsLoose(DraftEntityInstance, _DraftEntityInstanceR);

  function DraftEntityInstance() {
    return _DraftEntityInstanceR.apply(this, arguments) || this;
  }

  var _proto = DraftEntityInstance.prototype;

  _proto.getType = function getType() {
    return this.get('type');
  };

  _proto.getMutability = function getMutability() {
    return this.get('mutability');
  };

  _proto.getData = function getData() {
    return this.get('data');
  };

  return DraftEntityInstance;
}(DraftEntityInstanceRecord);

module.exports = DraftEntityInstance;