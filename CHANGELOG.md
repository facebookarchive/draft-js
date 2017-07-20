# Changelog

Notable changes to Draft.js will be documented in this file.

Changes to `src` are live in production on facebook.com at the time of release.

## 0.10.1

### Added

* Support UMD in dist output format (#1090)
* Expose textDirectionality prop
* Expose props disabling auto-correct, auto-complete, auto-capitalize
* Add `editorKey` prop for SSR
* Pass `block` to `customStyleFn` callback
* Added `moveAtomicBlock` to `AtomicBlockUtils`

### Fixed

* Fix some cases of "Failed to execute 'setStart' on 'Range" bug (#1162)
* Fix Chrome text deletion bug (#1155)
* Pass fresh editorState to edit handlers (#1112 and #1113)
* Fix for text insertion bugs in Android 5.1
* Correctly delete immutable and segmented entity content when at the edge of a
  selection
  * Fix bug where all text except first letter was dropped in IE11
  * Fix bug where starting new line incorrectly toggled inline style
  * Fix 'getRangeClientRects' to work around [webkit selection bounding rect
    bug](https://www.youtube.com/watch?v=TpNzVH5jlcU)

## 0.10.0 (Dec. 16, 2016)

### Added

* Add improved API for entity manipulation to contentState
* Add deprecation warnings to old Entity module API
* Add image support to convertFromHTML
* Add option of 'aliasedElements' in block render map

### Changed

* This version supports both the old and new Entity API; we
  are deprecating the Entity module in favor of
  using contentState. See [the migration guide.](https://draftjs.org/docs/v0-10-api-migration.html#content)

### Fixed

* Fix bug where block data was not removed when deleting atomic block
* Fix bug preventing pasting from clipboard
* Fix dead key deletion and deletion in 2-Set Korean
* Fix ContentState.createFromBlockArray to allow taking an empty array
* Improve typing in Korean on Windows

## 0.9.1 (September 16, 2016)

### Added

* `customStyleFn` for more control over inline style ranges

### Fixed

* Update Flow version
* Fix flow error in DraftEditorDragHandler

## 0.9.0 (September 13, 2016)

### Changed

* Return 'handled' or 'not-handled' from cancellable handlers callback
  * Boolean return value is deprecated
* Expand and update documentation

### Fixed

* Fix selection of atomic block when it is the last block
* Preserve the depth of custom block types when converting to raw
* Stop mutating component children when creating blocks with wrapper elements

## 0.8.1 (August 12, 2016)

### Fixed

* Include `object-assign` in npm dependencies
* Include `babel-core` in npm dependencies of tex example

## 0.8.0 (August 8, 2016)

### Added

* `customStyleFn` for more control over inline style ranges
* Uses `internalClipboard` for Safari
* Metadata for `ContentBlock` objects
* `convertFromHTMLToContentBlocks`:
  * Support for `mailto` protocol for links
  * Support "unset" inline styles
* Run ESLint on examples


### Changed

* Removed redundant ESLint module in TeX example
* Update Travis CI config for readability, Node v4 requirements, and pruning/updating npm dependencies
* Use `immutable` ~3.7.4 to avoid Flow errors in updated versions
* Modify `getSelectionOffsetKeyForNode` to search for nested offset-annotated nodes
* Upgrade eslint to 3.0.1, use fbjs config
* Update to Flow 0.28
* Jest
  * Update to 12.1.1
  * Replaced `jest.fn().mockReturnValue(x)` with `jest.fn(() => x)`
* Remove extra spaces from the text decoration style
* No longer using `nullthrows` for `blockRenderMap`
* `convertFromHTMLToContentBlocks`:
  * Improved variable names in `joinChunks`
  * Additional whitelisted entities such as `className`, `rel`, `target`, `title`

### Fixed

* Fix bug where placeholder text was not being erased in Chrome
* Fix bug where double click link in Firefox broke selection
* Kill iOS tooltips
* removed unnecessary `undefined` checks on `DraftEditorLeaf`
* `convertFromHTMLToContentBlocks`:
  * Preserve pasted block type on paste
  * Strip XML carriage returns and zero-width spaces
  * `getBlockMapSupportedTags()` will always return a valid array of tags
* Documentation fixes

## 0.7.0 (May 3, 2016)

### Added

* `blockRenderMap`: A map that allows configuration for the DOM elements and
wrapper components to render, keyed by block type
  * Includes configurability of element-to-block-type paste processing

### Changed

* Update to Jest 11.0.2

### Fixed

* Change deletion behavior around `atomic` blocks to avoid DOM selection errors
* Properly apply entities across multiple blocks in
* Improve placeholder behavior for a11y
* Properly remove and modify entity ranges during spellcheck changes
* Match Chrome `<textarea>` behavior during <kbd>cmd</kbd>+<kbd>backspace</kbd>
command at visual line-start

## 0.6.0 (April 27, 2016)

### Added

* `ContentState.getFirstBlock()` convenience method

### Changed

* <kbd>return</kbd> key handling now goes through command flow to enable easier
custom `'split-block'` handling.
* `convertFromRaw` now returns a `ContentState` object instead of an
`Array<ContentBlock>`

## 0.5.0 (April 12, 2016)

### Fixed

* <kbd>option</kbd>+<kbd>spacebar</kbd> no longer incorrectly scrolls browser in Chrome OSX
* Cursor behavior when adding soft newlines

### Added

* `AtomicBlockUtils`, a utility module to simplify adding `atomic` blocks to
an `EditorState`

### Changed

* The `media` block type is now `atomic`, to better represent that this type
is not just intended for photos and videos

## 0.4.0 (April 6, 2016)

### Fixed

* Avoid clearing inline style override when setting block type or depth

### Added

* `editable` field for custom block component configuration
* Default key binding support for <kbd>Ctrl</kbd>+<kbd>M</kbd> (`split-block`)

### Changed

* Always wrap custom block components, based on block type
  * Includes `data-editor`, `data-offset-key`, `data-block` in block props
* Replace `onPasteRawText` prop with `handlePastedText`

## 0.3.0 (March 22, 2016)

### Fixed

* Properly extract custom inline styles for `convertToRaw`
* Fix internal paste behavior to better handle copied custom blocks

### Added

* Export `getVisibleSelectionRect`
* Export `convertFromHTML`
* Export `DraftEditorBlock`

## 0.2.2 (March 9, 2016)

### Fixed

* Build before publish to get the warning suppression in place correctly

## 0.2.1 (March 9, 2016)

### Added

* React 15 RC as peer/dev dependency, provide `suppressContentEditableWarning`

## 0.2.0 (March 8, 2016)

### Added

* Move `white-space: pre-wrap` into inline style to resolve insertion issues
* `handleDrop` prop method for `Editor` to allow manual drop management
* `decoratedText` prop for decorator components
* `getVisibleSelectionRect`, to provide Rect for DOM selection
* Export `KeyBindingUtil` and `getDefaultKeyBinding`

### Fixed

* Triple-clicks followed by block type changes now only affect first block
* `DraftEditorLeaf` now re-renders correctly when its styles change
* Backspace behavior within empty code blocks

## 0.1.0 (February 22, 2016)

* Initial public release
