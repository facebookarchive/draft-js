/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 */

// THIS IS PURELY A MOCK TO GET AROUND THE TEST FRAMEWORK
// Never use this for anything else ever.
function getUnsafeBodyFromHTML(html) {
  var fragment = document.createElement('body');
  var match = html.match(/<body>(.*?)<\/body>/);
  fragment.innerHTML = match ? match[1] : html;
  return fragment;
}

module.exports = getUnsafeBodyFromHTML;
