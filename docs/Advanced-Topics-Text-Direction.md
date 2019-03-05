---
id: advanced-topics-text-direction
title: Text Direction
---

Facebook supports dozens of languages, which means that our text inputs need
to be flexible enough to handle considerable variety.

For example, we want input behavior for RTL languages such as Arabic and Hebrew
to meet users' expectations. We also want to be able to support editor contents
with a mixture of LTR and RTL text.

To that end, Draft uses a bidi algorithm to determine appropriate
text alignment and direction on a per-block basis.

Text is rendered with an LTR or RTL direction automatically as the user types.
You should not need to do anything to set direction yourself.

## Text Alignment

While languages are automatically aligned to the left or right during composition,
as defined by the content characters, it is also possible for engineers to
manually set the text alignment for an editor's contents.

This may be useful, for instance, if an editor requires strictly centered
contents, or needs to keep text aligned flush against another UI element.

The `Editor` component therefore provides a `textAlignment` prop, with a
simple set of values: `'left'`, `'center'`, and `'right'`. Using these values,
the contents of your editor will be aligned to the specified direction regardless
of language and character set.
