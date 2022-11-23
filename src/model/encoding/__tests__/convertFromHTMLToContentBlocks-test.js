/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall draft_js
 */

'use strict';

expect.addSnapshotSerializer(require('NonASCIIStringSnapshotSerializer'));

jest.mock('generateRandomKey');

const DefaultDraftBlockRenderMap = require('DefaultDraftBlockRenderMap');

const convertFromHTMLToContentBlocks = require('convertFromHTMLToContentBlocks');
const cx = require('cx');
const getSafeBodyFromHTML = require('getSafeBodyFromHTML');
const mockUUID = require('mockUUID');

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

const normalizeBlock = (block: $FlowFixMe) => {
  const {type, depth, text, characterList} = block;

  return {
    type,
    depth,
    text,
    characterList,
  };
};

const toggleExperimentalTreeDataSupport = (enabled: $FlowFixMe) => {
  jest.doMock('gkx', () => name => {
    if (name === 'draftjs_paste_emojis') {
      return true;
    }
    if (name === 'draft_tree_data_support') {
      return enabled;
    }
    return false;
  });
};

beforeEach(() => {
  jest.resetModules();
  jest.mock('uuid', () => mockUUID);
});

const convertFromHTML = (
  html_string: string | $TEMPORARY$string<'a\n'>,
  config:
    | void
    | $TEMPORARY$object<{...}>
    | $TEMPORARY$object<{experimentalTreeDataSupport: boolean}>
    | $TEMPORARY$object<{experimentalTreeDataSupport: boolean, ...}>,
) => {
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

const AreTreeBlockNodesEquivalent = (
  html_string: string,
  config: $TEMPORARY$object<{...}> = {},
) => {
  const treeEnabled = (
    convertFromHTML(html_string, {
      ...config,
      experimentalTreeDataSupport: true,
    })?.contentBlocks || []
  ).map(block => normalizeBlock(block.toJS()));

  const treeDisabled = (
    convertFromHTML(html_string, {
      ...config,
      experimentalTreeDataSupport: false,
    })?.contentBlocks || []
  ).map(block => normalizeBlock(block.toJS()));

  return JSON.stringify(treeEnabled) === JSON.stringify(treeDisabled);
};

const assertConvertFromHTMLToContentBlocks = (
  html_string: string,
  config:
    | $TEMPORARY$object<{...}>
    | $TEMPORARY$object<{experimentalTreeDataSupport: boolean}> = {},
) => {
  expect(
    (convertFromHTML(html_string, config)?.contentBlocks || []).map(block =>
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

    assertConvertFromHTMLToContentBlocks(html_string, {
      experimentalTreeDataSupport,
    });
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
  expect(blocks?.contentBlocks?.[0].text).toMatchSnapshot();
  const entityMap = blocks?.entityMap;
  expect(entityMap).not.toBe(null);
  if (entityMap != null) {
    expect(entityMap.last().mutability).toBe('IMMUTABLE');
  }
});

test('img with https protocol should have camera emoji content', () => {
  const blocks = convertFromHTMLToContentBlocks(
    '<img src="https://www.facebook.com">',
  );
  expect(blocks?.contentBlocks?.[0].text).toMatchSnapshot();
  const entityMap = blocks?.entityMap;
  expect(entityMap).not.toBe(null);
  if (entityMap != null) {
    expect(entityMap.last().mutability).toBe('IMMUTABLE');
  }
});

test('img with alt text should have alt text as placeholder', () => {
  const blocks = convertFromHTMLToContentBlocks(
    '<img alt="facebook website" src="https://www.facebook.com">',
  );
  expect(blocks?.contentBlocks?.[0].text).toMatchSnapshot();
  const entityMap = blocks?.entityMap;
  expect(entityMap).not.toBe(null);
  if (entityMap != null) {
    expect(entityMap.last().mutability).toBe('IMMUTABLE');
  }
});

test('img with empty alt text should have camera emoji content', () => {
  const blocks = convertFromHTMLToContentBlocks(
    '<img alt="" src="https://www.facebook.com">',
  );
  expect(blocks?.contentBlocks?.[0].text).toMatchSnapshot();
  const entityMap = blocks?.entityMap;
  expect(entityMap).not.toBe(null);
  if (entityMap != null) {
    expect(entityMap.last().mutability).toBe('IMMUTABLE');
  }
});

test('img with data protocol should be correctly parsed', () => {
  const blocks = convertFromHTMLToContentBlocks(
    `<img src="${IMAGE_DATA_URL}">`,
  );
  expect(blocks?.contentBlocks?.[0].text).toMatchSnapshot();
});

test('line break should be correctly parsed - single <br>', () => {
  const blocks = convertFromHTMLToContentBlocks(
    `<div>
      <b>Hello World!</b>
      <br />
      lorem ipsum
    </div>`,
  );
  expect(blocks?.contentBlocks).toMatchSnapshot();
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
  expect(blocks?.contentBlocks).toMatchSnapshot();
});

test('highlighted text should be recognized and considered styled characters', () => {
  const blocks = convertFromHTMLToContentBlocks(`<mark>test</mark>`);
  expect(blocks?.contentBlocks).toMatchSnapshot();
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

test('eliminates useless blocks when experimentalTreeDataSupport is disabled', () => {
  const html_string = `
    <div>
      <div>
        <div>Hello</div>
      </div>
      <div>World</div>
    </div>
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

// Regression test for issue https://github.com/facebook/draft-js/issues/1822
test('Should convert heading block after converting new line string', () => {
  // Convert an HTML string containing a newline
  // This was previously altering the module's internal state
  convertFromHTML('a\n');
  // Convert again, and assert this is not affected by the previous conversion
  const contentBlocks = convertFromHTML('<h1>heading</h1>')?.contentBlocks;
  expect(contentBlocks?.length).toBe(1);
  const contentBlock = contentBlocks?.[0];
  // #FIXME: Flow does not yet support method or property calls in optional chains.
  if (contentBlock != null) {
    expect(contentBlock.getType()).toBe('header-one');
    expect(contentBlock.getText()).toBe('heading');
  }
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

test('Should scope attribute styles', () => {
  const html_string = `
    <span style="font-weight: 700">these</span>
    <span style="font-style: italic">won't</span>
    <span style="text-decoration: underline">accumulate styles</span>
    <span style="font-weight: 700">
      <span style="font-style: italic">
        <span style="text-decoration: underline">
          <span>but this span will</span>
        </span>
      </span>
    </span>
  `;

  assertConvertFromHTMLToContentBlocks(html_string, {
    experimentalTreeDataSupport: true,
  });
});

test('Should properly handle nested attribute styles', () => {
  const html_string = [
    '<span style="font-weight: bold">',
    '<span>bold</span>',
    '<span style="font-weight: normal">not bold</span>',
    '<span>bold again</span>',
    '</span>',
  ].join('');

  assertConvertFromHTMLToContentBlocks(html_string, {
    experimentalTreeDataSupport: false,
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

test('Should import two blockquotes without extra line breaks', () => {
  const html_string = `
    <blockquote>
      <div>
        <span>First</span>
      </div>
    </blockquote
    <blockquote>
      <div>
        <span>Second</span>
      </div>
    </blockquote>
  `;
  assertConvertFromHTMLToContentBlocks(html_string, {
    experimentalTreeDataSupport: false,
  });
});

test('Should recognize preformatted blocks', () => {
  const html_string = `
    <meta charset='utf-8'><span style="font-family: system-ui, -apple-system, system-ui, &quot;.SFNSText-Regular&quot;, sans-serif; font-variant-ligatures: normal; white-space: pre-wrap; display: inline !important;">following some pre </span><span style="font-family: Menlo, Consolas, Monaco, monospace; white-space: pre-line;">some_code_stuff</span>
  `;
  assertConvertFromHTMLToContentBlocks(html_string, {
    experimentalTreeDataSupport: false,
  });
});

test('Should recognize preformatted blocks mixed other styles', () => {
  const html_string = `
    <meta charset='utf-8'><span style="font-family: system-ui, -apple-system, system-ui, &quot;.SFNSText-Regular&quot;, sans-serif; font-size: 14px; font-weight: 400; white-space: pre-wrap; display: inline !important;">example </span><span style="font-weight: 600; font-family: Menlo, Consolas, Monaco, monospace; white-space: pre-line;">bold</span><span style="font-family: Menlo, Consolas, Monaco, monospace; white-space: pre-line; font-weight: 400;"> and code</span>
  `;
  assertConvertFromHTMLToContentBlocks(html_string, {
    experimentalTreeDataSupport: false,
  });
});
