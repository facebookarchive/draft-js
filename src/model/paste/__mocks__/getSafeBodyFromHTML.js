/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+draft_js
 */

// THIS IS PURELY A MOCK TO GET AROUND THE TEST FRAMEWORK
// Never use this for anything else ever.
function getUnsafeBodyFromHTML(html) {
  const fragment = document.createElement('body');
  const match = html.match(/<body>(.*?)<\/body>/);
  fragment.innerHTML = match ? match[1] : html;
  return fragment;
}

module.exports = getUnsafeBodyFromHTML;
