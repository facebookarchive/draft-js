/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 * @emails oncall+draft_js
 *
 * This is unstable and not part of the public API and should not be used by
 * production systems. This file may be update/removed without notice.
 */

'use strict';

import type {BlockNodeRecord} from 'BlockNodeRecord';
import type ContentState from 'ContentState';
import type {DraftDecoratorType} from 'DraftDecoratorType';
import type {BidiDirection} from 'UnicodeBidiDirection';
import type {Set} from 'immutable';

const DraftOffsetKey = require('DraftOffsetKey');
const UnicodeBidi = require('UnicodeBidi');
const UnicodeBidiDirection = require('UnicodeBidiDirection');

const React = require('react');

type Props = {
  block: BlockNodeRecord,
  children: ?$ReadOnlyArray<React.Node>,
  contentState: ContentState,
  decorator: DraftDecoratorType,
  decoratorKey: string,
  direction: BidiDirection,
  text: string,
  leafSet: Set<any>,
  ...
};

class DraftEditorDecoratedLeaves extends React.Component<Props> {
  render(): React.Node {
    const {
      block,
      children,
      contentState,
      decorator,
      decoratorKey,
      direction,
      leafSet,
      text,
    } = this.props;

    const blockKey = block.getKey();
    const leavesForLeafSet = leafSet.get('leaves');
    const DecoratorComponent = decorator.getComponentForKey(decoratorKey);
    const decoratorProps = decorator.getPropsForKey(decoratorKey);
    const decoratorOffsetKey = DraftOffsetKey.encode(
      blockKey,
      parseInt(decoratorKey, 10),
      0,
    );

    const decoratedText = text.slice(
      leavesForLeafSet.first().get('start'),
      leavesForLeafSet.last().get('end'),
    );

    // Resetting dir to the same value on a child node makes Chrome/Firefox
    // confused on cursor movement. See http://jsfiddle.net/d157kLck/3/
    const dir = UnicodeBidiDirection.getHTMLDirIfDifferent(
      UnicodeBidi.getDirection(decoratedText),
      direction,
    );

    return (
      <DecoratorComponent
        {...decoratorProps}
        contentState={contentState}
        decoratedText={decoratedText}
        dir={dir}
        key={decoratorOffsetKey}
        entityKey={block.getEntityAt(leafSet.get('start'))}
        offsetKey={decoratorOffsetKey}>
        {children}
      </DecoratorComponent>
    );
  }
}

module.exports = DraftEditorDecoratedLeaves;
