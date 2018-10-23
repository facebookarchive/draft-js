---
id: api-reference-character-metadata
title: CharacterMetadata
---

`CharacterMetadata` is an Immutable
[Record](http://facebook.github.io/immutable-js/docs/#/Record/Record) that
represents inline style and entity information for a single character.

`CharacterMetadata` objects are aggressively pooled and shared. If two characters
have the same inline style and entity, they are represented with the same
`CharacterMetadata` object. We therefore need only as many objects as combinations
of utilized inline style sets with entity keys, keeping our memory footprint
small even as the contents grow in size and complexity.

To that end, you should create or apply changes to `CharacterMetadata` objects
via the provided set of static methods, which will ensure that pooling is utilized.

Most Draft use cases are unlikely to use these static methods, since most common edit
operations are already implemented and available via utility modules. The getter
methods, however, may come in handy at render time.

See the API reference on
[ContentBlock](/docs/api-reference-content-block.html#representing-styles-and-entities)
for information on how `CharacterMetadata` is used within `ContentBlock`.

## Overview

*Static Methods*

<ul class="apiIndex">
  <li>
    <a href="#create">
      <pre>static create(...): CharacterMetadata</pre>
    </a>
  </li>
  <li>
    <a href="#applystyle">
      <pre>static applyStyle(...): CharacterMetadata</pre>
    </a>
  </li>
  <li>
    <a href="#removestyle">
      <pre>static removeStyle(...): CharacterMetadata</pre>
    </a>
  </li>
  <li>
    <a href="#applyentity">
      <pre>static applyEntity(...): CharacterMetadata</pre>
    </a>
  </li>
</ul>

*Methods*

<ul class="apiIndex">
  <li>
    <a href="#getstyle">
      <pre>getStyle(): DraftInlineStyle</pre>
    </a>
  </li>
  <li>
    <a href="#hasstyle">
      <pre>hasStyle(style: string): boolean</pre>
    </a>
  </li>
  <li>
    <a href="#getentity">
      <pre>getEntity(): ?string</pre>
    </a>
  </li>
</ul>

## Static Methods

Under the hood, these methods will utilize pooling to return a matching object,
or return a new object if none exists.

### create

```
static create(config?: CharacterMetadataConfig): CharacterMetadata
```
Generates a `CharacterMetadata` object from the provided configuration. This
function should be used in lieu of a constructor.

The configuration will be used to check whether a pooled match for this
configuration already exists. If so, the pooled object will be returned.
Otherwise, a new `CharacterMetadata` will be pooled for this configuration,
and returned.

### applyStyle

```
static applyStyle(
  record: CharacterMetadata,
  style: string
): CharacterMetadata
```
Apply an inline style to this `CharacterMetadata`.

### removeStyle

```
static removeStyle(
  record: CharacterMetadata,
  style: string
): CharacterMetadata
```
Remove an inline style from this `CharacterMetadata`.

### applyEntity

```
static applyEntity(
  record: CharacterMetadata,
  entityKey: ?string
): CharacterMetadata
```

Apply an entity key -- or provide `null` to remove an entity key -- on this
`CharacterMetadata`.

## Methods

### getStyle

```
getStyle(): DraftInlineStyle
```
Returns the `DraftInlineStyle` for this character, an `OrderedSet` of strings
that represents the inline style to apply for the character at render time.

### hasStyle

```
hasStyle(style: string): boolean
```
Returns whether this character has the specified style.

### getEntity

```
getEntity(): ?string
```
Returns the entity key (if any) for this character, as mapped to the global set of
entities tracked by the [`Entity`](https://github.com/facebook/draft-js/blob/master/src/model/entity/DraftEntity.js)
module.

By tracking a string key here, we can keep the corresponding metadata separate
from the character representation.

If null, no entity is applied for this character.
