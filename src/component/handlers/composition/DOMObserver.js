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

const getCorrectDocumentFromNode = require('getCorrectDocumentFromNode');
const getWindowForNode = require('getWindowForNode');
const Immutable = require('immutable');
const invariant = require('invariant');

const {Map} = Immutable;

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
  observer: ?MutationObserver;
  container: HTMLElement;
  mutations: Map<string, string>;
  onCharData: ?({target: EventTarget, type: string}) => void;

  constructor(container: HTMLElement) {
    this.container = container;
    this.mutations = Map();
    const containerWindow = getWindowForNode(container);
    if (containerWindow.MutationObserver && !USE_CHAR_DATA) {
      this.observer = new containerWindow.MutationObserver(mutations =>
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
      /* $FlowFixMe(>=0.68.0 site=www,mobile) This event type is not defined
       * by Flow's standard library */
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
      /* $FlowFixMe(>=0.68.0 site=www,mobile) This event type is not defined
       * by Flow's standard library */
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

  registerMutation(mutation: MutationRecordT): void {
    const {type, target, removedNodes} = mutation;

    if (type === 'characterData') {
      const targetOffsetKey = findRealAncestorOffsetKey(target);

      // When `textContent` is '', there is a race condition that makes
      // getting the offsetKey from the target not possible.
      // These events are also followed by a `childList`, which is the one
      // we are able to retrieve the offsetKey and apply the '' text.
      if (target.textContent !== '' && targetOffsetKey) {
        let txt = target.textContent

        // IE 11 considers the enter keypress that concludes the composition
        // as an input char. This strips that newline character so the draft
        // state does not receive spurious newlines.
        if (USE_CHAR_DATA) {
          txt = target.textContent.replace('\n', '');
        }

        this.mutations = this.mutations.set(
          targetOffsetKey,
          txt,
        );
      }
    } else if (type === 'childList' && removedNodes && removedNodes.length) {
      const rmNode = removedNodes[0];
      const rmNodeOffsetKey = getOffsetKey(rmNode);

      // that means a leaf in treeMap will be empty
      if (rmNodeOffsetKey) {
        this.mutations = this.mutations.set(rmNodeOffsetKey, '');
      }
    } else if (type === 'childList' && target.textContent !== '') {
      // Typing Chinese in an empty block in MS Edge results in a
      // `childList` event with non-empty textContent.
      // See https://github.com/facebook/draft-js/issues/2082
      this.mutations = this.mutations.set(
        targetOffsetKey,
        target.textContent,
      );
    }
  }
}

// See https://github.com/facebook/draft-js/issues/2466
function findRealAncestorOffsetKey(node: Node): ?string {
  let searchNode = node;
  while (
    searchNode &&
    searchNode !== getCorrectDocumentFromNode(node).documentElement
  ) {
    const key = getOffsetKey(searchNode);

    if (key) {
      return key;
    }
    searchNode = searchNode.parentNode;
  }
  return null;
}

function getOffsetKey(node: Node): ?string {
  const key = node.getAttribute && node.getAttribute('data-offset-key');
  return key || null;
}

module.exports = DOMObserver;
