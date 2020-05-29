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

import type {RawDraftContentState} from 'RawDraftContentState';
import type {RawDraftSelectionState} from 'RawDraftSelectionState';

/** 
 * This object is used to create a raw editor state. It includes raw content and raw selection.
 */
export type RawDraftEditorState = {
  rawContent: RawDraftContentState,  
  rawSelection: RawDraftSelectionState
};
