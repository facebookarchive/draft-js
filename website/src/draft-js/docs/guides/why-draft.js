/**
 * @generated
 */
var React = require("React");
var Layout = require("DocsLayout");
var content = `
## Hey
`
var Post = React.createClass({
  statics: {
    content: content
  },
  render: function() {
    return <Layout metadata={{"id":"guides-why-draft","title":"Why Draft?","layout":"docs","category":"Guides","next":"guides-controlling-contenteditable","permalink":"docs/guides/why-draft.html"}}>{content}</Layout>;
  }
});
module.exports = Post;
