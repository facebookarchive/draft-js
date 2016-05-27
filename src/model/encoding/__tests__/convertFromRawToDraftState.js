/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+ui_infra
 */

jest.disableAutomock();

var ContentState = require('ContentState');
var NestedTextEditorUtil = require('NestedTextEditorUtil');

describe('convertFromRawToDraftState', () => {
  var convertFromRawToDraftState = require('convertFromRawToDraftState');

  it('should generate a ContentState', function() {
    var result = convertFromRawToDraftState({
      blocks: [
        {
          type: 'unstyled',
          text: 'Hello World'
        }
      ],
      entityMap: {}
    });

    expect(result).toEqual(jasmine.any(ContentState));
    expect(result.getBlockMap().size).toEqual(1);
  });

  it('should generate a nested ContentState', function() {
    var contentState = convertFromRawToDraftState({
      blocks: [
        {
          type: 'blockquote',
          text: '',
          blocks: [
            {
              type: 'unstyled',
              text: 'Hello'
            },
            {
              type: 'unstyled',
              text: 'World'
            }
          ]
        }
      ],
      entityMap: {}
    }, NestedTextEditorUtil.DefaultBlockRenderMap);

    expect(contentState.getBlockMap().size).toEqual(3);

    var mainBlocks = contentState.getFirstLevelBlocks();
    var mainBlock = mainBlocks.first();

    expect(mainBlocks.size).toBe(1);
    expect(mainBlock.getType()).toBe('blockquote');

    var mainKey = mainBlock.getKey();

    // Verify nesting
    var children = contentState.getBlockChildren(mainKey);
    expect(children.size).toBe(2);

    // Check order in blockMap
    expect(contentState.getKeyBefore(mainKey)).toBeFalsy();
    expect(contentState.getKeyAfter(mainKey)).toBe(children.first().getKey());
  });

});
