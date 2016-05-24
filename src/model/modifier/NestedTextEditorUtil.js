/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule NestedTextEditorUtil
 * @typechecks
 * @flow
 */

const Immutable = require('immutable');
const EditorState = require('EditorState');
const splitBlockInContentState = require('splitBlockInContentState');
const splitBlockWithNestingInContentState = require('splitBlockWithNestingInContentState');
const DefaultDraftBlockRenderMap = require('DefaultDraftBlockRenderMap');

import type {DraftEditorCommand} from 'DraftEditorCommand';
import type {DraftBlockRenderMap} from 'DraftBlockRenderMap';


const enabledNestingConfiguration = {
  nestingEnabled: true
};

const defaultEnabledBlocks = [
  'unordered-list-item',
  'ordered-list-item',
  'blockquote',
];

const DefaultBlockRenderMap = Immutable.Map(
  DefaultDraftBlockRenderMap.keySeq().toArray().reduce((o, v, i) => {
    // we are manually enabling all default draft blocks to support nesting for this example
    const blockExtendConfiguration = (
      defaultEnabledBlocks.indexOf(v) !== -1 ?
        enabledNestingConfiguration :
        {}
    );

    o[v] = Object.assign({}, DefaultDraftBlockRenderMap.get(v), blockExtendConfiguration);
    return o;
  }, {
    'table': {
      element: 'table',
      nestingEnabled: true
    },
    'table-body': {
      element: 'tbody',
      nestingEnabled: true
    },
    'table-header': {
      element: 'thead',
      nestingEnabled: true
    },
    'table-cell': {
      element: 'td',
      nestingEnabled: true
    },
    'table-row': {
      element: 'tr',
      nestingEnabled: true
    }
  })
);

const NestedTextEditorUtil = {
  DefaultBlockRenderMap: DefaultBlockRenderMap,

  handleKeyCommand: function(
    editorState: EditorState,
    blockRenderMap: DraftBlockRenderMap,
    command: DraftEditorCommand
  ): ?EditorState {
    var selectionState = editorState.getSelection();
    var contentState = editorState.getCurrentContent();
    var key = selectionState.getAnchorKey();

    var currentBlock = contentState.getBlockForKey(key);
    var nestedBlocks = contentState.getBlockChildren(key);

    // Option of rendering for the current block
    var renderOpt = blockRenderMap.get(currentBlock.getType());
    var hasNestingEnabled = renderOpt && renderOpt.nestingEnabled;

    // Press enter
    if (command === 'split-block') {
      var nextBlock = contentState.getBlockAfter(key);

      // In an empty last nested block
      if (currentBlock.hasParent()
      && currentBlock.getLength() === 0
      && (!nextBlock || nextBlock.getParentKey() !== currentBlock.getParentKey())) {
        command = 'split-parent-block';
      }

      // In a block that already have some nested blocks
      if (command === 'split-block' && nestedBlocks.size > 0) {
        command = 'split-nested-block';
      }
    }

    // Prevent creation of nested blocks
    if (!hasNestingEnabled && command == 'split-nested-block') {
      command = 'split-block'
    }

    switch (command) {
      case 'split-block':
        contentState = splitBlockInContentState(contentState, selectionState);
        return EditorState.push(editorState, contentState, 'split-block');

      case 'split-nested-block':
        contentState = splitBlockWithNestingInContentState(contentState, selectionState);
        return EditorState.push(editorState, contentState, 'split-block');

      case 'split-parent-block':
        var parentKey = currentBlock.getParentKey();

        // Split parent block
        var parentSelection = selectionState.merge({
          anchorKey: parentKey,
          anchorOffset: 0,
          focusKey: parentKey,
          focusOffset: 0,
          isBackward: false,
        });
        contentState = splitBlockInContentState(contentState, parentSelection);

        // Remove current block (the empty one)
        contentState = contentState.set('blockMap',
          contentState.getBlockMap()
          .filter(block => block !== currentBlock)
        );

        return EditorState.push(editorState, contentState, 'split-block');

      default:
        return null;
    }
  },

  keyBinding: function(e: SyntheticKeyboardEvent) {
    if (e.keyCode === 13 /* `Enter` key */ && e.shiftKey) {
      return 'split-nested-block';
    }
  }

};

module.exports = NestedTextEditorUtil;
