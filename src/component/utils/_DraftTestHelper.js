/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @emails oncall+draft_js
 */

const BLACK_LIST_PROPS = ['data-reactroot'];
const transformSnapshotProps = (
  node: any,
  blackList: Array<string> = BLACK_LIST_PROPS,
): any => {
  const stack = [node];
  while (stack.length) {
    const node = stack.pop();
    if (node.props) {
      if (node.props.className) {
        node.props.className = node.props.className.replace(/-/g, '__');
      }
      BLACK_LIST_PROPS.forEach(prop => delete node.props[prop]);
    }
    if (Array.isArray(node.children)) {
      stack.push(...node.children);
    }
  }
  return node;
};

const DraftTestHelper = {
  /**
   * This is meant to be used in combination with ReactTestRenderer
   * to ensure compatibility with running our snapshot tests internally
   *
   * usage example:
   *
   * const blockNode = ReactTestRenderer.create(
   *  <DraftComponentFooBar {...childProps} />,
   * );
   *
   * expect(transformSnapshotProps(blockNode.toJSON())).toMatchSnapshot();
   */
  transformSnapshotProps,
};

module.exports = DraftTestHelper;
