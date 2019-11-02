/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
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
    'prettier/prettier': ['error'],
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
