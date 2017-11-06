/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+ui_infra
 * @format
 */

'use strict';

jest.disableAutomock();

const getSampleStateForTesting = require('getSampleStateForTesting');
const convertFromDraftStateToRaw = require('convertFromDraftStateToRaw');

const {contentState} = getSampleStateForTesting();

const assertConvertFromDraftStateToRaw = (content = contentState) => {
  expect(convertFromDraftStateToRaw(content)).toMatchSnapshot();
};

test('must be able to convert from draft state with ContentBlock to raw', () => {
  assertConvertFromDraftStateToRaw();
});
