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
  .unmock('generateRandomKey');

var React = require('React');
var ReactTestUtils = require('ReactTestUtils');

var DraftEditor = require('DraftEditor.react');

describe('DraftEditor.react', () => {
  var shallow;

  beforeEach(function() {
    shallow = ReactTestUtils.createRenderer();
  });

  describe('Basic rendering', () => {
    it('must has generated editorKey', () => {
      shallow.render(
        <DraftEditor />,
      );
     
      var key = shallow._instance._instance.getEditorKey();
      expect(typeof key).toBe('string');
      expect(key.length).toBeGreaterThanOrEqual(4);
    });

    it('must has editorKey same as props', () => {
      shallow.render(
        <DraftEditor editorKey="hash" />,
      );
      
      var key = shallow._instance._instance.getEditorKey();
      expect(key).toBe('hash');
    });
  });
});
