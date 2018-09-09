/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 * @flow
 */

'use strict';

const gkx = require('gkx');

const experimentalTreeDataSupport = gkx('draft_tree_data_support');

module.exports = experimentalTreeDataSupport
  ? require('DraftEditorContentsExperimental.react')
  : require('DraftEditorContents-core.react');
