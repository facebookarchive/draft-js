---
id: api-reference-rich-utils
title: RichUtils
---

The `RichUtils` module is a static set of utility functions for rich text
editing.

In each case, these methods accept `EditorState` objects with relevant
parameters and return `EditorState` objects.

## Static Methods

### currentBlockContainsLink

```
currentBlockContainsLink(
  editorState: EditorState
): boolean
```

### getCurrentBlockType

```
getCurrentBlockType(
  editorState: EditorState
): string
```

### handleKeyCommand

```
handleKeyCommand(
  editorState: EditorState,
  command: string
): ?EditorState
```

### insertSoftNewline

```
insertSoftNewline(
  editorState: EditorState
): EditorState
```

### onBackspace

```
onBackspace(
  editorState: EditorState
): EditorState?
```

### onDelete

```
onDelete(
  editorState: EditorState
): EditorState?
```

### onTab

```
onTab(
  event: SyntheticEvent,
  editorState: EditorState,
  maxDepth: integer
): EditorState
```

### toggleBlockType

```
toggleBlockType(
  editorState: EditorState,
  blockType: string
): EditorState
```

### toggleCode

```
toggleCode(
  editorState: EditorState
): EditorState
```

### toggleInlineStyle

```
toggleInlineStyle(
  editorState: EditorState,
  inlineStyle: string
): EditorState
```

Toggle the specified inline style for the selection. If the
user's selection is collapsed, apply or remove the style for the
internal state. If it is not collapsed, apply the change directly
to the document state.

### toggleLink

```
toggleLink(
  editorState: EditorState,
  targetSelection: SelectionState,
  entityKey: string
): EditorState
```

### tryToRemoveBlockStyle

```
tryToRemoveBlockStyle(
  editorState: EditorState
): ContentState?
```
