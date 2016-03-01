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

## Examples

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
