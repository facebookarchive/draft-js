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

const convertFromHTMLToContentBlocks = require('convertFromHTMLToContentBlocks');

const IMAGE_DATA_URL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///' +
  'yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

function testConvertingAdjacentHtmlElementsToContentBlocks(
  tag: string,
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

describe('convertFromHTMLToContentBlocks', () => {
  [
    'blockquote',
    'div',
    'figure',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'li',
    'p',
    'pre',
  ].forEach(tag => testConvertingAdjacentHtmlElementsToContentBlocks(tag));

  describe('img tag', function() {
    test('img with http protocol should have camera emoji content', function() {
      const blocks = convertFromHTMLToContentBlocks(
        '<img src="http://www.facebook.com">',
      );
      expect(blocks.contentBlocks[0].text).toBe('\ud83d\udcf7');
    });

    test('img with data protocol should be correctly parsed', function() {
      const blocks = convertFromHTMLToContentBlocks(
        `<img src="${IMAGE_DATA_URL}">`,
      );
      expect(blocks.contentBlocks[0].text).toBe('\ud83d\udcf7');
    });
  });
});
