/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const siteConfig = {
  title: 'Draft.js' /* title for your website */,
  tagline: 'Rich Text Editor Framework for React',
  url: 'https://draftjs.org' /* your website url */,
  cname: 'draftjs.org',
  baseUrl: '/' /* base url for your project */,
  organizationName: 'facebook',
  projectName: 'draft-js',
  headerLinks: [
    {doc: 'getting-started', label: 'Docs'},
    {
      href: "https://github.com/facebook/draft-js",
      label: "GitHub"
    }
  ],
  headerIcon: 'img/draftjs-logo.svg',
  favicon: 'img/draftjs-logo.ico',
  /* colors for website */
  colors: {
    primaryColor: '#3B3738',
    secondaryColor: '#843131',
  },
  // This copyright info is used in /core/Footer.js and blog rss/atom feeds.
  copyright:
    'Copyright © ' +
    new Date().getFullYear() +
    ' Facebook Inc.',
  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks
    theme: 'atelier-forest-light',
  },
  scripts: ['https://buttons.github.io/buttons.js'],
  // You may provide arbitrary config keys to be used as needed by your template.
  repoUrl: 'https://github.com/facebook/draft-js',

  // Google analytics tracking id
  gaTrackingId: 'UA-44373548-19',

  // Show page's Table of Contents
  onPageNav: 'separate',

  // No .html in the path.
  cleanUrl: true,

  // Algolia search.
  algolia: {
    apiKey: 'ae94c9e3ee00ea8edddd484adafc37cd',
    indexName: 'draft-js',
  },
};

module.exports = siteConfig;
