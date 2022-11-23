---
id: api-reference-content-state
title: ContentState
---

`ContentState` is an Immutable
[Record](https://web.archive.org/web/20150623131347/http://facebook.github.io:80/immutable-js/docs/#/Record) 
that represents the full state of:

- The entire **contents** of an editor: text, block and inline styles, and entity ranges.
- Two **selection states** of an editor: before and after the rendering of these contents.

The most common use for the `ContentState` object is via `EditorState.getCurrentContent()`,
which provides the `ContentState` currently being rendered in the editor.

An `EditorState` object maintains undo and redo stacks comprised of `ContentState`
objects.

## Overview

_Static Methods_

<ul class="apiIndex">
  <li>
    <a href="#createfromtext">
      <pre>static createFromText(text: string): ContentState</pre>
    </a>
  </li>
  <li>
    <a href="#createfromblockarray">
      <pre>static createFromBlockArray(blocks: Array&lt;ContentBlock&gt;): ContentState</pre>
    </a>
  </li>
</ul>

_Methods_

<ul class="apiIndex">
  <li>
    <a href="#getentitymap">
      <pre>getEntityMap()</pre>
    </a>
  </li>
  <li>
    <a href="#getblockmap">
      <pre>getBlockMap()</pre>
    </a>
  </li>
  <li>
    <a href="#getselectionbefore">
      <pre>getSelectionBefore()</pre>
    </a>
  </li>
  <li>
    <a href="#getselectionafter">
      <pre>getSelectionAfter()</pre>
    </a>
  </li>
  <li>
    <a href="#getblockforkey">
      <pre>getBlockForKey(key)</pre>
    </a>
  </li>
  <li>
    <a href="#getkeybefore">
      <pre>getKeyBefore(key)</pre>
    </a>
  </li>
  <li>
    <a href="#getkeyafter">
      <pre>getKeyAfter(key)</pre>
    </a>
  </li>
  <li>
    <a href="#getblockbefore">
      <pre>getBlockBefore(key)</pre>
    </a>
  </li>
  <li>
    <a href="#getblockafter">
      <pre>getBlockAfter(key)</pre>
    </a>
  </li>
  <li>
    <a href="#getblocksasarray">
      <pre>getBlocksAsArray()</pre>
    </a>
  </li>
  <li>
    <a href="#getfirstblock">
      <pre>getFirstBlock()</pre>
    </a>
  </li>
  <li>
    <a href="#getlastblock">
      <pre>getLastBlock()</pre>
    </a>
  </li>
  <li>
    <a href="#getplaintext">
      <pre>getPlainText(delimiter)</pre>
    </a>
  </li>
  <li>
    <a href="#getlastcreatedentitykey">
      <pre>getLastCreatedEntityKey()</pre>
    </a>
  </li>
  <li>
    <a href="#hastext">
      <pre>hasText()</pre>
    </a>
  </li>
  <li>
    <a href="#createentity">
      <pre>createEntity(...)</pre>
    </a>
  </li>
  <li>
    <a href="#getentity">
      <pre>getEntity(...)</pre>
    </a>
  </li>
  <li>
    <a href="#mergeentitydata">
      <pre>mergeEntityData(...)</pre>
    </a>
  </li>
  <li>
    <a href="#replaceentitydata">
      <pre>replaceEntityData(...)</pre>
    </a>
  </li>
  <li>
    <a href="#addentity">
      <pre>addEntity(...)</pre>
    </a>
  </li>
</ul>

_Properties_

> Use [Immutable Map API](https://web.archive.org/web/20150623131347/http://facebook.github.io:80/immutable-js/docs/#/Map) to
> set properties.
>
> **Example**
>
> ```js
> const editorState = EditorState.createEmpty();
> const contentState = editorState.getCurrentContent();
> const contentStateWithSelectionBefore = contentState.set(
>   'selectionBefore',
>   SelectionState.createEmpty(contentState.getBlockForKey('1pu4d')),
> );
> ```

<ul class="apiIndex">
  <li>
    <a href="#blockmap">
      <pre>blockMap</pre>
    </a>
  </li>
  <li>
    <a href="#selectionbefore">
      <pre>selectionBefore</pre>
    </a>
  </li>
  <li>
    <a href="#selectionafter">
      <pre>selectionAfter</pre>
    </a>
  </li>
</ul>

## Static Methods

### `createFromText()`

```js
static createFromText(
  text: string,
  delimiter?: string
): ContentState
```

Generates a `ContentState` from a string, with a delimiter to split the string
into `ContentBlock` objects. If no delimiter is provided, '`\n`' is used.

### `createFromBlockArray()`

```js
static createFromBlockArray(
  blocks: Array<ContentBlock>,
  entityMap: ?OrderedMap
): ContentState
```

Generates a `ContentState` from an array of `ContentBlock` objects. The default
`selectionBefore` and `selectionAfter` states have the cursor at the start of
the content.

## Methods

### `getEntityMap()`

```js
getEntityMap(): EntityMap
```

Returns an object store containing all `DraftEntity` records that have been
created. In upcoming v0.11.0 the map returned will be an Immutable ordered map
of `DraftEntity` records.

In most cases, you should be able to use the convenience methods below to target
specific `DraftEntity` records or obtain information about the state of the
content.

### `getBlockMap()`

```js
getBlockMap(): BlockMap
```

Returns the full ordered map of `ContentBlock` objects representing the state
of an entire document.

In most cases, you should be able to use the convenience methods below to target
specific `ContentBlock` objects or obtain information about the state of the content.

### `getSelectionBefore()`

```js
getSelectionBefore(): SelectionState
```

Returns the `SelectionState` displayed in the editor before rendering `blockMap`.

When performing an `undo` action in the editor, the `selectionBefore` of the current
`ContentState` is used to place the selection range in the appropriate position.

### `getSelectionAfter()`

```js
getSelectionAfter(): SelectionState
```

Returns the `SelectionState` displayed in the editor after rendering `blockMap`.

When performing any action in the editor that leads to this `blockMap` being rendered,
the selection range will be placed in the `selectionAfter` position.

### `getBlockForKey()`

```js
getBlockForKey(key: string): ContentBlock
```

Returns the `ContentBlock` corresponding to the given block key.

#### Example

```js
var {editorState} = this.state;
var startKey = editorState.getSelection().getStartKey();
var selectedBlockType = editorState
  .getCurrentContent()
  .getBlockForKey(startKey)
  .getType();
```

### `getKeyBefore()`

```js
getKeyBefore(key: string): ?string
```

Returns the key before the specified key in `blockMap`, or null if this is the first key.

### `getKeyAfter()`

```js
getKeyAfter(key: string): ?string
```

Returns the key after the specified key in `blockMap`, or null if this is the last key.

### `getBlockBefore()`

```js
getBlockBefore(key: string): ?ContentBlock
```

Returns the `ContentBlock` before the specified key in `blockMap`, or null if this is
the first key.

### `getBlockAfter()`

```js
getBlockAfter(key: string): ?ContentBlock
```

Returns the `ContentBlock` after the specified key in `blockMap`, or null if this is the last key.

### `getBlocksAsArray()`

```js
getBlocksAsArray(): Array<ContentBlock>
```

Returns the values of `blockMap` as an array.

You generally won't need to use this method, since `getBlockMap` provides an `OrderedMap` that you should use for iteration.

### `getFirstBlock()`

```js
getFirstBlock(): ContentBlock
```

Returns the first `ContentBlock`.

### `getLastBlock()`

```js
getLastBlock(): ContentBlock
```

Returns the last `ContentBlock`.

### `getPlainText()`

```js
getPlainText(delimiter?: string): string
```

Returns the full plaintext value of the contents, joined with a delimiter. If no
delimiter is specified, the line feed character (`\u000A`) is used.

### `getLastCreatedEntityKey()`

```js
getLastCreatedEntityKey(): string
```

Returns the string key that can be used to reference the most recently created
`DraftEntity` record. This is because entities are referenced by their string
key in ContentState. The string value should be used within CharacterMetadata
objects to track the entity for annotated characters.

### `hasText()`

```js
hasText(): boolean
```

Returns whether the contents contain any text at all.

### `createEntity()`

```js
createEntity(
  type: DraftEntityType,
  mutability: DraftEntityMutability,
  data?: Object
): ContentState
```

Returns `ContentState` record updated to include the newly created `DraftEntity` record in it's `EntityMap`. Call `getLastCreatedEntityKey` to get the key of the newly created `DraftEntity` record.

### `getEntity()`

```js
getEntity(key: string): DraftEntityInstance
```

Returns the DraftEntityInstance for the specified key. Throws if no instance exists for that key.

### `mergeEntityData()`

```js
mergeEntityData(
  key: string,
  toMerge: {[key: string]: any}
): ContentState
```

Since DraftEntityInstance objects are immutable, you cannot update an entity's
metadata through typical mutative means.

The mergeData method allows you to apply updates to the specified entity.

### `replaceEntityData()`

```js
replaceEntityData(
  key: string,
  newData: {[key: string]: any}
): ContentState
```

The replaceData method is similar to the mergeData method, except it will totally discard the existing data value for the instance and replace it with the specified newData.

### `addEntity()`

```js
addEntity(instance: DraftEntityInstance): ContentState
```

In most cases, you will use contentState.createEntity(). This is a convenience
method that you probably will not need in typical Draft usage.

The add function is useful in cases where the instances have already been
created, and now need to be added to the Entity store. This may occur in cases
where a vanilla JavaScript representation of a ContentState is being revived for
editing.

## Properties

> Use [Immutable Map API](https://web.archive.org/web/20150623131347/http://facebook.github.io:80/immutable-js/docs/#/Map) to
> set properties.

### `blockMap`

See `getBlockMap()`.

### `selectionBefore`

See `getSelectionBefore()`.

### `selectionAfter`

See `getSelectionAfter()`.
