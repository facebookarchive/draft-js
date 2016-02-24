/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+ui_infra
 * @typechecks
 */

'use strict';

jest.autoMockOff()
  .mock('Style')
  .mock('getElementPosition')
  .mock('getScrollPosition')
  .mock('getViewportDimensions');

const BlockTree = require('BlockTree');
const CharacterMetadata = require('CharacterMetadata');
const ContentBlock = require('ContentBlock');
const Immutable = require('immutable');
const React = require('React');
const ReactDOM = require('ReactDOM');
const ReactTestUtils = require('ReactTestUtils');
const SampleDraftInlineStyle = require('SampleDraftInlineStyle');
const SelectionState = require('SelectionState');
const Style = require('Style');
const UnicodeBidiDirection = require('UnicodeBidiDirection');

const getElementPosition = require('getElementPosition');
const getScrollPosition = require('getScrollPosition');
const getViewportDimensions = require('getViewportDimensions');
const reactComponentExpect = require('reactComponentExpect');
const {BOLD, NONE, ITALIC} = SampleDraftInlineStyle;

const mockGetDecorations = jest.genMockFn();

const DecoratorSpan = React.createClass({
  render() {
    return <span>{this.props.children}</span>;
  },
});

const DraftEditorBlock = require('DraftEditorBlock.react');

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

const mockLeafRender = jest.genMockFn().mockReturnValue(<span />);
jest.setMock(
  'DraftEditorLeaf.react',
  React.createClass({
    render: function() {
      return mockLeafRender();
    },
  })
);

const DraftEditorLeaf = require('DraftEditorLeaf.react');

function returnEmptyString() {
  return '';
}

function getHelloBlock() {
  return new ContentBlock({
    key: 'a',
    type: 'unstyled',
    text: 'hello',
    characterList: Immutable.List(
      Immutable.Repeat(CharacterMetadata.EMPTY, 5)
    ),
  });
}

function getSelection() {
  return new SelectionState({
    anchorKey: 'a',
    anchorOffset: 0,
    focusKey: 'a',
    focusOffset: 0,
    isBackward: false,
    hasFocus: true,
  });
}

function getProps(block, decorator) {
  return {
    block,
    tree: BlockTree.generate(block, decorator),
    selection: getSelection(),
    decorator: decorator || null,
    forceSelection: false,
    direction: UnicodeBidiDirection.LTR,
    blockStyleFn: returnEmptyString,
    styleSet: NONE,
  };
}

function arePropsEqual(renderedChild, leafPropSet) {
  Object.keys(leafPropSet).forEach(key => {
    expect(
      Immutable.is(leafPropSet[key], renderedChild.instance().props[key])
    ).toBeTruthy();
  });
}

function assertLeaves(renderedBlock, leafProps) {
  leafProps.forEach((leafPropSet, ii) => {
    const child = renderedBlock.expectRenderedChildAt(ii);
    child.toBeComponentOfType(DraftEditorLeaf);
    arePropsEqual(child, leafPropSet);
  });
}

describe('DraftEditorBlock.react', () => {
  Style.getScrollParent.mockReturnValue(window);
  window.scrollTo = jest.genMockFn();
  getElementPosition.mockReturnValue({
    x: 0,
    y: 600,
    width: 500,
    height: 16,
  });
  getScrollPosition.mockReturnValue({x: 0, y: 0});
  getViewportDimensions.mockReturnValue({width: 1200, height: 800});

  beforeEach(() => {
    window.scrollTo.mockClear();
    mockGetDecorations.mockClear();
    mockLeafRender.mockClear();
  });

  describe('Basic rendering', () => {
    it('must render a leaf node', () => {
      const props = getProps(getHelloBlock());
      const block = ReactTestUtils.renderIntoDocument(
        <DraftEditorBlock {...props} />
      );

      const rendered = reactComponentExpect(block)
        .expectRenderedChild()
        .toBeComponentOfType('div');

      assertLeaves(rendered, [
        {
          text: 'hello',
          offsetKey: 'a-0-0',
          start: 0,
          styleSet: NONE,
          isLast: true,
        },
      ]);
    });

    it('must render multiple leaf nodes', () => {
      const boldLength = 2;
      let helloBlock = getHelloBlock();
      let characters = helloBlock.getCharacterList();
      characters = characters
        .slice(0, boldLength)
        .map(c => CharacterMetadata.applyStyle(c, 'BOLD'))
        .concat(characters.slice(boldLength));

      helloBlock = helloBlock.set('characterList', characters.toList());

      const props = getProps(helloBlock);
      const block = ReactTestUtils.renderIntoDocument(
        <DraftEditorBlock {...props} />
      );

      const rendered = reactComponentExpect(block)
        .expectRenderedChild()
        .toBeComponentOfType('div');

      assertLeaves(rendered, [
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
  });

  describe('Allow/reject component updates', () => {
    it('must allow update when `block` has changed', () => {
      const helloBlock = getHelloBlock();
      const props = getProps(helloBlock);

      const container = document.createElement('div');
      ReactDOM.render(
        <DraftEditorBlock {...props} />,
        container
      );

      expect(mockLeafRender.mock.calls.length).toBe(1);

      const updatedHelloBlock = helloBlock.set('text', 'hxllo');
      const nextProps = getProps(updatedHelloBlock);

      expect(updatedHelloBlock).not.toBe(helloBlock);
      expect(props.block).not.toBe(nextProps.block);

      ReactDOM.render(
        <DraftEditorBlock {...nextProps} />,
        container
      );

      expect(mockLeafRender.mock.calls.length).toBe(2);
    });

    it('must allow update when `tree` has changed', () => {
      const helloBlock = getHelloBlock();
      const props = getProps(helloBlock);

      const container = document.createElement('div');
      ReactDOM.render(
        <DraftEditorBlock {...props} />,
        container
      );

      expect(mockLeafRender.mock.calls.length).toBe(1);

      mockGetDecorations.mockReturnValue(
        Immutable.List.of('x', 'x', null, null, null)
      );
      const decorator = new Decorator();

      const newTree = BlockTree.generate(helloBlock, decorator);
      const nextProps = {...props, tree: newTree, decorator};

      expect(props.tree).not.toBe(nextProps.tree);

      ReactDOM.render(
        <DraftEditorBlock {...nextProps} />,
        container
      );

      expect(mockLeafRender.mock.calls.length).toBe(3);
    });

    it('must allow update when `direction` has changed', () => {
      const helloBlock = getHelloBlock();
      const props = getProps(helloBlock);

      const container = document.createElement('div');
      ReactDOM.render(
        <DraftEditorBlock {...props} />,
        container
      );

      expect(mockLeafRender.mock.calls.length).toBe(1);

      const nextProps = {...props, direction: UnicodeBidiDirection.RTL};
      expect(props.direction).not.toBe(nextProps.direction);

      ReactDOM.render(
        <DraftEditorBlock {...nextProps} />,
        container
      );

      expect(mockLeafRender.mock.calls.length).toBe(2);
    });

    it('must allow update when forcing selection', () => {
      const helloBlock = getHelloBlock();
      const props = getProps(helloBlock);

      const container = document.createElement('div');
      ReactDOM.render(
        <DraftEditorBlock {...props} />,
        container
      );

      expect(mockLeafRender.mock.calls.length).toBe(1);

      // The default selection state in this test is on a selection edge.
      const nextProps = {
        ...props,
        forceSelection: true,
      };

      ReactDOM.render(
        <DraftEditorBlock {...nextProps} />,
        container
      );

      expect(mockLeafRender.mock.calls.length).toBe(2);
    });

    it('must reject update if conditions are not met', () => {
      const helloBlock = getHelloBlock();
      const props = getProps(helloBlock);

      const container = document.createElement('div');
      ReactDOM.render(
        <DraftEditorBlock {...props} />,
        container
      );

      expect(mockLeafRender.mock.calls.length).toBe(1);

      // Render again with the exact same props as before.
      ReactDOM.render(
        <DraftEditorBlock {...props} />,
        container
      );

      // No new leaf renders.
      expect(mockLeafRender.mock.calls.length).toBe(1);
    });

    it('must reject update if selection is not on an edge', () => {
      const helloBlock = getHelloBlock();
      const props = getProps(helloBlock);

      const container = document.createElement('div');
      ReactDOM.render(
        <DraftEditorBlock {...props} />,
        container
      );

      expect(mockLeafRender.mock.calls.length).toBe(1);

      // Move selection state to some other block.
      const nonEdgeSelection = props.selection.merge({
        anchorKey: 'z',
        focusKey: 'z',
      });

      const newProps = {...props, selection: nonEdgeSelection};

      // Render again with selection now moved elsewhere and the contents
      // unchanged.
      ReactDOM.render(
        <DraftEditorBlock {...newProps} />,
        container
      );

      // No new leaf renders.
      expect(mockLeafRender.mock.calls.length).toBe(1);
    });
  });

  describe('Complex rendering with a decorator', () => {
    it('must split apart two decorated and undecorated', () => {
      const helloBlock = getHelloBlock();

      mockGetDecorations.mockReturnValue(
        Immutable.List.of('x', 'x', null, null, null)
      );
      const decorator = new Decorator();
      const props = getProps(helloBlock, decorator);

      const container = document.createElement('div');
      const block = ReactDOM.render(
        <DraftEditorBlock {...props} />,
        container
      );

      expect(mockLeafRender.mock.calls.length).toBe(2);

      const rendered = reactComponentExpect(block)
        .expectRenderedChild()
        .toBeComponentOfType('div');

      rendered
        .expectRenderedChildAt(0)
        .scalarPropsEqual({offsetKey: 'a-0-0'})
        .toBeComponentOfType(DecoratorSpan)
          .expectRenderedChild()
          .toBeComponentOfType('span');

      rendered
        .expectRenderedChildAt(1)
        .scalarPropsEqual({offsetKey: 'a-1-0'})
        .toBeComponentOfType(DraftEditorLeaf);
    });

    it('must split apart two decorators', () => {
      const helloBlock = getHelloBlock();

      mockGetDecorations.mockReturnValue(
        Immutable.List.of('x', 'x', 'y', 'y', 'y')
      );

      const decorator = new Decorator();
      const props = getProps(helloBlock, decorator);

      const container = document.createElement('div');
      const block = ReactDOM.render(
        <DraftEditorBlock {...props} />,
        container
      );

      expect(mockLeafRender.mock.calls.length).toBe(2);

      const rendered = reactComponentExpect(block)
        .expectRenderedChild()
        .toBeComponentOfType('div');

      rendered
        .expectRenderedChildAt(0)
        .scalarPropsEqual({offsetKey: 'a-0-0'})
        .toBeComponentOfType(DecoratorSpan);

      rendered
        .expectRenderedChildAt(1)
        .scalarPropsEqual({offsetKey: 'a-1-0'})
        .toBeComponentOfType(DecoratorSpan);
    });
  });

  describe('Complex rendering with inline styles', () => {
    it('must split apart styled spans', () => {
      let helloBlock = getHelloBlock();
      const characters = helloBlock.getCharacterList();
      const newChars = characters.slice(0, 2).map(ch => {
        return CharacterMetadata.applyStyle(ch, 'BOLD');
      }).concat(characters.slice(2));

      helloBlock = helloBlock.set('characterList', Immutable.List(newChars));
      const props = getProps(helloBlock);

      const container = document.createElement('div');
      const block = ReactDOM.render(
        <DraftEditorBlock {...props} />,
        container
      );

      expect(mockLeafRender.mock.calls.length).toBe(2);

      const rendered = reactComponentExpect(block)
        .expectRenderedChild()
        .toBeComponentOfType('div');

      let child = rendered.expectRenderedChildAt(0);
      child.toBeComponentOfType(DraftEditorLeaf);
      arePropsEqual(child, {offsetKey: 'a-0-0', styleSet: BOLD});

      child = rendered.expectRenderedChildAt(1);
      child.toBeComponentOfType(DraftEditorLeaf);
      arePropsEqual(child, {offsetKey: 'a-0-1', styleSet: NONE});
    });

    it('must split styled spans apart within decorator', () => {
      let helloBlock = getHelloBlock();
      const characters = helloBlock.getCharacterList();
      const newChars = Immutable.List([
        CharacterMetadata.applyStyle(characters.get(0), 'BOLD'),
        CharacterMetadata.applyStyle(characters.get(1), 'ITALIC'),
      ]).concat(characters.slice(2));

      helloBlock = helloBlock.set('characterList', Immutable.List(newChars));

      mockGetDecorations.mockReturnValue(
        Immutable.List.of('x', 'x', null, null, null)
      );
      const decorator = new Decorator();
      const props = getProps(helloBlock, decorator);

      const container = document.createElement('div');
      const block = ReactDOM.render(
        <DraftEditorBlock {...props} />,
        container
      );

      expect(mockLeafRender.mock.calls.length).toBe(3);

      const rendered = reactComponentExpect(block)
        .expectRenderedChild()
        .toBeComponentOfType('div');

      const decoratedSpan = rendered
        .expectRenderedChildAt(0)
        .scalarPropsEqual({offsetKey: 'a-0-0'})
        .toBeComponentOfType(DecoratorSpan)
          .expectRenderedChild();

      let child = decoratedSpan.expectRenderedChildAt(0);
      child.toBeComponentOfType(DraftEditorLeaf);
      arePropsEqual(child, {offsetKey: 'a-0-0', styleSet: BOLD});

      child = decoratedSpan.expectRenderedChildAt(1);
      child.toBeComponentOfType(DraftEditorLeaf);
      arePropsEqual(child, {offsetKey: 'a-0-1', styleSet: ITALIC});

      child = rendered.expectRenderedChildAt(1);
      child.toBeComponentOfType(DraftEditorLeaf);
      arePropsEqual(child, {offsetKey: 'a-1-0', styleSet: NONE});
    });
  });

  describe('Scroll-to-cursor on mount', () => {
    const props = getProps(getHelloBlock());

    describe('Scroll parent is `window`', () => {
      it('must scroll the window if needed', () => {
        getElementPosition.mockReturnValueOnce({
          x: 0,
          y: 800,
          width: 500,
          height: 16,
        });

        const container = document.createElement('div');
        ReactDOM.render(
          <DraftEditorBlock {...props} />,
          container
        );

        const scrollCalls = window.scrollTo.mock.calls;
        expect(scrollCalls.length).toBe(1);
        expect(scrollCalls[0][0]).toBe(0);

        // (current scroll position) + (block height) + (buffer)
        expect(scrollCalls[0][1]).toBe(26);
      });

      it('must not scroll the window if unnecessary', () => {
        const container = document.createElement('div');
        ReactDOM.render(
          <DraftEditorBlock {...props} />,
          container
        );

        const scrollCalls = window.scrollTo.mock.calls;
        expect(scrollCalls.length).toBe(0);
      });
    });
  });
});
