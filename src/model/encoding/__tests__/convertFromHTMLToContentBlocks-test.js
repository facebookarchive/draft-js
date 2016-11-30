/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails isaac, oncall+ui_infra
 */

'use strict';

jest.disableAutomock();

const convertFromHTMLToContentBlocks = require('convertFromHTMLToContentBlocks');
const DefaultDraftBlockRenderMap = require('DefaultDraftBlockRenderMap');

function testConvertingAdjacentHtmlElementsToContentBlocks(
  tag: string
) {
  it(`must not merge tags when converting adjacent <${tag} />`, () => {
    const html_string = `
      <${tag}>a</${tag}>
      <${tag}>b</${tag}>
    `;

    const blocks = convertFromHTMLToContentBlocks(html_string);

    expect(blocks.contentBlocks.length).toBe(2);
  });
}

function performTestWithDefaultDraftBlockTags(
  testSpec: Array<Function>
) {
  DefaultDraftBlockRenderMap
    .map((config) => config.element)
    .valueSeq()
    .toSet()
    .toArray()
    .forEach(tag => testSpec.forEach(func => func(tag)));
}

describe('convertFromHTMLToContentBlocks', () => {
  performTestWithDefaultDraftBlockTags([
    testConvertingAdjacentHtmlElementsToContentBlocks,
  ]);

  testConvertingAdjacentHtmlElementsToContentBlocks('p');
});
