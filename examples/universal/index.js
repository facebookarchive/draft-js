var React = require('react');
var ReactDOMServer = require('react-dom/server');

var { SimpleEditor } = require('./editor.js');

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
