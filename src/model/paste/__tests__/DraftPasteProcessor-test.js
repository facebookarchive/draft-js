/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails azelenskiy, oncall+ui_infra
 */

'use strict';

jest.autoMockOff();

const DraftEntity = require('DraftEntity');

const DraftPasteProcessor = require('DraftPasteProcessor');

describe('DraftPasteProcessor', function() {
  function assertInlineStyles(block, comparison) {
    const styles = block.getCharacterList().map(c => c.getStyle());
    expect(styles.toJS()).toEqual(comparison);
  }

  // Don't want to couple this to a specific way of generating entity IDs so
  // just checking their existance
  function assertEntities(block, comparison) {
    const entities = block.getCharacterList().map(c => c.getEntity());
    entities.toJS().forEach((entity, ii) => {
      expect(comparison[ii]).toBe(!!entity);
    });
  }

  function assertDepths(blocks, comparison) {
    expect(
      blocks.map(b => b.getDepth())
    ).toEqual(
      comparison
    );
  }

  function assertBlockTypes(blocks, comparison) {
    expect(
      blocks.map(b => b.getType())
    ).toEqual(
      comparison
    );
  }

  it('must identify italics text', function() {
    const html = '<i>hello</i> hi';
    const output = DraftPasteProcessor.processHTML(html);
    const block = output[0];
    expect(block.getType()).toBe('unstyled');
    assertInlineStyles(block, [
      ['ITALIC'],
      ['ITALIC'],
      ['ITALIC'],
      ['ITALIC'],
      ['ITALIC'],
      [],
      [],
      [],
    ]);
    expect(block.getText()).toBe('hello hi');
  });

  it('must identify overlapping inline styles', function() {
    const html = '<i><b>he</b>hi</i>';
    const output = DraftPasteProcessor.processHTML(html);
    const block = output[0];
    expect(block.getType()).toBe('unstyled');
    assertInlineStyles(block, [
      ['ITALIC', 'BOLD'],
      ['ITALIC', 'BOLD'],
      ['ITALIC'],
      ['ITALIC'],
    ]);
    expect(block.getText()).toBe('hehi');
  });

  it('must identify block styles', function() {
    const html = '<ol><li>hi</li><li>there</li></ol>';
    const output = DraftPasteProcessor.processHTML(html);
    assertBlockTypes(output, [
      'ordered-list-item',
      'ordered-list-item',
    ]);
  });

  it('must collapse nested blocks to the topmost level', function() {
    const html = '<ul><li><h2>what</h2></li></ul>';
    const output = DraftPasteProcessor.processHTML(html);
    assertBlockTypes(output, [
      'unordered-list-item',
    ]);
  });

  /**
   * todo: azelenskiy
   * Changes to the mocked DOM appear to have broken this.
   *
   * it('must suppress blocks nested inside other blocks', function() {
   *   const html = '<p><h2>Some text here</h2> more text here </p>';
   *   const output = DraftPasteProcessor.processHTML(html);
   *   assertBlockTypes(output, [
   *     'unstyled',
   *   ]);
   * });
   */

  it('must detect two touching blocks', function() {
    const html = '<h1>hi</h1>        <h2>hi</h2>';
    const output = DraftPasteProcessor.processHTML(html);
    assertBlockTypes(output, [
      'header-one',
      'header-two',
    ]);
  });

  it('must insert a block when needed', function() {
    const html = ' <h1> hi </h1><h1> </h1><span> whatever </span> <h2>hi </h2> ';
    const output = DraftPasteProcessor.processHTML(html);
    assertBlockTypes(output, [
      'header-one',
      'unstyled',
      'header-two',
    ]);
  });

  it('must not generate fake blocks on heavy nesting', function() {
    const html = '<p><span><span><span>Word</span></span></span>' +
      '<span><span>,</span></span></p>';
    const output = DraftPasteProcessor.processHTML(html);
    assertBlockTypes(output, ['unstyled']);
  });

  it('must preserve spaces', function() {
    let html, output;

    html = '<span>hello</span> <span>hi</span>';
    output = DraftPasteProcessor.processHTML(html);
    expect(output.length).toEqual(1);
    assertBlockTypes(output, ['unstyled']);
    const block = output[0];
    expect(block.getText()).toBe('hello hi');

    html = '<span>hello </span><span>hi</span>';
    output = DraftPasteProcessor.processHTML(html);
    expect(output[0].getText()).toBe('hello hi');

    html = '<span>hello</span><span> hi</span>';
    output = DraftPasteProcessor.processHTML(html);
    expect(output[0].getText()).toEqual('hello hi');
  });

  it('must treat divs as Ps when we do not have semantic markup', function() {
    const html = '<div>hi</div><div>hello</div>';
    const output = DraftPasteProcessor.processHTML(html);
    assertBlockTypes(output, [
      'unstyled',
      'unstyled',
    ]);
  });

  it('must NOT treat divs as Ps when we pave Ps', function() {
    const html = '<div><p>hi</p><p>hello</p></div>';
    const output = DraftPasteProcessor.processHTML(html);
    assertBlockTypes(output, [
      'unstyled',
      'unstyled',
    ]);
  });

  it('must replace br tags with soft newlines', function() {
    const html = 'hi<br>hello';
    const output = DraftPasteProcessor.processHTML(html);
    expect(output[0].getText()).toBe('hi\nhello');
  });

  it('must split unstyled blocks on two br tags', function() {
    let html = 'hi<br><br>hello';
    let output = DraftPasteProcessor.processHTML(html);
    assertBlockTypes(output, [
      'unstyled',
      'unstyled',
    ]);
    html = '<p>hi<br><br>hello</p>';
    output = DraftPasteProcessor.processHTML(html);
    assertBlockTypes(output, [
      'unstyled',
      'unstyled',
    ]);
  });

  it('must NOT split unstyled blocks inside a styled block', function() {
    const html = '<pre>hi<br><br>hello</pre>';
    const output = DraftPasteProcessor.processHTML(html);
    assertBlockTypes(output, ['code-block']);
  });

  it('must split unstyled blocks on two br tags', function() {
    const html = 'hi<br><br>hello';
    const output = DraftPasteProcessor.processHTML(html);
    expect(output[0].getText().length).toBe(3);
    expect(output[1].getText()).toBe('hello');
    assertBlockTypes(output, [
      'unstyled',
      'unstyled',
    ]);
  });

  it('must replace newlines in regular tags', function() {
    const html = '<div>hello\nthere</div>';
    const output = DraftPasteProcessor.processHTML(html);
    expect(output[0].getText()).toBe('hello there');
  });

  it('must preserve newlines in pre tags', function() {
    const html = '<pre>hello\nthere</pre>';
    const output = DraftPasteProcessor.processHTML(html);
    expect(output[0].getText()).toBe('hello\nthere');
  });

  it('must preserve newlines in whitespace in pre tags', function() {
    const html = '<pre><span>hello</span>\n<span>there</span></pre>';
    const output = DraftPasteProcessor.processHTML(html);
    expect(output[0].getText()).toBe('hello\nthere');
    assertBlockTypes(output, ['code-block']);
  });

  it('must parse based on style attribute', function() {
    const html = '<span style="font-weight: bold;">Bold '
      + '<span style="font-style: italic;">Italic</span></span>.';
    const output = DraftPasteProcessor.processHTML(html);
    assertBlockTypes(output, ['unstyled']);
    assertInlineStyles(output[0], [
      ['BOLD'],
      ['BOLD'],
      ['BOLD'],
      ['BOLD'],
      ['BOLD'],
      ['BOLD', 'ITALIC'],
      ['BOLD', 'ITALIC'],
      ['BOLD', 'ITALIC'],
      ['BOLD', 'ITALIC'],
      ['BOLD', 'ITALIC'],
      ['BOLD', 'ITALIC'],
      [],
    ]);
    expect(output[0].getText()).toBe('Bold Italic.');
  });

  it('must detect links in pasted content', function() {
    const html = 'This is a <a href="http://www.facebook.com">link</a>, yep.';
    const output = DraftPasteProcessor.processHTML(html);
    assertBlockTypes(output, ['unstyled']);
    assertEntities(
      output[0],
      Array(10).fill(false).concat(Array(4).fill(true), Array(6).fill(false))
    );
    expect(output[0].getText()).toBe('This is a link, yep.');
    const entityId = output[0].getCharacterList().get(12).getEntity();
    const entity = DraftEntity.get(entityId);
    expect(entity.getData().url).toBe('http://www.facebook.com/');
  });

  it('must preserve styles inside links in a good way', function() {
    const html = 'A <a href="http://www.facebook.com"><i>cool</i> link</a>, yep.';
    const output = DraftPasteProcessor.processHTML(html);
    assertBlockTypes(output, ['unstyled']);
    assertInlineStyles(
      output[0],
      Array(2).fill([]).concat(Array(4).fill(['ITALIC']), Array(11).fill([]))
    );
    assertEntities(
      output[0],
      Array(2).fill(false).concat(Array(9).fill(true), Array(6).fill(false))
    );
    expect(output[0].getText()).toBe('A cool link, yep.');
  });

  it('must ignore links that do not actually link anywhere', function() {
    const html = 'This is a <a>link</a>, yep.';
    const output = DraftPasteProcessor.processHTML(html);
    assertBlockTypes(output, ['unstyled']);
    assertEntities(output[0], Array(20).fill(false));
    expect(output[0].getText()).toBe('This is a link, yep.');
  });

  it('Tolerate doule BR tags separated by whitespace', function() {
    let html = 'hi<br>  <br>hello';
    let output = DraftPasteProcessor.processHTML(html);
    assertBlockTypes(output, [
      'unstyled',
      'unstyled',
    ]);
    html = '<p>hi<br> <br>hello</p>';
    output = DraftPasteProcessor.processHTML(html);
    assertBlockTypes(output, [
      'unstyled',
      'unstyled',
    ]);

    html = '<p>hi<br> good stuff here <br>hello</p>';
    output = DraftPasteProcessor.processHTML(html);
    assertBlockTypes(output, [
      'unstyled',
    ]);
  });

  it('Strip whitespace after block dividers', function() {
    const html = '<p>hello</p> <p> what</p>';
    const output = DraftPasteProcessor.processHTML(html);
    expect(output[1].getText()).toBe('what');
  });

  it('must preserve list formatting', function() {
    const html = `
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
    `;
    const output = DraftPasteProcessor.processHTML(html);
    assertBlockTypes(output, [
      'unstyled',
      'unordered-list-item',
      'unordered-list-item',
      'ordered-list-item',
      'ordered-list-item',
      'unordered-list-item',
    ]);
    assertDepths(output, [0, 0, 0, 1, 1, 0]);
  });
});
