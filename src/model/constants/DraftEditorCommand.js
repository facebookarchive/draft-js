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

/**
 * A set of editor commands that may be invoked by keyboard commands or UI
 * controls. These commands should map to operations that modify content or
 * selection state and update the editor state accordingly.
 */
export type DraftEditorCommand =
  /**
   * Self-explanatory.
   */
  | 'undo'
  | 'redo'

  /**
   * Perform a forward deletion.
   */
  | 'delete'

  /**
   * Perform a forward deletion to the next word boundary after the selection.
   */
  | 'delete-word'

  /**
   * Perform a backward deletion.
   */
  | 'backspace'

  /**
   * Perform a backward deletion to the previous word boundary before the
   * selection.
   */
  | 'backspace-word'

  /**
   * Perform a backward deletion to the beginning of the current line.
   */
  | 'backspace-to-start-of-line'

  /**
   * Toggle styles. Commands may be intepreted to modify inline text ranges
   * or block types.
   */
  | 'bold'
  | 'italic'
  | 'underline'
  | 'code'

  /**
   * Split a block in two.
   */
  | 'split-block'

  /**
   * Self-explanatory.
   */
  | 'transpose-characters'
  | 'move-selection-to-start-of-block'
  | 'move-selection-to-end-of-block'

  /**
   * Commands to support the "secondary" clipboard provided by certain
   * browsers and operating systems.
   */
  | 'secondary-cut'
  | 'secondary-paste';
