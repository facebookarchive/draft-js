---
id: advanced-topics-block-styling
title: Block Styling
---

Within `Editor`, some block types are given default CSS styles to limit the amount
of basic configuration required to get engineers up and running with custom
editors.

By defining a `blockStyleFn` prop function for an `Editor`, it is possible
to specify classes that should be applied to blocks at render time.

## DraftStyleDefault.css

The Draft library includes default block CSS styles within
[DraftStyleDefault.css](https://github.com/facebook/draft-js/blob/master/src/component/utils/DraftStyleDefault.css). _(Note that the annotations on the CSS class names are
artifacts of Facebook's internal CSS module management system.)_

These CSS rules are largely devoted to providing default styles for list items,
without which callers would be responsible for managing their own default list
styles.

## blockStyleFn

The `blockStyleFn` prop on `Editor` allows you to define CSS classes to
style blocks at render time. For instance, you may wish to style `'blockquote'`
type blocks with fancy italic text.

```js
function myBlockStyleFn(contentBlock) {
  const type = contentBlock.getType();
  if (type === 'blockquote') {
    return 'superFancyBlockquote';
  }
}

// Then...
import {Editor} from 'draft-js';
class EditorWithFancyBlockquotes extends React.Component {
  render() {
    return <Editor ... blockStyleFn={myBlockStyleFn} />;
  }
}
```

Then, in your own CSS:

```css
.superFancyBlockquote {
  color: #999;
  font-family: 'Hoefler Text', Georgia, serif;
  font-style: italic;
  text-align: center;
}
```
