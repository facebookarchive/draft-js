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

import UserAgent from 'UserAgent';

import isSoftNewlineEventImport from 'isSoftNewlineEvent';

const isOSX = UserAgent.isPlatform('Mac OS X');

/**
 * Check whether the ctrlKey modifier is *not* being used in conjunction with
 * the altKey modifier. If they are combined, the result is an `altGraph`
 * key modifier, which should not be handled by this set of key bindings.
 */
export function isCtrlKeyCommand(e: SyntheticKeyboardEvent<>): boolean {
  return !!e.ctrlKey && !e.altKey;
}

export function isOptionKeyCommand(e: SyntheticKeyboardEvent<>): boolean {
  return isOSX && e.altKey;
}

export function usesMacOSHeuristics(): boolean {
  return isOSX;
}

export function hasCommandModifier(e: SyntheticKeyboardEvent<>): boolean {
  return isOSX ? !!e.metaKey && !e.altKey : isCtrlKeyCommand(e);
}

export const isSoftNewlineEvent = isSoftNewlineEventImport;
