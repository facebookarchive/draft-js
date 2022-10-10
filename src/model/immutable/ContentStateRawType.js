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

import type {BlockNodeRawConfig} from 'BlockNode';

export type ContentStateRawType = {
  entityMap: ?{...},
  blockMap: ?Map<string, BlockNodeRawConfig>,
  selectionBefore: ?{...},
  selectionAfter: ?{...},
  ...
};
