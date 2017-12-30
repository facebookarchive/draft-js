/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule CharacterMetadata
 * @format
 * @flow
 */

'use strict';

import type {DraftInlineStyle} from 'DraftInlineStyle';
import type {DraftEntitySet} from 'DraftEntitySet';

var {Map, OrderedSet, Record} = require('immutable');

// Immutable.map is typed such that the value for every key in the map
// must be the same type
type CharacterMetadataConfigValueType = DraftInlineStyle | DraftEntitySet;

type CharacterMetadataConfig = {
  style?: CharacterMetadataConfigValueType,
  entity?: CharacterMetadataConfigValueType,
};

const EMPTY_SET = OrderedSet();

var defaultRecord: CharacterMetadataConfig = {
  style: EMPTY_SET,
  entity: EMPTY_SET,
};

var CharacterMetadataRecord = Record(defaultRecord);

class CharacterMetadata extends CharacterMetadataRecord {
  getStyle(): DraftInlineStyle {
    return this.get('style');
  }

  getEntity(): DraftEntitySet {
    return this.get('entity');
  }

  hasStyle(style: string): boolean {
    return this.getStyle().includes(style);
  }

  hasEntity(entity: string): boolean {
    return this.getEntity().includes(entity);
  }

  static applyStyle(
    record: CharacterMetadata,
    style: string,
  ): CharacterMetadata {
    var withStyle = record.set('style', record.getStyle().add(style));
    return CharacterMetadata.create(withStyle);
  }

  static removeStyle(
    record: CharacterMetadata,
    style: string,
  ): CharacterMetadata {
    var withoutStyle = record.set('style', record.getStyle().remove(style));
    return CharacterMetadata.create(withoutStyle);
  }

  static addEntity(
    record: CharacterMetadata,
    entityKey: string,
  ): CharacterMetadata {
    var withEntity = record.set('entity', record.getEntity().add(entityKey));
    return CharacterMetadata.create(withEntity);
  }

  static removeEntity(
    record: CharacterMetadata,
    entityKey: string,
  ): CharacterMetadata {
    var withoutEntity = record.set(
      'entity',
      record.getEntity().remove(entityKey),
    );
    return CharacterMetadata.create(withoutEntity);
  }

  /**
   * Use this function instead of the `CharacterMetadata` constructor.
   * Since most content generally uses only a very small number of
   * style/entity permutations, we can reuse these objects as often as
   * possible.
   */
  static create(config?: CharacterMetadataConfig): CharacterMetadata {
    if (!config) {
      return EMPTY;
    }

    const defaultConfig: CharacterMetadataConfig = {
      style: EMPTY_SET,
      entity: EMPTY_SET,
    };

    // Fill in unspecified properties, if necessary.
    var configMap = Map(defaultConfig).merge(config);

    var existing: ?CharacterMetadata = pool.get(configMap);
    if (existing) {
      return existing;
    }

    var newCharacter = new CharacterMetadata(configMap);
    pool = pool.set(configMap, newCharacter);
    return newCharacter;
  }
}

var EMPTY = new CharacterMetadata();
var pool: Map<Map<any, any>, CharacterMetadata> = Map([
  [Map(defaultRecord), EMPTY],
]);

CharacterMetadata.EMPTY = EMPTY;

module.exports = CharacterMetadata;
