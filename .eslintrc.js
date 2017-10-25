/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

 const variableNamePattern = String.raw`\s*[a-zA-Z_$][a-zA-Z_$\d]*\s*`;
 const maxLenIgnorePattern = String.raw`^(?:var|let|const|import type)\s+` +
   '{?' + variableNamePattern + '(?:,' + variableNamePattern + ')*}?' +
   String.raw`\s*(?:=\s*require\(|from)[a-zA-Z_+./"'\s\d\-]+\)?[^;\n]*[;\n]`;

module.exports = {
  extends: [
    'fbjs',
    'prettier',
  ],
  rules: {
    'prettier/prettier': ['error', 'fb'],
  },
  plugins: [
    'prettier'
  ]
};
