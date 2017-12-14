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

jest.mock('generateRandomKey');

const DefaultDraftBlockRenderMap = require('DefaultDraftBlockRenderMap');

const convertFromHTMLToContentBlocks = require('convertFromHTMLToContentBlocks');
const getSafeBodyFromHTML = require('getSafeBodyFromHTML');

const DEFAULT_CONFIG = {
  DOMBuilder: getSafeBodyFromHTML,
  blockRenderMap: DefaultDraftBlockRenderMap,
  experimentalTreeDataSupport: false,
};

const IMAGE_DATA_URL =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///' +
  'yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

const SUPPORTED_TAGS = [
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
];

const normalizeBlock = block => {
  const {type, depth, text, characterList} = block;

  return {
    type,
    depth,
    text,
    characterList,
  };
};

const toggleExperimentalTreeDataSupport = enabled => {
  jest.doMock('DraftFeatureFlags', () => {
    return {
      draft_tree_data_support: enabled,
    };
  });
};

beforeEach(() => {
  jest.resetModules();
});

const convertFromHTML = (html_string, config) => {
  const options = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  const {DOMBuilder, blockRenderMap, experimentalTreeDataSupport} = options;

  jest.resetModules();
  toggleExperimentalTreeDataSupport(experimentalTreeDataSupport);
  return convertFromHTMLToContentBlocks(
    html_string,
    DOMBuilder,
    blockRenderMap,
  );
};

const AreTreeBlockNodesEquivalent = (html_string, config = {}) => {
  const treeEnabled = convertFromHTML(html_string, {
    ...config,
    experimentalTreeDataSupport: true,
  }).contentBlocks.map(block => normalizeBlock(block.toJS()));

  const treeDisabled = convertFromHTML(html_string, {
    ...config,
    experimentalTreeDataSupport: false,
  }).contentBlocks.map(block => normalizeBlock(block.toJS()));

  return JSON.stringify(treeEnabled) === JSON.stringify(treeDisabled);
};

const assertConvertFromHTMLToContentBlocks = (html_string, config = {}) => {
  expect(
    convertFromHTML(html_string, config).contentBlocks.map(block =>
      block.toJS(),
    ),
  ).toMatchSnapshot();
};

const testConvertingAdjacentHtmlElementsToContentBlocks = (
  tag: string,
  experimentalTreeDataSupport?: boolean = false,
) => {
  test(`must not merge tags when converting adjacent <${tag} />`, () => {
    const html_string = `
      <${tag}>a</${tag}>
      <${tag}>b</${tag}>
    `;

    assertConvertFromHTMLToContentBlocks(
      html_string,
      experimentalTreeDataSupport,
    );
  });
};

const testConvertingHtmlElementsToContentBlocksAndRootContentBlockNodesMatch = (
  tag: string,
) => {
  test(`must convert root ContentBlockNodes to matching ContentBlock nodes for <${tag} />`, () => {
    expect(
      AreTreeBlockNodesEquivalent(`<${tag}>a</${tag}> `),
    ).toMatchSnapshot();
  });
};

SUPPORTED_TAGS.forEach(tag =>
  testConvertingAdjacentHtmlElementsToContentBlocks(tag),
);

test('img with http protocol should have camera emoji content', () => {
  const blocks = convertFromHTMLToContentBlocks(
    '<img src="http://www.facebook.com">',
  );
  expect(blocks.contentBlocks[0].text).toMatchSnapshot();
});

test('img with data protocol should be correctly parsed', () => {
  const blocks = convertFromHTMLToContentBlocks(
    `<img src="${IMAGE_DATA_URL}">`,
  );
  expect(blocks.contentBlocks[0].text).toMatchSnapshot();
});

test('converts nested html blocks when experimentalTreeDataSupport is enabled', () => {
  const html_string = `
    <blockquote>
      <h1>Hello World!</h1>
      <p>lorem ipsum</p>
    </blockquote>
  `;

  assertConvertFromHTMLToContentBlocks(html_string, {
    experimentalTreeDataSupport: true,
  });
});

test('converts text nodes to unstyled elements when leading nested blocks when experimentalTreeDataSupport is enabled', () => {
  const html_string = `
    <blockquote>
      Hello World!
      <h1>lorem ipsum</h1>
    </blockquote>
  `;

  assertConvertFromHTMLToContentBlocks(html_string, {
    experimentalTreeDataSupport: true,
  });
});

test('converts deeply nested html blocks when experimentalTreeDataSupport is enabled', () => {
  const html_string = `
    <ol>
      <li>Some quote</li>
      <li>
        <blockquote>
          <h1>Hello World!</h1>
          <p>lorem ipsum</p>
        </blockquote>
      </li>
    </ol>
  `;

  assertConvertFromHTMLToContentBlocks(html_string, {
    experimentalTreeDataSupport: true,
  });
});

test('does not convert deeply nested html blocks when experimentalTreeDataSupport is disabled', () => {
  const html_string = `
    <ol>
      <li>Some quote</li>
      <li>
        <blockquote>
          <h1>Hello World!</h1>
          <p>lorem ipsum</p>
        </blockquote>
      </li>
    </ol>
  `;

  expect(AreTreeBlockNodesEquivalent(html_string)).toMatchSnapshot();
  assertConvertFromHTMLToContentBlocks(html_string, {
    experimentalTreeDataSupport: false,
  });
});

SUPPORTED_TAGS.forEach(tag =>
  testConvertingAdjacentHtmlElementsToContentBlocks(tag, true),
);

// assert that using tree blocks and root content block nodes are equivalent
SUPPORTED_TAGS.forEach(tag =>
  testConvertingHtmlElementsToContentBlocksAndRootContentBlockNodesMatch(tag),
);

test('Should not create empty container blocks around ul and their list items', () => {
  const html_string = `
    <ul>
      <li>something</li>
    </ul>
  `;
  assertConvertFromHTMLToContentBlocks(html_string, {
    experimentalTreeDataSupport: false,
  });
});

test('Should not create empty container blocks around ul and their list items when nesting enabled', () => {
  const html_string = `
    <ul>
      <li>something</li>
    </ul>
  `;
  assertConvertFromHTMLToContentBlocks(html_string, {
    experimentalTreeDataSupport: true,
  });
});

test('Should not create empty container blocks around ol and their list items', () => {
  const html_string = `
    <ol>
      <li>something</li>
    </ol>
  `;
  assertConvertFromHTMLToContentBlocks(html_string, {
    experimentalTreeDataSupport: false,
  });
});

test('Should not create empty container blocks around ol and their list items when nesting enabled', () => {
  const html_string = `
    <ol>
      <li>something</li>
    </ol>
  `;
  assertConvertFromHTMLToContentBlocks(html_string, {
    experimentalTreeDataSupport: true,
  });
});
