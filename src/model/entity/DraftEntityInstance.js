/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @legacyServerCallableInstance
 * @oncall draft_js
 */

'use strict';

import type {DraftEntityMutability} from 'DraftEntityMutability';
import type {DraftEntityType} from 'DraftEntityType';

const Immutable = require('immutable');

const {Record} = Immutable;

const DraftEntityInstanceRecord = (Record({
  type: 'TOKEN',
  mutability: 'IMMUTABLE',
  data: Object,
}): any);

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
class DraftEntityInstance extends DraftEntityInstanceRecord {
  getType(): DraftEntityType {
    return this.get('type');
  }

  getMutability(): DraftEntityMutability {
    return this.get('mutability');
  }

  getData(): Object {
    return this.get('data');
  }
}

module.exports = DraftEntityInstance;
