/**
 * @generated
 */
var React = require("React");
var Layout = require("DocsLayout");
var content = `
## hi
`
var Post = React.createClass({
  statics: {
    content: content
  },
  render: function() {
    return <Layout metadata={{"id":"quick-start-customizing-your-editor","title":"Customizing Your Editor","layout":"docs","category":"Quick Start","next":"guides-why-draft","permalink":"docs/quickstart/customizing-your-editor.html"}}>{content}</Layout>;
  }
});
module.exports = Post;
