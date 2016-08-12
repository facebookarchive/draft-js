---
id: quickstart-api-serialization
title: Serialization
layout: docs
category: Quick Start
next: advanced-topics-entities
permalink: docs/quickstart-serialization.html
---

# Serialization

Because a text editor doesn't exist in a vacuum and it's important to save 
contents for storage or transmission, you will want to be able to convert 
`ContentState` into a plain JS object, and vice versa. For storing it in a database,
it may be easiest to store it in a string field as json.

```js
import {Editor, EditorState, convertToRaw} from 'draft-js';

class MyEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {editorState: EditorState.createEmpty()};
    this.onChange = (editorState) => this.setState({editorState});
    this.onSave = () => {
      var content = this.state.editorState.getCurrentContent();
      var raw = JSON.stringify(convertToRaw(content));
      $.post('/api/comment', {comment: raw}, () => {
        alert('Saved');
      });
    };
  }
  render() {
    return (
      <div>
        <Editor editorState={this.state.editorState} onChange={this.onChange} />
        <button onClick={this.onSave}>Save</button>
      </div>
    );
  }
}
```


You can then load it back into an `EditorState`.

```js
var editorState = EditorState.createWithContent(convertFromRaw(JSON.parse(raw)));
```

To display this elsewhere in your site, you can create an Editor component with
the `readOnly` prop set to `true`.

```js
<Editor editorState={editorState} readOnly />
```

## Why not HTML?

The editor content is a rich object that contains the "what" and not the "how" for the content.
This allows you to change the rendering after the data is submitted by the user, and to include
interactive widgets in the display.

Since it's not HTML, you can in theory create a native editor and display on non-web platforms, such
as iOS.

