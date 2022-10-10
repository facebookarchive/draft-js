/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall draft_js
 */

'use strict';

import * as React from 'react';

export type DraftBlockRenderConfig = {
  element: string,
  wrapper?: React.Node,
  aliasedElements?: Array<string>,
};
