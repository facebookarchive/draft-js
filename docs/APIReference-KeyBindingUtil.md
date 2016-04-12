---
id: api-reference-key-binding-util
title: KeyBindingUtil
layout: docs
category: API Reference
next: api-reference-modifier
permalink: docs/api-reference-key-binding-util.html
---

The `KeyBindingUtil` module is a static set of utility functions for 
defining key bindings.

## Static Methods

### isCtrlKeyCommand

```
isCtrlKeyCommand: function(
  e: SyntheticKeyboardEvent
): boolean
```

Check whether the `ctrlKey` modifier is *not* being used in conjunction with
the `altKey` modifier. If they are combined, the result is an `altGraph`
key modifier, which is not handled by this set of key bindings.

### isOptionKeyCommand

```
isOptionKeyCommand: function(
  e: SyntheticKeyboardEvent
): boolean
```

### hasCommandModifier

```
hasCommandModifier: function(
  e: SyntheticKeyboardEvent
): boolean
```
