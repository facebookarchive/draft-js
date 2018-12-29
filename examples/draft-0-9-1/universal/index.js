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

'use strict';

var React = require('react');
var ReactDOMServer = require('react-dom/server');

var SimpleEditor = require('./editor.js').SimpleEditor;

var express = require('express');

var app = express();

app.use('/static', express.static('static'));

app.get('/', (req, res) => {
  const rendered = ReactDOMServer.renderToString(<SimpleEditor />);
  const page = `<!doctype html>
<html>
  <body>
    <div id="react-content">${ rendered }</div>
    <script src="/static/bundle.js"></script>
  </body>
</html>
  `;
  res.send(page);
});

app.listen(3003);
console.log('app now listening at http://localhost:3003');
