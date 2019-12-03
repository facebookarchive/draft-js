---
id: api-reference-rich-utils
title: RichUtils
---

The `RichUtils` module is a static set of utility functions for rich text
editing.

In each case, these methods accept `EditorState` objects with relevant
parameters and return `EditorState` objects.

## Static Methods

### `currentBlockContainsLink()`

```js
currentBlockContainsLink(
  editorState: EditorState
): boolean
```

### `getCurrentBlockType()`

```js
getCurrentBlockType(
  editorState: EditorState
): string
```

### `handleKeyCommand()`

```js
handleKeyCommand(
  editorState: EditorState,
  command: string
): ?EditorState
```

### `insertSoftNewline()`

```js
insertSoftNewline(
  editorState: EditorState
): EditorState
```

### `onBackspace()`

```js
onBackspace(
  editorState: EditorState
): EditorState?
```

### `onDelete()`

```js
onDelete(
  editorState: EditorState
): EditorState?
```

### `onTab()`

```js
onTab(
  event: SyntheticEvent,
  editorState: EditorState,
  maxDepth: integer
): EditorState
```

### `toggleBlockType()`

```js
toggleBlockType(
  editorState: EditorState,
  blockType: string
): EditorState
```

### `toggleCode()`

```js
toggleCode(
  editorState: EditorState
): EditorState
```

### `toggleInlineStyle()`

```js
toggleInlineStyle(
  editorState: EditorState,
  inlineStyle: string
): EditorState
```

Toggle the specified inline style for the selection. If the
user's selection is collapsed, apply or remove the style for the
internal state. If it is not collapsed, apply the change directly
to the document state.

### `toggleLink()`

```js
toggleLink(
  editorState: EditorState,
  targetSelection: SelectionState,
  entityKey: string
): EditorState
```

### `tryToRemoveBlockStyle()`

```js
tryToRemoveBlockStyle(
  editorState: EditorState
): ContentState?
```
