/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

module.exports = {
  extends: [
    'fbjs',
    'prettier',
    'prettier/flowtype',
    'prettier/react',
    'prettier/standard',
  ],
  rules: {
    'prettier/prettier': ['error', 'fb'],
  },
  plugins: ['prettier'],
  overrides: [
    {
      files: ['examples/draft-0-10-0/**', 'examples/draft-0-9-1/**'],
      rules: {
        'prettier/prettier': 0,
        'jsx-a11y/no-static-element-interactions': 0,
        'no-console': 0,
      },
    },
  ],
};
