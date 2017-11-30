/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule wrapBlockNodes
 * @format
 * @flow
 */

'use strict';

const applyWrapperElementToSiblings = require('applyWrapperElementToSiblings');
const shouldNotAddWrapperElement = require('shouldNotAddWrapperElement');

const wrapBlockNodes = (
  nodes: [
    {
      wrapperTemplate: *,
      type: string,
    },
  ],
  contentState,
) =>
  nodes.reduce((acc, block) => {
    acc.push(block);

    console.log('yoyoyoyo', block.props.wrapperTemplate);

    if (
      !block.props.wrapperTemplate ||
      shouldNotAddWrapperElement(block.props.block, contentState)
    ) {
      return acc;
    }

    applyWrapperElementToSiblings(block.wrapperTemplate, block.type, acc);

    return acc;
  }, []);

module.exports = wrapBlockNodes;
