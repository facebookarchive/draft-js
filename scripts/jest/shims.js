/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

// used for testing react fiber
global.requestAnimationFrame = (callback) => global.setTimeout(callback, 0);
