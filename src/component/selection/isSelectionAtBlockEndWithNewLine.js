'use strict';

import type EditorState from 'EditorState';

function isSelectionAtBlockEndWithNewLine(editorState: EditorState): boolean {
  const selection = editorState.getSelection();
  const anchorKey = selection.getAnchorKey();
  const offset = selection.getStartOffset();

  const block = editorState.getCurrentContent().getBlockForKey(anchorKey);

  return block.getLength() === offset && block.getText()[offset - 1] === '\n';
}

module.exports = isSelectionAtBlockEndWithNewLine;
