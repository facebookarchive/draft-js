---
id: api-reference-editor-state
title: EditorState
layout: docs
category: API Reference
next: api-reference-content-state
permalink: docs/api-reference-editor-state.html
---

`EditorState` is the top-level state object for the editor.

It is an Immutable [Record](http://facebook.github.io/immutable-js/docs/#/Record/Record)
that represents the entire state of a Draft editor, including:

  - The current text content state
  - The current selection state
  - The fully decorated representation of the contents
  - Undo/redo stacks
  - The most recent type of change made to the contents

> Note
>
> You should not use the Immutable API when using EditorState objects.
> Instead, use the instance getters and static methods below.

## Overview

*Common instance methods*

The list below includes the most commonly used instance methods for `EditorState` objects.

<ul class="apiIndex">
  <li>
    <a href="#getcurrentcontent">
      <pre>getCurrentContent(): ContentState</pre>
    </a>
  </li>
  <li>
    <a href="#getselection">
      <pre>getSelection(): SelectionState</pre>
    </a>
  </li>
  <li>
    <a href="#getcurrentinlinestyle">
      <pre>getCurrentInlineStyle(): DraftInlineStyle</pre>
    </a>
  </li>
  <li>
    <a href="#getblocktree">
      <pre>getBlockTree(): OrderedMap</pre>
    </a>
  </li>
</ul>

*Static Methods*

<ul class="apiIndex">
  <li>
    <a href="#createempty">
      <pre>static createEmpty(?decorator): EditorState</pre>
    </a>
  </li>
  <li>
    <a href="#createwithcontent">
      <pre>static createWithContent(contentState, ?decorator): EditorState</pre>
    </a>
  </li>
  <li>
    <a href="#create">
      <pre>static create(config): EditorState</pre>
    </a>
  </li>
  <li>
    <a href="#push">
      <pre>static push(editorState, contentState, changeType): EditorState</pre>
    </a>
  </li>
  <li>
    <a href="#undo">
      <pre>static undo(editorState): EditorState</pre>
    </a>
  </li>
  <li>
    <a href="#redo">
      <pre>static redo(editorState): EditorState</pre>
    </a>
  </li>
  <li>
    <a href="#acceptselection">
      <pre>static acceptSelection(editorState, selectionState): EditorState</pre>
    </a>
  </li>
  <li>
    <a href="#forceselection">
      <pre>static forceSelection(editorState, selectionState): EditorState</pre>
    </a>
  </li>
  <li>
    <a href="#moveselectiontoend">
      <pre>static moveSelectionToEnd(editorState): EditorState</pre>
    </a>
  </li>
  <li>
    <a href="#movefocustoend">
      <pre>static moveFocusToEnd(editorState): EditorState</pre>
    </a>
  </li>
  <li>
    <a href="#setinlinestyleoverride">
      <pre>static setInlineStyleOverride(editorState, inlineStyleOverride): EditorState</pre>
    </a>
  </li>
  <li>
    <a href="#set">
      <pre>static set(editorState, EditorStateRecordType): EditorState</pre>
    </a>
  </li>
</ul>

*Properties*

> Note
>
> Use the static `EditorState` methods to set properties, rather than using
> the Immutable API directly.

<ul class="apiIndex">
  <li>
    <a href="#allowundo">
      <pre>allowUndo</pre>
    </a>
  </li>
  <li>
    <a href="#currentcontent">
      <pre>currentContent</pre>
    </a>
  </li>
  <li>
    <a href="#decorator">
      <pre>decorator</pre>
    </a>
  </li>
  <li>
    <a href="#directionmap">
      <pre>directionMap</pre>
    </a>
  </li>
  <li>
    <a href="#forceselection">
      <pre>forceSelection</pre>
    </a>
  </li>
  <li>
    <a href="#incompositionmode">
      <pre>inCompositionMode</pre>
    </a>
  </li>
  <li>
    <a href="#inlinestyleoverride">
      <pre>inlineStyleOverride</pre>
    </a>
  </li>
  <li>
    <a href="#lastchangetype">
      <pre>lastChangeType</pre>
    </a>
  </li>
  <li>
    <a href="#nativelyrenderedcontent">
      <pre>nativelyRenderedContent</pre>
    </a>
  </li>
  <li>
    <a href="#redostack">
      <pre>redoStack</pre>
    </a>
  </li>
  <li>
    <a href="#selection">
      <pre>selection</pre>
    </a>
  </li>
  <li>
    <a href="#treemap">
      <pre>treeMap</pre>
    </a>
  </li>
  <li>
    <a href="#undostack">
      <pre>undoStack</pre>
    </a>
  </li>
</ul>

## Common Instance Methods

### getCurrentContent

```
getCurrentContent(): ContentState
```
Returns the current contents of the editor.

### getSelection

```
getSelection(): SelectionState
```
Returns the current cursor/selection state of the editor.

### getCurrentInlineStyle

```
getCurrentInlineStyle(): DraftInlineStyle
```
Returns an `OrderedSet<string>` that represents the "current" inline style
for the editor.

This is the inline style value that would be used if a character were inserted
for the current `ContentState` and `SelectionState`, and takes into account
any inline style overrides that should be applied.

### getBlockTree

```
getBlockTree(blockKey: string): List;
```
Returns an Immutable `List` of decorated and styled ranges. This is used for
rendering purposes, and is generated based on the `currentContent` and
`decorator`.

At render time, this object is used to break the contents into the appropriate
block, decorator, and styled range components.

## Static Methods

### createEmpty

```
static createEmpty(decorator?: DraftDecoratorType): EditorState
```
Returns a new `EditorState` object with an empty `ContentState` and default
configuration.

### createWithContent

```
static createWithContent(
  contentState: ContentState,
  decorator?: DraftDecoratorType
): EditorState
```
Returns a new `EditorState` object based on the `ContentState` and decorator
provided.

### create

```
static create(config: EditorStateCreationConfig): EditorState
```
Returns a new `EditorState` object based on a configuration object. Use this
if you need custom configuration not available via the methods above.

### push

```
static push(
  editorState: EditorState,
  contentState: ContentState,
  changeType: EditorChangeType
): EditorState
```
Returns a new `EditorState` object with the specified `ContentState` applied
as the new `currentContent`. Based on the `changeType`, this `ContentState`
may be regarded as a boundary state for undo/redo behavior.

All content changes must be applied to the EditorState with this method.

_To be renamed._

### undo

```
static undo(editorState: EditorState): EditorState
```
Returns a new `EditorState` object with the top of the undo stack applied
as the new `currentContent`.

The existing `currentContent` is pushed onto the `redo` stack.

### redo

```
static redo(editorState: EditorState): EditorState
```
Returns a new `EditorState` object with the top of the redo stack applied
as the new `currentContent`.

The existing `currentContent` is pushed onto the `undo` stack.

### acceptSelection

```
static acceptSelection(
  editorState: EditorState,
  selectionState: SelectionState
): EditorState
```
Returns a new `EditorState` object with the specified `SelectionState` applied,
but without requiring the selection to be rendered.

For example, this is useful when the DOM selection has changed outside of our
control, and no re-renders are necessary.

### forceSelection

```
static forceSelection(
  editorState: EditorState,
  selectionState: SelectionState
): EditorState
```
Returns a new `EditorState` object with the specified `SelectionState` applied,
forcing the selection to be rendered.

This is useful when the selection should be manually rendered in the correct
location to maintain control of the rendered output.

### moveSelectionToEnd

```
static moveSelectionToEnd(editorState: EditorState): EditorState
```
Returns a new `EditorState` object with the selection at the end.

Moves selection to the end of the editor without forcing focus.

### moveFocusToEnd

```
static moveFocusToEnd(editorState: EditorState): EditorState
```
Returns a new `EditorState` object with selection at the end and forces focus.

This is useful in scenarios where we want to programmatically focus the input
and it makes sense to allow the user to continue working seamlessly.

### setInlineStyleOverride

```
static setInlineStyleOverride(editorState: EditorState, inlineStyleOverride: DraftInlineStyle): EditorState
```
Returns a new `EditorState` object with the specified `DraftInlineStyle` applied
as the set of inline styles to be applied to the next inserted characters.

### set

```
static set(editorState: EditorState, options: EditorStateRecordType): EditorState
```
Returns a new `EditorState` object with new options passed in. 'The method is
inherited from the Immutable `record` API.

## Properties and Getters

In most cases, the instance and static methods above should be sufficient to
manage the state of your Draft editor.

Below is the full list of properties tracked by an `EditorState`, as well as
their corresponding getter methods, to better provide detail on the scope of the
state tracked in this object.

> Note
>
> You should not use the Immutable API when using EditorState objects.
> Instead, use the instance getters and static methods above.

### allowUndo

```
allowUndo: boolean;
getAllowUndo()
```
Whether to allow undo/redo behavior in this editor. Default is `true`.

Since the undo/redo stack is the major source of memory retention, if you have
an editor UI that does not require undo/redo behavior, you might consider
setting this to `false`.

### currentContent

```
currentContent: ContentState;
getCurrentContent()
```
The currently rendered `ContentState`. See [getCurrentContent()](#getcurrentcontent).

### decorator

```
decorator: ?DraftDecoratorType;
getDecorator()
```
The current decorator object, if any.

Note that the `ContentState` is independent of your decorator. If a decorator
is provided, it will be used to decorate ranges of text for rendering.

### directionMap

```
directionMap: BlockMap;
getDirectionMap()
```
A map of each block and its text direction, as determined by UnicodeBidiService.

You should not manage this manually.

### forceSelection

```
forceSelection: boolean;
mustForceSelection()
```
Whether to force the current `SelectionState` to be rendered.

You should not set this property manually -- see
[forceSelection()](#forceselection).

### inCompositionMode

```
inCompositionMode: boolean;
isInCompositionMode()
```
Whether the user is in IME composition mode. This is useful for rendering the
appropriate UI for IME users, even when no content changes have been committed
to the editor. You should not set this property manually.

### inlineStyleOverride

```
inlineStyleOverride: DraftInlineStyle;
getInlineStyleOverride()
```
An inline style value to be applied to the next inserted characters. This is
used when keyboard commands or style buttons are used to apply an inline style
for a collapsed selection range.

`DraftInlineStyle` is a type alias for an immutable `OrderedSet` of strings,
each of which corresponds to an inline style.

### lastChangeType

```
lastChangeType: EditorChangeType;
getLastChangeType()
```
The type of content change that took place in order to bring us to our current
`ContentState`. This is used when determining boundary states for undo/redo.

### nativelyRenderedContent

```
nativelyRenderedContent: ?ContentState;
getNativelyRenderedContent()
```
During edit behavior, the editor may allow certain actions to render natively.
For instance, during normal typing behavior in the contentEditable-based component,
we can typically allow key events to fall through to print characters in the DOM.
In doing so, we can avoid extra re-renders and preserve spellcheck highlighting.

When allowing native rendering behavior, it is appropriate to use the
`nativelyRenderedContent` property to indicate that no re-render is necessary
for this `EditorState`.

### redoStack

```
redoStack: Stack<ContentState>;
getRedoStack()
```
An immutable stack of `ContentState` objects that can be resurrected for redo
operations. When performing an undo operation, the current `ContentState` is
pushed onto the `redoStack`.

You should not manage this property manually. If you would like to disable
undo/redo behavior, use the `allowUndo` property.

See also [undoStack](#undostack).

### selection

```
selection: SelectionState;
getSelection()
```
The currently rendered `SelectionState`. See [acceptSelection()](#acceptselection)
and [forceSelection()](#forceselection).

You should not manage this property manually.

### treeMap

```
treeMap: OrderedMap<string, List>;
```
The fully decorated and styled tree of ranges to be rendered in the editor
component. The `treeMap` object is generated based on a `ContentState` and an
optional decorator (`DraftDecoratorType`).

At render time, components should iterate through the `treeMap` object to
render decorated ranges and styled ranges, using the [getBlockTree()](#getblocktree)
method.

You should not manage this property manually.

### undoStack

```
undoStack: Stack<ContentState>;
getUndoStack()
```
An immutable stack of `ContentState` objects that can be restored for undo
operations.

When performing operations that modify contents, we determine whether the
current `ContentState` should be regarded as a "boundary" state that the user
can reach by performing an undo operation. If so, the `ContentState` is pushed
onto the `undoStack`. If not, the outgoing `ContentState` is simply discarded.

You should not manage this property manually. If you would like to disable
undo/redo behavior, use the `allowUndo` property.

See also [redoStack](#redostack).
