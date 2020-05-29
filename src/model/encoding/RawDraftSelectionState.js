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

/** 
 * This object is represents raw form of the selection state.
 * Will be used in converting editor state to raw form and recreating it using its raw form.
 */
export type RawDraftSelectionState = {
    anchorKey:String,
    focusKey:String,
    anchorOffset:Number,
    focusOffset:Number,
    isBackward:Boolean,
    hasFocus:Boolean
};
