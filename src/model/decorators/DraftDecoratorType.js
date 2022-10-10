/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @oncall draft_js
 */

'use strict';

import type {BlockNodeRecord} from 'BlockNodeRecord';
import type ContentState from 'ContentState';
import type {List} from 'immutable';

/**
 * An interface for document decorator classes, allowing the creation of
 * custom decorator classes.
 *
 * See `CompositeDraftDecorator` for the most common use case.
 */
export type DraftDecoratorType = interface {
  /**
   * Given a `ContentBlock`, return an immutable List of decorator keys.
   */
  getDecorations(
    block: BlockNodeRecord,
    contentState: ContentState,
  ): List<?string>,
  /**
   * Given a decorator key, return the component to use when rendering
   * this decorated range.
   */
  getComponentForKey(key: string): Function,
  /**
   * Given a decorator key, optionally return the props to use when rendering
   * this decorated range.
   */
  getPropsForKey(key: string): ?Object,
};
