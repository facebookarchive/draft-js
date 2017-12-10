/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getElementPropsConfig
 * @format
 * @flow
 *
 * This is unstable and not part of the public API and should not be used by
 * production systems. This file may be update/removed without notice.
 */

'use strict';

import type {BlockNodeRecord} from 'BlockNodeRecord';

type BlockStyleFn = (block: BlockNodeRecord) => string;

const getElementPropsConfig = (
  block: BlockNodeRecord,
  editorKey: string,
  offsetKey: string,
  blockStyleFn: BlockStyleFn,
  customConfig: *,
): Object => {
  let elementProps: Object = {
    'data-block': true,
    'data-editor': editorKey,
    'data-offset-key': offsetKey,
    key: block.getKey(),
  };
  const customClass = blockStyleFn(block);

  if (customClass) {
    elementProps.className = customClass;
  }

  if (customConfig.customEditable !== undefined) {
    elementProps = {
      ...elementProps,
      contentEditable: customConfig.customEditable,
      suppressContentEditableWarning: true,
    };
  }

  return elementProps;
};

module.exports = getElementPropsConfig;
