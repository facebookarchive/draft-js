"use strict";

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 * @format
 * @emails oncall+draft_js
 */
var BLACK_LIST_PROPS = ['data-reactroot'];

var transformSnapshotProps = function transformSnapshotProps(node) {
  var blackList = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : BLACK_LIST_PROPS;
  var stack = [node];

  var _loop = function _loop() {
    var node = stack.pop();

    if (node.props) {
      if (node.props.className) {
        node.props.className = node.props.className.replace(/-/g, '__');
      }

      BLACK_LIST_PROPS.forEach(function (prop) {
        return delete node.props[prop];
      });
    }

    if (Array.isArray(node.children)) {
      stack.push.apply(stack, node.children);
    }
  };

  while (stack.length) {
    _loop();
  }

  return node;
};

var DraftTestHelper = {
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
  transformSnapshotProps: transformSnapshotProps
};
module.exports = DraftTestHelper;