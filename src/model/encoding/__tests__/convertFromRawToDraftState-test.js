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

'use strict';

jest.disableAutomock();

const convertFromRawToDraftState = require('convertFromRawToDraftState');

describe('convertFromRawToDraftState', () => {
  it('must map falsey block types to default value of unstyled', () => {
    const rawState = {
      blocks: [
        {text: 'AAAA'},
        {text: 'BBBB', type: null},
        {text: 'CCCC', type: undefined},
      ],
      entityMap: {},
    };

    const contentState = convertFromRawToDraftState(rawState);
    const blockMap = contentState.getBlockMap();
    blockMap.forEach(block => expect(block.type).toEqual('unstyled'));
  });
});
