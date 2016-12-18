---
id: advanced-topics-entities
title: Entities
layout: docs
category: Advanced Topics
next: advanced-topics-decorators
permalink: docs/advanced-topics-entities.html
---

This article discusses the Entity system, which Draft uses for annotating
ranges of text with metadata. Entities enable engineers to introduce levels of
richness beyond styled text to their editors. Links, mentions, and embedded
content can all be implemented using entities.

In the Draft repository, the
[link editor](https://github.com/facebook/draft-js/tree/master/examples/draft-0-9-1/link)
and
[entity demo](https://github.com/facebook/draft-js/tree/master/examples/draft-0-9-1/entity)
provide live code examples to help clarify how entities can be used, as well
as their built-in behavior.

The [Entity API Reference](/draft-js/docs/api-reference-entity.html) provides
details on the static methods to be used when creating, retrieving, or updating
entity objects.

## Introduction

An entity is an object that represents metadata for a range of text within a
Draft editor. It has three properties:

- **type**: A string that indicates what kind of entity it is, e.g. `'LINK'`,
`'MENTION'`, `'PHOTO'`.
- **mutability**: Not to be confused with immutability a la `immutable-js`, this
property denotes the behavior of a range of text annotated with this entity
object when editing the text range within the editor. This is addressed in
greater detail below.
- **data**: An optional object containing metadata for the entity. For instance,
a `'LINK'` entity might contain a `data` object that contains the `href` value
for that link.

All entities are stored in a single object store within the `Entity` module,
and are referenced by key within `ContentState` and React components used to
decorate annotated ranges. _(We are considering future changes to bring
the entity store into `EditorState` or `ContentState`.)_

Using [decorators](/draft-js/docs/advanced-topics-decorators.html) or
[custom block components](/draft-js/docs/advanced-topics-block-components.html), you can
add rich rendering to your editor based on entity metadata.

## Creating and Retrieving Entities

Entities should be created using `Entity.create`, which accepts the three
properties above as arguments. This method returns a string key, which can then
be used to refer to the entity.

This key is the value that should be used when applying entities to your
content. For instance, the `Modifier` module contains an `applyEntity` method:

```js
const key = Entity.create('LINK', 'MUTABLE', {href: 'http://www.zombo.com'});
const contentStateWithLink = Modifier.applyEntity(
  contentState,
  selectionState,
  entityKey
);
```

For a given range of text, then, you can extract its associated entity key by using
the `getEntityAt()` method on a `ContentBlock` object, passing in the target
offset value.

```js
const blockWithLinkAtBeginning = contentState.getBlockForKey('...');
const linkKey = blockWithLinkAtBeginning.getEntityAt(0);
const linkInstance = Entity.get(linkKey);
const {href} = linkInstance.getData();
```

## "Mutability"

Entities may have one of three "mutability" values. The difference between them
is the way they behave when the user makes edits to them.

Note that `DraftEntityInstance` objects are always immutable Records, and this
property is meant only to indicate how the annotated text may be "mutated" within
the editor. _(Future changes may rename this property to ward off potential
confusion around naming.)_

### Immutable

This text cannot be altered without removing the entity annotation
from the text. Entities with this mutability type are effectively atomic.

For instance, in a Facebook input, add a mention for a Page (i.e. Barack Obama).
Then, either add a character within the mentioned text, or try to delete a character.
Note that when adding characters, the entity is removed, and when deleting character,
the entire entity is removed.

This mutability value is useful in cases where the text absolutely must match
its relevant metadata, and may not be altered.

### Mutable

This text may be altered freely. For instance, link text is
generally intended to be "mutable" since the href and linkified text are not
tightly coupled.

### Segmented

Entities that are "segmented" are tightly coupled to their text in much the
same way as "immutable" entities, but allow customization via deletion.

For instance, in a Facebook input, add a mention for a friend. Then, add a
character to the text. Note that the entity is removed from the entire string,
since your mentioned friend may not have their name altered in your text.

Next, try deleting a character or word within the mention. Note that only the
section of the mention that you have deleted is removed. In this way, we can
allow short names for mentions.

## Modifying Entities

Since `DraftEntityInstance` records are immutable, you may not update the `data`
property on an instance directly.

Instead, two `Entity` methods are available to modify entities: `mergeData` and
`replaceData`. The former allows updating data by passing in an object to merge,
while the latter completely swaps in the new data object.

## Using Entities for Rich Content

The next article in this section covers the usage of decorator objects, which
can be used to retrieve entities for rendering purposes.

The [link editor example](https://github.com/facebook/draft-js/tree/master/examples/draft-0-9-1/link)
provides a working example of entity creation and decoration in use.
