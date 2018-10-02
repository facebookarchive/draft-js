---
id: advanced-topics-editorstate-race-conditions
title: EditorState Race Conditions
---

Draft `Editor` is a *controlled input* component (you can read about this in detail in the [API Basics](/docs/quickstart-api-basics.html) section), meaning that changes made to the `Editor` state are propagated upwards through `onChange` and it's up to the app to feed it back to the `Editor` component.

This cycle usually looks like:
```
...
this.onChange = function(editorState) {
  this.setState({editorState: editorState});
}
...
<Editor
  editorState={this.state.editorState}
  onChange={this.onChange}
  placeholder="Enter some text..."
/>
```
Different browser events can trigger the `Editor` to create a new state and call `onChange`. For instance, when the user pastes text into it, Draft parses the new content and creates the necessary data structure to represent it.

This cycle works great, however, it is an asynchronous operation because of the `setState` call. This introduces a delay between setting the state and rendering the `Editor` with the new state. During this time period other JS code can be executed.
![](/img/editorstate-race-condition-1-handler.png)
Non-atomic operations like this can potentially introduce race conditions.
Here's an example: Suppose you want to remove all the text styles that come from the paste. This can be implemented by listening to the onPaste event and removing all styles from the `EditorState`:
```
this.onPaste = function() {
  this.setState({
    editorState: removeEditorStyles(this.state.editorState)
  });
}
```
However, this won't work as expected. You now have two event handlers that set a new `EditorState` in the exact same browser event. Since the event handlers will run one after the other only the last `setState` will prevail. Here's how it looks like in the JS timeline:
![](/img/editorstate-race-condition-2-handlers.png)
As you can see, since `setState` is an asynchronous operation, the second `setState` will override whatever it was set on the first one making the `Editor` lose all the contents from the pasted text.

You can observe and explore the race condition in [this running example](https://jsfiddle.net/qecccw3r/). The example also has logging to highlight the JS timeline so make sure to open the developer tools.

As a rule of thumb avoid having different event handlers for the same event that manipulate the `EditorState`. Using setTimeout to run `setState` might also land you in the same situation.
Anytime you feel you're “losing state” make sure you're not overriding it before the `Editor` re-rendering.

## Best Practices

Now that you understand the problem, what can you do to avoid it? In general be mindful of where you're getting the `EditorState` from. If you're using a local one (stored in `this.state`) then there's the potential for it to not be up to date.
To minimize this problem Draft offers the latest `EditorState` instance in most of its callback functions. In your code you should use the provided `EditorState` instead of your local one to make sure you're basing your changes on the latest one.
Here's a list of supported callbacks on the `Editor`:

* `handleReturn(event, editorState)`
* `handleKeyCommand(command, editorState)`
* `handleBeforeInput(chars, editorState)`
* `handlePastedText(text, html, editorState)`

The paste example can then be re-written in a race condition free way by using these methods:
```
this.handlePastedText = (text, styles, editorState) => {
  this.setState({
    editorState: removeEditorStyles(text, editorState)
  });
}
//...
<Editor
  editorState={this.state.editorState}
  onChange={this.onChange}
  handlePastedText={this.handlePastedText}
  placeholder="Enter some text..."
/>
```
With `handlePastedText` you can implement the paste behavior by yourself.

NOTE: If you need to have this behavior in your Editor there is a much easier way to achieve this. Just set the `Editor`'s `stripPastedStyles` property to `true`.
