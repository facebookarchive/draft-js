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

const PROPS = {
  blockRenderMap: DefaultDraftBlockRenderMap,
  blockRendererFn: block => null,
  blockStyleFn: block => '',
  customStyleFn: (style, block) => null,
  editorKey: 'editor',
  blockProps: {},
};

const assertWrapBlockNodes = (props = {}) => {
  const editorState = EditorState.createWithContent(props.contentState);
  const nodes = props.contentState.getBlocksAsArray().map(block => {
    const configForType =
      blockRenderMap.get(block.getType()) || blockRenderMap.get('unstyled');

    const wrapperTemplate = configForType.wrapper;
    const key = block.getKey();
    const offsetKey = DraftOffsetKey.encode(key, 0, 0);

    const childProps = {
      ...PROPS,
      ...props,
      selection: editorState.getSelection(),
      block,
      wrapperTemplate,
      editorState,
      tree: editorState.getBlockTree(key),
      offsetKey,
      key,
    };

    return {
      wrapperTemplate,
      block,
      element: <DraftEditorBlockNode {...childProps} />,
    };
  });

  const blockNode = ReactTestRenderer.create(
    <div>{wrapBlockNodes(nodes, props.contentState)}</div>,
  );

  expect(
    TestHelper.transformSnapshotProps(blockNode.toJSON()),
  ).toMatchSnapshot();
};

test('renders block with no children', () => {
  const rootBlock = new ContentBlockNode({
    key: 'A',
    text: 'some text',
    type: 'header-one',
  });

  const contentState = ContentState.createFromBlockArray([rootBlock]);
  assertWrapBlockNodes({ contentState });
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

  assertWrapBlockNodes({
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

  assertWrapBlockNodes({
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

  assertWrapBlockNodes({
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

  assertWrapBlockNodes({
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

  assertWrapBlockNodes({
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

  assertWrapBlockNodes({
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

  assertWrapBlockNodes({
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

  assertWrapBlockNodes({
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
