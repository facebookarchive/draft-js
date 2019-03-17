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

const UserAgent = require('UserAgent');
const Immutable = require('immutable');

const findAncestorOffsetKey = require('findAncestorOffsetKey');
const invariant = require('invariant');
const nullthrows = require('nullthrows');

const {OrderedMap} = Immutable;

type MutationRecordT =
  | MutationRecord
  | {|type: 'characterData', target: Node, removedNodes?: void|};

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
  observer: MutationObserver;
  container: HTMLElement;
  mutations: OrderedMap<string, string>;
  onCharData: ({target: EventTarget, type: string}) => void;

  constructor(container: HTMLElement) {
    this.container = container;
    this.mutations = new OrderedMap();
    if (window.MutationObserver && !USE_CHAR_DATA) {
      this.observer = new window.MutationObserver(mutations =>
        this.registerMutations(mutations),
      );
    } else {
      this.onCharData = e => {
        invariant(e.target instanceof Node);
        this.registerMutation({
          type: 'characterData',
          target: e.target,
        });
      };
    }
  }

  start() {
    if (this.observer) {
      this.observer.observe(this.container, DOM_OBSERVER_OPTIONS);
    } else {
      this.container.addEventListener(
        'DOMCharacterDataModified',
        this.onCharData,
      );
    }
  }

  stopAndFlushMutations() {
    if (this.observer) {
      this.registerMutations(this.observer.takeRecords());
      this.observer.disconnect();
    } else {
      this.container.removeEventListener(
        'DOMCharacterDataModified',
        this.onCharData,
      );
    }
    const mutations = this.mutations;
    this.mutations = new OrderedMap();
    return mutations;
  }

  registerMutations(mutations: Array<MutationRecord>) {
    for (let i = 0; i < mutations.length; i++) {
      this.registerMutation(mutations[i]);
    }
  }

  getMutationTextContent(mutation: MutationRecordT) {
    const {type, target, removedNodes} = mutation;
    if (type === 'characterData') {
      const {textContent} = target;
      // When `textContent` is '', there is a race condition that makes
      // getting the offsetKey from the target not possible.
      // These events are also followed by a `childList`, which is the one
      // we are able to retrieve the offsetKey and apply the '' text.
      return textContent === '' ? null : textContent;
    }
    // `characterData` events won't happen or are ignored when
    // removing the last character of a leaf node, what happens
    // instead is a `childList` event with a `removedNodes` array.
    // For this case the textContent should be '' and
    // `DraftModifier.replaceText` will make sure the content is
    // updated properly.
    if (type === 'childList' && removedNodes && removedNodes.length) {
      return '';
    }
    return null;
  }

  registerMutation(mutation: MutationRecordT) {
    const textContent = this.getMutationTextContent(mutation);
    if (textContent != null) {
      const offsetKey = nullthrows(findAncestorOffsetKey(mutation.target));
      this.mutations = this.mutations.set(offsetKey, textContent);
    }
  }
}

module.exports = DOMObserver;
