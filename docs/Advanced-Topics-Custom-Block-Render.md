---
id: advanced-topics-custom-block-render-map
title: Custom Block Rendering
---

This article discusses how to customize Draft default block rendering.
The block rendering is used to define supported block types and their respective
renderers, as well as converting pasted content to known Draft block types.

When pasting content or when using the
[convertFromHTML](/docs/api-reference-data-conversion.html#convertfromhtml)
Draft will then convert the pasted content to the respective block rendering type
by matching the Draft block render map with the matched tag.

## Draft default block render map

|  HTML element   |            Draft block type             |
| --------------- | --------------------------------------- |
|     `<h1/>`     |               header-one                |
|     `<h2/>`     |               header-two                |
|     `<h3/>`     |              header-three               |
|     `<h4/>`     |               header-four               |
|     `<h5/>`     |               header-five               |
|     `<h6/>`     |               header-six                |
| `<blockquote/>` |               blockquote                |
|    `<pre/>`     |               code-block                |
|   `<figure/>`   |                 atomic                  |
|     `<li/>`     | unordered-list-item,ordered-list-item** |
|    `<div/>`     |               unstyled***               |

\*\* - Block type will be based on the parent `<ul/>` or `<ol/>`

\*\*\* -  Any block that is not recognized by the block rendering mapping will be treated as unstyled

## Configuring block render map

Draft default block render map can be overwritten, by passing an
[Immutable Map](http://facebook.github.io/immutable-js/docs/#/Map) to
the editor blockRender props.

*example of overwriting default block render map:*

```js
// The example below deliberately only allows
// 'heading-two' as the only valid block type and
// updates the unstyled element to also become a h2.
const blockRenderMap = Immutable.Map({
  'header-two': {
    element: 'h2'
  },
  'unstyled': {
    element: 'h2'
  }
});

class RichEditor extends React.Component {
  render() {
    return (
      <Editor
        ...
        blockRenderMap={blockRenderMap}
      />
    );
  }
}
```

There are cases where instead of overwriting the defaults we just want to add new block types;
this can be done by using the DefaultDraftBlockRenderMap reference to create a new blockRenderMap

*example of extending default block render map:*

```js
const blockRenderMap = Immutable.Map({
  'section': {
    element: 'section'
  }
});

// Include 'paragraph' as a valid block and updated the unstyled element but
// keep support for other draft default block types
const extendedBlockRenderMap = Draft.DefaultDraftBlockRenderMap.merge(blockRenderMap);

class RichEditor extends React.Component {
  render() {
    return (
      <Editor
        ...
        blockRenderMap={extendedBlockRenderMap}
      />
    );
  }
}
```

When Draft parses pasted HTML, it maps from HTML elements back into
Draft block types. If you want to specify other HTML elements that map to a
particular block type, you can add an array `aliasedElements` to the block config.

*example of unstyled block type alias usage:*

```
'unstyled': {
  element: 'div',
  aliasedElements: ['p'],
}
```

## Custom block wrappers

By default the html element is used to wrap block types however a react component
can also be provided to the _blockRenderMap_ to wrap the EditorBlock.

During pasting or when using the
[convertFromHTML](/docs/api-reference-data-conversion.html#convertfromhtml)
the html will be scanned for matching tag elements. A wrapper will be used when there is a definition for
it on the _blockRenderMap_ to wrap that particular block type. For example:

Draft uses wrappers to wrap `<li/>` inside either `<ol/>` or `<ul/>` but wrappers can also be used
to wrap any other custom block type

*example of extending default block render map to use a react component for a custom block:*

```js
class MyCustomBlock extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className='MyCustomBlock'>
        {/* here, this.props.children contains a <section> container, as that was the matching element */}
        {this.props.children}
      </div>
    );
  }
}

const blockRenderMap = Immutable.Map({
  'MyCustomBlock': {
    // element is used during paste or html conversion to auto match your component;
    // it is also retained as part of this.props.children and not stripped out
    element: 'section',
    wrapper: <MyCustomBlock />,
  }
});

// keep support for other draft default block types and add our myCustomBlock type
const extendedBlockRenderMap = Draft.DefaultDraftBlockRenderMap.merge(blockRenderMap);

class RichEditor extends React.Component {
  ...
  render() {
    return (
      <Editor
        ...
        blockRenderMap={extendedBlockRenderMap}
      />
    );
  }
}
```
