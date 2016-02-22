/**
 * @generated
 */
var React = require("React");
var Layout = require("DocsLayout");
var content = `
Draft is a JavaScript framework that enables the creation of rich text editing
experiences.
`
var Post = React.createClass({
  statics: {
    content: content
  },
  render: function() {
    return <Layout metadata={{"id":"guides-why-draft","title":"Why Draft?","layout":"docs","category":"Guides","next":"guides-controlling-contenteditable","permalink":"docs/guides/controlled-contenteditable.html"}}>{content}</Layout>;
  }
});
module.exports = Post;
