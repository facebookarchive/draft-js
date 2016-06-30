---
id: api-reference-atomic-block-utils
title: AtomicBlockUtils
layout: docs
category: API Reference
next: api-reference-key-binding-util
permalink: docs/api-reference-atomic-block-utils.html
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

### moveAtomicBlockBefore

```
moveAtomicBlockBefore: function(
  editorState: EditorState,
  contentBlock: ContentBlock
): EditorState
```

### moveAtomicBlockAfter

```
moveAtomicBlockAfter: function(
  editorState: EditorState,
  contentBlock: ContentBlock
): EditorState
```
