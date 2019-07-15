/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+draft_js
 * @format
 */

'use strict';

jest.disableAutomock();

jest.mock('generateRandomKey');

const DefaultDraftBlockRenderMap = require('DefaultDraftBlockRenderMap');

const convertFromHTMLToContentBlocks = require('convertFromHTMLToContentBlocks2');
const cx = require('cx');
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
  jest.doMock('gkx', () => name => {
    if (name === 'draft_tree_data_support') {
      return enabled;
    }
    if (name === 'draftjs_fix_paste_for_img') {
      return true;
    }
    return false;
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

test('img with role presentation should not be rendered', () => {
  const blocks = convertFromHTMLToContentBlocks(
    `<img src="${IMAGE_DATA_URL}" role="presentation">`,
  );
  expect(blocks.contentBlocks).toMatchSnapshot();
});

test('line break should be correctly parsed - single <br>', () => {
  const blocks = convertFromHTMLToContentBlocks(
    `<div>
      <b>Hello World!</b>
      <br />
      lorem ipsum
    </div>`,
  );
  expect(blocks.contentBlocks).toMatchSnapshot();
});

test('line break should be correctly parsed - multiple <br> in a content block', () => {
  const blocks = convertFromHTMLToContentBlocks(
    `<div>
      <b>Hello World!</b>
      <br />
      <br />
      lorem ipsum
    </div>`,
  );
  expect(blocks.contentBlocks).toMatchSnapshot();
});

test('highlighted text should be recognized and considered styled characters', () => {
  const blocks = convertFromHTMLToContentBlocks(`<mark>test</mark>`);
  expect(blocks.contentBlocks).toMatchSnapshot();
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

test('Should preserve entities for whitespace-only content', () => {
  const html_string = `
    <a href="http://www.facebook.com">
      <b>before</b> <b>after</b>
    </a>
  `;
  assertConvertFromHTMLToContentBlocks(html_string, {
    experimentalTreeDataSupport: false,
  });
});

test('Should import recognised draft li depths when nesting disabled', () => {
  const html_string = `
    <ul>
      <li class="${cx('public/DraftStyleDefault/depth0')}">depth0</li>
      <li class="${cx('public/DraftStyleDefault/depth1')}">depth1</li>
      <li class="${cx('public/DraftStyleDefault/depth2')}">depth2</li>
      <li class="${cx('public/DraftStyleDefault/depth3')}">depth3</li>
      <li class="${cx('public/DraftStyleDefault/depth4')}">depth4</li>
    </ul>
  `;
  assertConvertFromHTMLToContentBlocks(html_string, {
    experimentalTreeDataSupport: false,
  });
});

test('Should *not* import recognised draft li depths when nesting enabled', () => {
  const html_string = `
    <ul>
      <li class="${cx('public/DraftStyleDefault/depth0')}">depth0-0</li>
      <li class="${cx('public/DraftStyleDefault/depth1')}">depth0-1</li>
      <li class="${cx('public/DraftStyleDefault/depth2')}">depth0-2</li>
      <li class="${cx('public/DraftStyleDefault/depth3')}">depth0-3</li>
      <li class="${cx('public/DraftStyleDefault/depth4')}">depth0-4</li>
    </ul>
  `;
  assertConvertFromHTMLToContentBlocks(html_string, {
    experimentalTreeDataSupport: true,
  });
});

test('Should preserve spacing around inline tags', () => {
  const html_string = `
    <span>Some<span> </span></span><i>stylised</i><span><span> </span></span><b>text</b>
  `;
  assertConvertFromHTMLToContentBlocks(html_string, {
    experimentalTreeDataSupport: true,
  });
});

test('Should recognized list deep nesting', () => {
  const html_string = `
    <ul>
      <li>depth0-0</li>
      <li>depth0-1</li>
      <ul>
        <li>depth1-0</li>
      </ul>
      <ol>
        <li>depth1-1</li>
        <ul>
          <li>depth2-0</li>
          <li>depth2-1</li>
        </ul>
      </ol>
      <li>depth0-2</li>
    </ul>
    <ol>
      <li>depth0-3</li>
    </ol>
  `;
  assertConvertFromHTMLToContentBlocks(html_string, {
    experimentalTreeDataSupport: false,
  });
});

test('Should recognized list deep nesting when nesting enabled', () => {
  const html_string = `
    <ul>
      <li>depth0-0</li>
      <li>depth0-1</li>
      <ul>
        <li>depth1-0</li>
      </ul>
      <ol>
        <li>depth1-1</li>
        <ul>
          <li>depth2-0</li>
          <li>depth2-1</li>
        </ul>
      </ol>
      <li>depth0-2</li>
    </ul>
    <ol>
      <li>depth0-3</li>
    </ol>
  `;
  assertConvertFromHTMLToContentBlocks(html_string, {
    experimentalTreeDataSupport: true,
  });
});

test('Should recognized and override html structure when having known draft-js classname with nesting disabled', () => {
  const html_string = `
    <ul>
      <li class="${cx('public/DraftStyleDefault/depth0')}">depth0</li>
      <ul>
        <li class="${cx('public/DraftStyleDefault/depth1')}">depth1</li>
        <li class="${cx('public/DraftStyleDefault/depth2')}">depth2</li>
      </ul>
      <li class="${cx('public/DraftStyleDefault/depth3')}">depth3</li>
    </ul>
  `;
  assertConvertFromHTMLToContentBlocks(html_string, {
    experimentalTreeDataSupport: false,
  });
});

test('Should recognized and *not* override html structure when having known draft-js classname with nesting enabled', () => {
  const html_string = `
    <ul>
      <li class="${cx('public/DraftStyleDefault/depth0')}">depth0-0</li>
      <ul>
        <li class="${cx('public/DraftStyleDefault/depth1')}">depth1-0</li>
        <li class="${cx('public/DraftStyleDefault/depth2')}">depth1-1</li>
      </ul>
      <li class="${cx('public/DraftStyleDefault/depth3')}">depth0-1</li>
    </ul>
  `;
  assertConvertFromHTMLToContentBlocks(html_string, {
    experimentalTreeDataSupport: true,
  });
});

test('Should import line breaks without creating a leading space', () => {
  const html_string = `
    Line 1<br/>
    Line 2<br/>
    Line 3
  `;
  assertConvertFromHTMLToContentBlocks(html_string, {
    experimentalTreeDataSupport: false,
  });
});
