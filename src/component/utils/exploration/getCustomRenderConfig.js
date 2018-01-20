/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getCustomRenderConfig
 * @format
 * @flow
 *
 * This is unstable and not part of the public API and should not be used by
 * production systems. This file may be update/removed without notice.
 */

'use strict';

import type {BlockNodeRecord} from 'BlockNodeRecord';
type BlockRenderFn = (block: BlockNodeRecord) => ?Object;
type CustomRenderConfig = Object;

const getCustomRenderConfig = (
  block: BlockNodeRecord,
  blockRendererFn: BlockRenderFn,
): CustomRenderConfig => {
  const customRenderer = blockRendererFn(block);

  if (!customRenderer) {
    return {};
  }

  const {
    component: CustomComponent,
    props: customProps,
    editable: customEditable,
  } = customRenderer;

  return {
    CustomComponent,
    customProps,
    customEditable,
  };
};

module.exports = getCustomRenderConfig;
