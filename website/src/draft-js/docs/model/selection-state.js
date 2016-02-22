/**
 * @generated
 */
var React = require("React");
var Layout = require("DocsLayout");
var content = `
Draft is the application architecture that Facebook uses for building
client-side web applications.  It complements React's composable view
components by utilizing a unidirectional data flow.  It's more of a pattern
rather than a formal framework, and you can start using Rewrite immediately
without a lot of new code.
`
var Post = React.createClass({
  statics: {
    content: content
  },
  render: function() {
    return <Layout metadata={{"id":"model-selection-state","title":"SelectionState","layout":"docs","category":"Model","next":"api-reference-editor-state","permalink":"docs/model/selection-state.html"}}>{content}</Layout>;
  }
});
module.exports = Post;
