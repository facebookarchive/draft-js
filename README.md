# [Draft.js](http://draftjs.org/) [![Build Status](https://img.shields.io/travis/facebook/draft-js/master.svg?style=flat)](https://travis-ci.org/facebook/draft-js) [![npm version](https://img.shields.io/npm/v/draft-js.svg?style=flat)](https://yarn.pm/draft-js)

![Live Demo](https://media.giphy.com/media/XHUjaxELpc11SiRSqN/giphy.gif)

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

[Learn how to use Draft.js in your own project.](https://draftjs.org/docs/getting-started.html)


## installing react js

We will need NodeJS, so if you don't have it installed, check the link from the following table.

Sr.No.	Software & Description
1	
NodeJS and NPM

NodeJS is the platform needed for the ReactJS development. Checkout our NodeJS Environment Setup.

After successfully installing NodeJS, we can start installing React upon it using npm. You can install NodeJS in two ways

Using webpack and babel.

Using the create-react-app command.

Installing ReactJS using webpack and babel
Webpack is a module bundler (manages and loads independent modules). It takes dependent modules and compiles them to a single (file) bundle. You can use this bundle while developing apps using command line or, by configuring it using webpack.config file.

Babel is a JavaScript compiler and transpiler. It is used to convert one source code to other. Using this you will be able to use the new ES6 features in your code where, babel converts it into plain old ES5 which can be run on all browsers.

Step 1 - Create the Root Folder
Create a folder with name reactApp on the desktop to install all the required files, using the mkdir command.

C:\Users\username\Desktop>mkdir reactApp
C:\Users\username\Desktop>cd reactApp
To create any module, it is required to generate the package.json file. Therefore, after Creating the folder, we need to create a package.json file. To do so you need to run the npm init command from the command prompt.

C:\Users\username\Desktop\reactApp>npm init
This command asks information about the module such as packagename, description, author etc. you can skip these using the –y option.

C:\Users\username\Desktop\reactApp>npm init -y
Wrote to C:\reactApp\package.json:
{
   "name": "reactApp",
   "version": "1.0.0",
   "description": "",
   "main": "index.js",
   "scripts": {
      "test": "echo \"Error: no test specified\" && exit 1"
   },
   "keywords": [],
   "author": "",
   "license": "ISC"
}
Step 2 - install React and react dom
Since our main task is to install ReactJS, install it, and its dom packages, using install react and react-dom commands of npm respectively. You can add the packages we install, to package.json file using the --save option.

C:\Users\Tutorialspoint\Desktop\reactApp>npm install react --save
C:\Users\Tutorialspoint\Desktop\reactApp>npm install react-dom --save
Or, you can install all of them in single command as −

C:\Users\username\Desktop\reactApp>npm install react react-dom --save
Step 3 - Install webpack
Since we are using webpack to generate bundler install webpack, webpack-dev-server and webpack-cli.

C:\Users\username\Desktop\reactApp>npm install webpack –save
C:\Users\username\Desktop\reactApp>npm install webpack-dev-server --save
C:\Users\username\Desktop\reactApp>npm install webpack-cli --save
Or, you can install all of them in single command as −

C:\Users\username\Desktop\reactApp>npm install webpack webpack-dev-server webpack-cli --save
Step 4 - Install babel
Install babel, and its plugins babel-core, babel-loader, babel-preset-env, babel-preset-react and, html-webpack-plugin

C:\Users\username\Desktop\reactApp>npm install babel-core --save-dev
C:\Users\username\Desktop\reactApp>npm install babel-loader --save-dev
C:\Users\username\Desktop\reactApp>npm install babel-preset-env --save-dev
C:\Users\username\Desktop\reactApp>npm install babel-preset-react --save-dev
C:\Users\username\Desktop\reactApp>npm install html-webpack-plugin --save-dev
Or, you can install all of them in single command as −

C:\Users\username\Desktop\reactApp>npm install babel-core babel-loader babel-preset-env 
   babel-preset-react html-webpack-plugin --save-dev
Step 5 - Create the Files
To complete the installation, we need to create certain files namely, index.html, App.js, main.js, webpack.config.js and, .babelrc. You can create these files manually or, using command prompt.

C:\Users\username\Desktop\reactApp>type nul > index.html
C:\Users\username\Desktop\reactApp>type nul > App.js
C:\Users\username\Desktop\reactApp>type nul > main.js
C:\Users\username\Desktop\reactApp>type nul > webpack.config.js
C:\Users\username\Desktop\reactApp>type nul > .babelrc
Step 6 - Set Compiler, Server and Loaders
Open webpack-config.js file and add the following code. We are setting webpack entry point to be main.js. Output path is the place where bundled app will be served. We are also setting the development server to 8001 port. You can choose any port you want.

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
    this.setEditor = (editor) => {
      this.editor = editor;
    };
    this.focusEditor = () => {
      if (this.editor) {
        this.editor.focus();
      }
    };
  }

  componentDidMount() {
    this.focusEditor();
  }

  render() {
    return (
      <div style={styles.editor} onClick={this.focusEditor}>
        <Editor
          ref={this.setEditor}
          editorState={this.state.editorState}
          onChange={this.onChange}
        />
      </div>
    );
  }
}

const styles = {
  editor: {
    border: '1px solid gray',
    minHeight: '6em'
  }
};

ReactDOM.render(
  <MyEditor />,
  document.getElementById('container')
);
```

Since the release of React 16.8, you can use [Hooks](https://reactjs.org/docs/hooks-intro.html) as a way to work with `EditorState` without using a class.


```js
import React from 'react';
import ReactDOM from 'react-dom';
import {Editor, EditorState} from 'draft-js';

function MyEditor() {
  const [editorState, setEditorState] = React.useState(
    EditorState.createEmpty()
  );

  const editor = React.useRef(null);

  function focusEditor() {
    editor.current.focus();
  }

  React.useEffect(() => {
    focusEditor()
  }, []);

  return (
    <div onClick={focusEditor}>
      <Editor
        ref={editor}
        editorState={editorState}
        onChange={editorState => setEditorState(editorState)}
      />
    </div>
  );
}

```

Note that the editor itself is only as tall as its contents. In order to give users a visual cue, we recommend setting a border and a minimum height via the `.DraftEditor-root` CSS selector, or using a wrapper div like in the above example.

Because Draft.js supports unicode, you must have the following meta tag in the `<head>` `</head>` block of your HTML file:

```html
<meta charset="utf-8" />
```
Further examples of how Draft.js can be used are provided below.

### Examples

Visit http://draftjs.org/ to try out a simple rich editor example.

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

## Browser Support

| ![IE / Edge](https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/edge.png) <br /> IE / Edge | ![Firefox](https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/firefox.png) <br /> Firefox | ![Chrome](https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/chrome.png) <br /> Chrome | ![Safari](https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/safari.png ) <br /> Safari | ![iOS Safari](https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/safari-ios.png) <br />iOS Safari | ![Chrome for Android](https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/chrome-android.png) <br/> Chrome for Android |
| --------- | --------- | --------- | --------- | --------- | --------- |
| IE11, Edge [1, 2]| last 2 versions| last 2 versions| last 2 versions| not fully supported [3] | not fully supported [3]

[1] May need a shim or a polyfill for some syntax used in Draft.js ([docs](https://draftjs.org/docs/advanced-topics-issues-and-pitfalls.html#polyfills)).

[2] IME inputs have known issues in these browsers, especially Korean ([docs](https://draftjs.org/docs/advanced-topics-issues-and-pitfalls.html#ime-and-internet-explorer)).

[3] There are known issues with mobile browsers, especially on Android ([docs](https://draftjs.org/docs/advanced-topics-issues-and-pitfalls.html#mobile-not-yet-supported)).

## Resources and Ecosystem

Check out this curated list of articles and open-sourced projects/utilities: [Awesome Draft-JS](https://github.com/nikgraf/awesome-draft-js).

## Discussion and Support

Join our [Slack team](https://draftjs.herokuapp.com)!

## Contribute

We actively welcome pull requests. Learn how to
[contribute](https://github.com/facebook/draft-js/blob/master/CONTRIBUTING.md).

## License

Draft.js is [MIT licensed](https://github.com/facebook/draft-js/blob/master/LICENSE).

Examples provided in this repository and in the documentation are separately
licensed.
