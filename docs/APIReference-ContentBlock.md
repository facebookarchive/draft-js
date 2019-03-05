---
id: api-reference-content-block
title: ContentBlock
---

`ContentBlock` is an Immutable
[Record](http://facebook.github.io/immutable-js/docs/#/Record/Record) that
represents the full state of a single block of editor content, including:

  - Plain text contents of the block
  - Type, e.g. paragraph, header, list item
  - Entity, inline style, and depth information

A `ContentState` object contains an `OrderedMap` of these `ContentBlock` objects,
which together comprise the full contents of the editor.

`ContentBlock` objects are largely analogous to block-level HTML elements like
paragraphs and list items. The available types are:

  - unstyled
  - paragraph
  - header-one
  - header-two
  - header-three
  - header-four
  - header-five
  - header-six
  - unordered-list-item
  - ordered-list-item
  - blockquote
  - code-block
  - atomic

New `ContentBlock` objects may be created directly using the constructor.
Expected Record values are detailed below.

### Representing styles and entities

The `characterList` field is an immutable `List` containing a `CharacterMetadata`
object for every character in the block. This is how we encode styles and
entities for a given block.

By making heavy use of immutability and data persistence for these lists and
`CharacterMetadata` objects, edits to the content generally have little impact
on the memory footprint of the editor.

By encoding inline styles and entities together in this way, a function that
performs edits on a `ContentBlock` can perform slices, concats, and other List
methods on a single `List` object.

When creating a new `ContentBlock` containing `text` and without `characterList`
it then will default to a `characterList` with empty `CharacterMetadata` for the
supplied text.

## Overview

*Methods*

<ul class="apiIndex">
  <li>
    <a href="#getkey">
      <pre>getKey(): string</pre>
    </a>
  </li>
  <li>
    <a href="#gettype">
      <pre>getType(): DraftBlockType</pre>
    </a>
  </li>
  <li>
    <a href="#gettext">
      <pre>getText(): string</pre>
    </a>
  </li>
  <li>
    <a href="#getcharacterlist">
      <pre>getCharacterList(): List<CharacterMetadata></pre>
    </a>
  </li>
  <li>
    <a href="#getlength">
      <pre>getLength(): number</pre>
    </a>
  </li>
  <li>
    <a href="#getdepth">
      <pre>getDepth(): number</pre>
    </a>
  </li>
  <li>
    <a href="#getinlinestyleat">
      <pre>getInlineStyleAt(offset: number): DraftInlineStyle</pre>
    </a>
  </li>
  <li>
    <a href="#getentityat">
      <pre>getEntityAt(offset: number): ?string</pre>
    </a>
  </li>
  <li>
    <a href="#getdata">
      <pre>getData(): Map<any, any></pre>
    </a>
  </li>
  <li>
    <a href="#findstyleranges">
      <pre>findStyleRanges(filterFn: Function, callback: Function): void</pre>
    </a>
  </li>
  <li>
    <a href="#findentityranges">
      <pre>findEntityRanges(filterFn: Function, callback: Function): void</pre>
    </a>
  </li>
</ul>

*Properties*

> Note
>
> Use [Immutable Map API](http://facebook.github.io/immutable-js/docs/#/Map)
> for the `ContentBlock` constructor or to set properties.

<ul class="apiIndex">
  <li>
    <a href="#key">
      <pre>key: string</pre>
    </a>
  </li>
  <li>
    <a href="#type">
      <pre>type: DraftBlockType</pre>
    </a>
  </li>
  <li>
    <a href="#text">
      <pre>text: string</pre>
    </a>
  </li>
  <li>
    <a href="#characterlist">
      <pre>characterList: List<CharacterMetadata></pre>
    </a>
  </li>
  <li>
    <a href="#depth">
      <pre>depth: number</pre>
    </a>
  </li>
  <li>
    <a href="#data">
      <pre>data: Map<any, any></pre>
    </a>
  </li>
</ul>

## Methods

### getKey()

```
getKey(): string
```
Returns the string key for this `ContentBlock`. Block keys are alphanumeric string. It is recommended to use `generateRandomKey` to generate block keys.

### getType()

```
getType(): DraftBlockType
```
Returns the type for this `ContentBlock`. Type values are largely analogous to
block-level HTML elements.

### getText()

```
getText(): string
```
Returns the full plaintext for this `ContentBlock`. This value does not contain
any styling, decoration, or HTML information.

### getCharacterList()

```
getCharacterList(): List<CharacterMetadata>
```
Returns an immutable `List` of `CharacterMetadata` objects, one for each
character in the `ContentBlock`. (See [CharacterMetadata](/docs/api-reference-character-metadata.html)
for details.)

This `List` contains all styling and entity information for the block.

### getLength()

```
getLength(): number
```
Returns the length of the plaintext for the `ContentBlock`.

This value uses the standard JavaScript `length` property for the string, and
is therefore not Unicode-aware -- surrogate pairs will be counted as two
characters.

### getDepth()

```
getDepth(): number
```
Returns the depth value for this block, if any. This is currently used only
for list items.

### getInlineStyleAt()

```
getInlineStyleAt(offset: number): DraftInlineStyle
```
Returns the `DraftInlineStyle` value (an `OrderedSet<string>`) at a given offset
within this `ContentBlock`.

### getEntityAt()

```
getEntityAt(offset: number): ?string
```
Returns the entity key value (or `null` if none) at a given offset within this
`ContentBlock`.

### getData()

```
getData(): Map<any, any>
```
Returns block-level metadata.

### findStyleRanges()

```
findStyleRanges(
  filterFn: (value: CharacterMetadata) => boolean,
  callback: (start: number, end: number) => void
): void
```
Executes a callback for each contiguous range of styles within this
`ContentBlock`.

### findEntityRanges()

```
findEntityRanges(
  filterFn: (value: CharacterMetadata) => boolean,
  callback: (start: number, end: number) => void
): void
```
Executes a callback for each contiguous range of entities within this
`ContentBlock`.

## Properties

> Note
>
> Use [Immutable Map API](http://facebook.github.io/immutable-js/docs/#/Map)
> for the `ContentBlock` constructor or to set properties.

### key
See `getKey()`.

### text
See `getText()`.

### type
See `getType()`.

### characterList
See `getCharacterList()`.

### depth
See `getDepth()`.

### data
See `getData()`.
