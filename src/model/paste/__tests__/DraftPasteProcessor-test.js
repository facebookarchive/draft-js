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

const DraftPasteProcessor = require('DraftPasteProcessor');

const Immutable = require('immutable');

const {OrderedSet, Map} = Immutable;

const CUSTOM_BLOCK_MAP = Map({
  'header-one': {
    element: 'h1',
  },
  'header-two': {
    element: 'h2',
  },
  'header-three': {
    element: 'h3',
  },
  'unordered-list-item': {
    element: 'li',
  },
  'ordered-list-item': {
    element: 'li',
  },
  blockquote: {
    element: 'blockquote',
  },
  'code-block': {
    element: 'pre',
  },
  paragraph: {
    element: 'p',
  },
  unstyled: {
    element: 'div',
  },
});

const EMPTY_CHAR_METADATA = OrderedSet();

const toggleExperimentalTreeDataSupport = enabled => {
  jest.doMock('gkx', () => name => {
    return name === 'draft_tree_data_support' ? enabled : false;
  });
};

const assertDraftPasteProcessorProcessText = (
  textBlocks,
  experimentalTreeDataSupport = false,
) => {
  toggleExperimentalTreeDataSupport(experimentalTreeDataSupport);
  const contentBlocks = DraftPasteProcessor.processText(
    textBlocks,
    EMPTY_CHAR_METADATA,
    'unstyled',
  );
  expect(contentBlocks.map(block => block.toJS())).toMatchSnapshot();
};

const assertDraftPasteProcessorProcessHTML = (
  html,
  blockMap = CUSTOM_BLOCK_MAP,
  experimentalTreeDataSupport = false,
) => {
  toggleExperimentalTreeDataSupport(experimentalTreeDataSupport);
  const {contentBlocks} = DraftPasteProcessor.processHTML(html, blockMap);
  expect(contentBlocks.map(block => block.toJS())).toMatchSnapshot();
};

beforeEach(() => {
  jest.resetModules();
});

test('must identify italics text', () => {
  assertDraftPasteProcessorProcessHTML(`
    <i>hello</i> hi
  `);
});

test('must identify overlapping inline styles', () => {
  assertDraftPasteProcessorProcessHTML(`
    <i>
      <b>he</b>
      hi
    </i>
  `);
});

test('must identify block styles', () => {
  assertDraftPasteProcessorProcessHTML(`
    <ol>
      <li>hi</li>
      <li>there</li>
    </ol>
  `);
});

test('must collapse nested blocks to the topmost level', () => {
  assertDraftPasteProcessorProcessHTML(`
    <ul>
      <li>
        <h2>what</h2>
      </li>
    </ul>
  `);
});

/**
 * todo: azelenskiy
 * Changes to the mocked DOM appear to have broken this.
 *
 * test('must suppress blocks nested inside other blocks', () => {
 *   const html = '<p><h2>Some text here</h2> more text here </p>';
 *   const output = DraftPasteProcessor.processHTML(html, CUSTOM_BLOCK_MAP);
 *   assertBlockTypes(output, [
 *   'unstyled',
 *   ]);
 * });
 */

test('must detect two touching blocks', () => {
  assertDraftPasteProcessorProcessHTML(`
    <h1>hi</h1>
    <h2>hi</h2>
  `);
});

test('must insert a block when needed', () => {
  assertDraftPasteProcessorProcessHTML(`
    <h1> hi </h1>
    <h1> </h1>
    <span> whatever </span>
    <h2>hi </h2>
  `);
});

test('must not generate fake blocks on heavy nesting', () => {
  assertDraftPasteProcessorProcessHTML(`
    <p>
      <span>
        <span>
          <span>Word</span>
        </span>
      </span>
      <span>
        <span>,</span>
      </span>
    </p>
  `);
});

test('must preserve spaces', () => {
  assertDraftPasteProcessorProcessHTML(`<span>hello</span> <span>hi</span>`);
  assertDraftPasteProcessorProcessHTML(`<span>hello </span><span>hi</span>`);
  assertDraftPasteProcessorProcessHTML(`<span>hello</span><span> hi</span>`);
});

test('must treat divs as Ps when we do not have semantic markup', () => {
  assertDraftPasteProcessorProcessHTML(`
    <div>hi</div>
    <div>hello</div>
  `);
});

test('must NOT treat divs as Ps when we pave Ps', () => {
  assertDraftPasteProcessorProcessHTML(`
    <div>
      <p>hi</p>
      <p>hello</p>
    </div>
  `);
});

test('must replace br tags with soft newlines', () => {
  assertDraftPasteProcessorProcessHTML(`
    hi<br>hello
  `);
});

test('must strip xml carriages and zero width spaces', () => {
  assertDraftPasteProcessorProcessHTML(`
    hi&#13;&#8203;hello
  `);
});

test('must split unstyled blocks on two br tags', () => {
  assertDraftPasteProcessorProcessHTML(`
    hi<br><br>hello
  `);
});

test('must NOT split unstyled blocks inside a styled block', () => {
  assertDraftPasteProcessorProcessHTML(`
    <pre>
      hi<br><br>hello
    </pre>
  `);
});

test('must replace newlines in regular tags', () => {
  assertDraftPasteProcessorProcessHTML(`
    <div>
      hello\nthere
    </div>
  `);
});

test('must preserve newlines in pre tags', () => {
  assertDraftPasteProcessorProcessHTML(`
    <pre>
      hello\nthere
    </pre>
  `);
});

test('must preserve newlines in whitespace in pre tags', () => {
  assertDraftPasteProcessorProcessHTML(`
    <pre>
      <span>hello</span>\n<span>there</span>
    </pre>
  `);
});

test('must parse based on style attribute', () => {
  assertDraftPasteProcessorProcessHTML(`
    <span style="font-weight: bold;">
      Bold <span style="font-style: italic;">Italic </span>
    </span>.
  `);
});

test('must detect links in pasted content', () => {
  assertDraftPasteProcessorProcessHTML(`
    This is a <a href="http://www.facebook.com">link</a>, yep.
  `);
});

test('must preserve styles inside links in a good way', () => {
  assertDraftPasteProcessorProcessHTML(`
    A <a href="http://www.facebook.com"><i>cool</i> link</a>, yep.
  `);
});

test('must ignore links that do not actually link anywhere', () => {
  assertDraftPasteProcessorProcessHTML(`
    This is a <a>link</a>, yep.
  `);
});

test('must ignore javascript: links', () => {
  assertDraftPasteProcessorProcessHTML(`
    This is a <a href="javascript:void(0)">link</a>, yep.
  `);
});

test('must preserve mailto: links', () => {
  assertDraftPasteProcessorProcessHTML(`
    This is a <a href="mailto:example@example.com">link</a>, yep.
  `);
});

test('Tolerate doule BR tags separated by whitespace', () => {
  assertDraftPasteProcessorProcessHTML(`
    hi<br>  <br>hello
  `);
});

test('Strip whitespace after block dividers', () => {
  assertDraftPasteProcessorProcessHTML(`
    <p>hello</p> <p> what</p>
  `);
});

test('Should detect when somthing is un-styled in a child', () => {
  assertDraftPasteProcessorProcessHTML(`
    <b>
      hello<span style="font-weight:400;">there</span>
    </b>
  `);

  assertDraftPasteProcessorProcessHTML(`
    <i>
      hello<span style="font-style:normal;">there</span>
    </i>
  `);

  // nothing to remove. make sure we don't throw an error
  assertDraftPasteProcessorProcessHTML(`
    <span>hello<span style="font-style:normal;">there</span></span>
  `);
});

test('must preserve list formatting', () => {
  assertDraftPasteProcessorProcessHTML(`
    what
    <ul>
      <li>what</li>
      <li>
        what
        <ol>
          <li>one</li>
          <li>two</li>
        </ol>
      </li>
      <li>what</li>
    </ul>
  `);
});

test('must create nested elements when experimentalTreeDataSupport is enabled', () => {
  assertDraftPasteProcessorProcessHTML(
    `
    <blockquote>
      <h2>Heading inside blockquote</h2>
      <p><em>some</em> <strong>text</strong></p>
    </blockquote>
  `,
    CUSTOM_BLOCK_MAP,
    true,
  );
});

test('must create ContentBlocks when experimentalTreeDataSupport is disabled while processing text', () => {
  assertDraftPasteProcessorProcessText(['Alpha', 'Beta', 'Charlie']);
});

test('must create ContentBlockNodes when experimentalTreeDataSupport is enabled while processing text', () => {
  assertDraftPasteProcessorProcessText(['Alpha', 'Beta', 'Charlie'], true);
});
