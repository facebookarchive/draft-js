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
const CompositeDraftDecorator = require('CompositeDraftDecorator');
const ContentBlockNode = require('ContentBlockNode');
const ContentState = require('ContentState');
const DefaultDraftBlockRenderMap = require('DefaultDraftBlockRenderMap');
const DraftEditorBlockNode = require('DraftEditorBlockNode.react');
const EditorState = require('EditorState');
const React = require('React');
const SelectionState = require('SelectionState');
const Style = require('Style');
const UnicodeBidiDirection = require('UnicodeBidiDirection');

const TestHelper = require('_DraftTestHelper');
const getElementPosition = require('getElementPosition');
const getScrollPosition = require('getScrollPosition');
const getViewportDimensions = require('getViewportDimensions');
const Immutable = require('immutable');
const ReactTestRenderer = require('react-test-renderer');

const {List} = Immutable;

const rootBlock = new ContentBlockNode({
  key: 'A',
  text: '',
  type: 'blockquote',
  children: List(['B', 'C', 'D']),
});

const contentState = ContentState.createFromBlockArray([
  rootBlock,
  new ContentBlockNode({
    parent: 'A',
    nextSibling: 'C',
    type: 'header-three',
    key: 'B',
    text: 'Left',
    children: List([]),
  }),
  new ContentBlockNode({
    parent: 'A',
    type: 'header-one',
    prevSibling: 'B',
    nextSibling: 'D',
    key: 'C',
    text: 'Middle',
    children: List([]),
  }),
  new ContentBlockNode({
    parent: 'A',
    prevSibling: 'C',
    type: 'header-two',
    key: 'D',
    text: 'Right',
    children: List([]),
  }),
]);

const selectionState = new SelectionState({
  anchorKey: 'A',
  anchorOffset: 0,
  focusKey: 'A',
  focusOffset: 0,
  isBackward: false,
  hasFocus: false,
});

const PROPS = {
  block: rootBlock,
  blockRenderMap: DefaultDraftBlockRenderMap,
  blockRendererFn: block => null,
  blockStyleFn: block => '',
  contentState,
  customStyleFn: (style, block) => null,
  customStyleMap: {},
  decorator: null,
  direction: UnicodeBidiDirection.LTR,
  editorKey: 'editor',
  editorState: EditorState.createWithContent(contentState, null),
  forceSelection: false,
  offsetKey: 'A-0-0',
  selection: selectionState,
  tree: BlockTree.generate(contentState, rootBlock, null),
};

const setupDomMocks = () => {
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
};

const assertDraftEditorBlockRendering = props => {
  const childProps = {
    ...props,
    editorState: EditorState.createWithContent(
      props.contentState,
      props.decorator,
    ),
  };

  const blockNode = ReactTestRenderer.create(
    <DraftEditorBlockNode {...childProps} />,
  );

  expect(
    TestHelper.transformSnapshotProps(blockNode.toJSON()),
  ).toMatchSnapshot();
};

beforeEach(() => {
  setupDomMocks();
});

test('renders block with no children', () => {
  const rootBlock = new ContentBlockNode({
    key: 'A',
    text: 'some text',
    type: 'header-one',
  });

  const contentState = ContentState.createFromBlockArray([rootBlock]);

  assertDraftEditorBlockRendering({
    ...PROPS,
    block: rootBlock,
    contentState,
    tree: BlockTree.generate(contentState, rootBlock, null),
  });
});

test('renders block with children', () => {
  assertDraftEditorBlockRendering(PROPS);
});

test('renders block with child that have wrapperElement', () => {
  const rootBlock = new ContentBlockNode({
    key: 'A',
    text: '',
    type: 'blockquote',
    children: List(['B']),
  });

  const contentState = ContentState.createFromBlockArray([
    rootBlock,
    new ContentBlockNode({
      parent: 'A',
      key: 'B',
      text: 'fist list item',
      type: 'ordered-list-item',
    }),
  ]);

  assertDraftEditorBlockRendering({
    ...PROPS,
    block: rootBlock,
    contentState,
    tree: BlockTree.generate(contentState, rootBlock, null),
  });
});

test('renders block with children that have same wrapperElement', () => {
  const rootBlock = new ContentBlockNode({
    key: 'A',
    text: '',
    type: 'blockquote',
    children: List(['B', 'C']),
  });

  const contentState = ContentState.createFromBlockArray([
    rootBlock,
    new ContentBlockNode({
      parent: 'A',
      key: 'B',
      text: 'fist list item',
      type: 'ordered-list-item',
      nextSibling: 'C',
    }),
    new ContentBlockNode({
      parent: 'A',
      key: 'C',
      text: 'second list item',
      type: 'ordered-list-item',
      prevSibling: 'B',
    }),
  ]);

  assertDraftEditorBlockRendering({
    ...PROPS,
    block: rootBlock,
    contentState,
    tree: BlockTree.generate(contentState, rootBlock, null),
  });
});

test('renders block with nested child that have same wrapperElement', () => {
  const rootBlock = new ContentBlockNode({
    key: 'A',
    text: '',
    type: 'blockquote',
    children: List(['B']),
  });

  const contentState = ContentState.createFromBlockArray([
    rootBlock,
    new ContentBlockNode({
      parent: 'A',
      key: 'B',
      text: '',
      type: 'unordered-list-item',
      children: List(['C']),
    }),
    new ContentBlockNode({
      parent: 'B',
      key: 'C',
      text: 'deeply nested list',
      type: 'unordered-list-item',
    }),
  ]);

  assertDraftEditorBlockRendering({
    ...PROPS,
    block: rootBlock,
    contentState,
    tree: BlockTree.generate(contentState, rootBlock, null),
  });
});

test('renders block with nested child that is of different block type', () => {
  const rootBlock = new ContentBlockNode({
    key: 'A',
    text: '',
    type: 'blockquote',
    children: List(['B']),
  });

  const contentState = ContentState.createFromBlockArray([
    rootBlock,
    new ContentBlockNode({
      parent: 'A',
      key: 'B',
      text: 'fist list item',
      type: 'ordered-list-item',
      children: List(['C']),
    }),
    new ContentBlockNode({
      parent: 'B',
      key: 'C',
      text: 'header inside list',
      type: 'header-one',
    }),
  ]);

  assertDraftEditorBlockRendering({
    ...PROPS,
    block: rootBlock,
    contentState,
    tree: BlockTree.generate(contentState, rootBlock, null),
  });
});

test('renders block with nested child that have different wrapperElement', () => {
  const rootBlock = new ContentBlockNode({
    key: 'A',
    text: '',
    type: 'blockquote',
    children: List(['B']),
  });

  const contentState = ContentState.createFromBlockArray([
    rootBlock,
    new ContentBlockNode({
      parent: 'A',
      key: 'B',
      text: '',
      type: 'unordered-list-item',
      children: List(['C']),
    }),
    new ContentBlockNode({
      parent: 'B',
      key: 'C',
      text: 'deeply nested list',
      type: 'ordered-list-item',
    }),
  ]);

  assertDraftEditorBlockRendering({
    ...PROPS,
    block: rootBlock,
    contentState,
    tree: BlockTree.generate(contentState, rootBlock, null),
  });
});

test('renders block with nested children with decorator', () => {
  const rootBlock = new ContentBlockNode({
    key: 'A',
    text: '',
    type: 'blockquote',
    children: List(['B']),
  });

  const contentState = ContentState.createFromBlockArray([
    rootBlock,
    new ContentBlockNode({
      parent: 'A',
      key: 'B',
      text: 'fist list item',
      type: 'ordered-list-item',
      children: List(['C']),
    }),
    new ContentBlockNode({
      parent: 'B',
      key: 'C',
      text: 'header inside list',
      type: 'header-one',
    }),
  ]);

  const DecoratedComponent = props => {
    return <span className={'custom-decorated-text'}>{props.children}</span>;
  };

  const decorator = new CompositeDraftDecorator([
    {
      strategy: (block, callback, contentState) => {
        if (block.getType() === 'header-one') {
          callback(0, block.getLength());
        }
      },
      component: DecoratedComponent,
    },
  ]);

  assertDraftEditorBlockRendering({
    ...PROPS,
    decorator,
    block: rootBlock,
    contentState,
    tree: BlockTree.generate(contentState, rootBlock, null),
  });
});

test('renders block with nested children with different direction', () => {
  const rootBlock = new ContentBlockNode({
    key: 'A',
    text: '',
    type: 'blockquote',
    children: List(['B']),
  });

  const contentState = ContentState.createFromBlockArray([
    rootBlock,
    new ContentBlockNode({
      parent: 'A',
      key: 'B',
      text: 'fist list item',
      type: 'ordered-list-item',
      children: List(['C']),
    }),
    new ContentBlockNode({
      parent: 'B',
      key: 'C',
      text: 'header inside list',
      type: 'header-one',
    }),
  ]);

  assertDraftEditorBlockRendering({
    ...PROPS,
    block: rootBlock,
    direction: UnicodeBidiDirection.RTL,
    contentState,
    tree: BlockTree.generate(contentState, rootBlock, null),
  });
});

test('renders block with nested children with custom component', () => {
  const rootBlock = new ContentBlockNode({
    key: 'A',
    text: '',
    type: 'blockquote',
    children: List(['B']),
  });

  const contentState = ContentState.createFromBlockArray([
    rootBlock,
    new ContentBlockNode({
      parent: 'A',
      key: 'B',
      text: 'fist list item',
      type: 'ordered-list-item',
      children: List(['C']),
    }),
    new ContentBlockNode({
      parent: 'B',
      key: 'C',
      text: 'header inside list',
      type: 'header-one',
    }),
  ]);

  const CustomBlock = props => {
    return <div className={'custom-header-one'}>Custom Component</div>;
  };

  assertDraftEditorBlockRendering({
    ...PROPS,
    block: rootBlock,
    blockRendererFn: block => {
      if (block.getType() === 'header-one') {
        return {
          component: CustomBlock,
        };
      }
      return null;
    },
    contentState,
    tree: BlockTree.generate(contentState, rootBlock, null),
  });
});

test('renders block with nested children with custom component and editable prop', () => {
  const rootBlock = new ContentBlockNode({
    key: 'A',
    text: '',
    type: 'blockquote',
    children: List(['B']),
  });

  const contentState = ContentState.createFromBlockArray([
    rootBlock,
    new ContentBlockNode({
      parent: 'A',
      key: 'B',
      text: 'fist list item',
      type: 'ordered-list-item',
      children: List(['C']),
    }),
    new ContentBlockNode({
      parent: 'B',
      key: 'C',
      text: 'header inside list',
      type: 'header-one',
    }),
  ]);

  const CustomBlock = props => {
    return (
      <div className={'custom-header-one'}>
        Custom Component {props.blockProps.foo}
      </div>
    );
  };

  assertDraftEditorBlockRendering({
    ...PROPS,
    block: rootBlock,
    blockRendererFn: block => {
      if (block.getType() === 'header-one') {
        return {
          component: CustomBlock,
          editable: false,
          props: {
            foo: 'bar',
          },
        };
      }
      return null;
    },
    contentState,
    tree: BlockTree.generate(contentState, rootBlock, null),
  });
});

test('renders block with nested children with blockStyleFn', () => {
  const rootBlock = new ContentBlockNode({
    key: 'A',
    text: '',
    type: 'blockquote',
    children: List(['B']),
  });

  const contentState = ContentState.createFromBlockArray([
    rootBlock,
    new ContentBlockNode({
      parent: 'A',
      key: 'B',
      text: 'fist list item',
      type: 'ordered-list-item',
      children: List(['C']),
    }),
    new ContentBlockNode({
      parent: 'B',
      key: 'C',
      text: 'header inside list',
      type: 'header-one',
    }),
  ]);

  assertDraftEditorBlockRendering({
    ...PROPS,
    block: rootBlock,
    blockStyleFn: block => {
      if (block.getType() === 'header-one') {
        return 'My-fancy-custom-class';
      }
      return null;
    },
    contentState,
    tree: BlockTree.generate(contentState, rootBlock, null),
  });
});
