---
id: quickstart-api-basics
title: API Basics
layout: docs
category: Quick Start
next: quickstart-rich-styling
permalink: docs/quickstart-api-basics.html
---

This document provides an overview of the basics of the `Draft` API. A
[working example](https://github.com/facebook/draft-js/tree/master/examples/draft-0-9-1/plaintext)
is also available to follow along.

## Controlled Inputs

The `Editor` React component is built as a controlled ContentEditable component,
with the goal of providing a top-level API modeled on the familiar React
*controlled input* API.

As a brief refresher, controlled inputs involve two key pieces:

1. A _value_ to represent the state of the input
2. An _onChange_ prop function to receive updates to the input

This approach allows the component that composes the input to have strict
control over the state of the input, while still allowing updates to the DOM
to provide information about the text that the user has written.

```js
class MyInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};
    this.onChange = (evt) => this.setState({value: evt.target.value});
  }
  render() {
    return <input value={this.state.value} onChange={this.onChange} />;
  }
}
```

The top-level component can maintain control over the input state via this
`value` state property.

## Controlling Rich Text

In a React rich text scenario, however, there are two clear problems:

1. A string of plaintext is insufficient to represent the complex state of
a rich editor.
2. There is no such `onChange` event available for a ContentEditable element.

State is therefore represented as a single immutable
[EditorState](/draft-js/docs/api-reference-editor-state.html) object, and
`onChange` is implemented within the `Editor` core to provide this state
value to the top level.

The `EditorState` object is a complete snapshot of the state of the editor,
including contents, cursor, and undo/redo history. All changes to content and
selection within the editor will create new `EditorState` objects. Note that
this remains efficient due to data persistence across immutable objects.

```js
import {Editor, EditorState} from 'draft-js';

class MyEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {editorState: EditorState.createEmpty()};
    this.onChange = (editorState) => this.setState({editorState});
  }
  render() {
    return <Editor editorState={this.state.editorState} onChange={this.onChange} />;
  }
}
```

For any edits or selection changes that occur in the editor DOM, your `onChange`
handler will execute with the latest `EditorState` object based on those changes.
