/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {fbInternalOnly} = require('internaldocs-fb-helpers');

module.exports = {
  docs: {
    'Quick Start': [
      'getting-started',
      'quickstart-api-basics',
      'quickstart-rich-styling',
    ],
    'Advanced Topics': [
      'advanced-topics-entities',
      'v0-10-api-migration',
      'advanced-topics-decorators',
      'advanced-topics-key-bindings',
      'advanced-topics-managing-focus',
      'advanced-topics-block-styling',
      'advanced-topics-custom-block-render-map',
      'advanced-topics-block-components',
      'advanced-topics-inline-styles',
      'advanced-topics-nested-lists',
      'advanced-topics-text-direction',
      'advanced-topics-editorstate-race-conditions',
      'advanced-topics-issues-and-pitfalls',
    ],
    'API Reference': [
      'api-reference-editor',
      'api-reference-editor-change-type',
      'api-reference-editor-state',
      'api-reference-content-state',
      'api-reference-content-block',
      'api-reference-character-metadata',
      'api-reference-entity',
      'api-reference-selection-state',
      'api-reference-composite-decorator',
      'api-reference-data-conversion',
      'api-reference-rich-utils',
      'api-reference-atomic-block-utils',
      'api-reference-key-binding-util',
      'api-reference-modifier',
    ],
  },
  'fb-internal': {
    'FB Internal': fbInternalOnly([
      'fb/draft-js-g-ks',
      'fb/github-code-sync',
      'fb/impact-of-draft-js',
      'fb/importing-p-rs',
      'fb/internal-manual-test-plan',
      'fb/internal-tools-teams-using-draft-js',
      'fb/migrating-from-draft-0-9-1-to-0-10-0',
      'fb/oncall',
      'fb/opening-a-pull-request',
      'fb/releasing-a-new-version',
      'fb/triaging-issues',
      'fb/index',
    ]),
  },
};
