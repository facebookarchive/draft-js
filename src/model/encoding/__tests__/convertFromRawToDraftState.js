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

const ContentState = require('ContentState');
const NestedTextEditorUtil = require('NestedTextEditorUtil');

describe('convertFromRawToDraftState', () => {
  const convertFromRawToDraftState = require('convertFromRawToDraftState');

  it('should generate a ContentState', () => {
    const result = convertFromRawToDraftState({
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

  it('should generate a nested ContentState', () => {
    const contentState = convertFromRawToDraftState({
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

    const mainBlocks = contentState.getFirstLevelBlocks();
    const mainBlock = mainBlocks.first();

    expect(mainBlocks.size).toBe(1);
    expect(mainBlock.getType()).toBe('blockquote');

    const mainKey = mainBlock.getKey();

    // Verify nesting
    const children = contentState.getBlockChildren(mainKey);
    expect(children.size).toBe(2);

    // Check order in blockMap
    expect(contentState.getKeyBefore(mainKey)).toBeFalsy();
    expect(contentState.getKeyAfter(mainKey)).toBe(children.first().getKey());
  });

});
