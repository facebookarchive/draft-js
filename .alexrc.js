/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

exports.allow = [
  // We frequently refer to form props by their name "disabled".
  // Ideally we would alex-ignore only the valid uses (PRs accepted).
  "invalid",

  // Unfortunately "watchman" is a library name that we depend on.
  "watchman-watchwoman"
];

// Use a "maybe" level of profanity instead of the default "unlikely".
exports.profanitySureness = 1;