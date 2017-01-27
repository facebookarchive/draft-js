---
id: api-reference-selection-state
title: SelectionState
layout: docs
category: API Reference
next: api-reference-composite-decorator
permalink: docs/api-reference-selection-state.html
---

`SelectionState` is an Immutable
[Record](http://facebook.github.io/immutable-js/docs/#/Record/Record) that
represents a selection range in the editor.

The most common use for the `SelectionState` object is via `EditorState.getSelection()`,
which provides the `SelectionState` currently being rendered in the editor.

### Keys and Offsets

A selection range has two points: an **anchor** and a **focus**. (Read more on
[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Selection#Glossary)).

The native DOM approach represents each point as a Node/offset pair, where the offset
is a number corresponding either to a position within a Node's `childNodes` or, if the
Node is a text node, a character offset within the text contents.

Since Draft maintains the contents of the editor using `ContentBlock` objects,
we can use our own model to represent these points. Thus, selection points are
tracked as key/offset pairs, where the `key` value is the key of the `ContentBlock`
where the point is positioned and the `offset` value is the character offset
within the block.

### Start/End vs. Anchor/Focus

The concept of **anchor** and **focus** is very useful when actually rendering
a selection state in the browser, as it allows us to use forward and backward
selection as needed. For editing operations, however, the direction of the selection
doesn't matter. In this case, it is more appropriate to think in terms of
**start** and **end** points.

The `SelectionState` therefore exposes both anchor/focus values and
start/end values. When managing selection behavior, we recommend that
you work with _anchor_ and _focus_ values to maintain selection direction.
When managing content operations, however, we recommend that you use _start_
and _end_ values.

For instance, when extracting a slice of text from a block based on a
`SelectionState`, it is irrelevant whether the selection is backward:

```
var selectionState = editorState.getSelection();
var anchorKey = selectionState.getAnchorKey();
var currentContent = editorState.getCurrentContent();
var currentContentBlock = currentContent.getBlockForKey(anchorKey);
var start = selectionState.getStartOffset();
var end = selectionState.getEndOffset();
var selectedText = currentContentBlock.getText().slice(start, end);
```

Note that `SelectionState` itself tracks only _anchor_ and _focus_ values.
_Start_ and _end_ values are derived.

## Overview

*Static Methods*

<ul class="apiIndex">
  <li>
    <a href="#createempty">
      <pre>static createEmpty(blockKey)</pre>
    </a>
  </li>
</ul>

*Methods*

<ul class="apiIndex">
  <li>
    <a href="#getstartkey">
      <pre>getStartKey()</pre>
    </a>
  </li>
  <li>
    <a href="#getstartoffset">
      <pre>getStartOffset()</pre>
    </a>
  </li>
  <li>
    <a href="#getendkey">
      <pre>getEndKey()</pre>
    </a>
  </li>
  <li>
    <a href="#getendoffset">
      <pre>getEndOffset()</pre>
    </a>
  </li>
  <li>
    <a href="#getanchorkey">
      <pre>getAnchorKey()</pre>
    </a>
  </li>
  <li>
    <a href="#getanchoroffset">
      <pre>getAnchorOffset()</pre>
    </a>
  </li>
  <li>
    <a href="#getfocuskey">
      <pre>getFocusKey()</pre>
    </a>
  </li>
  <li>
    <a href="#getfocusoffset">
      <pre>getFocusOffset()</pre>
    </a>
  </li>
  <li>
    <a href="#getisbackward">
      <pre>getIsBackward()</pre>
    </a>
  </li>
  <li>
    <a href="#gethasfocus">
      <pre>getHasFocus()</pre>
    </a>
  </li>
  <li>
    <a href="#iscollapsed">
      <pre>isCollapsed()</pre>
    </a>
  </li>
  <li>
    <a href="#hasedgewithin">
      <pre>hasEdgeWithin(blockKey, start, end)</pre>
    </a>
  </li>
  <li>
    <a href="#serialize">
      <pre>serialize()</pre>
    </a>
  </li>
</ul>

*Properties*

> Use [Immutable Map API](http://facebook.github.io/immutable-js/docs/#/Record/Record) to
> set properties.

<ul class="apiIndex">
  <li>
    <a href="#anchorkey">
      <pre>anchorKey</pre>
    </a>
  </li>
  <li>
    <a href="#anchoroffset">
      <pre>anchorOffset</pre>
    </a>
  </li>
  <li>
    <a href="#focuskey">
      <pre>focusKey</pre>
    </a>
  </li>
  <li>
    <a href="#focusoffset">
      <pre>focusOffset</pre>
    </a>
  </li>
  <li>
    <a href="#isbackward">
      <pre>isBackward</pre>
    </a>
  </li>
  <li>
    <a href="#hasfocus">
      <pre>hasFocus</pre>
    </a>
  </li>
</ul>

## Static Methods

### createEmpty()

```
createEmpty(blockKey: string): SelectionState
```
Create a `SelectionState` object at the zero offset of the provided block key
and `hasFocus` set to false.

## Methods

### getStartKey()

```
getStartKey(): string
```
Returns the key of the block containing the start position of the selection range.

### getStartOffset()

```
getStartOffset(): number
```
Returns the block-level character offset of the start position of the selection range.

### getEndKey()

```
getEndKey(): string
```
Returns the key of the block containing the end position of the selection range.

### getEndOffset()

```
getEndOffset(): number
```
Returns the block-level character offset of the end position of the selection range.

### getAnchorKey()

```
getAnchorKey(): string
```
Returns the key of the block containing the anchor position of the selection range.

### getAnchorOffset()

```
getAnchorOffset(): number
```
Returns the block-level character offset of the anchor position of the selection range.

### getFocusKey()

```
getFocusKey(): string
```
Returns the key of the block containing the focus position of the selection range.

### getFocusOffset()

```
getFocusOffset(): number
```
Returns the block-level character offset of the focus position of the selection range.

### getIsBackward()

```
getIsBackward(): boolean
```
Returns whether the focus position is before the anchor position in the document.

This must be derived from the key order of the active `ContentState`, or if the selection
range is entirely within one block, a comparison of the anchor and focus offset values.

### getHasFocus()

```
getHasFocus(): boolean
```
Returns whether the editor has focus.

### isCollapsed()

```
isCollapsed(): boolean
```
Returns whether the selection range is collapsed, i.e. a caret. This is true
when the anchor and focus keys are the same /and/ the anchor and focus offsets
are the same.

### hasEdgeWithin()

```
hasEdgeWithin(blockKey: string, start: number, end: number): boolean
```
Returns whether the selection range has an edge that overlaps with the specified
start/end range within a given block.

This is useful when setting DOM selection within a block after contents are
rendered.

### serialize()

```
serialize(): string
```
Returns a serialized version of the `SelectionState`. Useful for debugging.

## Properties

> Use [Immutable Map API](http://facebook.github.io/immutable-js/docs/#/Record/Record) to
> set properties.

```
var selectionState = SelectionState.createEmpty('foo');
var updatedSelection = selectionState.merge({
  focusKey: 'bar',
  focusOffset: 0,
});
var anchorKey = updatedSelection.getAnchorKey(); // 'foo'
var focusKey = updatedSelection.getFocusKey(); // 'bar'
```

### anchorKey
The block containing the anchor end of the selection range.

### anchorOffset
The offset position of the anchor end of the selection range.

### focusKey
The block containing the focus end of the selection range.

### focusOffset
The offset position of the focus end of the selection range.

### isBackward
If the anchor position is lower in the document than the focus position, the
selection is backward. Note: The `SelectionState` is an object with
no knowledge of the `ContentState` structure. Therefore, when updating
`SelectionState` values, you are responsible for updating `isBackward` as well.

### hasFocus
Whether the editor currently has focus.
