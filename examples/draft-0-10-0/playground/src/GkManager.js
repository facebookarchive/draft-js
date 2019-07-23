/**
 * Copyright (c) Facebook, Inc. and its affiliates. All rights reserved.
 *
 * This file provided by Facebook is for non-commercial testing and evaluation
 * purposes only. Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import querystring from 'querystring';

const QUERY_STRINGS = querystring.parse(window.location.search.substring(1));

// overwrite the feature flag stub object
const GKManager = (window.__DRAFT_GKX = {});

// enable or disable feature flags
const flagControls = {
  gk_disable: flags =>
    flags.forEach(flag => (window.__DRAFT_GKX[flag] = false)),
  gk_enable: flags => flags.forEach(flag => (window.__DRAFT_GKX[flag] = true)),
};

Object.keys(flagControls)
  .filter(flag => QUERY_STRINGS[flag])
  .forEach(flag => flagControls[flag](QUERY_STRINGS[flag].split(',')));

export default GKManager;
