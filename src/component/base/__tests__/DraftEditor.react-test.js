/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+ui_infra
 * @typechecks
 */

'use strict';

jest
  .unmock('DraftEditor.react')
  .unmock('react-test-renderer/shallow')
  .unmock('generateRandomKey');

var DraftEditor = require('DraftEditor.react');
var React = require('React');

var ReactShallowRenderer = require('react-test-renderer/shallow');

describe('DraftEditor.react', () => {
  var shallow;

  beforeEach(function() {
    shallow = new ReactShallowRenderer();
  });

  describe('Basic rendering', () => {
    it('must has generated editorKey', () => {
      shallow.render(
        <DraftEditor />,
      );

      // internally at Facebook we use a newer version of the shallowRenderer
      // which has a different level of wrapping of the '_instance'
      // long term we should rewrite this test to not depend on private
      // properties
      var getEditorKey =
        shallow._instance.getEditorKey
        || shallow._instance._instance.getEditorKey;
      var key = getEditorKey();
      expect(typeof key).toBe('string');
      expect(key.length).toBeGreaterThanOrEqual(4);
    });

    it('must has editorKey same as props', () => {
      shallow.render(
        <DraftEditor editorKey="hash" />,
      );

      // internally at Facebook we use a newer version of the shallowRenderer
      // which has a different level of wrapping of the '_instance'
      // long term we should rewrite this test to not depend on private
      // properties
      var getEditorKey =
        shallow._instance.getEditorKey
        || shallow._instance._instance.getEditorKey;
      var key = getEditorKey();
      expect(key).toBe('hash');
    });
  });
});
