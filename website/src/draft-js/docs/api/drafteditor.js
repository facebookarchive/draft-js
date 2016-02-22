/**
 * @generated
 */
var React = require("React");
var Layout = require("DocsLayout");
var content = `
\`ContentBlock\` is an Immutable
[Record](http://facebook.github.io/immutable-js/docs/#/Record/Record) that
represents the full state of:

- The entire **contents** of an editor: text, block and inline styles, and entity ranges.
- Two **selection states** of an editor: before and after the rendering of these contents.

The most common use for the \`ContentState\` object is via \`EditorState.getCurrentContent()\`,
which provides the \`ContentState\` currently being rendered in the editor.

An \`EditorState\` object maintains undo and redo stacks comprised of \`ContentState\`
objects.

## Overview

*Static Methods*

<ul class="apiIndex">
  <li>
    <a href="#createfromtext">
      <pre>createFromText()</pre>
    </a>
  </li>
  <li>
    <a href="#createfromblockarray">
      <pre>createFromBlockArray()</pre>
    </a>
  </li>
</ul>

*Methods*

<ul class="apiIndex">
  <li>
    <a href="#getblockmap">
      <pre>getBlockMap()</pre>
    </a>
  </li>
  <li>
    <a href="#getselectionbefore">
      <pre>getSelectionBefore()</pre>
    </a>
  </li>
  <li>
    <a href="#getselectionafter">
      <pre>getSelectionAfter()</pre>
    </a>
  </li>
  <li>
    <a href="#getblockforkey">
      <pre>getBlockForKey(key)</pre>
    </a>
  </li>
  <li>
    <a href="#getkeybefore">
      <pre>getKeyBefore(key)</pre>
    </a>
  </li>
  <li>
    <a href="#getkeyafter">
      <pre>getKeyAfter(key)</pre>
    </a>
  </li>
  <li>
    <a href="#getblockbefore">
      <pre>getBlockBefore(key)</pre>
    </a>
  </li>
  <li>
    <a href="#getblockafter">
      <pre>getBlockAfter(key)</pre>
    </a>
  </li>
  <li>
    <a href="#getblocksasarray">
      <pre>getBlocksAsArray()</pre>
    </a>
  </li>
  <li>
    <a href="#getlastblock">
      <pre>getLastBlock()</pre>
    </a>
  </li>
  <li>
    <a href="#getplaintext">
      <pre>getPlainText(delimiter)</pre>
    </a>
  </li>
  <li>
    <a href="#hastext">
      <pre>hasText()</pre>
    </a>
  </li>
</ul>

*Properties*

> Use [Immutable Map API](http://facebook.github.io/immutable-js/docs/#/Record/Record) to
> set properties.

<ul class="apiIndex">
  <li>
    <a href="#blockmap">
      <pre>blockMap</pre>
    </a>
  </li>
  <li>
    <a href="#selectionbefore">
      <pre>selectionBefore</pre>
    </a>
  </li>
  <li>
    <a href="#selectionafter">
      <pre>selectionAfter</pre>
    </a>
  </li>
</ul>

## Static Methods

### createFromText

\`\`\`
createFromText(text: string, delimiter?: string): ContentState
\`\`\`
Generates a \`ContentState\` from a string, with a delimiter to split the string
into \`ContentBlock\` objects. If no delimiter is provided, '\\n' is used.

### createFromBlockArray

\`\`\`
createFromBlockArray(blocks: Array<ContentBlock>): ContentState
\`\`\`
Generates a \`ContentState\` from an array of \`ContentBlock\` objects. The default
\`selectionBefore\` and \`selectionAfter\` states have the cursor at the start of
the content.

## Methods

### getBlockMap

\`\`\`
getBlockMap(): BlockMap
\`\`\`
Returns the full ordered map of \`ContentBlock\` objects representing the state
of an entire document.

In most cases, you should be able to use the convenience methods below to target
specific \`ContentBlock\` objects or obtain information about the state of the content.

### getSelectionBefore

\`\`\`
getSelectionBefore(): SelectionState
\`\`\`
Returns the \`SelectionState\` displayed in the editor before rendering \`blockMap\`.

When performing an \`undo\` action in the editor, the \`selectionBefore\` of the current
\`ContentState\` is used to place the selection range in the appropriate position.

### getSelectionAfter

\`\`\`
getSelectionAfter(): SelectionState
\`\`\`
Returns the \`SelectionState\` displayed in the editor after rendering \`blockMap\`.

When performing any action in the editor that leads to this \`blockMap\` being rendered,
the selection range will be placed in the \`selectionAfter\` position.

### getBlockForKey

\`\`\`
getBlockForKey(key: string): ContentBlock
\`\`\`
Returns the \`ContentBlock\` corresponding to the given block key.

#### Example

\`\`\`
var {editorState} = this.state;
var blockKey = editorState.getSelection().getStartKey();
var selectedBlockType = editorState
  .getCurrentContent()
  .getBlockForKey(startKey)
  .getType();
\`\`\`

### getKeyBefore()

\`\`\`
getKeyBefore(key: string): ?string
\`\`\`
Returns the key before the specified key in \`blockMap\`, or null if this is the first key.

### getKeyAfter()

\`\`\`
getKeyAfter(key: string): ?string
\`\`\`
Returns the key after the specified key in \`blockMap\`, or null if this is the last key.

### getBlockBefore()

\`\`\`
getBlockBefore(key: string): ?ContentBlock
\`\`\`
Returns the \`ContentBlock\` before the specified key in \`blockMap\`, or null if this is
the first key.

### getBlockAfter()

\`\`\`
getBlockAfter(key: string): ?ContentBlock
\`\`\`
Returns the \`ContentBlock\` after the specified key in \`blockMap\`, or null if this is
the last key.

### getBlocksAsArray()

\`\`\`
getBlocksAsArray(): Array<ContentBlock>
\`\`\`
Returns the values of \`blockMap\` as an array.

### getPlainText()

\`\`\`
getPlainText(delimiter?: string): string
\`\`\`
Returns the full plaintext value of the contents, joined with a delimiter. If no
delimiter is specified, the line feed character (\`\\u000A\`) is used.

### hasText()

\`\`\`
hasText(): boolean
\`\`\`
Returns whether the contents contain any text at all.

## Properties

> Use [Immutable Map API](http://facebook.github.io/immutable-js/docs/#/Record/Record) to
> set properties.

### blockMap
See \`getBlockMap()\`.

### selectionBefore
See \`getSelectionBefore()\`.

### selectionAfter
See \`getSelectionAfter()\`.
`
var Post = React.createClass({
  statics: {
    content: content
  },
  render: function() {
    return <Layout metadata={{"id":"api-reference-drafteditor","title":"DraftEditor","layout":"docs","category":"API Reference","next":"further-future-work","permalink":"docs/api/drafteditor.html"}}>{content}</Layout>;
  }
});
module.exports = Post;
