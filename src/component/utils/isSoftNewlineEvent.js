/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict
 * @emails oncall+draft_js
 */

'use strict';

import Keys from 'Keys';

export default function isSoftNewlineEvent(
  e: SyntheticKeyboardEvent<>,
): boolean {
  return (
    e.which === Keys.RETURN &&
    (e.getModifierState('Shift') ||
      e.getModifierState('Alt') ||
      e.getModifierState('Control'))
  );
}
