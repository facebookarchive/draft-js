---
id: experimental-nesting
title: Nesting
layout: docs
category: Experimental
next: api-reference-data-conversion
permalink: docs/experimental-nesting.html
---

## Overview

By default Draft.js doesn't support nested blocks, but it can be enabled using some component props.

### Usage

```js
import {Editor, EditorState, NestedUtils} from 'draft-js';

class MyEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {editorState: EditorState.createEmpty()};
    this.onChange = (editorState) => this.setState({editorState});
    this.handleKeyCommand = this.handleKeyCommand.bind(this);
  }
  handleKeyCommand(command) {
    const newState = NestedUtils.handleKeyCommand(this.state.editorState, command);
    if (newState) {
      this.onChange(newState);
      return true;
    }
    return false;
  }
  render() {
    return (
      <Editor
        editorState={this.state.editorState}
        blockRenderMap={NestedUtils.DefaultBlockRenderMap}
        keyBindingFn={NestedUtils.keyBinding}
        handleKeyCommand={this.handleKeyCommand}
        onChange={this.onChange}
      />
    );
  }
}
```

### Commands

`NestedUtils` provides two methods: `NestedUtils.keyBinding` and `NestedUtils.handleKeyCommand` to respond to user interactions with the right behavior for nested content.

### Data Conversion

`convertFromRaw` and `convertToRaw` supports nested blocks:

```js
import {convertFromRaw} from 'draft-js';

var contentState = convertFromRaw({
    blocks: [
        {
            type: 'heading-one',
            text: 'My Awesome Article'
        },
        {
            type: 'blockquote',
            blocks: [
                {
                    type: 'heading-two',
                    text: 'Another heading in a blockquote'
                },
                {
                    type: 'unstyled',
                    text: 'Followed by a paragraph.'
                }
            ]
        }
    ],
    entityMap: {}
});
```
