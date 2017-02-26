var React = require('react');
var ReactDom = require('react-dom');

var SimpleEditor = require('./editor.js').SimpleEditor;

ReactDom.render(<SimpleEditor />, document.getElementById('react-content'));
