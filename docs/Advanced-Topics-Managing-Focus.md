---
id: advanced-topics-managing-focus
title: Managing Focus
---

Managing text input focus can be a tricky task within React components. The browser
focus/blur API is imperative, so setting or removing focus via declarative means
purely through `render()` tends to feel awkward and incorrect, and it requires
challenging attempts at controlling focus state.

With that in mind, at Facebook we often choose to expose `focus()` methods
on components that wrap text inputs. This breaks the declarative paradigm,
but it also simplifies the work needed for engineers to successfully manage
focus behavior within their apps.

The `Editor` component follows this pattern, so there is a public `focus()`
method available on the component. This allows you to use a ref within your
higher-level component to call `focus()` directly on the component when needed.

The event listeners within the component will observe focus changes and
propagate them through `onChange` as expected, so state and DOM will remain
correctly in sync.

## Translating container clicks to focus

Your higher-level component will most likely wrap the `Editor` component in a
container of some kind, perhaps with padding to style it to match your app.

By default, if a user clicks within this container but outside of the rendered
`Editor` while attempting to focus the editor, the editor will have no awareness
of the click event. It is therefore recommended that you use a click listener
on your container component, and use the `focus()` method described above to
apply focus to your editor.

The [plaintext editor example](https://github.com/facebook/draft-js/tree/master/examples/draft-0-10-0/plaintext),
for instance, uses this pattern.
