/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule DraftEntity
 * @typechecks
 * @flow
 */

const createEntityInContentState = require('createEntityInContentState');
const addEntityToContentState = require('addEntityToContentState');

// var invariant = require('invariant');

import type {DraftEntityMutability} from 'DraftEntityMutability';
import type {DraftEntityType} from 'DraftEntityType';
import type DraftEntityInstance from 'DraftEntityInstance';
import type ContentState from 'ContentState';


/**
 * A "document entity" is an object containing metadata associated with a
 * piece of text in a ContentBlock.
 *
 * For example, a `link` entity might include a `uri` property. When a
 * ContentBlock is rendered in the browser, text that refers to that link
 * entity may be rendered as an anchor, with the `uri` as the href value.
 *
 * In a ContentBlock, every position in the text may correspond to zero
 * or one entities. This correspondence is tracked using a key string,
 * generated via DraftEntity.create() and used to obtain entity metadata
 * via DraftEntity.get().
 */
const DraftEntity = {

  /**
   * Create a DraftEntityInstance and store it for later retrieval.
   *
   * A random key string will be generated and returned. This key may
   * be used to track the entity's usage in a ContentBlock, and for
   * retrieving data about the entity at render time.
   */
  create: function(
    contentState: ContentState,
    type: DraftEntityType,
    mutability: DraftEntityMutability,
    data?: Object
  ): ContentState {
    return createEntityInContentState(contentState, type, mutability, data);
  },

  /**
   * Add an existing DraftEntityInstance to the DraftEntity map. This is
   * useful when restoring instances from the server.
   */
  add: function(contentState: ContentState, instance: DraftEntityInstance): ContentState {
    return addEntityToContentState(contentState, instance);
  },

  get: function(contentState: ContentState, key: String): DraftEntityInstance {
    return contentState.getEntityMap().get(key);
  },

  /**
   * Entity instances are immutable. If you need to update the data for an
   * instance, this method will merge your data updates and return a new
   * instance.
   */
  // mergeData: function(
  //   key: string,
  //   toMerge: {[key: string]: any}
  // ): DraftEntityInstance {
  //   var instance = DraftEntity.get(key);
  //   var newData = {...instance.getData(), ...toMerge};
  //   var newInstance = instance.set('data', newData);
  //   instances = instances.set(key, newInstance);
  //   return newInstance;
  // },

  /**
   * Completely replace the data for a given instance.
   */
  // replaceData: function(
  //   key: string,
  //   newData: {[key: string]: any}
  // ): DraftEntityInstance {
  //   const instance = DraftEntity.get(key);
  //   const newInstance = instance.set('data', newData);
  //   instances = instances.set(key, newInstance);
  //   return newInstance;
  // },
};

module.exports = DraftEntity;
