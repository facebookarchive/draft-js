/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule DraftEntityInstance
 * @flow
 */

'use strict';

var Immutable = require('immutable');

import type {DraftEntityType} from 'DraftEntityType';
import type {DraftEntityMutability} from 'DraftEntityMutability';

var {Record} = Immutable;

var DraftEntityInstanceRecord = Record({
  type: 'TOKEN',
  mutability: 'IMMUTABLE',
  data: Object,
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
class DraftEntityInstance extends DraftEntityInstanceRecord {
  getType(): DraftEntityType {
    return this.get('type');
  }

  getContiguity(): DraftEntityMutability {
    return this.get('contiguous');
  }

  getMutability(): DraftEntityMutability {
    return this.get('mutability');
  }

  getData(): Object {
    return this.get('data');
  }
}

module.exports = DraftEntityInstance;
