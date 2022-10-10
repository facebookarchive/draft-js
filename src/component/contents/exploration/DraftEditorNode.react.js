/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * This is unstable and not part of the public API and should not be used by
 * production systems. This file may be update/removed without notice.
 *
 * @flow
 * @format
 * @oncall draft_js
 */

'use strict';

import type {BlockNodeRecord} from 'BlockNodeRecord';
import type ContentState from 'ContentState';
import type {DraftDecoratorType} from 'DraftDecoratorType';
import type SelectionState from 'SelectionState';
import type {BidiDirection} from 'UnicodeBidiDirection';

const DraftEditorDecoratedLeaves = require('DraftEditorDecoratedLeaves.react');
const DraftEditorLeaf = require('DraftEditorLeaf.react');
const DraftOffsetKey = require('DraftOffsetKey');

const cx = require('cx');
const Immutable = require('immutable');
const React = require('react');

const {List} = Immutable;

type Props = {
  block: BlockNodeRecord,
  children: ?Array<React.Node>,
  contentState: ContentState,
  customStyleFn: Function,
  customStyleMap: Object,
  decorator: ?DraftDecoratorType,
  direction: BidiDirection,
  forceSelection: boolean,
  hasSelection: boolean,
  selection: SelectionState,
  tree: List<any>,
  ...
};

class DraftEditorNode extends React.Component<Props> {
  render(): React.Node {
    const {
      block,
      contentState,
      customStyleFn,
      customStyleMap,
      decorator,
      direction,
      forceSelection,
      hasSelection,
      selection,
      tree,
    } = this.props;

    const blockKey = block.getKey();
    const text = block.getText();
    const lastLeafSet = tree.size - 1;

    const children =
      this.props.children ||
      tree
        .map((leafSet, ii) => {
          const decoratorKey = leafSet.get('decoratorKey');
          const leavesForLeafSet = leafSet.get('leaves');
          const lastLeaf = leavesForLeafSet.size - 1;
          const Leaves = leavesForLeafSet
            .map((leaf, jj) => {
              const offsetKey = DraftOffsetKey.encode(blockKey, ii, jj);
              const start = leaf.get('start');
              const end = leaf.get('end');
              return (
                <DraftEditorLeaf
                  key={offsetKey}
                  offsetKey={offsetKey}
                  block={block}
                  start={start}
                  selection={hasSelection ? selection : null}
                  forceSelection={forceSelection}
                  text={text.slice(start, end)}
                  styleSet={block.getInlineStyleAt(start)}
                  customStyleMap={customStyleMap}
                  customStyleFn={customStyleFn}
                  isLast={decoratorKey === lastLeafSet && jj === lastLeaf}
                />
              );
            })
            .toArray();

          if (!decoratorKey || !decorator) {
            return Leaves;
          }

          return (
            <DraftEditorDecoratedLeaves
              block={block}
              children={Leaves}
              contentState={contentState}
              decorator={decorator}
              decoratorKey={decoratorKey}
              direction={direction}
              leafSet={leafSet}
              text={text}
              key={ii}
            />
          );
        })
        .toArray();

    return (
      <div
        data-offset-key={DraftOffsetKey.encode(blockKey, 0, 0)}
        className={cx({
          'public/DraftStyleDefault/block': true,
          'public/DraftStyleDefault/ltr': direction === 'LTR',
          'public/DraftStyleDefault/rtl': direction === 'RTL',
        })}>
        {children}
      </div>
    );
  }
}

module.exports = DraftEditorNode;
