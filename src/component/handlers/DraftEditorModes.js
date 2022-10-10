/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 * @oncall draft_js
 */

'use strict';

export type DraftEditorModes =
  /**
   * `edit` is the most common mode for text entry. This includes most typing,
   * deletion, cut/copy/paste, and other behaviors.
   */
  | 'edit'

  /**
   * `composite` mode handles IME text entry.
   */
  | 'composite'

  /**
   * `drag` mode handles editor behavior while a drag event is occurring.
   */
  | 'drag'

  /**
   * `cut` mode allows us to effectively ignore all edit behaviors while the`
   * browser performs a native `cut` operation on the DOM.
   */
  | 'cut'

  /**
   * `render` mode is the normal "null" mode, during which no edit behavior is
   * expected or observed.
   */
  | 'render';
