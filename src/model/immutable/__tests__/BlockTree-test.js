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

const BlockTree = require('BlockTree');
const CharacterMetadata = require('CharacterMetadata');
const ContentBlock = require('ContentBlock');
const ContentState = require('ContentState');
const {BOLD} = require('SampleDraftInlineStyle');

const Immutable = require('immutable');

const {EMPTY} = CharacterMetadata;

const {Repeat} = Immutable;

const PLAIN_BLOCK = {
  key: 'a',
  text: 'Lincoln',
  characterList: Repeat(EMPTY, 7).toList(),
};

const STYLED_BLOCK = {
  key: 'b',
  text: 'Washington',
  characterList: Repeat(EMPTY, 4).concat(
    Repeat(CharacterMetadata.create({style: BOLD}), 4),
    Repeat(EMPTY, 2),
  ),
};

class Decorator {}
Decorator.prototype.getDecorations = jest.fn();

beforeEach(() => {
  jest.resetModules();
});

// empty decorator
const emptyDecoratorFactory = length => {
  Decorator.prototype.getDecorations.mockImplementation(() =>
    Repeat(null, length).toList(),
  );
  return new Decorator();
};

// single decorator
const singleDecoratorFactory = length => {
  const DECORATOR_KEY = 'x';
  const RANGE_LENGTH = 3;

  Decorator.prototype.getDecorations.mockImplementation(() => {
    return Repeat(null, RANGE_LENGTH)
      .concat(
        Repeat(DECORATOR_KEY, RANGE_LENGTH),
        Repeat(null, length - 2 * RANGE_LENGTH),
      )
      .toList();
  });
  return new Decorator();
};

const multiDecoratorFactory = length => {
  const DECORATOR_KEY_A = 'y';
  const DECORATOR_KEY_B = 'z';
  const RANGE_LENGTH = 3;

  Decorator.prototype.getDecorations.mockImplementation(() => {
    return Repeat(DECORATOR_KEY_A, RANGE_LENGTH)
      .concat(
        Repeat(null, RANGE_LENGTH),
        Repeat(DECORATOR_KEY_B, length - 2 * RANGE_LENGTH),
      )
      .toList();
  });
  return new Decorator();
};

const assertBlockTreeGenerate = (
  config,
  getDecorator = emptyDecoratorFactory,
) => {
  const block = new ContentBlock(config);
  const content = ContentState.createFromText(config.text);
  const decorator = getDecorator(config.text.length);
  const tree = BlockTree.generate(content, block, decorator);

  expect(tree.toJS()).toMatchSnapshot();

  // to remove
  return tree;
};

it('must generate for unstyled block with empty decorator', () => {
  assertBlockTreeGenerate(PLAIN_BLOCK);
});

it('must generate for styled block with empty decorator', () => {
  assertBlockTreeGenerate(STYLED_BLOCK);
});

it('must generate for unstyled block with single decorator', () => {
  assertBlockTreeGenerate(PLAIN_BLOCK, singleDecoratorFactory);
});

it('must generate for styled block with single decorator', () => {
  assertBlockTreeGenerate(STYLED_BLOCK, singleDecoratorFactory);
});

it('must generate for unstyled block with multiple decorators', () => {
  assertBlockTreeGenerate(PLAIN_BLOCK, multiDecoratorFactory);
});

it('must generate for styled block with multiple decorators', () => {
  assertBlockTreeGenerate(STYLED_BLOCK, multiDecoratorFactory);
});
