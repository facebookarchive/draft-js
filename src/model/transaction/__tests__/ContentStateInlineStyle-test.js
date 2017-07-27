/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+ui_infra
 */

'use strict';

jest.disableAutomock();

const ContentStateInlineStyle = require('ContentStateInlineStyle');
const {
  List,
  Repeat,
} = require('immutable');

const getSampleStateForTesting = require('getSampleStateForTesting');

describe('ContentStateInlineStyle', () => {
  const {
    contentState,
    selectionState,
  } = getSampleStateForTesting();

  function getStyles(block) {
    return block.getCharacterList().map(c => c.getStyle()).flatten().toJS();
  }

  describe('Within a single block', () => {
    const blockKey = selectionState.getStartKey();
    const length = contentState.getBlockForKey(blockKey).getLength();
    const target = selectionState.set('focusOffset', length);

    it('must add styles', () => {
      let modified = ContentStateInlineStyle.add(contentState, target, 'BOLD');
      expect(
        getStyles(modified.getBlockForKey(blockKey)),
      ).toEqual(
        Repeat('BOLD', length).toJS(),
      );

      const nextTarget = target.set('focusOffset', 2);
      modified = ContentStateInlineStyle.add(modified, nextTarget, 'ITALIC');
      expect(
        getStyles(modified.getBlockForKey(blockKey)),
      ).toEqual(
        List(['BOLD', 'ITALIC', 'BOLD', 'ITALIC'])
          .concat(List(Repeat('BOLD', 3))).toJS(),
      );
    });

    it('must remove styles', () => {
      // Go ahead and add some styles that we'll then remove.
      let modified = ContentStateInlineStyle.add(
        contentState,
        target,
        'BOLD',
      );
      modified = ContentStateInlineStyle.add(modified, target, 'ITALIC');
      modified = ContentStateInlineStyle.remove(modified, target, 'BOLD');
      expect(
        getStyles(modified.getBlockForKey(blockKey)),
      ).toEqual(
        Repeat('ITALIC', length).toJS(),
      );

      const nextTarget = target.set('focusOffset', 2);
      modified = ContentStateInlineStyle.remove(modified, nextTarget, 'ITALIC');
      expect(
        getStyles(modified.getBlockForKey(blockKey)),
      ).toEqual(
        List(Repeat('ITALIC', 3)).toJS(),
      );
    });
  });

  describe('Across multiple blocks', () => {
    const nextBlock = contentState.getBlockAfter(selectionState.getStartKey());
    const target = selectionState.merge({
      focusKey: nextBlock.getKey(),
      focusOffset: nextBlock.getLength(),
    });

    it('must add and remove styles', () => {
      let modified = ContentStateInlineStyle.add(contentState, target, 'BOLD');
      const start = contentState.getBlockForKey(target.getStartKey());

      expect(
        getStyles(modified.getBlockForKey(target.getStartKey())),
      ).toEqual(
        Repeat('BOLD', start.getLength()).toJS(),
      );

      expect(
        getStyles(modified.getBlockForKey(nextBlock.getKey())),
      ).toEqual(
        Repeat('BOLD', nextBlock.getLength()).toJS(),
      );

      modified = ContentStateInlineStyle.remove(contentState, target, 'BOLD');

      expect(
        getStyles(modified.getBlockForKey(target.getStartKey())).length,
      ).toEqual(0);

      expect(
        getStyles(modified.getBlockForKey(nextBlock.getKey())).length,
      ).toEqual(0);
    });
  });
});
