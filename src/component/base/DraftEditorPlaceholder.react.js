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
const joinClasses = require('joinClasses');
const shallowEqual = require('shallowEqual');

type Props = {
  accessibilityID: string,
  className?: string,
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
    return (
      <div
        className={cx({
          'public/DraftEditorPlaceholder/root': true,
          'public/DraftEditorPlaceholder/hasFocus': this.props.editorState
            .getSelection()
            .getHasFocus(),
        })}>
        <div
          className={joinClasses(
            cx('public/DraftEditorPlaceholder/inner'),
            this.props.className,
          )}
          id={this.props.accessibilityID}
          style={{
            whiteSpace: 'pre-wrap',
          }}>
          {this.props.text}
        </div>
      </div>
    );
  }
}

module.exports = DraftEditorPlaceholder;
