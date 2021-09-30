/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict
 * @emails oncall+draft_js
 */

'use strict';

const invariant = require('invariant');

const TEXT_CLIPPING_REGEX = /\.textClipping$/;

const TEXT_TYPES = {
  'text/plain': true,
  'text/html': true,
  'text/rtf': true,
};

// Somewhat arbitrary upper bound on text size. Let's not lock up the browser.
const TEXT_SIZE_UPPER_BOUND = 5000;

/**
 * Extract the text content from a file list.
 */
function getTextContentFromFiles(
  files: Array<File>,
  callback: (contents: string) => void,
): void {
  let readCount = 0;
  const results = [];
  files.forEach(function(/*blob*/ file) {
    readFile(file, function(/*string*/ text) {
      readCount++;
      text && results.push(text.slice(0, TEXT_SIZE_UPPER_BOUND));
      if (readCount == files.length) {
        callback(results.join('\r'));
      }
    });
  });
}

/**
 * todo isaac: Do work to turn html/rtf into a content fragment.
 */
function readFile(file: File, callback: (contents: string) => void): void {
  if (!global.FileReader || (file.type && !(file.type in TEXT_TYPES))) {
    callback('');
    return;
  }

  if (file.type === '') {
    let contents = '';
    // Special-case text clippings, which have an empty type but include
    // `.textClipping` in the file name. `readAsText` results in an empty
    // string for text clippings, so we force the file name to serve
    // as the text value for the file.
    if (TEXT_CLIPPING_REGEX.test(file.name)) {
      contents = file.name.replace(TEXT_CLIPPING_REGEX, '');
    }
    callback(contents);
    return;
  }

  const reader = new FileReader();
  reader.onload = function() {
    const result = reader.result;
    invariant(
      typeof result === 'string',
      'We should be calling "FileReader.readAsText" which returns a string',
    );
    callback(result);
  };
  reader.onerror = function() {
    callback('');
  };
  reader.readAsText(file);
}

module.exports = getTextContentFromFiles;
