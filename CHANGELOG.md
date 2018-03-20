# Changelog

Notable changes to Draft.js will be documented in this file.

Changes to `src` are live in production on facebook.com at the time of release.

## 0.10.5 (January 19th, 2018)

### Added
* Add support for `ariaDescribedBy` prop, for better a11y. (Suraj Karnati in
  [a6af3e15](https://github.com/facebook/draft-js/commit/a6af3e15120e74c8797c5670f5bb63cb45c49a32))
* Add support for `ariaLabelledBy` prop, for better a11y. ([@jackyho112](https://github.com/jackyho112)
  in [#1519](https://github.com/facebook/draft-js/pull/1519))

### Changed
* Cause editor to break out of code block when user enters two blank lines. (Hanzhi Zhang
  in [548fd5d1](https://github.com/facebook/draft-js/commit/548fd5d1b1c31b7b4c79cd70b101fae69d522b3f))

### Fixed
* Preserve list indentation when copying and pasting from one Draft.js editor
  into another. ([@GordyD](https://github.com/GordyD) in [#1605](https://github.com/facebook/draft-js/pull/1605))
* Fix `cannot read property 'update' of undefined` error that was thrown when
  typing same character into selection that starts with that character. ([@existentialism](https://github.com/existentialism) in
  [#1512](https://github.com/facebook/draft-js/pull/1512))
* Fix `encodeRawBlocks` to handle non-contiguous entities. Entities should
  always be contigious, and cover one sequential range of characters. However,
  in cases where entityState is corrupted to include non-contiguous entities,
  `encodeRawBlocks` would improperly process the entities in that case. (Frank
  Thompson in [0059dd46](https://github.com/facebook/draft-js/commit/0059dd46f4d23af7d9803316aa93d8deddb5e8ae))
* Updated CSS for DraftEditorPlaceholder to support multiline placeholder (Gaurav Vaish in
  [c38b0285](https://github.com/facebook/draft-js/commit/c38b028513214416d66a3fdf191745dfde04ed2b)
* Fix issue where typing at the end of a link caused the link to continue. (Ian
  Jones in
  [d16833b3](https://github.com/facebook/draft-js/commit/d16833b3dae77ccf13e3af7f5e42c8131b0d1d2c))
* Fix regression of bug where clicking a link caused the focus to move but the
selection state was not cleared, leading to a 'node not found' error.
  ([@flarnie](https://github.com/flarnie)
  in [55316176](https://github.com/facebook/draft-js/commit/553161761903bed7fad971d73e1fe04bb0ff360e))
* Loosen Flow type definition for DraftBlockType to allow user-defined custom
  block types. ([@mitermayer](https://github.com/mitermayer)
  in [#1480](https://github.com/facebook/draft-js/pull/1480))

## 0.10.4 (October 24th, 2017)

### Added
* Expose `onRightArrow` and `onLeftArrow` props to allow handling keyboard
  events when right or left arrow is pressed.
  ([@eessex](https://github.com/eessex)
  in [#1384](https://github.com/facebook/draft-js/pull/1384))
* Expose Draft.css as default CSS export in package.json for use by CSS
  preprocessors. ([@darobin](https://github.com/darobin )
  in [#566](https://github.com/facebook/draft-js/pull/566))

### Changed
* Change 'lookUpwardForInlineStyle' from O(n^2) to O(n), improving performance.
  :) ([@Lemmih](https://github.com/Lemmih)
  in [#1429](https://github.com/facebook/draft-js/pull/1429))

### Fixed
* Fix bug where editors inside draggable parent were broken for Safari.
  ([@mattkrick](https://github.com/mattkrick) in
  [#1326](https://github.com/facebook/draft-js/pull/1326))
* Stop pulling in Enzyme as production dependency. D'oh.
  ([@flarnie](https://github.com/flarnie) in
  [#1415](https://github.com/facebook/draft-js/pull/1415))
* Fix `TypeError: Cannot read property 'nodeType' of undefined` error where
  `anchorNode` was `undefined`.
  ([@tleunen](https://github.com/tleunen) in
  [#1407](https://github.com/facebook/draft-js/pull/1407))
* Fix error thrown when callback tries to `focus` on editor after it has been
  unmounted.  ([@mattkrick](https://github.com/mattkrick) in
  [#1409](https://github.com/facebook/draft-js/pull/1409))
* Fix bug where selecting a single character then typing it doesn't replace it.
  ([@karanjthakkar](https://github.com/karanjthakkar) in
  [#719](https://github.com/facebook/draft-js/pull/719))
* Clear the block type when backspacing at the start of the first block with
  rich text utils.  ([@jvaill](https://github.com/jvaill) in
  [#748](https://github.com/facebook/draft-js/pull/748))

## 0.10.3 (September 28th, 2017)

### Added
* Allow React 16.\* as peer dependency. ([@nikgraf](https://github.com/nikgraf)
  in [#1385](https://github.com/facebook/draft-js/pull/1385))

### Fixed
* Fixed bug where using a custom block type without overriding the default block
  map threw an error. ([@southerncross](https://github.com/southerncross) in
  [#1302](https://github.com/facebook/draft-js/pull/1302))
* Update dependency on `fbjs` to get fix for bug where `focus()` caused
  unexpected scroll ([@flarnie](https://github.com/flarnie) in
  [#1401](https://github.com/facebook/draft-js/pull/1401))

## 0.10.2

### Added
* Added support for `aria-controls` in draft.js ([@jessebeach](https://github.com/jessebeach) in [7f0cab28](https://github.com/facebook/draft-js/commit/7f0cab28386ec4bde8ec6289377bff9e53cd019b))

### Changed
* Change `aria-owns` to `aria-controls` in draft.js. ([@jessebeach](https://github.com/jessebeach) in [7f0cab28](https://github.com/facebook/draft-js/commit/7f0cab28386ec4bde8ec6289377bff9e53cd019b))
  * Deprecates support of `ariaOwns` and `ariaOwneeID` props.
* Deprecate use of `ariaHasPopup` prop in draft.js. `ariaExpanded` should be used instead if an input is showing a dropdown with options.([@jessebeach](https://github.com/jessebeach) in [744e9b4e](https://github.com/facebook/draft-js/commit/744e9b4eb4810797a93c66591fea6f9cac533b4b))
* Pasting an `img` no longer inserts the `src` by default; now inserts image emoji if no decorator is used. ([@aadsm](https://github.com/aadsm) in [0b22d713](https://github.com/facebook/draft-js/commit/0b22d713d556ccc4820850099ad6231493b3f7aa) and [@flarnie](https://github.com/flarnie) in [1378](https://github.com/facebook/draft-js/pull/1378))

### Fixed

* Fix issue where selection state was not cleared on blur and refocus of the
  editor. ([@sophiebits](https://github.com/sophiebits) in
  [19b9b1c5](https://github.com/facebook/draft-js/commit/19b9b1c5007bcb3a4111ea31f8d9a8cda629a1ff))
* Fix issue where pasting code into code block defaulted to plain text, and
  styles were dropped from pasted blocks in general.
  ([@bumbu](https://github.com/bumbu) in
  [e8d10112](https://github.com/facebook/draft-js/commit/e8d101121fb9dd9203a46d899124a7be4b0b2936))
* Fix issue where Flow was not running with some 'import' statements ([@flarnie](https://github.com/flarnie) & [@yuku-t](https://github.com/yuku-t) in [#1263](https://github.com/facebook/draft-js/pull/1262))
* Fix bug where Draft threw when two keys were pressed at same time in React 16 async mode ([@sophiebits](https://github.com/sophiebits) in [1c6a49b8](https://github.com/facebook/draft-js/commit/1c6a49b8801183fe0c29458626c0b5dbe1238e59))
* Fix recent Chrome bug where tab causes error ([@sophiebits](https://github.com/sophiebits) in [5863399a](https://github.com/facebook/draft-js/commit/5863399a3a1bcbbe9b090249504a70496a7af7cc))
* Fix "Refs must have owner" error when multiple copies of React are used ([@mks11](https://github.com/mks11) in [#925](https://github.com/facebook/draft-js/pull/925))
* Fix issue where AT could treat 'return' as submit in Draft ([@jessebeach](https://github.com/jessebeach) in [#1295](https://github.com/facebook/draft-js/pull/1295))
* Don't allow `aria-expanded` to be true unless the aria role is combobox ([@jessebeach](https://github.com/jessebeach) in [3494d45d](https://github.com/facebook/draft-js/commit/3494d45d32b64d6e82e4b3e8fcade6a2b5c6bd46))
* Fix pesky "This Selection object doesn't have any Ranges" bug ([@sophiebits](https://github.com/sophiebits) in [96688e10](https://github.com/facebook/draft-js/commit/96688e10b22a778c76e03009da4b9f3d05eba5f7) and [036e3a84](https://github.com/facebook/draft-js/commit/036e3a848e3593c97f4c3011e1ddc045e128a7af))
* Fix bug where pasting `img` with large data URL source could crash editor ([@aadsm](https://github.com/aadsm) in [0b22d713](https://github.com/facebook/draft-js/commit/0b22d713d556ccc4820850099ad6231493b3f7aa))

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
