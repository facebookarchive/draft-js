/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule addEntityToEntityMap
 * @typechecks
 * 
 */

'use strict';

// TODO: when removing the deprecated API update this to use the EntityMap type
// instead of OrderedMap

var key = 0;

function addEntityToEntityMap(entityMap, instance) {
  return entityMap.set('' + ++key, instance);
}

module.exports = addEntityToEntityMap;