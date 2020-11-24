/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * 
 * @emails oncall+draft_js
 */
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var UserAgent = require("fbjs/lib/UserAgent");

var findAncestorOffsetKey = require("./findAncestorOffsetKey");

var getWindowForNode = require("./getWindowForNode");

var Immutable = require("immutable");

var invariant = require("fbjs/lib/invariant");

var nullthrows = require("fbjs/lib/nullthrows");

var Map = Immutable.Map;
// Heavily based on Prosemirror's DOMObserver https://github.com/ProseMirror/prosemirror-view/blob/master/src/domobserver.js
var DOM_OBSERVER_OPTIONS = {
  subtree: true,
  characterData: true,
  childList: true,
  characterDataOldValue: false,
  attributes: false
}; // IE11 has very broken mutation observers, so we also listen to DOMCharacterDataModified

var USE_CHAR_DATA = UserAgent.isBrowser('IE <= 11');

var DOMObserver = /*#__PURE__*/function () {
  function DOMObserver(container) {
    var _this = this;

    _defineProperty(this, "observer", void 0);

    _defineProperty(this, "container", void 0);

    _defineProperty(this, "mutations", void 0);

    _defineProperty(this, "onCharData", void 0);

    this.container = container;
    this.mutations = Map();
    var containerWindow = getWindowForNode(container);

    if (containerWindow.MutationObserver && !USE_CHAR_DATA) {
      this.observer = new containerWindow.MutationObserver(function (mutations) {
        return _this.registerMutations(mutations);
      });
    } else {
      this.onCharData = function (e) {
        !(e.target instanceof Node) ? process.env.NODE_ENV !== "production" ? invariant(false, 'Expected target to be an instance of Node') : invariant(false) : void 0;

        _this.registerMutation({
          type: 'characterData',
          target: e.target
        });
      };
    }
  }

  var _proto = DOMObserver.prototype;

  _proto.start = function start() {
    if (this.observer) {
      this.observer.observe(this.container, DOM_OBSERVER_OPTIONS);
    } else {
      /* $FlowFixMe[incompatible-call] (>=0.68.0 site=www,mobile) This event
       * type is not defined by Flow's standard library */
      this.container.addEventListener('DOMCharacterDataModified', this.onCharData);
    }
  };

  _proto.stopAndFlushMutations = function stopAndFlushMutations() {
    var observer = this.observer;

    if (observer) {
      this.registerMutations(observer.takeRecords());
      observer.disconnect();
    } else {
      /* $FlowFixMe[incompatible-call] (>=0.68.0 site=www,mobile) This event
       * type is not defined by Flow's standard library */
      this.container.removeEventListener('DOMCharacterDataModified', this.onCharData);
    }

    var mutations = this.mutations;
    this.mutations = Map();
    return mutations;
  };

  _proto.registerMutations = function registerMutations(mutations) {
    for (var i = 0; i < mutations.length; i++) {
      this.registerMutation(mutations[i]);
    }
  };

  _proto.getMutationTextContent = function getMutationTextContent(mutation) {
    var type = mutation.type,
        target = mutation.target,
        removedNodes = mutation.removedNodes;

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
  };

  _proto.registerMutation = function registerMutation(mutation) {
    var textContent = this.getMutationTextContent(mutation);

    if (textContent != null) {
      var offsetKey = nullthrows(findAncestorOffsetKey(mutation.target));
      this.mutations = this.mutations.set(offsetKey, textContent);
    }
  };

  return DOMObserver;
}();

module.exports = DOMObserver;