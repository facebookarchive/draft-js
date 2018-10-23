---
id: api-reference-modifier
title: Modifier
---

The `Modifier` module is a static set of utility functions that encapsulate common
edit operations on `ContentState` objects. It is highly recommended that you use
these methods for edit operations.

These methods also take care of removing or modifying entity ranges appropriately,
given the mutability types of any affected entities.

In each case, these methods accept `ContentState` objects with relevant
parameters and return `ContentState` objects. The returned `ContentState`
will be the same as the input object if no edit was actually performed.

## Overview

*Methods*

<ul class="apiIndex">
  <li>
    <a href="#replacetext">
      <pre>replaceText(...): ContentState</pre>
    </a>
  </li>
  <li>
    <a href="#inserttext">
      <pre>insertText(...): ContentState</pre>
    </a>
  </li>
  <li>
    <a href="#movetext">
      <pre>moveText(...): ContentState</pre>
    </a>
  </li>
  <li>
    <a href="#replacewithfragment">
      <pre>replaceWithFragment(...): ContentState</pre>
    </a>
  </li>
  <li>
    <a href="#removerange">
      <pre>removeRange(...): ContentState</pre>
    </a>
  </li>
  <li>
    <a href="#splitblock">
      <pre>splitBlock(...): ContentState</pre>
    </a>
  </li>
  <li>
    <a href="#applyinlinestyle">
      <pre>applyInlineStyle(...): ContentState</pre>
    </a>
  </li>
  <li>
    <a href="#removeinlinestyle">
      <pre>removeInlineStyle(...): ContentState</pre>
    </a>
  </li>
  <li>
    <a href="#setblocktype">
      <pre>setBlockType(...): ContentState</pre>
    </a>
  </li>
  <li>
    <a href="#setblockdata">
      <pre>setBlockData(...): ContentState</pre>
    </a>
  </li>
  <li>
    <a href="#mergeblockdata">
      <pre>mergeBlockData(...): ContentState</pre>
    </a>
  </li>
  <li>
    <a href="#applyentity">
      <pre>applyEntity(...): ContentState</pre>
    </a>
  </li>
</ul>

## Static Methods

### replaceText

```
replaceText(
  contentState: ContentState,
  rangeToReplace: SelectionState,
  text: string,
  inlineStyle?: DraftInlineStyle,
  entityKey?: ?string
): ContentState
```
Replaces the specified range of this `ContentState` with the supplied string,
with the inline style and entity key applied to the entire inserted string.

Example: On Facebook, when replacing `@abraham lincoln` with a mention of
Abraham Lincoln, the entire old range is the target to replace and the mention
entity should be applied to the inserted string.

### insertText

```
insertText(
  contentState: ContentState,
  targetRange: SelectionState,
  text: string,
  inlineStyle?: DraftInlineStyle,
  entityKey?: ?string
): ContentState
```
Identical to `replaceText`, but enforces that the target range is collapsed
so that no characters are replaced. This is just for convenience, since text
edits are so often insertions rather than replacements.

### moveText

```
moveText(
  contentState: ContentState,
  removalRange: SelectionState,
  targetRange: SelectionState
): ContentState
```
Moves the "removal" range to the "target" range, replacing the target text.

### replaceWithFragment

```
replaceWithFragment(
  contentState: ContentState,
  targetRange: SelectionState,
  fragment: BlockMap
): ContentState
```
A "fragment" is a section of a block map, effectively just an
`OrderedMap<string, ContentBlock>` much the same as the full block map of a
`ContentState` object.

This method will replace the "target" range with the fragment.

Example: When pasting content, we convert the paste into a fragment to be inserted
into the editor, then use this method to add it.

### removeRange

```
removeRange(
  contentState: ContentState,
  rangeToRemove: SelectionState,
  removalDirection: DraftRemovalDirection
): ContentState
```
Remove an entire range of text from the editor. The removal direction is important
for proper entity deletion behavior.

### splitBlock

```
splitBlock(
  contentState: ContentState,
  selectionState: SelectionState
): ContentState
```
Split the selected block into two blocks. This should only be used if the
selection is collapsed.

### applyInlineStyle

```
applyInlineStyle(
  contentState: ContentState,
  selectionState: SelectionState,
  inlineStyle: string
): ContentState
```
Apply the specified inline style to the entire selected range.

### removeInlineStyle

```
removeInlineStyle(
  contentState: ContentState,
  selectionState: SelectionState,
  inlineStyle: string
): ContentState
```
Remove the specified inline style from the entire selected range.

### setBlockType

```
setBlockType(
  contentState: ContentState,
  selectionState: SelectionState,
  blockType: DraftBlockType
): ContentState
```
Set the block type for all selected blocks.

### setBlockData

```
setBlockData(
  contentState: ContentState,
  selectionState: SelectionState,
  blockData: Map<any, any>
): ContentState
```
Set the block data for all selected blocks.

### mergeBlockData

```
mergeBlockData(
  contentState: ContentState,
  selectionState: SelectionState,
  blockData: Map<any, any>
): ContentState
```
Update block data for all selected blocks.

### applyEntity

```
applyEntity(
  contentState: ContentState,
  selectionState: SelectionState,
  entityKey: ?string
): ContentState
```
Apply an entity to the entire selected range, or remove all entities from the
range if `entityKey` is `null`.
