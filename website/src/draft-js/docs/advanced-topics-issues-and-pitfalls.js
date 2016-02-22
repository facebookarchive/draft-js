/**
 * @generated
 */
var React = require("React");
var Layout = require("DocsLayout");
var content = `
This article addresses some known issues with the Draft editor framework, as
well as some common pitfalls that we have encountered while using the framework
at Facebook.

## Common Pitfalls

### Delayed state updates

A common pattern for unidirectional data management is to batch or otherwise
delay updates to data stores, using a setTimeout or another mechanism. Stores are
updated, then emit changes to the relevant React components to propagate
re-rendering.

When delays are introduced to a React application with a Draft editor, however,
it is possible to cause significant interaction problems. This is because the
editor expects immediate updates and renders that stay in sync with the user's typing
behavior. Delays can prevent updates from being propagated through the editor
component tree, which can cause a disconnect between keystrokes and updates.

To avoid this while still using a delaying or batching mechanism, you should
separate the delay behavior from your \`Editor\` state propagation. That is,
you must always allow your \`EditorState\` to propagate to your \`Editor\`
component without delay, and independently perform batched updates that do
not affect the state of your \`Editor\` component.

## Known Issues

### React ContentEditable Warning

Within the React core, a warning is used to ward off engineers who wish to
use ContentEditable within their components, since by default the
browser-controlled nature of ContentEditable does not mesh with strict React
control over the DOM. The Draft editor resolves this issue, so for our case,
the warning is noise. You can ignore it for now.

We are currently looking into removing or replacing the warning to alleviate
the irritation it may cause: https://github.com/facebook/react/issues/6081

### Custom OSX Keybindings

Because the browser has no access to OS-level custom keybindings, it is not
possible to intercept edit intent behaviors that do not map to default system
key bindings.

The result of this is that users who use custom keybindings may encounter
issues with Draft editors, since their key commands may not behave as expected.

### Browser plugins/extensions

As with any React application, browser plugins and extensions that modify the
DOM can cause Draft editors to break.

Grammar checkers, for instance, may modify the DOM within contentEditable
elements, adding styles like underlines and backgrounds. Since React cannot
reconcile the DOM if the browser does not match its expectations,
the editor state may fail to remain in sync with the DOM.

Certain old ad blockers are also known to break the native DOM Selection
API -- a bad idea no matter what! -- and since Draft depends on this API to
maintain controlled selection state, this can cause trouble for editor
interaction.

### IME and Internet Explorer

As of IE11, Internet Explorer demonstrates notable issues with certain international
input methods, most significantly Korean input.
`
var Post = React.createClass({
  statics: {
    content: content
  },
  render: function() {
    return <Layout metadata={{"id":"advanced-topics-issues-and-pitfalls","title":"Issues and Pitfalls","layout":"docs","category":"Advanced Topics","next":"api-reference-editor","permalink":"docs/advanced-topics-issues-and-pitfalls.html"}}>{content}</Layout>;
  }
});
module.exports = Post;
