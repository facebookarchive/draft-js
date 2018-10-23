---
id: advanced-topics-key-bindings
title: Key Bindings
---

The `Editor` component offers flexibility to define custom key bindings
for your editor, via the `keyBindingFn` prop. This allows you to match key
commands to behaviors in your editor component.

## Defaults

The default key binding function is `getDefaultKeyBinding`.

Since the Draft framework maintains tight control over DOM rendering and
behavior, basic editing commands must be captured and routed through the key
binding system.

`getDefaultKeyBinding` maps known OS-level editor commands to `DraftEditorCommand`
strings, which then correspond to behaviors within component handlers.

For instance, `Ctrl+Z` (Win) and `Cmd+Z` (OSX) map to the `'undo'` command,
which then routes our handler to perform an `EditorState.undo()`.

## Customization

You may provide your own key binding function to supply custom command strings.

It is recommended that your function use `getDefaultKeyBinding` as a
fall-through case, so that your editor may benefit from default commands.

With your custom command string, you may then implement the `handleKeyCommand`
prop function, which allows you to map that command string to your desired
behavior. If `handleKeyCommand` returns `'handled'`, the command is considered
handled. If it returns `'not-handled'`, the command will fall through.

## Example

Let's say we have an editor that should have a "Save" mechanism to periodically
write your contents to the server as a draft copy.

First, let's define our key binding function:

```js
import {getDefaultKeyBinding, KeyBindingUtil} from 'draft-js';
const {hasCommandModifier} = KeyBindingUtil;

function myKeyBindingFn(e: SyntheticKeyboardEvent): string {
  if (e.keyCode === 83 /* `S` key */ && hasCommandModifier(e)) {
    return 'myeditor-save';
  }
  return getDefaultKeyBinding(e);
}
```

Our function receives a key event, and we check whether it matches our criteria:
it must be an `S` key, and it must have a command modifier, i.e. the command
key for OSX, or the control key otherwise.

If the command is a match, return a string that names the command. Otherwise,
fall through to the default key bindings.

In our editor component, we can then make use of the command via the
`handleKeyCommand` prop:

```js
import {Editor} from 'draft-js';
class MyEditor extends React.Component {

  constructor(props) {
    super(props);
    this.handleKeyCommand = this.handleKeyCommand.bind(this);
  }
  // ...

  handleKeyCommand(command: string): DraftHandleValue {
    if (command === 'myeditor-save') {
      // Perform a request to save your contents, set
      // a new `editorState`, etc.
      return 'handled';
    }
    return 'not-handled';
  }

  render() {
    return (
      <Editor
        editorState={this.state.editorState}
        handleKeyCommand={this.handleKeyCommand}
        keyBindingFn={myKeyBindingFn}
        ...
      />
    );
  }
}
```

The `'myeditor-save'` command can be used for our custom behavior, and returning
`'handled'` instructs the editor that the command has been handled and no more work
is required.

By returning `'not-handled'` in all other cases, default commands are able to fall
through to default handler behavior.
