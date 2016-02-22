/**
 * @generated
 */
var React = require("React");
var Layout = require("DocsLayout");
var content = `
Test
`
var Post = React.createClass({
  statics: {
    content: content
  },
  render: function() {
    return <Layout metadata={{"id":"model-overview","title":"Overview","layout":"docs","category":"Model","next":"model-selection-state","permalink":"docs/model/overview.html"}}>{content}</Layout>;
  }
});
module.exports = Post;
