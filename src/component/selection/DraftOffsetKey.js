/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 * @emails oncall+draft_js
 */

'use strict';

import type {DraftOffsetKeyPath} from 'DraftOffsetKeyPath';

const KEY_DELIMITER = '-';

const DraftOffsetKey = {
  encode: function(
    blockKey: string,
    decoratorKey: number,
    leafKey: number,
  ): string {
    return blockKey + KEY_DELIMITER + decoratorKey + KEY_DELIMITER + leafKey;
  },

  decode: function(offsetKey: string): DraftOffsetKeyPath {
    const keyComponents = offsetKey.split(KEY_DELIMITER);
    const blockKey = keyComponents
      .slice(0, keyComponents.length - 2)
      .join(KEY_DELIMITER);

    const [decoratorKey, leafKey] = keyComponents.slice(
      keyComponents.length - 2,
    );

    return {
      blockKey,
      decoratorKey: parseInt(decoratorKey, 10),
      leafKey: parseInt(leafKey, 10),
    };
  },
};

module.exports = DraftOffsetKey;
