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

const BOLD = {
  fontWeight: 'bold',
};

const CODE = {
  fontFamily: 'monospace',
  wordWrap: 'break-word',
};

const ITALIC = {
  fontStyle: 'italic',
};

const STRIKETHROUGH = {
  textDecoration: 'line-through',
};

const UNDERLINE = {
  textDecoration: 'underline',
};

export const DefaultDraftInlineStyle = {
  BOLD,
  CODE,
  ITALIC,
  STRIKETHROUGH,
  UNDERLINE,
};
