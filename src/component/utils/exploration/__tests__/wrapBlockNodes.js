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

const React = require('react');
const UnicodeBidiDirection = require('UnicodeBidiDirection');
const CompositeDraftDecorator = require('CompositeDraftDecorator');
const DraftEditorNode = require('DraftEditorNode.react');
const ContentState = require('ContentState');
const EditorState = require('EditorState');
const BlockTree = require('BlockTree');
const ContentBlockNode = require('ContentBlockNode');
const ReactTestRenderer = require('react-test-renderer');
const wrapBlockNodes = require('wrapBlockNodes');
const TestHelper = require('_DraftTestHelper');
const DraftEditorBlockNode = require('DraftEditorBlockNode.react');
const {List} = require('immutable');
const blockRenderMap = require('DefaultDraftBlockRenderMap');
const DraftOffsetKey = require('DraftOffsetKey');
const DefaultDraftBlockRenderMap = require('DefaultDraftBlockRenderMap');
const getElementPropsConfig = require('getElementPropsConfig');
const getDraftRenderConfig = require('getDraftRenderConfig');
const getCustomRenderConfig = require('getCustomRenderConfig');
const SelectionState = require('SelectionState');

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

const assertWrapBlockNodes = (props = {}) => {
  const editorState = EditorState.createWithContent(props.contentState);
  const blockArray = props.contentState.getBlocksAsArray();
  const block = blockArray.filter(block => !block.parent)[0];

  const nodes = blockArray
    .filter(block => !!block.parent)
    .map((block, index) => {
      const key = block.getKey();

      const offsetKey = DraftOffsetKey.encode(key, 0, 0);
      const child = props.contentState.getBlockForKey(key);
      const customConfig = getCustomRenderConfig(child, props.blockRendererFn);
      const Component = customConfig.CustomComponent || DraftEditorBlockNode;
      const {Element, wrapperTemplate} = getDraftRenderConfig(
        child,
        blockRenderMap,
      );

      const elementProps = getElementPropsConfig(
        child,
        props.editorKey,
        offsetKey,
        props.blockStyleFn,
        customConfig,
      );

      const childProps = {
        ...props,
        tree: editorState.getBlockTree(key),
        blockProps: customConfig.customProps,
        offsetKey,
        wrapperTemplate,
        block: child,
      };

      const res = {
        wrapperTemplate,
        block: child,
        element: React.createElement(
          Element,
          elementProps,
          <Component {...childProps} />,
        ),
      };

      return res;
    });

  const children = wrapBlockNodes(nodes, props.contentState);

  const blockNode = (
    <DraftEditorNode
      block={block}
      children={children}
      contentState={props.contentState}
      customStyleFn={props.customStyleFn}
      customStyleMap={props.customStyleMap}
      decorator={props.decorator}
      direction={props.direction}
      forceSelection={props.forceSelection}
      hasSelection={props.hasSelection}
      selection={props.selection}
      tree={props.tree}
    />
  );

  const blockKey = block.getKey();
  const offsetKey = DraftOffsetKey.encode(blockKey, 0, 0);

  const {Element} = getDraftRenderConfig(block, blockRenderMap);
  const elementProps = getElementPropsConfig(
    block,
    props.editorKey,
    offsetKey,
    props.blockStyleFn,
    getCustomRenderConfig(block, props.blockRendererFn),
  );

  const TestNode = React.createElement(Element, elementProps, blockNode);

  expect(
    TestHelper.transformSnapshotProps(
      ReactTestRenderer.create(TestNode).toJSON(),
    ),
  ).toMatchSnapshot();
};

test('renders block with no children', () => {
  const rootBlock = new ContentBlockNode({
    key: 'A',
    text: 'some text',
    type: 'header-one',
  });

  const contentState = ContentState.createFromBlockArray([rootBlock]);
  assertWrapBlockNodes({
    ...PROPS,
    contentState,
  });
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
      text: 'first list item',
      type: 'ordered-list-item',
    }),
  ]);

  assertWrapBlockNodes({
    ...PROPS,
    contentState,
    block: rootBlock,
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
      text: 'first list item',
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

  assertWrapBlockNodes({
    ...PROPS,
    contentState,
    block: rootBlock,
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

  assertWrapBlockNodes({
    ...PROPS,
    contentState,
    block: rootBlock,
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
      text: 'first list item',
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

  assertWrapBlockNodes({
    ...PROPS,
    contentState,
    block: rootBlock,
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

  assertWrapBlockNodes({
    ...PROPS,
    contentState,
    block: rootBlock,
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
      text: 'first list item',
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

  assertWrapBlockNodes({
    ...PROPS,
    contentState,
    decorator,
    block: rootBlock,
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
      text: 'first list item',
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

  assertWrapBlockNodes({
    ...PROPS,
    contentState,
    block: rootBlock,
    direction: UnicodeBidiDirection.RTL,
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
      text: 'first list item',
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

  assertWrapBlockNodes({
    ...PROPS,
    contentState,
    block: rootBlock,
    blockRendererFn: block => {
      if (block.getType() === 'header-one') {
        return {
          component: CustomBlock,
        };
      }
      return null;
    },
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
      text: 'first list item',
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

  assertWrapBlockNodes({
    ...PROPS,
    contentState,
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
      text: 'first list item',
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

  assertWrapBlockNodes({
    ...PROPS,
    contentState,
    block: rootBlock,
    blockStyleFn: block => {
      if (block.getType() === 'header-one') {
        return 'My-fancy-custom-class';
      }
      return null;
    },
    tree: BlockTree.generate(contentState, rootBlock, null),
  });
});
