/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * 
 */
'use strict';

var gkx = require("./gkx");

var experimentalTreeDataSupport = gkx('draft_tree_data_support');
module.exports = experimentalTreeDataSupport ? require("./DraftEditorContentsExperimental.react") : require("./DraftEditorContents-core.react");