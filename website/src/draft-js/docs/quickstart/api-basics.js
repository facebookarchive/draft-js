/**
 * @generated
 */
var React = require("React");
var Layout = require("DocsLayout");
var content = `
This document provides an overview of the basics of the \`Draft\` API. A
[working example](https://github.com/facebook/draft-js/tree/master/examples/plaintext)
is also available to follow along.

## Controlled Inputs

The \`DraftEditor\` React component is built as a controlled ContentEditable component,
with the goal of providing a top-level API modeled on the familiar React
*controlled input* API.

As a brief refresher, controlled inputs involve two key pieces:

1. A _value_ to represent the state of the input
2. An _onChange_ prop function to receive updates to the input

This approach allows the component that composes the input to have strict
control over the state of the input, while still allowing updates to the DOM
to provide information about the text that the user has written.

\`\`\`
const MyInput = React.createClass({
  onChange(evt) {
    this.setState({value: evt.target.value});
  },
  render() {
    return <input value={this.state.value} onChange={this.onChange} />;
  }
});
\`\`\`

The top-level component can maintain control over the input state via this
\`value\` state property.

## Controlling Rich Text

In a React rich text scenario, however, there are two clear problems:

1. A string of plaintext is insufficient to represent the complex state of
a rich editor.
2. There is no such \`onChange\` event available for a ContentEditable element.

State is therefore represented as a single immutable
[EditorState](/draft-js/docs/api/editor-state.html) object, and \`onChange\` is
implemented within the \`DraftEditor\` core to provide this state value to the
top level.

The \`EditorState\` object is a complete snapshot of the state of the editor,
including contents, cursor, and undo/redo history. All changes to content and
selection within the editor will create new \`EditorState\` objects. Note that
this remains efficient due to data persistence across immutable objects.

\`\`\`
const MyEditor = React.createClass({
  onChange(editorState) {
    this.setState({editorState});
  },
  render() {
    const {editorState} = this.state;
    return <DraftEditor editorState={editorState} onChange={this.onChange} />;
  }
});
\`\`\`

For any edits or selection changes that occur in the editor DOM, your \`onChange\`
handler will execute with the latest \`EditorState\` object based on those changes.
`
var Post = React.createClass({
  statics: {
    content: content
  },
  render: function() {
    return <Layout metadata={{"id":"quick-start-api-basics","title":"API Basics","layout":"docs","category":"Quick Start","next":"quick-start-rich-styling","permalink":"docs/quickstart/api-basics.html"}}>{content}</Layout>;
  }
});
module.exports = Post;
