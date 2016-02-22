/**
 * @generated
 */
var React = require("React");
var Layout = require("DocsLayout");
var content = `
Inline and block styles aren't the only kind of rich styling that we might
want to add to our editor. The Facebook comment input, for example, provides
blue background highlights for mentions and hashtags.

To support flexibility for custom rich text, Draft provides a "decorator"
system. The [tweet example](https://github.com/facebook/draft-js/tree/master/examples/tweet)
offers a live example of decorators in action.

## CompositeDecorator

The decorator concept is based on scanning the contents of a given
[ContentBlock](/draft-js/docs/api/content-block.html)
for ranges of text that match a defined strategy, then rendering them
with a specified React component.

You can use the \`CompositeDecorator\` class to define your desired
decorator behavior. This class allows you to supply multiple \`DraftDecorator\`
objects, and will search through a block of text with each strategy in turn.

Decorators are stored within the \`EditorState\` record. When creating a new
\`EditorState\` object, e.g. via \`EditorState.createEmpty()\`, a decorator may
optionally be provided.

> Under the hood
>
> When contents change in a Draft editor, the resulting \`EditorState\` object
> will evaluate the new \`ContentState\` with its decorator, and identify ranges
> to be decorated. A complete tree of blocks, decorators, and inline styles is
> formed at this time, and serves as the basis for our rendered output.
>
> In this way, we always ensure that as contents change, rendered decorations
> are in sync with our \`EditorState\`.

In the "Tweet" editor example, for instance, we use a \`CompositeDecorator\` that
searches for @-handle strings as well as hashtag strings:

\`\`\`
const compositeDecorator = new CompositeDecorator([
  {
    strategy: handleStrategy,
    component: HandleSpan,
  },
  {
    strategy: hashtagStrategy,
    component: HashtagSpan,
  },
]);
\`\`\`

This composite decorator will first scan a given block of text for @-handle
matches, then for hashtag matches.

\`\`\`
// Note: these aren't very good regexes, don't use them!
const HANDLE_REGEX = /\\@[\\w]+/g;
const HASHTAG_REGEX = /\\#[\\w\\u0590-\\u05ff]+/g;

function handleStrategy(contentBlock, callback) {
  findWithRegex(HANDLE_REGEX, contentBlock, callback);
}

function hashtagStrategy(contentBlock, callback) {
  findWithRegex(HASHTAG_REGEX, contentBlock, callback);
}

function findWithRegex(regex, contentBlock, callback) {
  const text = contentBlock.getText();
  let matchArr, start;
  while ((matchArr = regex.exec(text)) !== null) {
    start = matchArr.index;
    callback(start, start + matchArr[0].length);
  }
}
\`\`\`

The strategy functions execute the provided callback with the \`start\` and
\`end\` values of the matching range of text.

## Decorator Components

For your decorated ranges of text, you must define a React component to use
to render them. These tend to be simple \`span\` elements with CSS classes or
styles applied to them.

In our current example, the \`CompositeDecorator\` object names \`HandleSpan\` and
\`HashtagSpan\` as the components to use for decoration. These are just basic
stateless components:

\`\`\`
const HandleSpan = (props) => {
  return <span {...props} style={styles.handle}>{props.children}</span>;
};

const HashtagSpan = (props) => {
  return <span {...props} style={styles.hashtag}>{props.children}</span>;
};
\`\`\`

Note that \`props.children\` is passed through to the rendered output. This is
done to ensure that the text is rendered within the decorated \`span\`.

You can use the same approach for links, as demonstrated in our
[link example](https://github.com/facebook/draft-js/tree/master/examples/link).
`
var Post = React.createClass({
  statics: {
    content: content
  },
  render: function() {
    return <Layout metadata={{"id":"quick-start-decorated-text","title":"Decorated Text","layout":"docs","category":"Quick Start","next":"quick-start-customizing-your-editor","permalink":"docs/quickstart/decorated-text.html"}}>{content}</Layout>;
  }
});
module.exports = Post;
