/**
 * marked - a markdown parser
 * Copyright (c) 2011-2013, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/chjj/marked
 *
 * @providesModule Marked
 * @jsx React.DOM
 * @preserve-header
 */

var React = require('React');
var marked = require('marked');

var prism = require('prismjs');
require('prismjs/components/prism-markup');
require('prismjs/components/prism-javascript');
require('prismjs/components/prism-css');
require('prismjs/components/prism-diff');
require('prismjs/components/prism-jsx');

const renderer = new marked.Renderer();
renderer.code = (code, lang) => {
  let language;
  switch (lang) {
    case 'diff':
      language = prism.languages.diff;
      break;

    case 'css':
      language = prism.languages.css;
      break;

    case 'js':
    case 'jsx':
    default:
      language = prism.languages.jsx;
      break;
  }
  return `<pre class="prism language-${lang}">${prism.highlight(code, language)}</pre>`;
};

// monkey patch to preserve non-breaking spaces
// https://github.com/chjj/marked/blob/6b0416d10910702f73da9cb6bb3d4c8dcb7dead7/lib/marked.js#L142-L150
marked.Lexer.prototype.lex = function lex(src) {
  src = src
    .replace(/\r\n|\r/g, '\n')
    .replace(/\t/g, '    ')
    .replace(/\u2424/g, '\n');

  return this.token(src, true);
};

marked.setOptions({
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: false,
  silent: false,
  highlight: null,
  langPrefix: 'lang-',
  smartypants: false,
  paragraphFn: null,
  renderer: renderer,
});

var Marked = React.createClass({
  render: function() {
    return (
      <div
        dangerouslySetInnerHTML={{ __html: marked(this.props.children, this.props) }}
      />
    )
  },
});

module.exports = Marked;
