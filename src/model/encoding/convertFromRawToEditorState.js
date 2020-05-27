/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 * @emails oncall+draft_js
 */

'use strict';

import type {RawDraftEditorState} from 'RawDraftEditorState';
import type {ContentState} from 'ContentState';
import type {DraftDecoratorType} from 'DraftDecoratorType';

const EditorState = require('EditorState');
const SelectionState = require('SelectionState');
const convertFromRawToDraftState = require('convertFromRawToDraftState');


const convertFromRawToEditorState = (
  rawEditorState: RawDraftEditorState,
  decorator?: ?DraftDecoratorType,
): EditorState => {
  
  let contentState:ContentState = convertFromRawToDraftState(rawEditorState.rawContent);  
  let bareEditorState:EditorState = EditorState.createWithContent(contentState, decorator);

  let createdSelectionState:SelectionState = SelectionState.createFromRaw(rawEditorState.rawSelection)

  let finalEditorState = EditorState.forceSelection(
    bareEditorState,
    createdSelectionState
  );

  return finalEditorState;

};

module.exports = convertFromRawToEditorState;
