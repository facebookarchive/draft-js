// Copyright 2004-present Facebook. All Rights Reserved.

// THIS IS PURELY A MOCK TO GET AROUND THE TEST FRAMEWORK
// Never use this for anything else ever.
function getUnsafeBodyFromHTML(html) {
  var fragment = document.createElement('body');
  var match = html.match(/<body>(.*?)<\/body>/);
  fragment.innerHTML = match ? match[1] : html;
  return fragment;
}

module.exports = getUnsafeBodyFromHTML;
