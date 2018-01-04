---
id: v0-10-api-migration
title: v0.10 API Migration
---

The Draft.js v0.10 release includes a change to the API for managing
`DraftEntity` data; the global 'DraftEntity' module is being deprecated and
`DraftEntity` instances will be managed as part of `ContentState`. This means
that the methods which were previously accessed on `DraftEntity` are now moved
to the `ContentState` record.

This API improvement unlocks the path for many benefits that will be available in v0.11:

* DraftEntity instances and storage will be immutable.
* DraftEntity will no longer be globally accessible.
* Any changes to entity data will trigger a re-render.

## Quick Overview

Here is a quick list of what has been changed and how to update your application:

### Creating an entity

**Old Syntax**

```
const entityKey = Entity.create(
  urlType,
  'IMMUTABLE',
  {src: urlValue},
);
```

**New Syntax**

```
const contentStateWithEntity = contentState.createEntity(
  urlType,
  'IMMUTABLE',
  {src: urlValue},
);
const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
```

### Getting an Entity

**Old Syntax**

```
const entityInstance = Entity.get(entityKey);
// entityKey is a string key associated with that entity when it was created
```

**New Syntax**

```
const entityInstance = contentState.getEntity(entityKey);
// entityKey is a string key associated with that entity when it was created
```

### Decorator Strategy arguments change

**Old Syntax**

```
const compositeDecorator = new CompositeDecorator([
  {
    strategy: (contentBlock, callback) => exampleFindTextRange(contentBlock, callback),
    component: ExampleTokenComponent,
  },
]);
```

**New Syntax**

```
const compositeDecorator = new CompositeDecorator([
  {
    strategy: (
      contentBlock,
      callback,
      contentState
    ) => exampleFindTextRange(contentBlock, callback, contentState),
    component: ExampleTokenComponent,
  },
]);
```

Note that ExampleTokenComponent will receive contentState as a prop.

Why does the 'contentState' get passed into the decorator strategy now? Because we may need it if our strategy is to  find certain entities in the contentBlock:

```
const mutableEntityStrategy = function(contentBlock, callback, contentState) {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      if (entityKey === null) {
        return false;
      }
      // To look for certain types of entities,
      // or entities with a certain mutability,
      // you may need to get the entity from contentState.
      // In this example we get only mutable entities.
      return contentState.getEntity(entityKey).getMutability() === 'MUTABLE';
    },
    callback,
  );
};
```

### Decorator Strategies that find Entities

**Old Syntax**

```
function findLinkEntities(contentBlock, callback) {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        Entity.get(entityKey).getType() === 'LINK'
      );
    },
    callback,
  );
};
```

**New Syntax**

```
function findLinkEntities(contentBlock, callback, contentState) {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        contentState.getEntity(entityKey).getType() === 'LINK'
      );
    },
    callback,
  );
};
```

## More Information

For more information see the [updated examples](https://github.com/facebook/draft-js/tree/master/examples/draft-0-10-0).
