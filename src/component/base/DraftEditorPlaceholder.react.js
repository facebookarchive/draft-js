/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 * @emails oncall+draft_js
 */

'use strict';

import type {DraftTextAlignment} from 'DraftTextAlignment';
import type EditorState from 'EditorState';

const React = require('React');

const cx = require('cx');
const shallowEqual = require('shallowEqual');

type Props = {
  accessibilityID: string,
  editorState: EditorState,
  text: string,
  textAlignment: DraftTextAlignment,
  ...
};

/**
 * This component is responsible for rendering placeholder text for the
 * `DraftEditor` component.
 *
 * Override placeholder style via CSS.
 */
class DraftEditorPlaceholder extends React.Component<Props> {
  shouldComponentUpdate(nextProps: Props): boolean {
    const {editorState, ...otherProps} = this.props;
    const {editorState: nextEditorState, ...nextOtherProps} = nextProps;
    return (
      editorState.getSelection().getHasFocus() !==
        nextEditorState.getSelection().getHasFocus() ||
      shallowEqual(otherProps, nextOtherProps)
    );
  }

  render(): React.Node {
    const hasFocus = this.props.editorState.getSelection().getHasFocus();

    const className = cx({
      'public/DraftEditorPlaceholder/root': true,
      'public/DraftEditorPlaceholder/hasFocus': hasFocus,
    });

    const contentStyle = {
      whiteSpace: 'pre-wrap',
    };

    return (
      <div className={className}>
        <div
          className={cx('public/DraftEditorPlaceholder/inner')}
          id={this.props.accessibilityID}
          style={contentStyle}>
          {this.props.text}
        </div>
      </div>
    );
  }
}

module.exports = DraftEditorPlaceholder;
