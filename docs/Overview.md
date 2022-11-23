---
id: getting-started
title: Overview
onPageNav: 'none'
---

Draft.js is a framework for building rich text editors in React, powered by an immutable model and abstracting over cross-browser differences.

Draft.js allows you to build any type of rich text input, whether you're only looking to support a few inline text styles or building a complex text editor for composing long-form articles.

Draft.js was introduced at [React.js Conf](https://conf2016.reactjs.org/schedule#rich-text-editing-with-react) in February 2016.

<iframe width="100%" height="365" src="https://www.youtube.com/embed/feUYwoLhE_4" frameBorder="0" allowFullScreen></iframe>

## Installation

Draft.js is distributed via npm. It depends on React and React DOM which must also be installed.

```sh
npm install draft-js react react-dom
# or alternately
yarn add draft-js react react-dom
```

Draft.js uses some modern ECMAScript features which are not available to IE11 and not part of create-react-app's default babel config. If you're running into problems out-of-the-box try installing a shim or polyfill alongside Draft.

```sh
npm install draft-js react react-dom babel-polyfill
# or
yarn add draft-js react react-dom es6-shim
```

Learn more about [using a shim with Draft](/docs/advanced-topics-issues-and-pitfalls#polyfills).

## API Changes Notice

Before getting started, please be aware that we recently changed the API of
Entity storage in Draft. Draft.js version `v0.10.0` and `v0.11.0` support both the old
and new API. Following that up will be `v0.12.0` which will remove the old API.

## Usage

```js
import React from 'react';
import ReactDOM from 'react-dom';
import {Editor, EditorState} from 'draft-js';
import 'draft-js/dist/Draft.css';

class MyEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {editorState: EditorState.createEmpty()};
    this.onChange = editorState => this.setState({editorState});
  }

  render() {
    return (
      <Editor editorState={this.state.editorState} onChange={this.onChange} />
    );
  }
}

ReactDOM.render(<MyEditor />, document.getElementById('container'));
```

Since the release of React 16.8, you can use [Hooks](https://reactjs.org/docs/hooks-intro.html) as a way to work with `EditorState` without using a class.

```js
import React from 'react';
import ReactDOM from 'react-dom';
import {Editor, EditorState} from 'draft-js';
import 'draft-js/dist/Draft.css';

function MyEditor() {
  const [editorState, setEditorState] = React.useState(
    () => EditorState.createEmpty(),
  );

  return <Editor editorState={editorState} onChange={setEditorState} />;
}

ReactDOM.render(<MyEditor />, document.getElementById('container'));
```

Because Draft.js supports unicode, you must have the following meta tag in the `<head></head>` block of your HTML file:

```html
<meta charset="utf-8" />
```

`Draft.css` should be included when rendering the editor. Learn more about [why](/docs/advanced-topics-issues-and-pitfalls#missing-draftcss).

Next, let's go into the basics of the API and learn what else you can do with Draft.js.
