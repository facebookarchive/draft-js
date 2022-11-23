/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall draft_js
 */

'use strict';

const UserAgent = require('UserAgent');

const findAncestorOffsetKey = require('findAncestorOffsetKey');
const getWindowForNode = require('getWindowForNode');
const Immutable = require('immutable');
const invariant = require('invariant');
const nullthrows = require('nullthrows');

const {Map} = Immutable;

type MutationRecordT =
  | MutationRecord
  | {type: 'characterData', target: Node, removedNodes?: void};

// Heavily based on Prosemirror's DOMObserver https://github.com/ProseMirror/prosemirror-view/blob/master/src/domobserver.js

const DOM_OBSERVER_OPTIONS = {
  subtree: true,
  characterData: true,
  childList: true,
  characterDataOldValue: false,
  attributes: false,
};
// IE11 has very broken mutation observers, so we also listen to DOMCharacterDataModified
const USE_CHAR_DATA = UserAgent.isBrowser('IE <= 11');

class DOMObserver {
  observer: ?MutationObserver;
  container: HTMLElement;
  mutations: Map<string, string>;
  onCharData: ?({
    target: EventTarget,
    type: string,
    ...
  }) => void;

  constructor(container: HTMLElement) {
    this.container = container;
    this.mutations = Map();
    const containerWindow = getWindowForNode(container);
    const MutationObserver = containerWindow.MutationObserver;
    if (MutationObserver && !USE_CHAR_DATA) {
      this.observer = new MutationObserver(mutations =>
        this.registerMutations(mutations),
      );
    } else {
      this.onCharData = e => {
        invariant(
          e.target instanceof Node,
          'Expected target to be an instance of Node',
        );
        this.registerMutation({
          type: 'characterData',
          target: e.target,
        });
      };
    }
  }

  start(): void {
    if (this.observer) {
      this.observer.observe(this.container, DOM_OBSERVER_OPTIONS);
    } else {
      /* $FlowFixMe[incompatible-call] (>=0.68.0 site=www,mobile) This event
       * type is not defined by Flow's standard library */
      this.container.addEventListener(
        'DOMCharacterDataModified',
        this.onCharData,
      );
    }
  }

  stopAndFlushMutations(): Map<string, string> {
    const {observer} = this;
    if (observer) {
      this.registerMutations(observer.takeRecords());
      observer.disconnect();
    } else {
      /* $FlowFixMe[incompatible-call] (>=0.68.0 site=www,mobile) This event
       * type is not defined by Flow's standard library */
      this.container.removeEventListener(
        'DOMCharacterDataModified',
        this.onCharData,
      );
    }
    const mutations = this.mutations;
    this.mutations = Map();
    return mutations;
  }

  registerMutations(mutations: Array<MutationRecord>): void {
    for (let i = 0; i < mutations.length; i++) {
      this.registerMutation(mutations[i]);
    }
  }

  getMutationTextContent(mutation: MutationRecordT): ?string {
    const {type, target, removedNodes} = mutation;
    if (type === 'characterData') {
      // When `textContent` is '', there is a race condition that makes
      // getting the offsetKey from the target not possible.
      // These events are also followed by a `childList`, which is the one
      // we are able to retrieve the offsetKey and apply the '' text.
      if (target.textContent !== '') {
        // IE 11 considers the enter keypress that concludes the composition
        // as an input char. This strips that newline character so the draft
        // state does not receive spurious newlines.
        if (USE_CHAR_DATA) {
          return target.textContent.replace('\n', '');
        }
        return target.textContent;
      }
    } else if (type === 'childList') {
      if (removedNodes && removedNodes.length) {
        // `characterData` events won't happen or are ignored when
        // removing the last character of a leaf node, what happens
        // instead is a `childList` event with a `removedNodes` array.
        // For this case the textContent should be '' and
        // `DraftModifier.replaceText` will make sure the content is
        // updated properly.
        return '';
      } else if (target.textContent !== '') {
        // Typing Chinese in an empty block in MS Edge results in a
        // `childList` event with non-empty textContent.
        // See https://github.com/facebook/draft-js/issues/2082
        return target.textContent;
      }
    }
    return null;
  }

  registerMutation(mutation: MutationRecordT): void {
    const textContent = this.getMutationTextContent(mutation);
    if (textContent != null) {
      const offsetKey = nullthrows(findAncestorOffsetKey(mutation.target));
      this.mutations = this.mutations.set(offsetKey, textContent);
    }
  }
}

module.exports = DOMObserver;
