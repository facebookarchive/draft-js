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

const UserAgent = require('UserAgent');

const invariant = require('invariant');

const isOldIE = UserAgent.isBrowser('IE <= 9');

// Provides a dom node that will not execute scripts
// https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation.createHTMLDocument
// https://developer.mozilla.org/en-US/Add-ons/Code_snippets/HTML_to_DOM

function getSafeBodyFromHTML(html: string): ?Element {
  let doc;
  let root = null;
  // Provides a safe context
  if (
    !isOldIE &&
    document.implementation &&
    document.implementation.createHTMLDocument
  ) {
    doc = document.implementation.createHTMLDocument('foo');
    invariant(doc.documentElement, 'Missing doc.documentElement');
    doc.documentElement.innerHTML = html;
    root = doc.getElementsByTagName('body')[0];
  }
  return root;
}

module.exports = getSafeBodyFromHTML;
