---
id: advanced-topics-paste-support
title: Paste Support
layout: docs
category: Advanced Topics
next: advanced-topics-issues-and-pitfalls
permalink: docs/advanced-topics-paste-support.html
---

The `Editor` component offers flexibility to define custom paste support
for your editor, via the `pasteSupport` prop. This allows you to define which
inline styles and block types should be retained on paste, as well as disable
links support.

## Defaults

By default, `Editor` supports paste of links, all default
[inline styles](/docs/advanced-topics-inline-styles.html) and
[block types](/docs/advanced-topics-custom-block-render-map.html). If custom
block render map is provided, it will be used to define supported block types.

## Configuring paste support

For your editor, you may provide the `pasteSupport` prop to define the lists
of `inlineStyles` and `blockTypes` you want to support on paste. Also you can
disable images and links support.

## pasteSupport object properties

#### inlineStyles
```
inlineStyles?: List<string>
```
Optionally define the list of inliny styles supported on paste. If omitted, all
defult inline styles will be supported.

#### blockTypes
```
blockTypes?: List<string>
```
Optionally define the list of block types supported on paste. If omitted, all
block types defined in `blockRenderMap` will be supported.

#### images
```
images?: boolean
```
Optionally disable images support (set to `false`).

Default is `true`.

#### links
```
links?: boolean
```
Optionally disable links support (set to `false`).

Default is `true`.

## Example

You may want to ignore underlined text, h4-h6 headers, blockquotes and images
on paste. To do so, define a custom `pasteSupport` object:

```js
import {Editor} from 'draft-js';

const pasteSupport = {
  inlineStyles: Immutable.List([
    'BOLD',
    'CODE',
    'ITALIC',
    'STRIKETHROUGH',
  ]),
  blockTypes: Immutable.List([
    'header-one',
    'header-two',
    'header-three',
    'unordered-list-item',
    'ordered-list-item',
    'blockquote',
    'atomic',
    'code-block',
    'unstyled',
  ]),
  images: false,
};

class MyEditor extends React.Component {
  // ...
  render() {
    return (
      <Editor
        pasteSupport={pasteSupport}
        editorState={this.state.editorState}
        ...
      />
    );
  }
}
```

If your use case should not have any blocks, inline styles, images and links, set
`pasteSupport` prop to:
```js
{
  inlineStyles: Immutable.List(),
  blockTypes: Immutable.List(),
  images: false,
  links: false,
}
```
