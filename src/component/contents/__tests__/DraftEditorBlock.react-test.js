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

jest
  .disableAutomock()
  .mock('Style')
  .mock('getElementPosition')
  .mock('getScrollPosition')
  .mock('getViewportDimensions');

const BlockTree = require('BlockTree');
const CharacterMetadata = require('CharacterMetadata');
const ContentBlock = require('ContentBlock');
const ContentState = require('ContentState');
const DraftEditorBlock = require('DraftEditorBlock.react');
const React = require('React');
const ReactDOM = require('ReactDOM');
const SampleDraftInlineStyle = require('SampleDraftInlineStyle');
const SelectionState = require('SelectionState');
const Style = require('Style');
const UnicodeBidiDirection = require('UnicodeBidiDirection');

const getElementPosition = require('getElementPosition');
const getScrollPosition = require('getScrollPosition');
const getViewportDimensions = require('getViewportDimensions');
const Immutable = require('immutable');
const ReactTestRenderer = require('react-test-renderer');

const {BOLD, NONE, ITALIC} = SampleDraftInlineStyle;

const mockGetDecorations = jest.fn();

class DecoratorSpan extends React.Component {
  render() {
    return <span>{this.props.children}</span>;
  }
}

// Define a class to satisfy typechecks.
class Decorator {
  getDecorations() {
    return mockGetDecorations();
  }
  getComponentForKey() {
    return DecoratorSpan;
  }
  getPropsForKey() {
    return {};
  }
}

const mockLeafRender = jest.fn(() => <span />);
class MockEditorLeaf extends React.Component {
  render() {
    return mockLeafRender();
  }
}
jest.setMock('DraftEditorLeaf.react', MockEditorLeaf);
Style.getScrollParent.mockReturnValue(window);
window.scrollTo = jest.fn();
getElementPosition.mockReturnValue({
  x: 0,
  y: 600,
  width: 500,
  height: 16,
});
getScrollPosition.mockReturnValue({x: 0, y: 0});
getViewportDimensions.mockReturnValue({width: 1200, height: 800});

const DraftEditorLeaf = require('DraftEditorLeaf.react');

const returnEmptyString = () => {
  return '';
};

const getHelloBlock = () => {
  return new ContentBlock({
    key: 'a',
    type: 'unstyled',
    text: 'hello',
    characterList: Immutable.List(Immutable.Repeat(CharacterMetadata.EMPTY, 5)),
  });
};

const getSelection = () => {
  return new SelectionState({
    anchorKey: 'a',
    anchorOffset: 0,
    focusKey: 'a',
    focusOffset: 0,
    isBackward: false,
    hasFocus: true,
  });
};

const getProps = (block, decorator) => {
  return {
    block,
    tree: BlockTree.generate(ContentState.createFromText(''), block, decorator),
    selection: getSelection(),
    decorator: decorator || null,
    forceSelection: false,
    direction: UnicodeBidiDirection.LTR,
    blockStyleFn: returnEmptyString,
    styleSet: NONE,
  };
};

const arePropsEqual = (renderedChild, leafPropSet) => {
  Object.keys(leafPropSet).forEach(key => {
    expect(
      Immutable.is(leafPropSet[key], renderedChild.props[key]),
    ).toMatchSnapshot();
  });
};

const assertLeaves = (renderedBlock, leafProps) => {
  leafProps.forEach((leafPropSet, ii) => {
    const child = renderedBlock[ii];
    expect(child.type).toBe(DraftEditorLeaf);
    arePropsEqual(child, leafPropSet);
  });
};

beforeEach(() => {
  window.scrollTo.mockClear();
  mockGetDecorations.mockClear();
  mockLeafRender.mockClear();
});

test('must render a leaf node', () => {
  const props = getProps(getHelloBlock());
  const block = ReactTestRenderer.create(<DraftEditorBlock {...props} />);
  const blockInstance = block.root;

  expect(blockInstance.children[0].type).toBe('div');

  assertLeaves(blockInstance.children[0].children, [
    {
      text: 'hello',
      offsetKey: 'a-0-0',
      start: 0,
      styleSet: NONE,
      isLast: true,
    },
  ]);
});

test('must render multiple leaf nodes', () => {
  const boldLength = 2;
  let helloBlock = getHelloBlock();
  let characters = helloBlock.getCharacterList();
  characters = characters
    .slice(0, boldLength)
    .map(c => CharacterMetadata.applyStyle(c, 'BOLD'))
    .concat(characters.slice(boldLength));

  helloBlock = helloBlock.set('characterList', characters.toList());

  const props = getProps(helloBlock);
  const block = ReactTestRenderer.create(<DraftEditorBlock {...props} />);
  const blockInstance = block.root;

  expect(blockInstance.children[0].type).toBe('div');

  assertLeaves(blockInstance.children[0].children, [
    {
      text: 'he',
      offsetKey: 'a-0-0',
      start: 0,
      styleSet: BOLD,
      isLast: false,
    },
    {
      text: 'llo',
      offsetKey: 'a-0-1',
      start: 2,
      styleSet: NONE,
      isLast: true,
    },
  ]);
});

test('must allow update when `block` has changed', () => {
  const helloBlock = getHelloBlock();
  const props = getProps(helloBlock);

  const container = document.createElement('div');
  ReactDOM.render(<DraftEditorBlock {...props} />, container);

  expect(mockLeafRender.mock.calls.length).toMatchSnapshot();

  const updatedHelloBlock = helloBlock.set('text', 'hxllo');
  const nextProps = getProps(updatedHelloBlock);

  expect(updatedHelloBlock !== helloBlock).toMatchSnapshot();
  expect(props.block !== nextProps.block).toMatchSnapshot();

  ReactDOM.render(<DraftEditorBlock {...nextProps} />, container);

  expect(mockLeafRender.mock.calls.length).toMatchSnapshot();
});

test('must allow update when `tree` has changed', () => {
  const helloBlock = getHelloBlock();
  const props = getProps(helloBlock);

  const container = document.createElement('div');
  ReactDOM.render(<DraftEditorBlock {...props} />, container);

  expect(mockLeafRender.mock.calls.length).toMatchSnapshot();

  mockGetDecorations.mockReturnValue(
    Immutable.List.of('x', 'x', null, null, null),
  );
  const decorator = new Decorator();

  const newTree = BlockTree.generate(
    ContentState.createFromText(helloBlock.getText()),
    helloBlock,
    decorator,
  );
  const nextProps = {...props, tree: newTree, decorator};

  expect(props.tree !== nextProps.tree).toMatchSnapshot();

  ReactDOM.render(<DraftEditorBlock {...nextProps} />, container);

  expect(mockLeafRender.mock.calls.length).toMatchSnapshot();
});

test('must allow update when `direction` has changed', () => {
  const helloBlock = getHelloBlock();
  const props = getProps(helloBlock);

  const container = document.createElement('div');
  ReactDOM.render(<DraftEditorBlock {...props} />, container);

  expect(mockLeafRender.mock.calls.length).toMatchSnapshot();

  const nextProps = {...props, direction: UnicodeBidiDirection.RTL};
  expect(props.direction !== nextProps.direction).toMatchSnapshot();

  ReactDOM.render(<DraftEditorBlock {...nextProps} />, container);

  expect(mockLeafRender.mock.calls.length).toMatchSnapshot();
});

test('must allow update when forcing selection', () => {
  const helloBlock = getHelloBlock();
  const props = getProps(helloBlock);

  const container = document.createElement('div');
  ReactDOM.render(<DraftEditorBlock {...props} />, container);

  expect(mockLeafRender.mock.calls.length).toMatchSnapshot();

  // The default selection state in this test is on a selection edge.
  const nextProps = {
    ...props,
    forceSelection: true,
  };

  ReactDOM.render(<DraftEditorBlock {...nextProps} />, container);

  expect(mockLeafRender.mock.calls.length).toMatchSnapshot();
});

test('must reject update if conditions are not met', () => {
  const helloBlock = getHelloBlock();
  const props = getProps(helloBlock);

  const container = document.createElement('div');
  ReactDOM.render(<DraftEditorBlock {...props} />, container);

  expect(mockLeafRender.mock.calls.length).toMatchSnapshot();

  // Render again with the exact same props as before.
  ReactDOM.render(<DraftEditorBlock {...props} />, container);

  // No new leaf renders.
  expect(mockLeafRender.mock.calls.length).toMatchSnapshot();
});

test('must reject update if selection is not on an edge', () => {
  const helloBlock = getHelloBlock();
  const props = getProps(helloBlock);

  const container = document.createElement('div');
  ReactDOM.render(<DraftEditorBlock {...props} />, container);

  expect(mockLeafRender.mock.calls.length).toMatchSnapshot();

  // Move selection state to some other block.
  const nonEdgeSelection = props.selection.merge({
    anchorKey: 'z',
    focusKey: 'z',
  });

  const newProps = {...props, selection: nonEdgeSelection};

  // Render again with selection now moved elsewhere and the contents
  // unchanged.
  ReactDOM.render(<DraftEditorBlock {...newProps} />, container);

  // No new leaf renders.
  expect(mockLeafRender.mock.calls.length).toMatchSnapshot();
});

test('must split apart two decorated and undecorated', () => {
  const helloBlock = getHelloBlock();

  mockGetDecorations.mockReturnValue(
    Immutable.List.of('x', 'x', null, null, null),
  );
  const decorator = new Decorator();
  const props = getProps(helloBlock, decorator);

  const container = document.createElement('div');
  const block = ReactTestRenderer.create(
    <DraftEditorBlock {...props} />,
    container,
  );
  const blockInstance = block.root;

  expect(mockLeafRender.mock.calls.length).toMatchSnapshot();

  const el = blockInstance.children[0];
  expect(el.type).toBe('div');

  arePropsEqual(el.children[0], {offsetKey: 'a-0-0'});
  expect(el.children[0].type).toBe(DecoratorSpan);
  expect(el.children[0].children.length).toBe(1);
  expect(el.children[0].children[0].type).toBe('span');

  arePropsEqual(el.children[1], {offsetKey: 'a-1-0'});
  expect(el.children[1].type).toBe(DraftEditorLeaf);
});

test('must split apart two decorators', () => {
  const helloBlock = getHelloBlock();

  mockGetDecorations.mockReturnValue(
    Immutable.List.of('x', 'x', 'y', 'y', 'y'),
  );

  const decorator = new Decorator();
  const props = getProps(helloBlock, decorator);

  const container = document.createElement('div');
  const block = ReactTestRenderer.create(
    <DraftEditorBlock {...props} />,
    container,
  );
  const blockInstance = block.root;

  expect(mockLeafRender.mock.calls.length).toMatchSnapshot();

  const el = blockInstance.children[0];
  expect(el.type).toBe('div');

  arePropsEqual(el.children[0], {offsetKey: 'a-0-0'});
  expect(el.children[0].type).toBe(DecoratorSpan);
  expect(el.children[0].children.length).toBe(1);
  expect(el.children[0].children[0].type).toBe('span');

  arePropsEqual(el.children[1], {offsetKey: 'a-1-0'});
  expect(el.children[1].type).toBe(DecoratorSpan);
});

test('must split apart styled spans', () => {
  let helloBlock = getHelloBlock();
  const characters = helloBlock.getCharacterList();
  const newChars = characters
    .slice(0, 2)
    .map(ch => {
      return CharacterMetadata.applyStyle(ch, 'BOLD');
    })
    .concat(characters.slice(2));

  helloBlock = helloBlock.set('characterList', Immutable.List(newChars));
  const props = getProps(helloBlock);

  const container = document.createElement('div');
  const block = ReactTestRenderer.create(
    <DraftEditorBlock {...props} />,
    container,
  );
  const blockInstance = block.root;

  expect(mockLeafRender.mock.calls.length).toMatchSnapshot();

  const el = blockInstance.children[0];
  expect(el.type).toBe('div');

  arePropsEqual(el.children[0], {offsetKey: 'a-0-0', styleSet: BOLD});
  expect(el.children[0].type).toBe(DraftEditorLeaf);

  arePropsEqual(el.children[1], {offsetKey: 'a-0-1', styleSet: NONE});
  expect(el.children[1].type).toBe(DraftEditorLeaf);
});

test('must split styled spans apart within decorator', () => {
  let helloBlock = getHelloBlock();
  const characters = helloBlock.getCharacterList();
  const newChars = Immutable.List([
    CharacterMetadata.applyStyle(characters.get(0), 'BOLD'),
    CharacterMetadata.applyStyle(characters.get(1), 'ITALIC'),
  ]).concat(characters.slice(2));

  helloBlock = helloBlock.set('characterList', Immutable.List(newChars));

  mockGetDecorations.mockReturnValue(
    Immutable.List.of('x', 'x', null, null, null),
  );
  const decorator = new Decorator();
  const props = getProps(helloBlock, decorator);

  const container = document.createElement('div');
  const block = ReactTestRenderer.create(
    <DraftEditorBlock {...props} />,
    container,
  );
  const blockInstance = block.root;

  expect(mockLeafRender.mock.calls.length).toMatchSnapshot();

  const el = blockInstance.children[0];
  expect(el.type).toBe('div');

  arePropsEqual(el.children[0], {offsetKey: 'a-0-0'});
  expect(el.children[0].type).toBe(DecoratorSpan);

  const renderer = el.children[0].props;
  arePropsEqual(renderer.children[0], {offsetKey: 'a-0-0', styleSet: BOLD});
  expect(renderer.children[0].type).toBe(DraftEditorLeaf);

  arePropsEqual(renderer.children[1], {
    offsetKey: 'a-0-1',
    styleSet: ITALIC,
  });
  expect(renderer.children[0].type).toBe(DraftEditorLeaf);

  arePropsEqual(el.children[1], {offsetKey: 'a-1-0', styleSet: NONE});
  expect(el.children[1].type).toBe(DraftEditorLeaf);
});

test('must scroll the window if needed', () => {
  const props = getProps(getHelloBlock());

  getElementPosition.mockReturnValueOnce({
    x: 0,
    y: 800,
    width: 500,
    height: 16,
  });

  const container = document.createElement('div');
  ReactDOM.render(<DraftEditorBlock {...props} />, container);

  const scrollCalls = window.scrollTo.mock.calls;
  expect(scrollCalls).toMatchSnapshot();
});

test('must not scroll the window if unnecessary', () => {
  const props = getProps(getHelloBlock());
  const container = document.createElement('div');
  ReactDOM.render(<DraftEditorBlock {...props} />, container);

  const scrollCalls = window.scrollTo.mock.calls;
  expect(scrollCalls).toMatchSnapshot();
});
