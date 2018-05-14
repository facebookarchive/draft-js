/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 * @flow
 */

'use strict';

import type {BlockNodeKey} from 'BlockNode';
import type {BlockNodeRecord} from 'BlockNodeRecord';
import type ContentState from 'ContentState';
import type {HTMLDir} from 'UnicodeBidiDirection';

const React = require('React');

export type DraftDecoratorStrategy = (
  contentState: ContentState,
  block: BlockNodeRecord,
  callback: (start: number, end: number) => void,
) => void;

/**
 * A DraftDecorator is a strategy-component pair intended for use when
 * rendering content.
 *
 *   - A "strategy": A function that accepts a ContentBlock object and
 *     continuously executes a callback with start/end values corresponding to
 *     relevant matches in the document text. For example, getHashtagMatches
 *     uses a hashtag regex to find hashtag strings in the block, and
 *     for each hashtag match, executes the callback with start/end pairs.
 *
 *   - A "component": A React component that will be used to render the
 *     "decorated" section of text.
 *
 *   - "props": Props to be passed into the React component that will be used.
 */
export type DraftDecorator = {
  strategy: DraftDecoratorStrategy,
  component: Function,
  props?: Object,
};

/**
 * DraftDecoratorComponentProps are the core set of props that will be
 * passed to all DraftDecoratorComponents if a Custom Block Component is not used.
 * Note that a component may also accept additional props outside of this list.
 */
export type DraftDecoratorComponentProps = {
  blockKey: BlockNodeKey,
  children?: Array<React.Node>,
  contentState: ContentState,
  decoratedText: string,
  dir: ?HTMLDir,
  end: number,

  // Many folks mistakenly assume that there will always be an 'entityKey'
  // passed to a DecoratorComponent.
  // To find the `entityKey`, Draft calls
  // `contentBlock.getEntityKeyAt(leafNode)` and in many cases the leafNode does
  // not have an entityKey. In those cases the entityKey will be null or
  // undefined. That's why `getEntityKeyAt()` is typed to return `?string`.
  // See https://github.com/facebook/draft-js/blob/2da3dcb1c4c106d1b2a0f07b3d0275b8d724e777/src/model/immutable/BlockNode.js#L51
  entityKey: ?string,

  key: React.Key,
  offsetKey: string,
  start: number,
};
