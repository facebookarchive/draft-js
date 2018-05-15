---
id: api-reference-atomic-block-utils
title: AtomicBlockUtils
---

The `AtomicBlockUtils` module is a static set of utility functions for atomic
block editing.

In each case, these methods accept `EditorState` objects with relevant
parameters and return `EditorState` objects.

## Static Methods

### insertAtomicBlock

```
insertAtomicBlock: function(
  editorState: EditorState,
  entityKey: string,
  character: string
): EditorState
```

### moveAtomicBlock

```
moveAtomicBlock: function(
  editorState: EditorState,
  atomicBlock: ContentBlock,
  targetRange: SelectionState,
  insertionMode?: DraftInsertionType
): EditorState
```
