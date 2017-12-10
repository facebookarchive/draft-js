/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getDraftRenderConfig
 * @format
 * @flow
 *
 * This is unstable and not part of the public API and should not be used by
 * production systems. This file may be update/removed without notice.
 */

'use strict';

import type {BlockNodeRecord} from 'BlockNodeRecord';
import type {DraftBlockRenderMap} from 'DraftBlockRenderMap';

type DraftRenderConfig = Object;

const getDraftRenderConfig = (
  block: BlockNodeRecord,
  blockRenderMap: DraftBlockRenderMap,
): DraftRenderConfig => {
  const configForType =
    blockRenderMap.get(block.getType()) || blockRenderMap.get('unstyled');

  const wrapperTemplate = configForType.wrapper;
  const Element =
    configForType.element || blockRenderMap.get('unstyled').element;

  return {
    Element,
    wrapperTemplate,
  };
};

module.exports = getDraftRenderConfig;
