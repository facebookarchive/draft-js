/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @emails oncall+ads_integration_management
 * @flow strict-local
 * @format
 */

'use strict';

const MAX_ASCII_CHARACTER = 127;

/**
 * Serializes strings with non-ASCII characters to their Unicode escape
 * sequences (eg. \u2022), to avoid hitting this lint rule:
 * "Source code should only include printable US-ASCII bytes"
 */
const NonASCIIStringSnapshotSerializer = {
  test(val: mixed): boolean {
    if (typeof val !== 'string') {
      return false;
    }
    for (let i = 0; i < val.length; i++) {
      if (val.charCodeAt(i) > MAX_ASCII_CHARACTER) {
        return true;
      }
    }
    return false;
  },

  print: (val: string): string => {
    return (
      '"' +
      val
        .split('')
        .map((char) => {
          const code = char.charCodeAt(0);
          return code > MAX_ASCII_CHARACTER
            ? '\\u' + code.toString(16).padStart(4, '0')
            : char;
        })
        .join('')
        // Keep the same behaviour as Jest's regular string snapshot
        // serialization, which escapes double quotes.
        .replace(/"/g, '\\"') +
      '"'
    );
  },
};

module.exports = NonASCIIStringSnapshotSerializer;
