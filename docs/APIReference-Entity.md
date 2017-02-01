---
id: api-reference-entity
title: Entity
layout: docs
category: API Reference
next: api-reference-selection-state
permalink: docs/api-reference-entity.html
---

`Entity` is a static module containing the API for creating, retrieving, and
updating entity objects, which are used for annotating text ranges with metadata.
This module also houses the single store used to maintain entity data.

This article is dedicated to covering the details of the API. See the
[advanced topics article on entities](/draft-js/docs/advanced-topics-entities.html)
for more detail on how entities may be used.

Please note that the API for entity storage and management has changed recently;
for details on updating your application
[see our v0.10 API Migration Guide](/draft-js/docs/v0-10-api-migration.html#content).

Entity objects returned by `Entity` methods are represented as
[DraftEntityInstance](https://github.com/facebook/draft-js/blob/master/src/model/entity/DraftEntityInstance.js) immutable records. These have a simple set of getter functions and should
be used only for retrieval.

## Overview

*Methods*

<ul class="apiIndex">
  <li>
    <a href="#create">
      <pre>create(...): DraftEntityInstance</pre>
    </a>
  </li>
  <li>
    <a href="#add">
      <pre>add(instance: DraftEntityInstance): string</pre>
    </a>
  </li>
  <li>
    <a href="#get">
      <pre>get(key: string): DraftEntityInstance</pre>
    </a>
  </li>
  <li>
    <a href="#mergedata">
      <pre>mergeData(...): DraftEntityInstance</pre>
    </a>
  </li>
  <li>
    <a href="#replacedata">
      <pre>replaceData(...): DraftEntityInstance</pre>
    </a>
  </li>
</ul>

## Methods

### create

```
create(
  type: DraftEntityType,
  mutability: DraftEntityMutability,
  data?: Object
): string
```
The `create` method should be used to generate a new entity object with the
supplied properties.

Note that a string is returned from this function. This is because entities
are referenced by their string key in `ContentState`. The string value should
be used within `CharacterMetadata` objects to track the entity for annotated
characters.

### add

```
add(instance: DraftEntityInstance): string
```
In most cases, you will use `Entity.create()`. This is a convenience method
that you probably will not need in typical Draft usage.

The `add` function is useful in cases where the instances have already been
created, and now need to be added to the `Entity` store. This may occur in cases
where a vanilla JavaScript representation of a `ContentState` is being revived
for editing.

### get

```
get(key: string): DraftEntityInstance
```
Returns the `DraftEntityInstance` for the specified key. Throws if no instance
exists for that key.

### mergeData

```
mergeData(
  key: string,
  toMerge: {[key: string]: any}
): DraftEntityInstance
```
Since `DraftEntityInstance` objects are immutable, you cannot update an entity's
metadata through typical mutative means.

The `mergeData` method allows you to apply updates to the specified entity.

### replaceData

```
replaceData(
  key: string,
  newData: {[key: string]: any}
): DraftEntityInstance
```
The `replaceData` method is similar to the `mergeData` method, except it will
totally discard the existing `data` value for the instance and replace it with
the specified `newData`.
