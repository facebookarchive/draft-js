# [Draft.js](https://facebook.github.io/draft-js/) [![Build Status](https://img.shields.io/travis/facebook/draft-js/master.svg?style=flat)](https://travis-ci.org/facebook/draft-js) [![npm version](https://img.shields.io/npm/v/draft-js.svg?style=flat)](https://www.npmjs.com/package/draft-js)

Draft.js is a JavaScript rich text editor framework, built for React and
backed by an immutable model.

- **Extensible and Customizable:** We provide the building blocks to enable
the creation of a broad variety of rich text composition experiences, from
simple text styles to embedded media.
- **Declarative Rich Text:** Draft.js fits seamlessly into
[React](http://facebook.github.io/react/) applications,
abstracting away the details of rendering, selection, and input behavior with a
familiar declarative API.
- **Immutable Editor State:** The Draft.js model is built
with [immutable-js](https://facebook.github.io/immutable-js/), offering
an API with functional state updates and aggressively leveraging data persistence
for scalable memory usage.

[Learn how to use Draft.js in your own project.](https://facebook.github.io/draft-js/docs/overview.html)

## API Notice

Before getting started, please be aware that we recently changed the API of
Entity storage in Draft. The latest version, `v0.10.0`, supports both the old
and new API.  Following that up will be `v0.11.0` which will remove the old API.
If you are interested in helping out, or tracking the progress, please follow
[issue 839](https://github.com/facebook/draft-js/issues/839).

## Getting Started

Currently Draft.js is distributed via npm. It depends on React and React DOM which must also be installed.

```
npm install --save draft-js react react-dom

or

yarn add draft-js react react-dom
```

### Using Draft.js

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import {Editor, EditorState} from 'draft-js';

class MyEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {editorState: EditorState.createEmpty()};
    this.onChange = (editorState) => this.setState({editorState});
  }
  render() {
    return (
        <Editor editorState={this.state.editorState} onChange={this.onChange} />
    );
  }
}

ReactDOM.render(
  <MyEditor />,
  document.getElementById('container')
);
```

Because Draft.js supports unicode, you must have the following meta tag in the `<head>` `</head>` block of your HTML file:

```html
<meta charset="utf-8" />
```
Further examples of how Draft.js can be used are provided below.

### Examples

Visit https://facebook.github.io/draft-js/ to try out a simple rich editor example.

The repository includes a variety of different editor examples to demonstrate
some of the features offered by the framework.

To run the examples, first build Draft.js locally:

```
git clone https://github.com/facebook/draft-js.git
cd draft-js
npm install
npm run build
```

then open the example HTML files in your browser.

Draft.js is used in production on Facebook, including status and
comment inputs, [Notes](https://www.facebook.com/notes/), and
[messenger.com](https://www.messenger.com).

## Resources and Ecosystem

Check out this curated list of articles and open-sourced projects/utilities: [Awesome Draft-JS](https://github.com/nikgraf/awesome-draft-js).

## Discussion and Support

Join our [Slack team](https://draftjs.herokuapp.com)!

## Contribute

We actively welcome pull requests. Learn how to
[contribute](https://github.com/facebook/draft-js/blob/master/CONTRIBUTING.md).

## License

Draft.js is [BSD Licensed](https://github.com/facebook/draft-js/blob/master/LICENSE).
We also provide an additional [patent grant](https://github.com/facebook/draft-js/blob/master/PATENTS).

Examples provided in this repository and in the documentation are separately
licensed.
