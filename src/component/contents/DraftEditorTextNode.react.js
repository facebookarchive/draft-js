/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 * @flow strict-local
 */

'use strict';

const React = require('React');
const ReactDOM = require('ReactDOM');

const invariant = require('invariant');

/**
 * Check whether the node should be considered a newline.
 */
function isNewline(node: Element): boolean {
  return node.textContent === '\n';
}

/**
 * Placeholder elements for empty text content.
 *
 * What is this `data-text` attribute, anyway? It turns out that we need to
 * put an attribute on the lowest-level text node in order to preserve correct
 * spellcheck handling. If the <span> is naked, Chrome and Safari may do
 * bizarre things to do the DOM -- split text nodes, create extra spans, etc.
 * If the <span> has an attribute, this appears not to happen.
 * See http://jsfiddle.net/9khdavod/ for the failure case, and
 * http://jsfiddle.net/7pg143f7/ for the fixed case.
 */
const NEWLINE_A = (
  <span key="A" data-text="true">
    {'\n'}
  </span>
);

const NEWLINE_B = (
  <span key="B" data-text="true">
    {'\n'}
  </span>
);

type Props = {
  children: string,
};

/**
 * The lowest-level component in a `DraftEditor`, the text node component
 * replaces the default React text node implementation. This allows us to
 * perform custom handling of newline behavior and avoid re-rendering text
 * nodes with DOM state that already matches the expectations of our immutable
 * editor state.
 */
class DraftEditorTextNode extends React.Component<Props> {
  _forceFlag: boolean;

  constructor(props: Props) {
    super(props);
    // By flipping this flag, we also keep flipping keys which forces
    // React to remount this node every time it rerenders.
    this._forceFlag = false;
  }

  shouldComponentUpdate(nextProps: Props): boolean {
    const node = ReactDOM.findDOMNode(this);
    const shouldBeNewline = nextProps.children === '';
    invariant(node instanceof Element, 'node is not an Element');
    if (shouldBeNewline) {
      return !isNewline(node);
    }
    return node.textContent !== nextProps.children;
  }

  componentDidMount(): void {
    this._forceFlag = !this._forceFlag;
  }

  componentDidUpdate(): void {
    this._forceFlag = !this._forceFlag;
  }

  render(): React.Node {
    if (this.props.children === '') {
      return this._forceFlag ? NEWLINE_A : NEWLINE_B;
    }
    return (
      <span key={this._forceFlag ? 'A' : 'B'} data-text="true">
        {this.props.children}
      </span>
    );
  }
}

module.exports = DraftEditorTextNode;
