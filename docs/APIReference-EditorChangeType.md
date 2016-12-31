---
id: api-reference-editor-change-type
title: EditorChangeType
layout: docs
category: API Reference
next: api-reference-editor-state
permalink: docs/api-reference-editor-change-type.html
---

[EditorChangeType](https://github.com/facebook/draft-js/blob/master/src/model/immutable/EditorChangeType.js)
is an enum that lists the possible set of change operations that can be handled
the Draft model. It is represented as a Flow type, as a union of strings.

It is passed as a parameter to `EditorState.push`, and denotes the type of
change operation that is being performed by transitioning to the new
`ContentState`.

Behind the scenes, this value is used to determine appropriate undo/redo
handling, spellcheck behavior, and more. Therefore, while it is possible to
provide an arbitrary string value as the `changeType` parameter here, you should
avoid doing so.

We highly recommend that you install [Flow](http://flowtype.org) to perform
static typechecking on your project. Flow will enforce the use of an appropriate
`EditorChangeType` value.

## Values

#### `adjust-depth`

The `depth` value of one or more `ContentBlock` objects is being changed.

#### `apply-entity`

An entity is being applied (or removed via `null`) to one or more characters.

#### `backspace-character`

A single character is being backward-removed.

#### `change-block-data`

The `data` value of one or more `ContentBlock` objects is being changed.

#### `change-block-type`

The `type` value of one or more `ContentBlock` objects is being changed.

#### `change-inline-style`

An inline style is being applied or removed for one or more characters.

#### `move-block`

A block is being moved within the [BlockMap](https://github.com/facebook/draft-js/blob/master/src/model/immutable/BlockMap.js).

#### `delete-character`

A single character is being forward-removed.

#### `insert-characters`

One or more characters is being inserted at a selection state.

#### `insert-fragment`

A "fragment" of content (i.e. a
[BlockMap](https://github.com/facebook/draft-js/blob/master/src/model/immutable/BlockMap.js))
is being inserted at a selection state.

#### `redo`

A redo operation is being performed. Since redo behavior is handled by the
Draft core, it is unlikely that you will need to use this explicitly.

#### `remove-range`

Multiple characters or blocks are being removed.

#### `spellcheck-change`

A spellcheck or autocorrect change is being performed. This is used to inform
the core editor whether to try to allow native undo behavior.

#### `split-block`

A single `ContentBlock` is being split into two, for instance when the user
presses return.

#### `undo`

An undo operation is being performed. Since undo behavior is handled by the
Draft core, it is unlikely that you will need to use this explicitly.
