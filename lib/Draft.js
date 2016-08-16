/**
 * Draft v0.8.1
 *
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
var Draft =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule Draft
	 */

	'use strict';

	var AtomicBlockUtils = __webpack_require__(58);
	var BlockMapBuilder = __webpack_require__(15);
	var CharacterMetadata = __webpack_require__(6);
	var CompositeDraftDecorator = __webpack_require__(59);
	var ContentBlock = __webpack_require__(10);
	var ContentState = __webpack_require__(22);
	var DefaultDraftBlockRenderMap = __webpack_require__(23);
	var DefaultDraftInlineStyle = __webpack_require__(35);
	var DraftEditor = __webpack_require__(61);
	var DraftEditorBlock = __webpack_require__(36);
	var DraftModifier = __webpack_require__(4);
	var DraftEntity = __webpack_require__(9);
	var DraftEntityInstance = __webpack_require__(37);
	var EditorState = __webpack_require__(1);
	var KeyBindingUtil = __webpack_require__(24);
	var RichTextEditorUtil = __webpack_require__(72);
	var SelectionState = __webpack_require__(14);

	var convertFromDraftStateToRaw = __webpack_require__(77);
	var convertFromHTMLToContentBlocks = __webpack_require__(40);
	var convertFromRawToDraftState = __webpack_require__(78);
	var generateRandomKey = __webpack_require__(7);
	var getDefaultKeyBinding = __webpack_require__(41);
	var getVisibleSelectionRect = __webpack_require__(101);

	var DraftPublic = {
	  Editor: DraftEditor,
	  EditorBlock: DraftEditorBlock,
	  EditorState: EditorState,

	  CompositeDecorator: CompositeDraftDecorator,
	  Entity: DraftEntity,
	  EntityInstance: DraftEntityInstance,

	  BlockMapBuilder: BlockMapBuilder,
	  CharacterMetadata: CharacterMetadata,
	  ContentBlock: ContentBlock,
	  ContentState: ContentState,
	  SelectionState: SelectionState,

	  AtomicBlockUtils: AtomicBlockUtils,
	  KeyBindingUtil: KeyBindingUtil,
	  Modifier: DraftModifier,
	  RichUtils: RichTextEditorUtil,

	  DefaultDraftBlockRenderMap: DefaultDraftBlockRenderMap,
	  DefaultDraftInlineStyle: DefaultDraftInlineStyle,

	  convertFromHTML: convertFromHTMLToContentBlocks,
	  convertFromRaw: convertFromRawToDraftState,
	  convertToRaw: convertFromDraftStateToRaw,
	  genKey: generateRandomKey,
	  getDefaultKeyBinding: getDefaultKeyBinding,
	  getVisibleSelectionRect: getVisibleSelectionRect
	};

	module.exports = DraftPublic;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule EditorState
	 * 
	 */

	'use strict';

	var _assign = __webpack_require__(12);

	var _extends = _assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var BlockTree = __webpack_require__(34);
	var ContentState = __webpack_require__(22);
	var EditorBidiService = __webpack_require__(71);
	var Immutable = __webpack_require__(2);
	var SelectionState = __webpack_require__(14);

	var OrderedSet = Immutable.OrderedSet;
	var Record = Immutable.Record;
	var Stack = Immutable.Stack;


	var defaultRecord = {
	  allowUndo: true,
	  currentContent: null,
	  decorator: null,
	  directionMap: null,
	  forceSelection: false,
	  inCompositionMode: false,
	  inlineStyleOverride: null,
	  lastChangeType: null,
	  nativelyRenderedContent: null,
	  redoStack: Stack(),
	  selection: null,
	  treeMap: null,
	  undoStack: Stack()
	};

	var EditorStateRecord = Record(defaultRecord);

	var EditorState = function () {
	  EditorState.createEmpty = function createEmpty(decorator) {
	    return EditorState.createWithContent(ContentState.createFromText(''), decorator);
	  };

	  EditorState.createWithContent = function createWithContent(contentState, decorator) {
	    var firstKey = contentState.getBlockMap().first().getKey();
	    return EditorState.create({
	      currentContent: contentState,
	      undoStack: Stack(),
	      redoStack: Stack(),
	      decorator: decorator || null,
	      selection: SelectionState.createEmpty(firstKey)
	    });
	  };

	  EditorState.create = function create(config) {
	    var currentContent = config.currentContent;
	    var decorator = config.decorator;

	    var recordConfig = _extends({}, config, {
	      treeMap: generateNewTreeMap(currentContent, decorator),
	      directionMap: EditorBidiService.getDirectionMap(currentContent)
	    });
	    return new EditorState(new EditorStateRecord(recordConfig));
	  };

	  EditorState.set = function set(editorState, put) {
	    var map = editorState.getImmutable().withMutations(function (state) {
	      var existingDecorator = state.get('decorator');
	      var decorator = existingDecorator;
	      if (put.decorator === null) {
	        decorator = null;
	      } else if (put.decorator) {
	        decorator = put.decorator;
	      }

	      var newContent = put.currentContent || editorState.getCurrentContent();

	      if (decorator !== existingDecorator) {
	        var treeMap = state.get('treeMap');
	        var newTreeMap;
	        if (decorator && existingDecorator) {
	          newTreeMap = regenerateTreeForNewDecorator(newContent.getBlockMap(), treeMap, decorator, existingDecorator);
	        } else {
	          newTreeMap = generateNewTreeMap(newContent, decorator);
	        }

	        state.merge({
	          decorator: decorator,
	          treeMap: newTreeMap,
	          nativelyRenderedContent: null
	        });
	        return;
	      }

	      var existingContent = editorState.getCurrentContent();
	      if (newContent !== existingContent) {
	        state.set('treeMap', regenerateTreeForNewBlocks(editorState, newContent.getBlockMap(), decorator));
	      }

	      state.merge(put);
	    });

	    return new EditorState(map);
	  };

	  EditorState.prototype.toJS = function toJS() {
	    return this.getImmutable().toJS();
	  };

	  EditorState.prototype.getAllowUndo = function getAllowUndo() {
	    return this.getImmutable().get('allowUndo');
	  };

	  EditorState.prototype.getCurrentContent = function getCurrentContent() {
	    return this.getImmutable().get('currentContent');
	  };

	  EditorState.prototype.getUndoStack = function getUndoStack() {
	    return this.getImmutable().get('undoStack');
	  };

	  EditorState.prototype.getRedoStack = function getRedoStack() {
	    return this.getImmutable().get('redoStack');
	  };

	  EditorState.prototype.getSelection = function getSelection() {
	    return this.getImmutable().get('selection');
	  };

	  EditorState.prototype.getDecorator = function getDecorator() {
	    return this.getImmutable().get('decorator');
	  };

	  EditorState.prototype.isInCompositionMode = function isInCompositionMode() {
	    return this.getImmutable().get('inCompositionMode');
	  };

	  EditorState.prototype.mustForceSelection = function mustForceSelection() {
	    return this.getImmutable().get('forceSelection');
	  };

	  EditorState.prototype.getNativelyRenderedContent = function getNativelyRenderedContent() {
	    return this.getImmutable().get('nativelyRenderedContent');
	  };

	  EditorState.prototype.getLastChangeType = function getLastChangeType() {
	    return this.getImmutable().get('lastChangeType');
	  };

	  /**
	   * While editing, the user may apply inline style commands with a collapsed
	   * cursor, intending to type text that adopts the specified style. In this
	   * case, we track the specified style as an "override" that takes precedence
	   * over the inline style of the text adjacent to the cursor.
	   *
	   * If null, there is no override in place.
	   */


	  EditorState.prototype.getInlineStyleOverride = function getInlineStyleOverride() {
	    return this.getImmutable().get('inlineStyleOverride');
	  };

	  EditorState.setInlineStyleOverride = function setInlineStyleOverride(editorState, inlineStyleOverride) {
	    return EditorState.set(editorState, { inlineStyleOverride: inlineStyleOverride });
	  };

	  /**
	   * Get the appropriate inline style for the editor state. If an
	   * override is in place, use it. Otherwise, the current style is
	   * based on the location of the selection state.
	   */


	  EditorState.prototype.getCurrentInlineStyle = function getCurrentInlineStyle() {
	    var override = this.getInlineStyleOverride();
	    if (override != null) {
	      return override;
	    }

	    var content = this.getCurrentContent();
	    var selection = this.getSelection();

	    if (selection.isCollapsed()) {
	      return getInlineStyleForCollapsedSelection(content, selection);
	    }

	    return getInlineStyleForNonCollapsedSelection(content, selection);
	  };

	  EditorState.prototype.getBlockTree = function getBlockTree(blockKey) {
	    return this.getImmutable().getIn(['treeMap', blockKey]);
	  };

	  EditorState.prototype.isSelectionAtStartOfContent = function isSelectionAtStartOfContent() {
	    var firstKey = this.getCurrentContent().getBlockMap().first().getKey();
	    return this.getSelection().hasEdgeWithin(firstKey, 0, 0);
	  };

	  EditorState.prototype.isSelectionAtEndOfContent = function isSelectionAtEndOfContent() {
	    var content = this.getCurrentContent();
	    var blockMap = content.getBlockMap();
	    var last = blockMap.last();
	    var end = last.getLength();
	    return this.getSelection().hasEdgeWithin(last.getKey(), end, end);
	  };

	  EditorState.prototype.getDirectionMap = function getDirectionMap() {
	    return this.getImmutable().get('directionMap');
	  };

	  /**
	   * Incorporate native DOM selection changes into the EditorState. This
	   * method can be used when we simply want to accept whatever the DOM
	   * has given us to represent selection, and we do not need to re-render
	   * the editor.
	   *
	   * To forcibly move the DOM selection, see `EditorState.forceSelection`.
	   */


	  EditorState.acceptSelection = function acceptSelection(editorState, selection) {
	    return updateSelection(editorState, selection, false);
	  };

	  /**
	   * At times, we need to force the DOM selection to be where we
	   * need it to be. This can occur when the anchor or focus nodes
	   * are non-text nodes, for instance. In this case, we want to trigger
	   * a re-render of the editor, which in turn forces selection into
	   * the correct place in the DOM. The `forceSelection` method
	   * accomplishes this.
	   *
	   * This method should be used in cases where you need to explicitly
	   * move the DOM selection from one place to another without a change
	   * in ContentState.
	   */


	  EditorState.forceSelection = function forceSelection(editorState, selection) {
	    if (!selection.getHasFocus()) {
	      selection = selection.set('hasFocus', true);
	    }
	    return updateSelection(editorState, selection, true);
	  };

	  /**
	   * Move selection to the end of the editor without forcing focus.
	   */


	  EditorState.moveSelectionToEnd = function moveSelectionToEnd(editorState) {
	    var content = editorState.getCurrentContent();
	    var lastBlock = content.getLastBlock();
	    var lastKey = lastBlock.getKey();
	    var length = lastBlock.getLength();

	    return EditorState.acceptSelection(editorState, new SelectionState({
	      anchorKey: lastKey,
	      anchorOffset: length,
	      focusKey: lastKey,
	      focusOffset: length,
	      isBackward: false
	    }));
	  };

	  /**
	   * Force focus to the end of the editor. This is useful in scenarios
	   * where we want to programmatically focus the input and it makes sense
	   * to allow the user to continue working seamlessly.
	   */


	  EditorState.moveFocusToEnd = function moveFocusToEnd(editorState) {
	    var afterSelectionMove = EditorState.moveSelectionToEnd(editorState);
	    return EditorState.forceSelection(afterSelectionMove, afterSelectionMove.getSelection());
	  };

	  /**
	   * Push the current ContentState onto the undo stack if it should be
	   * considered a boundary state, and set the provided ContentState as the
	   * new current content.
	   */


	  EditorState.push = function push(editorState, contentState, changeType) {
	    if (editorState.getCurrentContent() === contentState) {
	      return editorState;
	    }

	    var forceSelection = changeType !== 'insert-characters';
	    var directionMap = EditorBidiService.getDirectionMap(contentState, editorState.getDirectionMap());

	    if (!editorState.getAllowUndo()) {
	      return EditorState.set(editorState, {
	        currentContent: contentState,
	        directionMap: directionMap,
	        lastChangeType: changeType,
	        selection: contentState.getSelectionAfter(),
	        forceSelection: forceSelection,
	        inlineStyleOverride: null
	      });
	    }

	    var selection = editorState.getSelection();
	    var currentContent = editorState.getCurrentContent();
	    var undoStack = editorState.getUndoStack();
	    var newContent = contentState;

	    if (selection !== currentContent.getSelectionAfter() || mustBecomeBoundary(editorState, changeType)) {
	      undoStack = undoStack.push(currentContent);
	      newContent = newContent.set('selectionBefore', selection);
	    } else if (changeType === 'insert-characters' || changeType === 'backspace-character' || changeType === 'delete-character') {
	      // Preserve the previous selection.
	      newContent = newContent.set('selectionBefore', currentContent.getSelectionBefore());
	    }

	    var inlineStyleOverride = editorState.getInlineStyleOverride();

	    // Don't discard inline style overrides on block type or depth changes.
	    if (changeType !== 'adjust-depth' && changeType !== 'change-block-type') {
	      inlineStyleOverride = null;
	    }

	    var editorStateChanges = {
	      currentContent: newContent,
	      directionMap: directionMap,
	      undoStack: undoStack,
	      redoStack: Stack(),
	      lastChangeType: changeType,
	      selection: contentState.getSelectionAfter(),
	      forceSelection: forceSelection,
	      inlineStyleOverride: inlineStyleOverride
	    };

	    return EditorState.set(editorState, editorStateChanges);
	  };

	  /**
	   * Make the top ContentState in the undo stack the new current content and
	   * push the current content onto the redo stack.
	   */


	  EditorState.undo = function undo(editorState) {
	    if (!editorState.getAllowUndo()) {
	      return editorState;
	    }

	    var undoStack = editorState.getUndoStack();
	    var newCurrentContent = undoStack.peek();
	    if (!newCurrentContent) {
	      return editorState;
	    }

	    var currentContent = editorState.getCurrentContent();
	    var directionMap = EditorBidiService.getDirectionMap(newCurrentContent, editorState.getDirectionMap());

	    return EditorState.set(editorState, {
	      currentContent: newCurrentContent,
	      directionMap: directionMap,
	      undoStack: undoStack.shift(),
	      redoStack: editorState.getRedoStack().push(currentContent),
	      forceSelection: true,
	      inlineStyleOverride: null,
	      lastChangeType: 'undo',
	      nativelyRenderedContent: null,
	      selection: currentContent.getSelectionBefore()
	    });
	  };

	  /**
	   * Make the top ContentState in the redo stack the new current content and
	   * push the current content onto the undo stack.
	   */


	  EditorState.redo = function redo(editorState) {
	    if (!editorState.getAllowUndo()) {
	      return editorState;
	    }

	    var redoStack = editorState.getRedoStack();
	    var newCurrentContent = redoStack.peek();
	    if (!newCurrentContent) {
	      return editorState;
	    }

	    var currentContent = editorState.getCurrentContent();
	    var directionMap = EditorBidiService.getDirectionMap(newCurrentContent, editorState.getDirectionMap());

	    return EditorState.set(editorState, {
	      currentContent: newCurrentContent,
	      directionMap: directionMap,
	      undoStack: editorState.getUndoStack().push(currentContent),
	      redoStack: redoStack.shift(),
	      forceSelection: true,
	      inlineStyleOverride: null,
	      lastChangeType: 'redo',
	      nativelyRenderedContent: null,
	      selection: newCurrentContent.getSelectionAfter()
	    });
	  };

	  /**
	   * Not for public consumption.
	   */


	  function EditorState(immutable) {
	    _classCallCheck(this, EditorState);

	    this._immutable = immutable;
	  }

	  /**
	   * Not for public consumption.
	   */


	  EditorState.prototype.getImmutable = function getImmutable() {
	    return this._immutable;
	  };

	  return EditorState;
	}();

	/**
	 * Set the supplied SelectionState as the new current selection, and set
	 * the `force` flag to trigger manual selection placement by the view.
	 */


	function updateSelection(editorState, selection, forceSelection) {
	  return EditorState.set(editorState, {
	    selection: selection,
	    forceSelection: forceSelection,
	    nativelyRenderedContent: null,
	    inlineStyleOverride: null
	  });
	}

	/**
	 * Regenerate the entire tree map for a given ContentState and decorator.
	 * Returns an OrderedMap that maps all available ContentBlock objects.
	 */
	function generateNewTreeMap(contentState, decorator) {
	  return contentState.getBlockMap().map(function (block) {
	    return BlockTree.generate(block, decorator);
	  }).toOrderedMap();
	}

	/**
	 * Regenerate tree map objects for all ContentBlocks that have changed
	 * between the current editorState and newContent. Returns an OrderedMap
	 * with only changed regenerated tree map objects.
	 */
	function regenerateTreeForNewBlocks(editorState, newBlockMap, decorator) {
	  var prevBlockMap = editorState.getCurrentContent().getBlockMap();
	  var prevTreeMap = editorState.getImmutable().get('treeMap');
	  return prevTreeMap.merge(newBlockMap.toSeq().filter(function (block, key) {
	    return block !== prevBlockMap.get(key);
	  }).map(function (block) {
	    return BlockTree.generate(block, decorator);
	  }));
	}

	/**
	 * Generate tree map objects for a new decorator object, preserving any
	 * decorations that are unchanged from the previous decorator.
	 *
	 * Note that in order for this to perform optimally, decoration Lists for
	 * decorators should be preserved when possible to allow for direct immutable
	 * List comparison.
	 */
	function regenerateTreeForNewDecorator(blockMap, previousTreeMap, decorator, existingDecorator) {
	  return previousTreeMap.merge(blockMap.toSeq().filter(function (block) {
	    return decorator.getDecorations(block) !== existingDecorator.getDecorations(block);
	  }).map(function (block) {
	    return BlockTree.generate(block, decorator);
	  }));
	}

	/**
	 * Return whether a change should be considered a boundary state, given
	 * the previous change type. Allows us to discard potential boundary states
	 * during standard typing or deletion behavior.
	 */
	function mustBecomeBoundary(editorState, changeType) {
	  var lastChangeType = editorState.getLastChangeType();
	  return changeType !== lastChangeType || changeType !== 'insert-characters' && changeType !== 'backspace-character' && changeType !== 'delete-character';
	}

	function getInlineStyleForCollapsedSelection(content, selection) {
	  var startKey = selection.getStartKey();
	  var startOffset = selection.getStartOffset();
	  var startBlock = content.getBlockForKey(startKey);

	  // If the cursor is not at the start of the block, look backward to
	  // preserve the style of the preceding character.
	  if (startOffset > 0) {
	    return startBlock.getInlineStyleAt(startOffset - 1);
	  }

	  // The caret is at position zero in this block. If the block has any
	  // text at all, use the style of the first character.
	  if (startBlock.getLength()) {
	    return startBlock.getInlineStyleAt(0);
	  }

	  // Otherwise, look upward in the document to find the closest character.
	  return lookUpwardForInlineStyle(content, startKey);
	}

	function getInlineStyleForNonCollapsedSelection(content, selection) {
	  var startKey = selection.getStartKey();
	  var startOffset = selection.getStartOffset();
	  var startBlock = content.getBlockForKey(startKey);

	  // If there is a character just inside the selection, use its style.
	  if (startOffset < startBlock.getLength()) {
	    return startBlock.getInlineStyleAt(startOffset);
	  }

	  // Check if the selection at the end of a non-empty block. Use the last
	  // style in the block.
	  if (startOffset > 0) {
	    return startBlock.getInlineStyleAt(startOffset - 1);
	  }

	  // Otherwise, look upward in the document to find the closest character.
	  return lookUpwardForInlineStyle(content, startKey);
	}

	function lookUpwardForInlineStyle(content, fromKey) {
	  var previousBlock = content.getBlockBefore(fromKey);
	  var previousLength;

	  while (previousBlock) {
	    previousLength = previousBlock.getLength();
	    if (previousLength) {
	      return previousBlock.getInlineStyleAt(previousLength - 1);
	    }
	    previousBlock = content.getBlockBefore(previousBlock.getKey());
	  }

	  return OrderedSet();
	}

	module.exports = EditorState;

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = Immutable;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 */

	'use strict';

	/**
	 * Use invariant() to assert state which your program assumes to be true.
	 *
	 * Provide sprintf-style format (only %s is supported) and arguments
	 * to provide information about what broke and what you were
	 * expecting.
	 *
	 * The invariant message will be stripped in production, but the invariant
	 * will remain to ensure logic does not differ in production.
	 */

	function invariant(condition, format, a, b, c, d, e, f) {
	  if (true) {
	    if (format === undefined) {
	      throw new Error('invariant requires an error message argument');
	    }
	  }

	  if (!condition) {
	    var error;
	    if (format === undefined) {
	      error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
	    } else {
	      var args = [a, b, c, d, e, f];
	      var argIndex = 0;
	      error = new Error(format.replace(/%s/g, function () {
	        return args[argIndex++];
	      }));
	      error.name = 'Invariant Violation';
	    }

	    error.framesToPop = 1; // we don't care about invariant's own frame
	    throw error;
	  }
	}

	module.exports = invariant;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule DraftModifier
	 * @typechecks
	 * 
	 */

	'use strict';

	var CharacterMetadata = __webpack_require__(6);
	var ContentStateInlineStyle = __webpack_require__(60);
	var Immutable = __webpack_require__(2);

	var applyEntityToContentState = __webpack_require__(76);
	var getCharacterRemovalRange = __webpack_require__(97);
	var getContentStateFragment = __webpack_require__(21);
	var insertFragmentIntoContentState = __webpack_require__(102);
	var insertTextIntoContentState = __webpack_require__(103);
	var invariant = __webpack_require__(3);
	var modifyBlockForContentState = __webpack_require__(114);
	var removeEntitiesAtEdges = __webpack_require__(52);
	var removeRangeFromContentState = __webpack_require__(115);
	var splitBlockInContentState = __webpack_require__(117);

	var OrderedSet = Immutable.OrderedSet;

	/**
	 * `DraftModifier` provides a set of convenience methods that apply
	 * modifications to a `ContentState` object based on a target `SelectionState`.
	 *
	 * Any change to a `ContentState` should be decomposable into a series of
	 * transaction functions that apply the required changes and return output
	 * `ContentState` objects.
	 *
	 * These functions encapsulate some of the most common transaction sequences.
	 */

	var DraftModifier = {
	  replaceText: function replaceText(contentState, rangeToReplace, text, inlineStyle, entityKey) {
	    var withoutEntities = removeEntitiesAtEdges(contentState, rangeToReplace);
	    var withoutText = removeRangeFromContentState(withoutEntities, rangeToReplace);

	    var character = CharacterMetadata.create({
	      style: inlineStyle || OrderedSet(),
	      entity: entityKey || null
	    });

	    return insertTextIntoContentState(withoutText, withoutText.getSelectionAfter(), text, character);
	  },

	  insertText: function insertText(contentState, targetRange, text, inlineStyle, entityKey) {
	    !targetRange.isCollapsed() ?  true ? invariant(false, 'Target range must be collapsed for `insertText`.') : invariant(false) : void 0;
	    return DraftModifier.replaceText(contentState, targetRange, text, inlineStyle, entityKey);
	  },

	  moveText: function moveText(contentState, removalRange, targetRange) {
	    var movedFragment = getContentStateFragment(contentState, removalRange);

	    var afterRemoval = DraftModifier.removeRange(contentState, removalRange, 'backward');

	    return DraftModifier.replaceWithFragment(afterRemoval, targetRange, movedFragment);
	  },

	  replaceWithFragment: function replaceWithFragment(contentState, targetRange, fragment) {
	    var withoutEntities = removeEntitiesAtEdges(contentState, targetRange);
	    var withoutText = removeRangeFromContentState(withoutEntities, targetRange);

	    return insertFragmentIntoContentState(withoutText, withoutText.getSelectionAfter(), fragment);
	  },

	  removeRange: function removeRange(contentState, rangeToRemove, removalDirection) {
	    // Check whether the selection state overlaps with a single entity.
	    // If so, try to remove the appropriate substring of the entity text.
	    if (rangeToRemove.getAnchorKey() === rangeToRemove.getFocusKey()) {
	      var key = rangeToRemove.getAnchorKey();
	      var startOffset = rangeToRemove.getStartOffset();
	      var endOffset = rangeToRemove.getEndOffset();
	      var block = contentState.getBlockForKey(key);

	      var startEntity = block.getEntityAt(startOffset);
	      var endEntity = block.getEntityAt(endOffset - 1);
	      if (startEntity && startEntity === endEntity) {
	        var adjustedRemovalRange = getCharacterRemovalRange(block, rangeToRemove, removalDirection);
	        return removeRangeFromContentState(contentState, adjustedRemovalRange);
	      }
	    }

	    var withoutEntities = removeEntitiesAtEdges(contentState, rangeToRemove);
	    return removeRangeFromContentState(withoutEntities, rangeToRemove);
	  },

	  splitBlock: function splitBlock(contentState, selectionState) {
	    var withoutEntities = removeEntitiesAtEdges(contentState, selectionState);
	    var withoutText = removeRangeFromContentState(withoutEntities, selectionState);

	    return splitBlockInContentState(withoutText, withoutText.getSelectionAfter());
	  },

	  applyInlineStyle: function applyInlineStyle(contentState, selectionState, inlineStyle) {
	    return ContentStateInlineStyle.add(contentState, selectionState, inlineStyle);
	  },

	  removeInlineStyle: function removeInlineStyle(contentState, selectionState, inlineStyle) {
	    return ContentStateInlineStyle.remove(contentState, selectionState, inlineStyle);
	  },

	  setBlockType: function setBlockType(contentState, selectionState, blockType) {
	    return modifyBlockForContentState(contentState, selectionState, function (block) {
	      return block.merge({ type: blockType, depth: 0 });
	    });
	  },

	  setBlockData: function setBlockData(contentState, selectionState, blockData) {
	    return modifyBlockForContentState(contentState, selectionState, function (block) {
	      return block.merge({ data: blockData });
	    });
	  },

	  mergeBlockData: function mergeBlockData(contentState, selectionState, blockData) {
	    return modifyBlockForContentState(contentState, selectionState, function (block) {
	      return block.merge({ data: block.getData().merge(blockData) });
	    });
	  },

	  applyEntity: function applyEntity(contentState, selectionState, entityKey) {
	    var withoutEntities = removeEntitiesAtEdges(contentState, selectionState);
	    return applyEntityToContentState(withoutEntities, selectionState, entityKey);
	  }
	};

	module.exports = DraftModifier;

/***/ },
/* 5 */
/***/ function(module, exports) {

	"use strict";

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */

	var nullthrows = function nullthrows(x) {
	  if (x != null) {
	    return x;
	  }
	  throw new Error("Got unexpected null or undefined");
	};

	module.exports = nullthrows;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule CharacterMetadata
	 * @typechecks
	 * 
	 */

	'use strict';

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _require = __webpack_require__(2);

	var Map = _require.Map;
	var OrderedSet = _require.OrderedSet;
	var Record = _require.Record;


	var EMPTY_SET = OrderedSet();

	var defaultRecord = {
	  style: EMPTY_SET,
	  entity: null
	};

	var CharacterMetadataRecord = Record(defaultRecord);

	var CharacterMetadata = function (_CharacterMetadataRec) {
	  _inherits(CharacterMetadata, _CharacterMetadataRec);

	  function CharacterMetadata() {
	    _classCallCheck(this, CharacterMetadata);

	    return _possibleConstructorReturn(this, _CharacterMetadataRec.apply(this, arguments));
	  }

	  CharacterMetadata.prototype.getStyle = function getStyle() {
	    return this.get('style');
	  };

	  CharacterMetadata.prototype.getEntity = function getEntity() {
	    return this.get('entity');
	  };

	  CharacterMetadata.prototype.hasStyle = function hasStyle(style) {
	    return this.getStyle().has(style);
	  };

	  CharacterMetadata.applyStyle = function applyStyle(record, style) {
	    var withStyle = record.set('style', record.getStyle().add(style));
	    return CharacterMetadata.create(withStyle);
	  };

	  CharacterMetadata.removeStyle = function removeStyle(record, style) {
	    var withoutStyle = record.set('style', record.getStyle().remove(style));
	    return CharacterMetadata.create(withoutStyle);
	  };

	  CharacterMetadata.applyEntity = function applyEntity(record, entityKey) {
	    var withEntity = record.getEntity() === entityKey ? record : record.set('entity', entityKey);
	    return CharacterMetadata.create(withEntity);
	  };

	  /**
	   * Use this function instead of the `CharacterMetadata` constructor.
	   * Since most content generally uses only a very small number of
	   * style/entity permutations, we can reuse these objects as often as
	   * possible.
	   */


	  CharacterMetadata.create = function create(config) {
	    if (!config) {
	      return EMPTY;
	    }

	    // Fill in unspecified properties, if necessary.
	    var configMap = Map({ style: EMPTY_SET, entity: null }).merge(config);

	    var existing = pool.get(configMap);
	    if (existing) {
	      return existing;
	    }

	    var newCharacter = new CharacterMetadata(configMap);
	    pool = pool.set(configMap, newCharacter);
	    return newCharacter;
	  };

	  return CharacterMetadata;
	}(CharacterMetadataRecord);

	var EMPTY = new CharacterMetadata();
	var pool = Map([[Map(defaultRecord), EMPTY]]);

	CharacterMetadata.EMPTY = EMPTY;

	module.exports = CharacterMetadata;

/***/ },
/* 7 */
/***/ function(module, exports) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule generateRandomKey
	 * @typechecks
	 * 
	 */

	'use strict';

	var seenKeys = {};
	var MULTIPLIER = Math.pow(2, 24);

	function generateRandomKey() {
	  var key = void 0;
	  while (key === undefined || seenKeys.hasOwnProperty(key) || !isNaN(+key)) {
	    key = Math.floor(Math.random() * MULTIPLIER).toString(32);
	  }
	  seenKeys[key] = true;
	  return key;
	}

	module.exports = generateRandomKey;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 */

	'use strict';

	var UserAgentData = __webpack_require__(123);
	var VersionRange = __webpack_require__(124);

	var mapObject = __webpack_require__(137);
	var memoizeStringOnly = __webpack_require__(138);

	/**
	 * Checks to see whether `name` and `version` satisfy `query`.
	 *
	 * @param {string} name Name of the browser, device, engine or platform
	 * @param {?string} version Version of the browser, engine or platform
	 * @param {string} query Query of form "Name [range expression]"
	 * @param {?function} normalizer Optional pre-processor for range expression
	 * @return {boolean}
	 */
	function compare(name, version, query, normalizer) {
	  // check for exact match with no version
	  if (name === query) {
	    return true;
	  }

	  // check for non-matching names
	  if (!query.startsWith(name)) {
	    return false;
	  }

	  // full comparison with version
	  var range = query.slice(name.length);
	  if (version) {
	    range = normalizer ? normalizer(range) : range;
	    return VersionRange.contains(range, version);
	  }

	  return false;
	}

	/**
	 * Normalizes `version` by stripping any "NT" prefix, but only on the Windows
	 * platform.
	 *
	 * Mimics the stripping performed by the `UserAgentWindowsPlatform` PHP class.
	 *
	 * @param {string} version
	 * @return {string}
	 */
	function normalizePlatformVersion(version) {
	  if (UserAgentData.platformName === 'Windows') {
	    return version.replace(/^\s*NT/, '');
	  }

	  return version;
	}

	/**
	 * Provides client-side access to the authoritative PHP-generated User Agent
	 * information supplied by the server.
	 */
	var UserAgent = {
	  /**
	   * Check if the User Agent browser matches `query`.
	   *
	   * `query` should be a string like "Chrome" or "Chrome > 33".
	   *
	   * Valid browser names include:
	   *
	   * - ACCESS NetFront
	   * - AOL
	   * - Amazon Silk
	   * - Android
	   * - BlackBerry
	   * - BlackBerry PlayBook
	   * - Chrome
	   * - Chrome for iOS
	   * - Chrome frame
	   * - Facebook PHP SDK
	   * - Facebook for iOS
	   * - Firefox
	   * - IE
	   * - IE Mobile
	   * - Mobile Safari
	   * - Motorola Internet Browser
	   * - Nokia
	   * - Openwave Mobile Browser
	   * - Opera
	   * - Opera Mini
	   * - Opera Mobile
	   * - Safari
	   * - UIWebView
	   * - Unknown
	   * - webOS
	   * - etc...
	   *
	   * An authoritative list can be found in the PHP `BrowserDetector` class and
	   * related classes in the same file (see calls to `new UserAgentBrowser` here:
	   * https://fburl.com/50728104).
	   *
	   * @note Function results are memoized
	   *
	   * @param {string} query Query of the form "Name [range expression]"
	   * @return {boolean}
	   */

	  isBrowser: function isBrowser(query) {
	    return compare(UserAgentData.browserName, UserAgentData.browserFullVersion, query);
	  },


	  /**
	   * Check if the User Agent browser uses a 32 or 64 bit architecture.
	   *
	   * @note Function results are memoized
	   *
	   * @param {string} query Query of the form "32" or "64".
	   * @return {boolean}
	   */
	  isBrowserArchitecture: function isBrowserArchitecture(query) {
	    return compare(UserAgentData.browserArchitecture, null, query);
	  },


	  /**
	   * Check if the User Agent device matches `query`.
	   *
	   * `query` should be a string like "iPhone" or "iPad".
	   *
	   * Valid device names include:
	   *
	   * - Kindle
	   * - Kindle Fire
	   * - Unknown
	   * - iPad
	   * - iPhone
	   * - iPod
	   * - etc...
	   *
	   * An authoritative list can be found in the PHP `DeviceDetector` class and
	   * related classes in the same file (see calls to `new UserAgentDevice` here:
	   * https://fburl.com/50728332).
	   *
	   * @note Function results are memoized
	   *
	   * @param {string} query Query of the form "Name"
	   * @return {boolean}
	   */
	  isDevice: function isDevice(query) {
	    return compare(UserAgentData.deviceName, null, query);
	  },


	  /**
	   * Check if the User Agent rendering engine matches `query`.
	   *
	   * `query` should be a string like "WebKit" or "WebKit >= 537".
	   *
	   * Valid engine names include:
	   *
	   * - Gecko
	   * - Presto
	   * - Trident
	   * - WebKit
	   * - etc...
	   *
	   * An authoritative list can be found in the PHP `RenderingEngineDetector`
	   * class related classes in the same file (see calls to `new
	   * UserAgentRenderingEngine` here: https://fburl.com/50728617).
	   *
	   * @note Function results are memoized
	   *
	   * @param {string} query Query of the form "Name [range expression]"
	   * @return {boolean}
	   */
	  isEngine: function isEngine(query) {
	    return compare(UserAgentData.engineName, UserAgentData.engineVersion, query);
	  },


	  /**
	   * Check if the User Agent platform matches `query`.
	   *
	   * `query` should be a string like "Windows" or "iOS 5 - 6".
	   *
	   * Valid platform names include:
	   *
	   * - Android
	   * - BlackBerry OS
	   * - Java ME
	   * - Linux
	   * - Mac OS X
	   * - Mac OS X Calendar
	   * - Mac OS X Internet Account
	   * - Symbian
	   * - SymbianOS
	   * - Windows
	   * - Windows Mobile
	   * - Windows Phone
	   * - iOS
	   * - iOS Facebook Integration Account
	   * - iOS Facebook Social Sharing UI
	   * - webOS
	   * - Chrome OS
	   * - etc...
	   *
	   * An authoritative list can be found in the PHP `PlatformDetector` class and
	   * related classes in the same file (see calls to `new UserAgentPlatform`
	   * here: https://fburl.com/50729226).
	   *
	   * @note Function results are memoized
	   *
	   * @param {string} query Query of the form "Name [range expression]"
	   * @return {boolean}
	   */
	  isPlatform: function isPlatform(query) {
	    return compare(UserAgentData.platformName, UserAgentData.platformFullVersion, query, normalizePlatformVersion);
	  },


	  /**
	   * Check if the User Agent platform is a 32 or 64 bit architecture.
	   *
	   * @note Function results are memoized
	   *
	   * @param {string} query Query of the form "32" or "64".
	   * @return {boolean}
	   */
	  isPlatformArchitecture: function isPlatformArchitecture(query) {
	    return compare(UserAgentData.platformArchitecture, null, query);
	  }
	};

	module.exports = mapObject(UserAgent, memoizeStringOnly);

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _assign = __webpack_require__(12);

	var _extends = _assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule DraftEntity
	 * @typechecks
	 * 
	 */

	var DraftEntityInstance = __webpack_require__(37);
	var Immutable = __webpack_require__(2);

	var invariant = __webpack_require__(3);

	var Map = Immutable.Map;


	var instances = Map();
	var instanceKey = 0;

	/**
	 * A "document entity" is an object containing metadata associated with a
	 * piece of text in a ContentBlock.
	 *
	 * For example, a `link` entity might include a `uri` property. When a
	 * ContentBlock is rendered in the browser, text that refers to that link
	 * entity may be rendered as an anchor, with the `uri` as the href value.
	 *
	 * In a ContentBlock, every position in the text may correspond to zero
	 * or one entities. This correspondence is tracked using a key string,
	 * generated via DraftEntity.create() and used to obtain entity metadata
	 * via DraftEntity.get().
	 */
	var DraftEntity = {
	  /**
	   * Create a DraftEntityInstance and store it for later retrieval.
	   *
	   * A random key string will be generated and returned. This key may
	   * be used to track the entity's usage in a ContentBlock, and for
	   * retrieving data about the entity at render time.
	   */
	  create: function create(type, mutability, data) {
	    return DraftEntity.add(new DraftEntityInstance({ type: type, mutability: mutability, data: data || {} }));
	  },

	  /**
	   * Add an existing DraftEntityInstance to the DraftEntity map. This is
	   * useful when restoring instances from the server.
	   */
	  add: function add(instance) {
	    var key = '' + ++instanceKey;
	    instances = instances.set(key, instance);
	    return key;
	  },

	  /**
	   * Retrieve the entity corresponding to the supplied key string.
	   */
	  get: function get(key) {
	    var instance = instances.get(key);
	    !!!instance ?  true ? invariant(false, 'Unknown DraftEntity key.') : invariant(false) : void 0;
	    return instance;
	  },

	  /**
	   * Entity instances are immutable. If you need to update the data for an
	   * instance, this method will merge your data updates and return a new
	   * instance.
	   */
	  mergeData: function mergeData(key, toMerge) {
	    var instance = DraftEntity.get(key);
	    var newData = _extends({}, instance.getData(), toMerge);
	    var newInstance = instance.set('data', newData);
	    instances = instances.set(key, newInstance);
	    return newInstance;
	  },

	  /**
	   * Completely replace the data for a given instance.
	   */
	  replaceData: function replaceData(key, newData) {
	    var instance = DraftEntity.get(key);
	    var newInstance = instance.set('data', newData);
	    instances = instances.set(key, newInstance);
	    return newInstance;
	  }
	};

	module.exports = DraftEntity;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule ContentBlock
	 * 
	 */

	'use strict';

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Immutable = __webpack_require__(2);

	var findRangesImmutable = __webpack_require__(20);

	var List = Immutable.List;
	var Map = Immutable.Map;
	var OrderedSet = Immutable.OrderedSet;
	var Record = Immutable.Record;


	var EMPTY_SET = OrderedSet();

	var defaultRecord = {
	  key: '',
	  type: 'unstyled',
	  text: '',
	  characterList: List(),
	  depth: 0,
	  data: Map()
	};

	var ContentBlockRecord = Record(defaultRecord);

	var ContentBlock = function (_ContentBlockRecord) {
	  _inherits(ContentBlock, _ContentBlockRecord);

	  function ContentBlock() {
	    _classCallCheck(this, ContentBlock);

	    return _possibleConstructorReturn(this, _ContentBlockRecord.apply(this, arguments));
	  }

	  ContentBlock.prototype.getKey = function getKey() {
	    return this.get('key');
	  };

	  ContentBlock.prototype.getType = function getType() {
	    return this.get('type');
	  };

	  ContentBlock.prototype.getText = function getText() {
	    return this.get('text');
	  };

	  ContentBlock.prototype.getCharacterList = function getCharacterList() {
	    return this.get('characterList');
	  };

	  ContentBlock.prototype.getLength = function getLength() {
	    return this.getText().length;
	  };

	  ContentBlock.prototype.getDepth = function getDepth() {
	    return this.get('depth');
	  };

	  ContentBlock.prototype.getData = function getData() {
	    return this.get('data');
	  };

	  ContentBlock.prototype.getInlineStyleAt = function getInlineStyleAt(offset) {
	    var character = this.getCharacterList().get(offset);
	    return character ? character.getStyle() : EMPTY_SET;
	  };

	  ContentBlock.prototype.getEntityAt = function getEntityAt(offset) {
	    var character = this.getCharacterList().get(offset);
	    return character ? character.getEntity() : null;
	  };

	  /**
	   * Execute a callback for every contiguous range of styles within the block.
	   */


	  ContentBlock.prototype.findStyleRanges = function findStyleRanges(filterFn, callback) {
	    findRangesImmutable(this.getCharacterList(), haveEqualStyle, filterFn, callback);
	  };

	  /**
	   * Execute a callback for every contiguous range of entities within the block.
	   */


	  ContentBlock.prototype.findEntityRanges = function findEntityRanges(filterFn, callback) {
	    findRangesImmutable(this.getCharacterList(), haveEqualEntity, filterFn, callback);
	  };

	  return ContentBlock;
	}(ContentBlockRecord);

	function haveEqualStyle(charA, charB) {
	  return charA.getStyle() === charB.getStyle();
	}

	function haveEqualEntity(charA, charB) {
	  return charA.getEntity() === charB.getEntity();
	}

	module.exports = ContentBlock;

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @typechecks
	 */

	/**
	 * Unicode-enabled replacesments for basic String functions.
	 *
	 * All the functions in this module assume that the input string is a valid
	 * UTF-16 encoding of a Unicode sequence. If it's not the case, the behavior
	 * will be undefined.
	 *
	 * WARNING: Since this module is typechecks-enforced, you may find new bugs
	 * when replacing normal String functions with ones provided here.
	 */

	'use strict';

	var invariant = __webpack_require__(3);

	// These two ranges are consecutive so anything in [HIGH_START, LOW_END] is a
	// surrogate code unit.
	var SURROGATE_HIGH_START = 0xD800;
	var SURROGATE_HIGH_END = 0xDBFF;
	var SURROGATE_LOW_START = 0xDC00;
	var SURROGATE_LOW_END = 0xDFFF;
	var SURROGATE_UNITS_REGEX = /[\uD800-\uDFFF]/;

	/**
	 * @param {number} codeUnit   A Unicode code-unit, in range [0, 0x10FFFF]
	 * @return {boolean}          Whether code-unit is in a surrogate (hi/low) range
	 */
	function isCodeUnitInSurrogateRange(codeUnit) {
	  return SURROGATE_HIGH_START <= codeUnit && codeUnit <= SURROGATE_LOW_END;
	}

	/**
	 * Returns whether the two characters starting at `index` form a surrogate pair.
	 * For example, given the string s = "\uD83D\uDE0A", (s, 0) returns true and
	 * (s, 1) returns false.
	 *
	 * @param {string} str
	 * @param {number} index
	 * @return {boolean}
	 */
	function isSurrogatePair(str, index) {
	  !(0 <= index && index < str.length) ?  true ? invariant(false, 'isSurrogatePair: Invalid index %s for string length %s.', index, str.length) : invariant(false) : void 0;
	  if (index + 1 === str.length) {
	    return false;
	  }
	  var first = str.charCodeAt(index);
	  var second = str.charCodeAt(index + 1);
	  return SURROGATE_HIGH_START <= first && first <= SURROGATE_HIGH_END && SURROGATE_LOW_START <= second && second <= SURROGATE_LOW_END;
	}

	/**
	 * @param {string} str  Non-empty string
	 * @return {boolean}    True if the input includes any surrogate code units
	 */
	function hasSurrogateUnit(str) {
	  return SURROGATE_UNITS_REGEX.test(str);
	}

	/**
	 * Return the length of the original Unicode character at given position in the
	 * String by looking into the UTF-16 code unit; that is equal to 1 for any
	 * non-surrogate characters in BMP ([U+0000..U+D7FF] and [U+E000, U+FFFF]); and
	 * returns 2 for the hi/low surrogates ([U+D800..U+DFFF]), which are in fact
	 * representing non-BMP characters ([U+10000..U+10FFFF]).
	 *
	 * Examples:
	 * - '\u0020' => 1
	 * - '\u3020' => 1
	 * - '\uD835' => 2
	 * - '\uD835\uDDEF' => 2
	 * - '\uDDEF' => 2
	 *
	 * @param {string} str  Non-empty string
	 * @param {number} pos  Position in the string to look for one code unit
	 * @return {number}      Number 1 or 2
	 */
	function getUTF16Length(str, pos) {
	  return 1 + isCodeUnitInSurrogateRange(str.charCodeAt(pos));
	}

	/**
	 * Fully Unicode-enabled replacement for String#length
	 *
	 * @param {string} str  Valid Unicode string
	 * @return {number}     The number of Unicode characters in the string
	 */
	function strlen(str) {
	  // Call the native functions if there's no surrogate char
	  if (!hasSurrogateUnit(str)) {
	    return str.length;
	  }

	  var len = 0;
	  for (var pos = 0; pos < str.length; pos += getUTF16Length(str, pos)) {
	    len++;
	  }
	  return len;
	}

	/**
	 * Fully Unicode-enabled replacement for String#substr()
	 *
	 * @param {string} str      Valid Unicode string
	 * @param {number} start    Location in Unicode sequence to begin extracting
	 * @param {?number} length  The number of Unicode characters to extract
	 *                          (default: to the end of the string)
	 * @return {string}         Extracted sub-string
	 */
	function substr(str, start, length) {
	  start = start || 0;
	  length = length === undefined ? Infinity : length || 0;

	  // Call the native functions if there's no surrogate char
	  if (!hasSurrogateUnit(str)) {
	    return str.substr(start, length);
	  }

	  // Obvious cases
	  var size = str.length;
	  if (size <= 0 || start > size || length <= 0) {
	    return '';
	  }

	  // Find the actual starting position
	  var posA = 0;
	  if (start > 0) {
	    for (; start > 0 && posA < size; start--) {
	      posA += getUTF16Length(str, posA);
	    }
	    if (posA >= size) {
	      return '';
	    }
	  } else if (start < 0) {
	    for (posA = size; start < 0 && 0 < posA; start++) {
	      posA -= getUTF16Length(str, posA - 1);
	    }
	    if (posA < 0) {
	      posA = 0;
	    }
	  }

	  // Find the actual ending position
	  var posB = size;
	  if (length < size) {
	    for (posB = posA; length > 0 && posB < size; length--) {
	      posB += getUTF16Length(str, posB);
	    }
	  }

	  return str.substring(posA, posB);
	}

	/**
	 * Fully Unicode-enabled replacement for String#substring()
	 *
	 * @param {string} str    Valid Unicode string
	 * @param {number} start  Location in Unicode sequence to begin extracting
	 * @param {?number} end   Location in Unicode sequence to end extracting
	 *                        (default: end of the string)
	 * @return {string}       Extracted sub-string
	 */
	function substring(str, start, end) {
	  start = start || 0;
	  end = end === undefined ? Infinity : end || 0;

	  if (start < 0) {
	    start = 0;
	  }
	  if (end < 0) {
	    end = 0;
	  }

	  var length = Math.abs(end - start);
	  start = start < end ? start : end;
	  return substr(str, start, length);
	}

	/**
	 * Get a list of Unicode code-points from a String
	 *
	 * @param {string} str        Valid Unicode string
	 * @return {array<number>}    A list of code-points in [0..0x10FFFF]
	 */
	function getCodePoints(str) {
	  var codePoints = [];
	  for (var pos = 0; pos < str.length; pos += getUTF16Length(str, pos)) {
	    codePoints.push(str.codePointAt(pos));
	  }
	  return codePoints;
	}

	var UnicodeUtils = {
	  getCodePoints: getCodePoints,
	  getUTF16Length: getUTF16Length,
	  hasSurrogateUnit: hasSurrogateUnit,
	  isCodeUnitInSurrogateRange: isCodeUnitInSurrogateRange,
	  isSurrogatePair: isSurrogatePair,
	  strlen: strlen,
	  substring: substring,
	  substr: substr
	};

	module.exports = UnicodeUtils;

/***/ },
/* 12 */
/***/ function(module, exports) {

	'use strict';
	/* eslint-disable no-unused-vars */
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	var propIsEnumerable = Object.prototype.propertyIsEnumerable;

	function toObject(val) {
		if (val === null || val === undefined) {
			throw new TypeError('Object.assign cannot be called with null or undefined');
		}

		return Object(val);
	}

	function shouldUseNative() {
		try {
			if (!Object.assign) {
				return false;
			}

			// Detect buggy property enumeration order in older V8 versions.

			// https://bugs.chromium.org/p/v8/issues/detail?id=4118
			var test1 = new String('abc');  // eslint-disable-line
			test1[5] = 'de';
			if (Object.getOwnPropertyNames(test1)[0] === '5') {
				return false;
			}

			// https://bugs.chromium.org/p/v8/issues/detail?id=3056
			var test2 = {};
			for (var i = 0; i < 10; i++) {
				test2['_' + String.fromCharCode(i)] = i;
			}
			var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
				return test2[n];
			});
			if (order2.join('') !== '0123456789') {
				return false;
			}

			// https://bugs.chromium.org/p/v8/issues/detail?id=3056
			var test3 = {};
			'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
				test3[letter] = letter;
			});
			if (Object.keys(Object.assign({}, test3)).join('') !==
					'abcdefghijklmnopqrst') {
				return false;
			}

			return true;
		} catch (e) {
			// We don't expect any of the above to throw, but better to be safe.
			return false;
		}
	}

	module.exports = shouldUseNative() ? Object.assign : function (target, source) {
		var from;
		var to = toObject(target);
		var symbols;

		for (var s = 1; s < arguments.length; s++) {
			from = Object(arguments[s]);

			for (var key in from) {
				if (hasOwnProperty.call(from, key)) {
					to[key] = from[key];
				}
			}

			if (Object.getOwnPropertySymbols) {
				symbols = Object.getOwnPropertySymbols(from);
				for (var i = 0; i < symbols.length; i++) {
					if (propIsEnumerable.call(from, symbols[i])) {
						to[symbols[i]] = from[symbols[i]];
					}
				}
			}
		}

		return to;
	};


/***/ },
/* 13 */
/***/ function(module, exports) {

	module.exports = React;

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule SelectionState
	 * @typechecks
	 * 
	 */

	'use strict';

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Immutable = __webpack_require__(2);

	var Record = Immutable.Record;


	var defaultRecord = {
	  anchorKey: '',
	  anchorOffset: 0,
	  focusKey: '',
	  focusOffset: 0,
	  isBackward: false,
	  hasFocus: false
	};

	var SelectionStateRecord = Record(defaultRecord);

	var SelectionState = function (_SelectionStateRecord) {
	  _inherits(SelectionState, _SelectionStateRecord);

	  function SelectionState() {
	    _classCallCheck(this, SelectionState);

	    return _possibleConstructorReturn(this, _SelectionStateRecord.apply(this, arguments));
	  }

	  SelectionState.prototype.serialize = function serialize() {
	    return 'Anchor: ' + this.getAnchorKey() + ':' + this.getAnchorOffset() + ', ' + 'Focus: ' + this.getFocusKey() + ':' + this.getFocusOffset() + ', ' + 'Is Backward: ' + String(this.getIsBackward()) + ', ' + 'Has Focus: ' + String(this.getHasFocus());
	  };

	  SelectionState.prototype.getAnchorKey = function getAnchorKey() {
	    return this.get('anchorKey');
	  };

	  SelectionState.prototype.getAnchorOffset = function getAnchorOffset() {
	    return this.get('anchorOffset');
	  };

	  SelectionState.prototype.getFocusKey = function getFocusKey() {
	    return this.get('focusKey');
	  };

	  SelectionState.prototype.getFocusOffset = function getFocusOffset() {
	    return this.get('focusOffset');
	  };

	  SelectionState.prototype.getIsBackward = function getIsBackward() {
	    return this.get('isBackward');
	  };

	  SelectionState.prototype.getHasFocus = function getHasFocus() {
	    return this.get('hasFocus');
	  };

	  /**
	   * Return whether the specified range overlaps with an edge of the
	   * SelectionState.
	   */


	  SelectionState.prototype.hasEdgeWithin = function hasEdgeWithin(blockKey, start, end) {
	    var anchorKey = this.getAnchorKey();
	    var focusKey = this.getFocusKey();

	    if (anchorKey === focusKey && anchorKey === blockKey) {
	      var selectionStart = this.getStartOffset();
	      var selectionEnd = this.getEndOffset();
	      return start <= selectionEnd && selectionStart <= end;
	    }

	    if (blockKey !== anchorKey && blockKey !== focusKey) {
	      return false;
	    }

	    var offsetToCheck = blockKey === anchorKey ? this.getAnchorOffset() : this.getFocusOffset();

	    return start <= offsetToCheck && end >= offsetToCheck;
	  };

	  SelectionState.prototype.isCollapsed = function isCollapsed() {
	    return this.getAnchorKey() === this.getFocusKey() && this.getAnchorOffset() === this.getFocusOffset();
	  };

	  SelectionState.prototype.getStartKey = function getStartKey() {
	    return this.getIsBackward() ? this.getFocusKey() : this.getAnchorKey();
	  };

	  SelectionState.prototype.getStartOffset = function getStartOffset() {
	    return this.getIsBackward() ? this.getFocusOffset() : this.getAnchorOffset();
	  };

	  SelectionState.prototype.getEndKey = function getEndKey() {
	    return this.getIsBackward() ? this.getAnchorKey() : this.getFocusKey();
	  };

	  SelectionState.prototype.getEndOffset = function getEndOffset() {
	    return this.getIsBackward() ? this.getAnchorOffset() : this.getFocusOffset();
	  };

	  SelectionState.createEmpty = function createEmpty(key) {
	    return new SelectionState({
	      anchorKey: key,
	      anchorOffset: 0,
	      focusKey: key,
	      focusOffset: 0,
	      isBackward: false,
	      hasFocus: false
	    });
	  };

	  return SelectionState;
	}(SelectionStateRecord);

	module.exports = SelectionState;

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule BlockMapBuilder
	 * 
	 */

	'use strict';

	var Immutable = __webpack_require__(2);

	var OrderedMap = Immutable.OrderedMap;


	var BlockMapBuilder = {
	  createFromArray: function createFromArray(blocks) {
	    return OrderedMap(blocks.map(function (block) {
	      return [block.getKey(), block];
	    }));
	  }
	};

	module.exports = BlockMapBuilder;

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule removeTextWithStrategy
	 * 
	 */

	'use strict';

	var DraftModifier = __webpack_require__(4);

	/**
	 * For a collapsed selection state, remove text based on the specified strategy.
	 * If the selection state is not collapsed, remove the entire selected range.
	 */
	function removeTextWithStrategy(editorState, strategy, direction) {
	  var selection = editorState.getSelection();
	  var content = editorState.getCurrentContent();
	  var target = selection;
	  if (selection.isCollapsed()) {
	    if (direction === 'forward') {
	      if (editorState.isSelectionAtEndOfContent()) {
	        return content;
	      }
	    } else if (editorState.isSelectionAtStartOfContent()) {
	      return content;
	    }

	    target = strategy(editorState);
	    if (target === selection) {
	      return content;
	    }
	  }
	  return DraftModifier.removeRange(content, target, direction);
	}

	module.exports = removeTextWithStrategy;

/***/ },
/* 17 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 */

	/**
	 * This function is used to mark string literals representing CSS class names
	 * so that they can be transformed statically. This allows for modularization
	 * and minification of CSS class names.
	 *
	 * In static_upstream, this function is actually implemented, but it should
	 * eventually be replaced with something more descriptive, and the transform
	 * that is used in the main stack should be ported for use elsewhere.
	 *
	 * @param string|object className to modularize, or an object of key/values.
	 *                      In the object case, the values are conditions that
	 *                      determine if the className keys should be included.
	 * @param [string ...]  Variable list of classNames in the string case.
	 * @return string       Renderable space-separated CSS className.
	 */
	function cx(classNames) {
	  if (typeof classNames == 'object') {
	    return Object.keys(classNames).filter(function (className) {
	      return classNames[className];
	    }).map(replace).join(' ');
	  }
	  return Array.prototype.map.call(arguments, replace).join(' ');
	}

	function replace(str) {
	  return str.replace(/\//g, '-');
	}

	module.exports = cx;

/***/ },
/* 18 */
/***/ function(module, exports) {

	module.exports = ReactDOM;

/***/ },
/* 19 */
/***/ function(module, exports) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule DraftOffsetKey
	 * 
	 */

	'use strict';

	var KEY_DELIMITER = '-';

	var DraftOffsetKey = {
	  encode: function encode(blockKey, decoratorKey, leafKey) {
	    return blockKey + KEY_DELIMITER + decoratorKey + KEY_DELIMITER + leafKey;
	  },

	  decode: function decode(offsetKey) {
	    var _offsetKey$split = offsetKey.split(KEY_DELIMITER);

	    var blockKey = _offsetKey$split[0];
	    var decoratorKey = _offsetKey$split[1];
	    var leafKey = _offsetKey$split[2];

	    return {
	      blockKey: blockKey,
	      decoratorKey: parseInt(decoratorKey, 10),
	      leafKey: parseInt(leafKey, 10)
	    };
	  }
	};

	module.exports = DraftOffsetKey;

/***/ },
/* 20 */
/***/ function(module, exports) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule findRangesImmutable
	 * 
	 */

	'use strict';

	/**
	 * Search through an array to find contiguous stretches of elements that
	 * match a specified filter function.
	 *
	 * When ranges are found, execute a specified `found` function to supply
	 * the values to the caller.
	 */
	function findRangesImmutable(haystack, areEqualFn, filterFn, foundFn) {
	  if (!haystack.size) {
	    return;
	  }

	  var cursor = 0;

	  haystack.reduce(function (value, nextValue, nextIndex) {
	    /* $FlowFixMe(>=0.28.0): `value` could be undefined! */
	    if (!areEqualFn(value, nextValue)) {
	      /* $FlowFixMe(>=0.28.0): `value` could be undefined! */
	      if (filterFn(value)) {
	        foundFn(cursor, nextIndex);
	      }
	      cursor = nextIndex;
	    }
	    return nextValue;
	  });

	  filterFn(haystack.last()) && foundFn(cursor, haystack.count());
	}

	module.exports = findRangesImmutable;

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule getContentStateFragment
	 * @typechecks
	 * 
	 */

	'use strict';

	var generateRandomKey = __webpack_require__(7);
	var removeEntitiesAtEdges = __webpack_require__(52);

	function getContentStateFragment(contentState, selectionState) {
	  var startKey = selectionState.getStartKey();
	  var startOffset = selectionState.getStartOffset();
	  var endKey = selectionState.getEndKey();
	  var endOffset = selectionState.getEndOffset();

	  // Edge entities should be stripped to ensure that we don't preserve
	  // invalid partial entities when the fragment is reused. We do, however,
	  // preserve entities that are entirely within the selection range.
	  var contentWithoutEdgeEntities = removeEntitiesAtEdges(contentState, selectionState);

	  var blockMap = contentWithoutEdgeEntities.getBlockMap();
	  var blockKeys = blockMap.keySeq();
	  var startIndex = blockKeys.indexOf(startKey);
	  var endIndex = blockKeys.indexOf(endKey) + 1;

	  var slice = blockMap.slice(startIndex, endIndex).map(function (block, blockKey) {
	    var newKey = generateRandomKey();

	    var text = block.getText();
	    var chars = block.getCharacterList();

	    if (startKey === endKey) {
	      return block.merge({
	        key: newKey,
	        text: text.slice(startOffset, endOffset),
	        characterList: chars.slice(startOffset, endOffset)
	      });
	    }

	    if (blockKey === startKey) {
	      return block.merge({
	        key: newKey,
	        text: text.slice(startOffset),
	        characterList: chars.slice(startOffset)
	      });
	    }

	    if (blockKey === endKey) {
	      return block.merge({
	        key: newKey,
	        text: text.slice(0, endOffset),
	        characterList: chars.slice(0, endOffset)
	      });
	    }

	    return block.set('key', newKey);
	  });

	  return slice.toOrderedMap();
	}

	module.exports = getContentStateFragment;

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule ContentState
	 * @typechecks
	 * 
	 */

	'use strict';

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var BlockMapBuilder = __webpack_require__(15);
	var CharacterMetadata = __webpack_require__(6);
	var ContentBlock = __webpack_require__(10);
	var Immutable = __webpack_require__(2);
	var SelectionState = __webpack_require__(14);

	var generateRandomKey = __webpack_require__(7);
	var sanitizeDraftText = __webpack_require__(28);

	var List = Immutable.List;
	var Record = Immutable.Record;
	var Repeat = Immutable.Repeat;


	var defaultRecord = {
	  blockMap: null,
	  selectionBefore: null,
	  selectionAfter: null
	};

	var ContentStateRecord = Record(defaultRecord);

	var ContentState = function (_ContentStateRecord) {
	  _inherits(ContentState, _ContentStateRecord);

	  function ContentState() {
	    _classCallCheck(this, ContentState);

	    return _possibleConstructorReturn(this, _ContentStateRecord.apply(this, arguments));
	  }

	  ContentState.prototype.getBlockMap = function getBlockMap() {
	    return this.get('blockMap');
	  };

	  ContentState.prototype.getSelectionBefore = function getSelectionBefore() {
	    return this.get('selectionBefore');
	  };

	  ContentState.prototype.getSelectionAfter = function getSelectionAfter() {
	    return this.get('selectionAfter');
	  };

	  ContentState.prototype.getBlockForKey = function getBlockForKey(key) {
	    var block = this.getBlockMap().get(key);
	    return block;
	  };

	  ContentState.prototype.getKeyBefore = function getKeyBefore(key) {
	    return this.getBlockMap().reverse().keySeq().skipUntil(function (v) {
	      return v === key;
	    }).skip(1).first();
	  };

	  ContentState.prototype.getKeyAfter = function getKeyAfter(key) {
	    return this.getBlockMap().keySeq().skipUntil(function (v) {
	      return v === key;
	    }).skip(1).first();
	  };

	  ContentState.prototype.getBlockAfter = function getBlockAfter(key) {
	    return this.getBlockMap().skipUntil(function (_, k) {
	      return k === key;
	    }).skip(1).first();
	  };

	  ContentState.prototype.getBlockBefore = function getBlockBefore(key) {
	    return this.getBlockMap().reverse().skipUntil(function (_, k) {
	      return k === key;
	    }).skip(1).first();
	  };

	  ContentState.prototype.getBlocksAsArray = function getBlocksAsArray() {
	    return this.getBlockMap().toArray();
	  };

	  ContentState.prototype.getFirstBlock = function getFirstBlock() {
	    return this.getBlockMap().first();
	  };

	  ContentState.prototype.getLastBlock = function getLastBlock() {
	    return this.getBlockMap().last();
	  };

	  ContentState.prototype.getPlainText = function getPlainText(delimiter) {
	    return this.getBlockMap().map(function (block) {
	      return block ? block.getText() : '';
	    }).join(delimiter || '\n');
	  };

	  ContentState.prototype.hasText = function hasText() {
	    var blockMap = this.getBlockMap();
	    return blockMap.size > 1 || blockMap.first().getLength() > 0;
	  };

	  ContentState.createFromBlockArray = function createFromBlockArray(blocks) {
	    var blockMap = BlockMapBuilder.createFromArray(blocks);
	    var selectionState = SelectionState.createEmpty(blockMap.first().getKey());
	    return new ContentState({
	      blockMap: blockMap,
	      selectionBefore: selectionState,
	      selectionAfter: selectionState
	    });
	  };

	  ContentState.createFromText = function createFromText(text) {
	    var delimiter = arguments.length <= 1 || arguments[1] === undefined ? /\r\n?|\n/g : arguments[1];

	    var strings = text.split(delimiter);
	    var blocks = strings.map(function (block) {
	      block = sanitizeDraftText(block);
	      return new ContentBlock({
	        key: generateRandomKey(),
	        text: block,
	        type: 'unstyled',
	        characterList: List(Repeat(CharacterMetadata.EMPTY, block.length))
	      });
	    });
	    return ContentState.createFromBlockArray(blocks);
	  };

	  return ContentState;
	}(ContentStateRecord);

	module.exports = ContentState;

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule DefaultDraftBlockRenderMap
	 * 
	 */

	'use strict';

	var _require = __webpack_require__(2);

	var Map = _require.Map;

	var React = __webpack_require__(13);

	var cx = __webpack_require__(17);

	var UL_WRAP = React.createElement('ul', { className: cx('public/DraftStyleDefault/ul') });
	var OL_WRAP = React.createElement('ol', { className: cx('public/DraftStyleDefault/ol') });
	var PRE_WRAP = React.createElement('pre', { className: cx('public/DraftStyleDefault/pre') });

	module.exports = Map({
	  'header-one': {
	    element: 'h1'
	  },
	  'header-two': {
	    element: 'h2'
	  },
	  'header-three': {
	    element: 'h3'
	  },
	  'header-four': {
	    element: 'h4'
	  },
	  'header-five': {
	    element: 'h5'
	  },
	  'header-six': {
	    element: 'h6'
	  },
	  'unordered-list-item': {
	    element: 'li',
	    wrapper: UL_WRAP
	  },
	  'ordered-list-item': {
	    element: 'li',
	    wrapper: OL_WRAP
	  },
	  'blockquote': {
	    element: 'blockquote'
	  },
	  'atomic': {
	    element: 'figure'
	  },
	  'code-block': {
	    element: 'pre',
	    wrapper: PRE_WRAP
	  },
	  'unstyled': {
	    element: 'div'
	  }
	});

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule KeyBindingUtil
	 * @typechecks
	 * 
	 */

	'use strict';

	var UserAgent = __webpack_require__(8);

	var isOSX = UserAgent.isPlatform('Mac OS X');

	var KeyBindingUtil = {
	  /**
	   * Check whether the ctrlKey modifier is *not* being used in conjunction with
	   * the altKey modifier. If they are combined, the result is an `altGraph`
	   * key modifier, which should not be handled by this set of key bindings.
	   */
	  isCtrlKeyCommand: function isCtrlKeyCommand(e) {
	    return !!e.ctrlKey && !e.altKey;
	  },

	  isOptionKeyCommand: function isOptionKeyCommand(e) {
	    return isOSX && e.altKey;
	  },

	  hasCommandModifier: function hasCommandModifier(e) {
	    return isOSX ? !!e.metaKey && !e.altKey : KeyBindingUtil.isCtrlKeyCommand(e);
	  }
	};

	module.exports = KeyBindingUtil;

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule findAncestorOffsetKey
	 * @typechecks
	 * 
	 */

	'use strict';

	var getSelectionOffsetKeyForNode = __webpack_require__(46);

	/**
	 * Get the key from the node's nearest offset-aware ancestor.
	 */
	function findAncestorOffsetKey(node) {
	  var searchNode = node;
	  while (searchNode && searchNode !== document.documentElement) {
	    var key = getSelectionOffsetKeyForNode(searchNode);
	    if (key != null) {
	      return key;
	    }
	    searchNode = searchNode.parentNode;
	  }
	  return null;
	}

	module.exports = findAncestorOffsetKey;

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule getEntityKeyForSelection
	 * @typechecks
	 * 
	 */

	'use strict';

	var DraftEntity = __webpack_require__(9);

	/**
	 * Return the entity key that should be used when inserting text for the
	 * specified target selection, only if the entity is `MUTABLE`. `IMMUTABLE`
	 * and `SEGMENTED` entities should not be used for insertion behavior.
	 */
	function getEntityKeyForSelection(contentState, targetSelection) {
	  var entityKey;

	  if (targetSelection.isCollapsed()) {
	    var key = targetSelection.getAnchorKey();
	    var offset = targetSelection.getAnchorOffset();
	    if (offset > 0) {
	      entityKey = contentState.getBlockForKey(key).getEntityAt(offset - 1);
	      return filterKey(entityKey);
	    }
	    return null;
	  }

	  var startKey = targetSelection.getStartKey();
	  var startOffset = targetSelection.getStartOffset();
	  var startBlock = contentState.getBlockForKey(startKey);

	  entityKey = startOffset === startBlock.getLength() ? null : startBlock.getEntityAt(startOffset);

	  return filterKey(entityKey);
	}

	/**
	 * Determine whether an entity key corresponds to a `MUTABLE` entity. If so,
	 * return it. If not, return null.
	 */
	function filterKey(entityKey) {
	  if (entityKey) {
	    var entity = DraftEntity.get(entityKey);
	    return entity.getMutability() === 'MUTABLE' ? entityKey : null;
	  }
	  return null;
	}

	module.exports = getEntityKeyForSelection;

/***/ },
/* 27 */
/***/ function(module, exports) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule moveSelectionBackward
	 * 
	 */

	'use strict';

	/**
	 * Given a collapsed selection, move the focus `maxDistance` backward within
	 * the selected block. If the selection will go beyond the start of the block,
	 * move focus to the end of the previous block, but no further.
	 *
	 * This function is not Unicode-aware, so surrogate pairs will be treated
	 * as having length 2.
	 */
	function moveSelectionBackward(editorState, maxDistance) {
	  var selection = editorState.getSelection();
	  var content = editorState.getCurrentContent();
	  var key = selection.getStartKey();
	  var offset = selection.getStartOffset();

	  var focusKey = key;
	  var focusOffset = 0;

	  if (maxDistance > offset) {
	    var keyBefore = content.getKeyBefore(key);
	    if (keyBefore == null) {
	      focusKey = key;
	    } else {
	      focusKey = keyBefore;
	      var blockBefore = content.getBlockForKey(keyBefore);
	      focusOffset = blockBefore.getText().length;
	    }
	  } else {
	    focusOffset = offset - maxDistance;
	  }

	  return selection.merge({
	    focusKey: focusKey,
	    focusOffset: focusOffset,
	    isBackward: true
	  });
	}

	module.exports = moveSelectionBackward;

/***/ },
/* 28 */
/***/ function(module, exports) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule sanitizeDraftText
	 * 
	 */

	'use strict';

	var REGEX_BLOCK_DELIMITER = new RegExp('\r', 'g');

	function sanitizeDraftText(input) {
	  return input.replace(REGEX_BLOCK_DELIMITER, '');
	}

	module.exports = sanitizeDraftText;

/***/ },
/* 29 */
/***/ function(module, exports) {

	"use strict";

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 */

	module.exports = {
	  BACKSPACE: 8,
	  TAB: 9,
	  RETURN: 13,
	  ALT: 18,
	  ESC: 27,
	  SPACE: 32,
	  PAGE_UP: 33,
	  PAGE_DOWN: 34,
	  END: 35,
	  HOME: 36,
	  LEFT: 37,
	  UP: 38,
	  RIGHT: 39,
	  DOWN: 40,
	  DELETE: 46,
	  COMMA: 188,
	  PERIOD: 190,
	  A: 65,
	  Z: 90,
	  ZERO: 48,
	  NUMPAD_0: 96,
	  NUMPAD_9: 105
	};

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @typechecks
	 */

	var getStyleProperty = __webpack_require__(130);

	/**
	 * @param {DOMNode} element [description]
	 * @param {string} name Overflow style property name.
	 * @return {boolean} True if the supplied ndoe is scrollable.
	 */
	function _isNodeScrollable(element, name) {
	  var overflow = Style.get(element, name);
	  return overflow === 'auto' || overflow === 'scroll';
	}

	/**
	 * Utilities for querying and mutating style properties.
	 */
	var Style = {
	  /**
	   * Gets the style property for the supplied node. This will return either the
	   * computed style, if available, or the declared style.
	   *
	   * @param {DOMNode} node
	   * @param {string} name Style property name.
	   * @return {?string} Style property value.
	   */
	  get: getStyleProperty,

	  /**
	   * Determines the nearest ancestor of a node that is scrollable.
	   *
	   * NOTE: This can be expensive if used repeatedly or on a node nested deeply.
	   *
	   * @param {?DOMNode} node Node from which to start searching.
	   * @return {?DOMWindow|DOMElement} Scroll parent of the supplied node.
	   */
	  getScrollParent: function getScrollParent(node) {
	    if (!node) {
	      return null;
	    }
	    while (node && node !== document.body) {
	      if (_isNodeScrollable(node, 'overflow') || _isNodeScrollable(node, 'overflowY') || _isNodeScrollable(node, 'overflowX')) {
	        return node;
	      }
	      node = node.parentNode;
	    }
	    return window;
	  }

	};

	module.exports = Style;

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @typechecks
	 * 
	 */

	/**
	 * Constants to represent text directionality
	 *
	 * Also defines a *global* direciton, to be used in bidi algorithms as a
	 * default fallback direciton, when no better direction is found or provided.
	 *
	 * NOTE: Use `setGlobalDir()`, or update `initGlobalDir()`, to set the initial
	 *       global direction value based on the application.
	 *
	 * Part of the implementation of Unicode Bidirectional Algorithm (UBA)
	 * Unicode Standard Annex #9 (UAX9)
	 * http://www.unicode.org/reports/tr9/
	 */

	'use strict';

	var invariant = __webpack_require__(3);

	var NEUTRAL = 'NEUTRAL'; // No strong direction
	var LTR = 'LTR'; // Left-to-Right direction
	var RTL = 'RTL'; // Right-to-Left direction

	var globalDir = null;

	// == Helpers ==

	/**
	 * Check if a directionality value is a Strong one
	 */
	function isStrong(dir) {
	  return dir === LTR || dir === RTL;
	}

	/**
	 * Get string value to be used for `dir` HTML attribute or `direction` CSS
	 * property.
	 */
	function getHTMLDir(dir) {
	  !isStrong(dir) ?  true ? invariant(false, '`dir` must be a strong direction to be converted to HTML Direction') : invariant(false) : void 0;
	  return dir === LTR ? 'ltr' : 'rtl';
	}

	/**
	 * Get string value to be used for `dir` HTML attribute or `direction` CSS
	 * property, but returns null if `dir` has same value as `otherDir`.
	 * `null`.
	 */
	function getHTMLDirIfDifferent(dir, otherDir) {
	  !isStrong(dir) ?  true ? invariant(false, '`dir` must be a strong direction to be converted to HTML Direction') : invariant(false) : void 0;
	  !isStrong(otherDir) ?  true ? invariant(false, '`otherDir` must be a strong direction to be converted to HTML Direction') : invariant(false) : void 0;
	  return dir === otherDir ? null : getHTMLDir(dir);
	}

	// == Global Direction ==

	/**
	 * Set the global direction.
	 */
	function setGlobalDir(dir) {
	  globalDir = dir;
	}

	/**
	 * Initialize the global direction
	 */
	function initGlobalDir() {
	  setGlobalDir(LTR);
	}

	/**
	 * Get the global direction
	 */
	function getGlobalDir() {
	  if (!globalDir) {
	    this.initGlobalDir();
	  }
	  !globalDir ?  true ? invariant(false, 'Global direction not set.') : invariant(false) : void 0;
	  return globalDir;
	}

	var UnicodeBidiDirection = {
	  // Values
	  NEUTRAL: NEUTRAL,
	  LTR: LTR,
	  RTL: RTL,
	  // Helpers
	  isStrong: isStrong,
	  getHTMLDir: getHTMLDir,
	  getHTMLDirIfDifferent: getHTMLDirIfDifferent,
	  // Global Direction
	  setGlobalDir: setGlobalDir,
	  initGlobalDir: initGlobalDir,
	  getGlobalDir: getGlobalDir
	};

	module.exports = UnicodeBidiDirection;

/***/ },
/* 32 */
/***/ function(module, exports) {

	"use strict";

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */

	function makeEmptyFunction(arg) {
	  return function () {
	    return arg;
	  };
	}

	/**
	 * This function accepts and discards inputs; it has no side effects. This is
	 * primarily useful idiomatically for overridable function endpoints which
	 * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
	 */
	var emptyFunction = function emptyFunction() {};

	emptyFunction.thatReturns = makeEmptyFunction;
	emptyFunction.thatReturnsFalse = makeEmptyFunction(false);
	emptyFunction.thatReturnsTrue = makeEmptyFunction(true);
	emptyFunction.thatReturnsNull = makeEmptyFunction(null);
	emptyFunction.thatReturnsThis = function () {
	  return this;
	};
	emptyFunction.thatReturnsArgument = function (arg) {
	  return arg;
	};

	module.exports = emptyFunction;

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @typechecks
	 */

	'use strict';

	var getDocumentScrollElement = __webpack_require__(127);
	var getUnboundedScrollPosition = __webpack_require__(131);

	/**
	 * Gets the scroll position of the supplied element or window.
	 *
	 * The return values are bounded. This means that if the scroll position is
	 * negative or exceeds the element boundaries (which is possible using inertial
	 * scrolling), you will get zero or the maximum scroll position, respectively.
	 *
	 * If you need the unbound scroll position, use `getUnboundedScrollPosition`.
	 *
	 * @param {DOMWindow|DOMElement} scrollable
	 * @return {object} Map with `x` and `y` keys.
	 */
	function getScrollPosition(scrollable) {
	  var documentScrollElement = getDocumentScrollElement();
	  if (scrollable === window) {
	    scrollable = documentScrollElement;
	  }
	  var scrollPosition = getUnboundedScrollPosition(scrollable);

	  var viewport = scrollable === documentScrollElement ? document.documentElement : scrollable;

	  var xMax = scrollable.scrollWidth - viewport.clientWidth;
	  var yMax = scrollable.scrollHeight - viewport.clientHeight;

	  scrollPosition.x = Math.max(0, Math.min(scrollPosition.x, xMax));
	  scrollPosition.y = Math.max(0, Math.min(scrollPosition.y, yMax));

	  return scrollPosition;
	}

	module.exports = getScrollPosition;

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule BlockTree
	 * 
	 */

	'use strict';

	var Immutable = __webpack_require__(2);

	var emptyFunction = __webpack_require__(32);
	var findRangesImmutable = __webpack_require__(20);

	var List = Immutable.List;
	var Repeat = Immutable.Repeat;
	var Record = Immutable.Record;


	var returnTrue = emptyFunction.thatReturnsTrue;

	var FINGERPRINT_DELIMITER = '-';

	var defaultLeafRange = {
	  start: null,
	  end: null
	};

	var LeafRange = Record(defaultLeafRange);

	var defaultDecoratorRange = {
	  start: null,
	  end: null,
	  decoratorKey: null,
	  leaves: null
	};

	var DecoratorRange = Record(defaultDecoratorRange);

	var BlockTree = {
	  /**
	   * Generate a block tree for a given ContentBlock/decorator pair.
	   */
	  generate: function generate(block, decorator) {
	    var textLength = block.getLength();
	    if (!textLength) {
	      return List.of(new DecoratorRange({
	        start: 0,
	        end: 0,
	        decoratorKey: null,
	        leaves: List.of(new LeafRange({ start: 0, end: 0 }))
	      }));
	    }

	    var leafSets = [];
	    var decorations = decorator ? decorator.getDecorations(block) : List(Repeat(null, textLength));

	    var chars = block.getCharacterList();

	    findRangesImmutable(decorations, areEqual, returnTrue, function (start, end) {
	      leafSets.push(new DecoratorRange({
	        start: start,
	        end: end,
	        decoratorKey: decorations.get(start),
	        leaves: generateLeaves(chars.slice(start, end).toList(), start)
	      }));
	    });

	    return List(leafSets);
	  },

	  /**
	   * Create a string representation of the given tree map. This allows us
	   * to rapidly determine whether a tree has undergone a significant
	   * structural change.
	   */
	  getFingerprint: function getFingerprint(tree) {
	    return tree.map(function (leafSet) {
	      var decoratorKey = leafSet.get('decoratorKey');
	      var fingerprintString = decoratorKey !== null ? decoratorKey + '.' + (leafSet.get('end') - leafSet.get('start')) : '';
	      return '' + fingerprintString + '.' + leafSet.get('leaves').size;
	    }).join(FINGERPRINT_DELIMITER);
	  }
	};

	/**
	 * Generate LeafRange records for a given character list.
	 */
	function generateLeaves(characters, offset) {
	  var leaves = [];
	  var inlineStyles = characters.map(function (c) {
	    return c.getStyle();
	  }).toList();
	  findRangesImmutable(inlineStyles, areEqual, returnTrue, function (start, end) {
	    leaves.push(new LeafRange({
	      start: start + offset,
	      end: end + offset
	    }));
	  });
	  return List(leaves);
	}

	function areEqual(a, b) {
	  return a === b;
	}

	module.exports = BlockTree;

/***/ },
/* 35 */
/***/ function(module, exports) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule DefaultDraftInlineStyle
	 * 
	 */

	'use strict';

	module.exports = {
	  BOLD: {
	    fontWeight: 'bold'
	  },

	  CODE: {
	    fontFamily: 'monospace',
	    wordWrap: 'break-word'
	  },

	  ITALIC: {
	    fontStyle: 'italic'
	  },

	  STRIKETHROUGH: {
	    textDecoration: 'line-through'
	  },

	  UNDERLINE: {
	    textDecoration: 'underline'
	  }
	};

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule DraftEditorBlock.react
	 * @typechecks
	 * 
	 */

	'use strict';

	var _assign = __webpack_require__(12);

	var _extends = _assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var ContentBlock = __webpack_require__(10);
	var DraftEditorLeaf = __webpack_require__(66);
	var DraftOffsetKey = __webpack_require__(19);
	var React = __webpack_require__(13);
	var ReactDOM = __webpack_require__(18);
	var Scroll = __webpack_require__(54);
	var SelectionState = __webpack_require__(14);
	var Style = __webpack_require__(30);
	var UnicodeBidi = __webpack_require__(55);
	var UnicodeBidiDirection = __webpack_require__(31);

	var cx = __webpack_require__(17);
	var getElementPosition = __webpack_require__(128);
	var getScrollPosition = __webpack_require__(33);
	var getViewportDimensions = __webpack_require__(132);
	var nullthrows = __webpack_require__(5);

	var SCROLL_BUFFER = 10;

	/**
	 * The default block renderer for a `DraftEditor` component.
	 *
	 * A `DraftEditorBlock` is able to render a given `ContentBlock` to its
	 * appropriate decorator and inline style components.
	 */
	var DraftEditorBlock = function (_React$Component) {
	  _inherits(DraftEditorBlock, _React$Component);

	  function DraftEditorBlock() {
	    _classCallCheck(this, DraftEditorBlock);

	    return _possibleConstructorReturn(this, _React$Component.apply(this, arguments));
	  }

	  DraftEditorBlock.prototype.shouldComponentUpdate = function shouldComponentUpdate(nextProps) {
	    return this.props.block !== nextProps.block || this.props.tree !== nextProps.tree || this.props.direction !== nextProps.direction || isBlockOnSelectionEdge(nextProps.selection, nextProps.block.getKey()) && nextProps.forceSelection;
	  };

	  /**
	   * When a block is mounted and overlaps the selection state, we need to make
	   * sure that the cursor is visible to match native behavior. This may not
	   * be the case if the user has pressed `RETURN` or pasted some content, since
	   * programatically creating these new blocks and setting the DOM selection
	   * will miss out on the browser natively scrolling to that position.
	   *
	   * To replicate native behavior, if the block overlaps the selection state
	   * on mount, force the scroll position. Check the scroll state of the scroll
	   * parent, and adjust it to align the entire block to the bottom of the
	   * scroll parent.
	   */


	  DraftEditorBlock.prototype.componentDidMount = function componentDidMount() {
	    var selection = this.props.selection;
	    var endKey = selection.getEndKey();
	    if (!selection.getHasFocus() || endKey !== this.props.block.getKey()) {
	      return;
	    }

	    var blockNode = ReactDOM.findDOMNode(this);
	    var scrollParent = Style.getScrollParent(blockNode);
	    var scrollPosition = getScrollPosition(scrollParent);
	    var scrollDelta;

	    if (scrollParent === window) {
	      var nodePosition = getElementPosition(blockNode);
	      var nodeBottom = nodePosition.y + nodePosition.height;
	      var viewportHeight = getViewportDimensions().height;
	      scrollDelta = nodeBottom - viewportHeight;
	      if (scrollDelta > 0) {
	        window.scrollTo(scrollPosition.x, scrollPosition.y + scrollDelta + SCROLL_BUFFER);
	      }
	    } else {
	      var blockBottom = blockNode.offsetHeight + blockNode.offsetTop;
	      var scrollBottom = scrollParent.offsetHeight + scrollPosition.y;
	      scrollDelta = blockBottom - scrollBottom;
	      if (scrollDelta > 0) {
	        Scroll.setTop(scrollParent, Scroll.getTop(scrollParent) + scrollDelta + SCROLL_BUFFER);
	      }
	    }
	  };

	  DraftEditorBlock.prototype._renderChildren = function _renderChildren() {
	    var _this2 = this;

	    var block = this.props.block;
	    var blockKey = block.getKey();
	    var text = block.getText();
	    var lastLeafSet = this.props.tree.size - 1;
	    var hasSelection = isBlockOnSelectionEdge(this.props.selection, blockKey);

	    return this.props.tree.map(function (leafSet, ii) {
	      var leavesForLeafSet = leafSet.get('leaves');
	      var lastLeaf = leavesForLeafSet.size - 1;
	      var leaves = leavesForLeafSet.map(function (leaf, jj) {
	        var offsetKey = DraftOffsetKey.encode(blockKey, ii, jj);
	        var start = leaf.get('start');
	        var end = leaf.get('end');
	        return React.createElement(DraftEditorLeaf, {
	          key: offsetKey,
	          offsetKey: offsetKey,
	          blockKey: blockKey,
	          start: start,
	          selection: hasSelection ? _this2.props.selection : undefined,
	          forceSelection: _this2.props.forceSelection,
	          text: text.slice(start, end),
	          styleSet: block.getInlineStyleAt(start),
	          customStyleMap: _this2.props.customStyleMap,
	          customStyleFn: _this2.props.customStyleFn,
	          isLast: ii === lastLeafSet && jj === lastLeaf
	        });
	      }).toArray();

	      var decoratorKey = leafSet.get('decoratorKey');
	      if (decoratorKey == null) {
	        return leaves;
	      }

	      if (!_this2.props.decorator) {
	        return leaves;
	      }

	      var decorator = nullthrows(_this2.props.decorator);

	      var DecoratorComponent = decorator.getComponentForKey(decoratorKey);
	      if (!DecoratorComponent) {
	        return leaves;
	      }

	      var decoratorProps = decorator.getPropsForKey(decoratorKey);
	      var decoratorOffsetKey = DraftOffsetKey.encode(blockKey, ii, 0);
	      var decoratedText = text.slice(leavesForLeafSet.first().get('start'), leavesForLeafSet.last().get('end'));

	      // Resetting dir to the same value on a child node makes Chrome/Firefox
	      // confused on cursor movement. See http://jsfiddle.net/d157kLck/3/
	      var dir = UnicodeBidiDirection.getHTMLDirIfDifferent(UnicodeBidi.getDirection(decoratedText), _this2.props.direction);

	      return React.createElement(
	        DecoratorComponent,
	        _extends({}, decoratorProps, {
	          decoratedText: decoratedText,
	          dir: dir,
	          key: decoratorOffsetKey,
	          entityKey: block.getEntityAt(leafSet.get('start')),
	          offsetKey: decoratorOffsetKey }),
	        leaves
	      );
	    }).toArray();
	  };

	  DraftEditorBlock.prototype.render = function render() {
	    var _props = this.props;
	    var direction = _props.direction;
	    var offsetKey = _props.offsetKey;

	    var className = cx({
	      'public/DraftStyleDefault/block': true,
	      'public/DraftStyleDefault/ltr': direction === 'LTR',
	      'public/DraftStyleDefault/rtl': direction === 'RTL'
	    });

	    return React.createElement(
	      'div',
	      { 'data-offset-key': offsetKey, className: className },
	      this._renderChildren()
	    );
	  };

	  return DraftEditorBlock;
	}(React.Component);

	/**
	 * Return whether a block overlaps with either edge of the `SelectionState`.
	 */


	function isBlockOnSelectionEdge(selection, key) {
	  return selection.getAnchorKey() === key || selection.getFocusKey() === key;
	}

	module.exports = DraftEditorBlock;

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule DraftEntityInstance
	 * 
	 */

	'use strict';

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Immutable = __webpack_require__(2);

	var Record = Immutable.Record;


	var DraftEntityInstanceRecord = Record({
	  type: 'TOKEN',
	  mutability: 'IMMUTABLE',
	  data: Object
	});

	/**
	 * An instance of a document entity, consisting of a `type` and relevant
	 * `data`, metadata about the entity.
	 *
	 * For instance, a "link" entity might provide a URI, and a "mention"
	 * entity might provide the mentioned user's ID. These pieces of data
	 * may be used when rendering the entity as part of a ContentBlock DOM
	 * representation. For a link, the data would be used as an href for
	 * the rendered anchor. For a mention, the ID could be used to retrieve
	 * a hovercard.
	 */

	var DraftEntityInstance = function (_DraftEntityInstanceR) {
	  _inherits(DraftEntityInstance, _DraftEntityInstanceR);

	  function DraftEntityInstance() {
	    _classCallCheck(this, DraftEntityInstance);

	    return _possibleConstructorReturn(this, _DraftEntityInstanceR.apply(this, arguments));
	  }

	  DraftEntityInstance.prototype.getType = function getType() {
	    return this.get('type');
	  };

	  DraftEntityInstance.prototype.getMutability = function getMutability() {
	    return this.get('mutability');
	  };

	  DraftEntityInstance.prototype.getData = function getData() {
	    return this.get('data');
	  };

	  return DraftEntityInstance;
	}(DraftEntityInstanceRecord);

	module.exports = DraftEntityInstance;

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule DraftRemovableWord
	 * @typechecks
	 * 
	 */

	'use strict';

	var TokenizeUtil = __webpack_require__(120);

	var punctuation = TokenizeUtil.getPunctuation();

	// The apostrophe and curly single quotes behave in a curious way: when
	// surrounded on both sides by word characters, they behave as word chars; when
	// either neighbor is punctuation or an end of the string, they behave as
	// punctuation.
	var CHAMELEON_CHARS = '[\'‘’]';

	// Remove the underscore, which should count as part of the removable word. The
	// "chameleon chars" also count as punctuation in this regex.
	var WHITESPACE_AND_PUNCTUATION = '\\s|(?![_])' + punctuation;

	var DELETE_STRING = '^' + '(?:' + WHITESPACE_AND_PUNCTUATION + ')*' + '(?:' + CHAMELEON_CHARS + '|(?!' + WHITESPACE_AND_PUNCTUATION + ').)*' + '(?:(?!' + WHITESPACE_AND_PUNCTUATION + ').)';
	var DELETE_REGEX = new RegExp(DELETE_STRING);

	var BACKSPACE_STRING = '(?:(?!' + WHITESPACE_AND_PUNCTUATION + ').)' + '(?:' + CHAMELEON_CHARS + '|(?!' + WHITESPACE_AND_PUNCTUATION + ').)*' + '(?:' + WHITESPACE_AND_PUNCTUATION + ')*' + '$';
	var BACKSPACE_REGEX = new RegExp(BACKSPACE_STRING);

	function getRemovableWord(text, isBackward) {
	  var matches = isBackward ? BACKSPACE_REGEX.exec(text) : DELETE_REGEX.exec(text);
	  return matches ? matches[0] : text;
	}

	var DraftRemovableWord = {
	  getBackward: function getBackward(text) {
	    return getRemovableWord(text, true);
	  },

	  getForward: function getForward(text) {
	    return getRemovableWord(text, false);
	  }
	};

	module.exports = DraftRemovableWord;

/***/ },
/* 39 */
/***/ function(module, exports) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule DraftStringKey
	 * @typechecks
	 * 
	 */

	'use strict';

	var DraftStringKey = {
	  stringify: function stringify(key) {
	    return '_' + String(key);
	  },

	  unstringify: function unstringify(key) {
	    return key.slice(1);
	  }
	};

	module.exports = DraftStringKey;

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule convertFromHTMLToContentBlocks
	 * @typechecks
	 * 
	 */

	'use strict';

	var CharacterMetadata = __webpack_require__(6);
	var ContentBlock = __webpack_require__(10);
	var DefaultDraftBlockRenderMap = __webpack_require__(23);
	var DraftEntity = __webpack_require__(9);
	var Immutable = __webpack_require__(2);
	var URI = __webpack_require__(121);

	var generateRandomKey = __webpack_require__(7);
	var getSafeBodyFromHTML = __webpack_require__(45);
	var invariant = __webpack_require__(3);
	var nullthrows = __webpack_require__(5);
	var sanitizeDraftText = __webpack_require__(28);

	var List = Immutable.List;
	var OrderedSet = Immutable.OrderedSet;


	var NBSP = '&nbsp;';
	var SPACE = ' ';

	// Arbitrary max indent
	var MAX_DEPTH = 4;

	// used for replacing characters in HTML
	var REGEX_CR = new RegExp('\r', 'g');
	var REGEX_LF = new RegExp('\n', 'g');
	var REGEX_NBSP = new RegExp(NBSP, 'g');
	var REGEX_CARRIAGE = new RegExp('&#13;?', 'g');
	var REGEX_ZWS = new RegExp('&#8203;?', 'g');

	// https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight
	var boldValues = ['bold', 'bolder', '500', '600', '700', '800', '900'];
	var notBoldValues = ['light', 'lighter', '100', '200', '300', '400'];

	// Block tag flow is different because LIs do not have
	// a deterministic style ;_;
	var inlineTags = {
	  b: 'BOLD',
	  code: 'CODE',
	  del: 'STRIKETHROUGH',
	  em: 'ITALIC',
	  i: 'ITALIC',
	  s: 'STRIKETHROUGH',
	  strike: 'STRIKETHROUGH',
	  strong: 'BOLD',
	  u: 'UNDERLINE'
	};

	var anchorAttr = ['className', 'href', 'rel', 'target', 'title'];

	var lastBlock;

	function getEmptyChunk() {
	  return {
	    text: '',
	    inlines: [],
	    entities: [],
	    blocks: []
	  };
	}

	function getWhitespaceChunk(inEntity) {
	  var entities = new Array(1);
	  if (inEntity) {
	    entities[0] = inEntity;
	  }
	  return {
	    text: SPACE,
	    inlines: [OrderedSet()],
	    entities: entities,
	    blocks: []
	  };
	}

	function getSoftNewlineChunk() {
	  return {
	    text: '\n',
	    inlines: [OrderedSet()],
	    entities: new Array(1),
	    blocks: []
	  };
	}

	function getBlockDividerChunk(block, depth) {
	  return {
	    text: '\r',
	    inlines: [OrderedSet()],
	    entities: new Array(1),
	    blocks: [{
	      type: block,
	      depth: Math.max(0, Math.min(MAX_DEPTH, depth))
	    }]
	  };
	}

	function getListBlockType(tag, lastList) {
	  if (tag === 'li') {
	    return lastList === 'ol' ? 'ordered-list-item' : 'unordered-list-item';
	  }
	  return null;
	}

	function getBlockMapSupportedTags(blockRenderMap) {
	  var unstyledElement = blockRenderMap.get('unstyled').element;
	  return blockRenderMap.map(function (config) {
	    return config.element;
	  }).valueSeq().toSet().filter(function (tag) {
	    return tag && tag !== unstyledElement;
	  }).toArray().sort();
	}

	// custom element conversions
	function getMultiMatchedType(tag, lastList, multiMatchExtractor) {
	  for (var ii = 0; ii < multiMatchExtractor.length; ii++) {
	    var matchType = multiMatchExtractor[ii](tag, lastList);
	    if (matchType) {
	      return matchType;
	    }
	  }
	  return null;
	}

	function getBlockTypeForTag(tag, lastList, blockRenderMap) {
	  var matchedTypes = blockRenderMap.filter(function (config) {
	    return config.element === tag || config.wrapper === tag;
	  }).keySeq().toSet().toArray().sort();

	  // if we dont have any matched type, return unstyled
	  // if we have one matched type return it
	  // if we have multi matched types use the multi-match function to gather type
	  switch (matchedTypes.length) {
	    case 0:
	      return 'unstyled';
	    case 1:
	      return matchedTypes[0];
	    default:
	      return getMultiMatchedType(tag, lastList, [getListBlockType]) || 'unstyled';
	  }
	}

	function processInlineTag(tag, node, currentStyle) {
	  var styleToCheck = inlineTags[tag];
	  if (styleToCheck) {
	    currentStyle = currentStyle.add(styleToCheck).toOrderedSet();
	  } else if (node instanceof HTMLElement) {
	    (function () {
	      var htmlElement = node;
	      currentStyle = currentStyle.withMutations(function (style) {
	        var fontWeight = htmlElement.style.fontWeight;
	        var fontStyle = htmlElement.style.fontStyle;
	        var textDecoration = htmlElement.style.textDecoration;

	        if (boldValues.indexOf(fontWeight) >= 0) {
	          style.add('BOLD');
	        } else if (notBoldValues.indexOf(fontWeight) >= 0) {
	          style.remove('BOLD');
	        }

	        if (fontStyle === 'italic') {
	          style.add('ITALIC');
	        } else if (fontStyle === 'normal') {
	          style.remove('ITALIC');
	        }

	        if (textDecoration === 'underline') {
	          style.add('UNDERLINE');
	        }
	        if (textDecoration === 'line-through') {
	          style.add('STRIKETHROUGH');
	        }
	        if (textDecoration === 'none') {
	          style.remove('UNDERLINE');
	          style.remove('STRIKETHROUGH');
	        }
	      }).toOrderedSet();
	    })();
	  }
	  return currentStyle;
	}

	function joinChunks(A, B) {
	  // Sometimes two blocks will touch in the DOM and we need to strip the
	  // extra delimiter to preserve niceness.
	  var lastInA = A.text.slice(-1);
	  var firstInB = B.text.slice(0, 1);

	  if (lastInA === '\r' && firstInB === '\r') {
	    A.text = A.text.slice(0, -1);
	    A.inlines.pop();
	    A.entities.pop();
	    A.blocks.pop();
	  }

	  // Kill whitespace after blocks
	  if (lastInA === '\r') {
	    if (B.text === SPACE || B.text === '\n') {
	      return A;
	    } else if (firstInB === SPACE || firstInB === '\n') {
	      B.text = B.text.slice(1);
	      B.inlines.shift();
	      B.entities.shift();
	    }
	  }

	  return {
	    text: A.text + B.text,
	    inlines: A.inlines.concat(B.inlines),
	    entities: A.entities.concat(B.entities),
	    blocks: A.blocks.concat(B.blocks)
	  };
	}

	/**
	 * Check to see if we have anything like <p> <blockquote> <h1>... to create
	 * block tags from. If we do, we can use those and ignore <div> tags. If we
	 * don't, we can treat <div> tags as meaningful (unstyled) blocks.
	 */
	function containsSemanticBlockMarkup(html, blockTags) {
	  return blockTags.some(function (tag) {
	    return html.indexOf('<' + tag) !== -1;
	  });
	}

	function hasValidLinkText(link) {
	  !(link instanceof HTMLAnchorElement) ?  true ? invariant(false, 'Link must be an HTMLAnchorElement.') : invariant(false) : void 0;
	  var protocol = link.protocol;
	  return protocol === 'http:' || protocol === 'https:' || protocol === 'mailto:';
	}

	function genFragment(node, inlineStyle, lastList, inBlock, blockTags, depth, blockRenderMap, inEntity) {
	  var nodeName = node.nodeName.toLowerCase();
	  var newBlock = false;
	  var nextBlockType = 'unstyled';
	  var lastLastBlock = lastBlock;

	  // Base Case
	  if (nodeName === '#text') {
	    var text = node.textContent;
	    if (text.trim() === '' && inBlock !== 'pre') {
	      return getWhitespaceChunk(inEntity);
	    }
	    if (inBlock !== 'pre') {
	      // Can't use empty string because MSWord
	      text = text.replace(REGEX_LF, SPACE);
	    }

	    // save the last block so we can use it later
	    lastBlock = nodeName;

	    return {
	      text: text,
	      inlines: Array(text.length).fill(inlineStyle),
	      entities: Array(text.length).fill(inEntity),
	      blocks: []
	    };
	  }

	  // save the last block so we can use it later
	  lastBlock = nodeName;

	  // BR tags
	  if (nodeName === 'br') {
	    if (lastLastBlock === 'br' && (!inBlock || getBlockTypeForTag(inBlock, lastList, blockRenderMap) === 'unstyled')) {
	      return getBlockDividerChunk('unstyled', depth);
	    }
	    return getSoftNewlineChunk();
	  }

	  var chunk = getEmptyChunk();
	  var newChunk = null;

	  // Inline tags
	  inlineStyle = processInlineTag(nodeName, node, inlineStyle);

	  // Handle lists
	  if (nodeName === 'ul' || nodeName === 'ol') {
	    if (lastList) {
	      depth += 1;
	    }
	    lastList = nodeName;
	  }

	  // Block Tags
	  if (!inBlock && blockTags.indexOf(nodeName) !== -1) {
	    chunk = getBlockDividerChunk(getBlockTypeForTag(nodeName, lastList, blockRenderMap), depth);
	    inBlock = nodeName;
	    newBlock = true;
	  } else if (lastList && inBlock === 'li' && nodeName === 'li') {
	    chunk = getBlockDividerChunk(getBlockTypeForTag(nodeName, lastList, blockRenderMap), depth);
	    inBlock = nodeName;
	    newBlock = true;
	    nextBlockType = lastList === 'ul' ? 'unordered-list-item' : 'ordered-list-item';
	  }

	  // Recurse through children
	  var child = node.firstChild;
	  if (child != null) {
	    nodeName = child.nodeName.toLowerCase();
	  }

	  var entityId = null;

	  while (child) {
	    if (child instanceof HTMLAnchorElement && child.href && hasValidLinkText(child)) {
	      (function () {
	        var anchor = child;
	        var entityConfig = {};

	        anchorAttr.forEach(function (attr) {
	          var anchorAttribute = anchor.getAttribute(attr);
	          if (anchorAttribute) {
	            entityConfig[attr] = anchorAttribute;
	          }
	        });

	        entityConfig.url = new URI(anchor.href).toString();

	        entityId = DraftEntity.create('LINK', 'MUTABLE', entityConfig);
	      })();
	    } else {
	      entityId = undefined;
	    }

	    newChunk = genFragment(child, inlineStyle, lastList, inBlock, blockTags, depth, blockRenderMap, entityId || inEntity);

	    chunk = joinChunks(chunk, newChunk);
	    var sibling = child.nextSibling;

	    // Put in a newline to break up blocks inside blocks
	    if (sibling && blockTags.indexOf(nodeName) >= 0 && inBlock) {
	      chunk = joinChunks(chunk, getSoftNewlineChunk());
	    }
	    if (sibling) {
	      nodeName = sibling.nodeName.toLowerCase();
	    }
	    child = sibling;
	  }

	  if (newBlock) {
	    chunk = joinChunks(chunk, getBlockDividerChunk(nextBlockType, depth));
	  }

	  return chunk;
	}

	function getChunkForHTML(html, DOMBuilder, blockRenderMap) {
	  html = html.trim().replace(REGEX_CR, '').replace(REGEX_NBSP, SPACE).replace(REGEX_CARRIAGE, '').replace(REGEX_ZWS, '');

	  var supportedBlockTags = getBlockMapSupportedTags(blockRenderMap);

	  var safeBody = DOMBuilder(html);
	  if (!safeBody) {
	    return null;
	  }
	  lastBlock = null;

	  // Sometimes we aren't dealing with content that contains nice semantic
	  // tags. In this case, use divs to separate everything out into paragraphs
	  // and hope for the best.
	  var workingBlocks = containsSemanticBlockMarkup(html, supportedBlockTags) ? supportedBlockTags : ['div'];

	  // Start with -1 block depth to offset the fact that we are passing in a fake
	  // UL block to start with.
	  var chunk = genFragment(safeBody, OrderedSet(), 'ul', null, workingBlocks, -1, blockRenderMap);

	  // join with previous block to prevent weirdness on paste
	  if (chunk.text.indexOf('\r') === 0) {
	    chunk = {
	      text: chunk.text.slice(1),
	      inlines: chunk.inlines.slice(1),
	      entities: chunk.entities.slice(1),
	      blocks: chunk.blocks
	    };
	  }

	  // Kill block delimiter at the end
	  if (chunk.text.slice(-1) === '\r') {
	    chunk.text = chunk.text.slice(0, -1);
	    chunk.inlines = chunk.inlines.slice(0, -1);
	    chunk.entities = chunk.entities.slice(0, -1);
	    chunk.blocks.pop();
	  }

	  // If we saw no block tags, put an unstyled one in
	  if (chunk.blocks.length === 0) {
	    chunk.blocks.push({ type: 'unstyled', depth: 0 });
	  }

	  // Sometimes we start with text that isn't in a block, which is then
	  // followed by blocks. Need to fix up the blocks to add in
	  // an unstyled block for this content
	  if (chunk.text.split('\r').length === chunk.blocks.length + 1) {
	    chunk.blocks.unshift({ type: 'unstyled', depth: 0 });
	  }

	  return chunk;
	}

	function convertFromHTMLtoContentBlocks(html) {
	  var DOMBuilder = arguments.length <= 1 || arguments[1] === undefined ? getSafeBodyFromHTML : arguments[1];
	  var blockRenderMap = arguments.length <= 2 || arguments[2] === undefined ? DefaultDraftBlockRenderMap : arguments[2];

	  // Be ABSOLUTELY SURE that the dom builder you pass here won't execute
	  // arbitrary code in whatever environment you're running this in. For an
	  // example of how we try to do this in-browser, see getSafeBodyFromHTML.

	  var chunk = getChunkForHTML(html, DOMBuilder, blockRenderMap);

	  if (chunk == null) {
	    return null;
	  }
	  var start = 0;
	  return chunk.text.split('\r').map(function (textBlock, ii) {
	    // Make absolutely certain that our text is acceptable.
	    textBlock = sanitizeDraftText(textBlock);
	    var end = start + textBlock.length;
	    var inlines = nullthrows(chunk).inlines.slice(start, end);
	    var entities = nullthrows(chunk).entities.slice(start, end);
	    var characterList = List(inlines.map(function (style, ii) {
	      var data = { style: style, entity: null };
	      if (entities[ii]) {
	        data.entity = entities[ii];
	      }
	      return CharacterMetadata.create(data);
	    }));
	    start = end + 1;

	    return new ContentBlock({
	      key: generateRandomKey(),
	      type: nullthrows(chunk).blocks[ii].type,
	      depth: nullthrows(chunk).blocks[ii].depth,
	      text: textBlock,
	      characterList: characterList
	    });
	  });
	}

	module.exports = convertFromHTMLtoContentBlocks;

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule getDefaultKeyBinding
	 * @typechecks
	 * 
	 */

	'use strict';

	var KeyBindingUtil = __webpack_require__(24);
	var Keys = __webpack_require__(29);
	var UserAgent = __webpack_require__(8);

	var isOSX = UserAgent.isPlatform('Mac OS X');
	var isWindows = UserAgent.isPlatform('Windows');

	// Firefox on OSX had a bug resulting in navigation instead of cursor movement.
	// This bug was fixed in Firefox 29. Feature detection is virtually impossible
	// so we just check the version number. See #342765.
	var shouldFixFirefoxMovement = isOSX && UserAgent.isBrowser('Firefox < 29');

	var hasCommandModifier = KeyBindingUtil.hasCommandModifier;
	var isCtrlKeyCommand = KeyBindingUtil.isCtrlKeyCommand;


	function shouldRemoveWord(e) {
	  return isOSX && e.altKey || isCtrlKeyCommand(e);
	}

	/**
	 * Get the appropriate undo/redo command for a Z key command.
	 */
	function getZCommand(e) {
	  if (!hasCommandModifier(e)) {
	    return null;
	  }
	  return e.shiftKey ? 'redo' : 'undo';
	}

	function getDeleteCommand(e) {
	  // Allow default "cut" behavior for Windows on Shift + Delete.
	  if (isWindows && e.shiftKey) {
	    return null;
	  }
	  return shouldRemoveWord(e) ? 'delete-word' : 'delete';
	}

	function getBackspaceCommand(e) {
	  if (hasCommandModifier(e) && isOSX) {
	    return 'backspace-to-start-of-line';
	  }
	  return shouldRemoveWord(e) ? 'backspace-word' : 'backspace';
	}

	/**
	 * Retrieve a bound key command for the given event.
	 */
	function getDefaultKeyBinding(e) {
	  switch (e.keyCode) {
	    case 66:
	      // B
	      return hasCommandModifier(e) ? 'bold' : null;
	    case 68:
	      // D
	      return isCtrlKeyCommand(e) ? 'delete' : null;
	    case 72:
	      // H
	      return isCtrlKeyCommand(e) ? 'backspace' : null;
	    case 73:
	      // I
	      return hasCommandModifier(e) ? 'italic' : null;
	    case 74:
	      // J
	      return hasCommandModifier(e) ? 'code' : null;
	    case 75:
	      // K
	      return !isWindows && isCtrlKeyCommand(e) ? 'secondary-cut' : null;
	    case 77:
	      // M
	      return isCtrlKeyCommand(e) ? 'split-block' : null;
	    case 79:
	      // O
	      return isCtrlKeyCommand(e) ? 'split-block' : null;
	    case 84:
	      // T
	      return isOSX && isCtrlKeyCommand(e) ? 'transpose-characters' : null;
	    case 85:
	      // U
	      return hasCommandModifier(e) ? 'underline' : null;
	    case 87:
	      // W
	      return isOSX && isCtrlKeyCommand(e) ? 'backspace-word' : null;
	    case 89:
	      // Y
	      if (isCtrlKeyCommand(e)) {
	        return isWindows ? 'redo' : 'secondary-paste';
	      }
	      return null;
	    case 90:
	      // Z
	      return getZCommand(e) || null;
	    case Keys.RETURN:
	      return 'split-block';
	    case Keys.DELETE:
	      return getDeleteCommand(e);
	    case Keys.BACKSPACE:
	      return getBackspaceCommand(e);
	    // LEFT/RIGHT handlers serve as a workaround for a Firefox bug.
	    case Keys.LEFT:
	      return shouldFixFirefoxMovement && hasCommandModifier(e) ? 'move-selection-to-start-of-block' : null;
	    case Keys.RIGHT:
	      return shouldFixFirefoxMovement && hasCommandModifier(e) ? 'move-selection-to-end-of-block' : null;
	    default:
	      return null;
	  }
	}

	module.exports = getDefaultKeyBinding;

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule getDraftEditorSelectionWithNodes
	 * @typechecks
	 * 
	 */

	'use strict';

	var findAncestorOffsetKey = __webpack_require__(25);
	var getSelectionOffsetKeyForNode = __webpack_require__(46);
	var getUpdatedSelectionState = __webpack_require__(48);
	var invariant = __webpack_require__(3);
	var nullthrows = __webpack_require__(5);

	/**
	 * Convert the current selection range to an anchor/focus pair of offset keys
	 * and values that can be interpreted by components.
	 */
	function getDraftEditorSelectionWithNodes(editorState, root, anchorNode, anchorOffset, focusNode, focusOffset) {
	  var anchorIsTextNode = anchorNode.nodeType === Node.TEXT_NODE;
	  var focusIsTextNode = focusNode.nodeType === Node.TEXT_NODE;

	  // If the selection range lies only on text nodes, the task is simple.
	  // Find the nearest offset-aware elements and use the
	  // offset values supplied by the selection range.
	  if (anchorIsTextNode && focusIsTextNode) {
	    return {
	      selectionState: getUpdatedSelectionState(editorState, nullthrows(findAncestorOffsetKey(anchorNode)), anchorOffset, nullthrows(findAncestorOffsetKey(focusNode)), focusOffset),
	      needsRecovery: false
	    };
	  }

	  var anchorPoint = null;
	  var focusPoint = null;
	  var needsRecovery = true;

	  // An element is selected. Convert this selection range into leaf offset
	  // keys and offset values for consumption at the component level. This
	  // is common in Firefox, where select-all and triple click behavior leads
	  // to entire elements being selected.
	  //
	  // Note that we use the `needsRecovery` parameter in the callback here. This
	  // is because when certain elements are selected, the behavior for subsequent
	  // cursor movement (e.g. via arrow keys) is uncertain and may not match
	  // expectations at the component level. For example, if an entire <div> is
	  // selected and the user presses the right arrow, Firefox keeps the selection
	  // on the <div>. If we allow subsequent keypresses to insert characters
	  // natively, they will be inserted into a browser-created text node to the
	  // right of that <div>. This is obviously undesirable.
	  //
	  // With the `needsRecovery` flag, we inform the caller that it is responsible
	  // for manually setting the selection state on the rendered document to
	  // ensure proper selection state maintenance.

	  if (anchorIsTextNode) {
	    anchorPoint = {
	      key: nullthrows(findAncestorOffsetKey(anchorNode)),
	      offset: anchorOffset
	    };
	    focusPoint = getPointForNonTextNode(root, focusNode, focusOffset);
	  } else if (focusIsTextNode) {
	    focusPoint = {
	      key: nullthrows(findAncestorOffsetKey(focusNode)),
	      offset: focusOffset
	    };
	    anchorPoint = getPointForNonTextNode(root, anchorNode, anchorOffset);
	  } else {
	    anchorPoint = getPointForNonTextNode(root, anchorNode, anchorOffset);
	    focusPoint = getPointForNonTextNode(root, focusNode, focusOffset);

	    // If the selection is collapsed on an empty block, don't force recovery.
	    // This way, on arrow key selection changes, the browser can move the
	    // cursor from a non-zero offset on one block, through empty blocks,
	    // to a matching non-zero offset on other text blocks.
	    if (anchorNode === focusNode && anchorOffset === focusOffset) {
	      needsRecovery = !!anchorNode.firstChild && anchorNode.firstChild.nodeName !== 'BR';
	    }
	  }

	  return {
	    selectionState: getUpdatedSelectionState(editorState, anchorPoint.key, anchorPoint.offset, focusPoint.key, focusPoint.offset),
	    needsRecovery: needsRecovery
	  };
	}

	/**
	 * Identify the first leaf descendant for the given node.
	 */
	function getFirstLeaf(node) {
	  while (node.firstChild && getSelectionOffsetKeyForNode(node.firstChild)) {
	    node = node.firstChild;
	  }
	  return node;
	}

	/**
	 * Identify the last leaf descendant for the given node.
	 */
	function getLastLeaf(node) {
	  while (node.lastChild && getSelectionOffsetKeyForNode(node.lastChild)) {
	    node = node.lastChild;
	  }
	  return node;
	}

	function getPointForNonTextNode(editorRoot, startNode, childOffset) {
	  var node = startNode;
	  var offsetKey = findAncestorOffsetKey(node);

	  !(offsetKey != null || editorRoot && (editorRoot === node || editorRoot.firstChild === node)) ?  true ? invariant(false, 'Unknown node in selection range.') : invariant(false) : void 0;

	  // If the editorRoot is the selection, step downward into the content
	  // wrapper.
	  if (editorRoot === node) {
	    node = node.firstChild;
	    !(node instanceof Element && node.getAttribute('data-contents') === 'true') ?  true ? invariant(false, 'Invalid DraftEditorContents structure.') : invariant(false) : void 0;
	    if (childOffset > 0) {
	      childOffset = node.childNodes.length;
	    }
	  }

	  // If the child offset is zero and we have an offset key, we're done.
	  // If there's no offset key because the entire editor is selected,
	  // find the leftmost ("first") leaf in the tree and use that as the offset
	  // key.
	  if (childOffset === 0) {
	    var key = null;
	    if (offsetKey != null) {
	      key = offsetKey;
	    } else {
	      var firstLeaf = getFirstLeaf(node);
	      key = nullthrows(getSelectionOffsetKeyForNode(firstLeaf));
	    }
	    return { key: key, offset: 0 };
	  }

	  var nodeBeforeCursor = node.childNodes[childOffset - 1];
	  var leafKey = null;
	  var textLength = null;

	  if (!getSelectionOffsetKeyForNode(nodeBeforeCursor)) {
	    // Our target node may be a leaf or a text node, in which case we're
	    // already where we want to be and can just use the child's length as
	    // our offset.
	    leafKey = nullthrows(offsetKey);
	    textLength = getTextContentLength(nodeBeforeCursor);
	  } else {
	    // Otherwise, we'll look at the child to the left of the cursor and find
	    // the last leaf node in its subtree.
	    var lastLeaf = getLastLeaf(nodeBeforeCursor);
	    leafKey = nullthrows(getSelectionOffsetKeyForNode(lastLeaf));
	    textLength = getTextContentLength(lastLeaf);
	  }

	  return {
	    key: leafKey,
	    offset: textLength
	  };
	}

	/**
	 * Return the length of a node's textContent, regarding single newline
	 * characters as zero-length. This allows us to avoid problems with identifying
	 * the correct selection offset for empty blocks in IE, in which we
	 * render newlines instead of break tags.
	 */
	function getTextContentLength(node) {
	  var textContent = node.textContent;
	  return textContent === '\n' ? 0 : textContent.length;
	}

	module.exports = getDraftEditorSelectionWithNodes;

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule getFragmentFromSelection
	 * 
	 */

	'use strict';

	var getContentStateFragment = __webpack_require__(21);

	function getFragmentFromSelection(editorState) {
	  var selectionState = editorState.getSelection();

	  if (selectionState.isCollapsed()) {
	    return null;
	  }

	  return getContentStateFragment(editorState.getCurrentContent(), selectionState);
	}

	module.exports = getFragmentFromSelection;

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule getRangeClientRects
	 * @typechecks
	 * 
	 */

	'use strict';

	var UserAgent = __webpack_require__(8);

	var invariant = __webpack_require__(3);

	var isChrome = UserAgent.isBrowser('Chrome');

	// In Chrome, the client rects will include the entire bounds of all nodes that
	// begin (have a start tag) within the selection, even if the selection does
	// not overlap the entire node. To resolve this, we split the range at each
	// start tag and join the client rects together.
	// https://code.google.com/p/chromium/issues/detail?id=324437
	/* eslint-disable consistent-return */
	function getRangeClientRectsChrome(range) {
	  var tempRange = range.cloneRange();
	  var clientRects = [];

	  for (var ancestor = range.endContainer; ancestor != null; ancestor = ancestor.parentNode) {
	    // If we've climbed up to the common ancestor, we can now use the
	    // original start point and stop climbing the tree.
	    var atCommonAncestor = ancestor === range.commonAncestorContainer;
	    if (atCommonAncestor) {
	      tempRange.setStart(range.startContainer, range.startOffset);
	    } else {
	      tempRange.setStart(tempRange.endContainer, 0);
	    }
	    var rects = Array.from(tempRange.getClientRects());
	    clientRects.push(rects);
	    if (atCommonAncestor) {
	      var _ref;

	      clientRects.reverse();
	      return (_ref = []).concat.apply(_ref, clientRects);
	    }
	    tempRange.setEndBefore(ancestor);
	  }

	   true ?  true ? invariant(false, 'Found an unexpected detached subtree when getting range client rects.') : invariant(false) : void 0;
	}
	/* eslint-enable consistent-return */

	/**
	 * Like range.getClientRects() but normalizes for browser bugs.
	 */
	var getRangeClientRects = isChrome ? getRangeClientRectsChrome : function (range) {
	  return Array.from(range.getClientRects());
	};

	module.exports = getRangeClientRects;

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule getSafeBodyFromHTML
	 * 
	 */

	'use strict';

	var UserAgent = __webpack_require__(8);

	var isOldIE = UserAgent.isBrowser('IE <= 9');

	// Provides a dom node that will not execute scripts
	// https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation.createHTMLDocument
	// https://developer.mozilla.org/en-US/Add-ons/Code_snippets/HTML_to_DOM

	function getSafeBodyFromHTML(html) {
	  var doc;
	  var root = null;
	  // Provides a safe context
	  if (!isOldIE && document.implementation && document.implementation.createHTMLDocument) {
	    doc = document.implementation.createHTMLDocument('foo');
	    doc.documentElement.innerHTML = html;
	    root = doc.getElementsByTagName('body')[0];
	  }
	  return root;
	}

	module.exports = getSafeBodyFromHTML;

/***/ },
/* 46 */
/***/ function(module, exports) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule getSelectionOffsetKeyForNode
	 * @typechecks
	 * 
	 */

	'use strict';

	/**
	 * Get offset key from a node or it's child nodes. Return the first offset key
	 * found on the DOM tree of given node.
	 */

	function getSelectionOffsetKeyForNode(node) {
	  if (node instanceof Element) {
	    var offsetKey = node.getAttribute('data-offset-key');
	    if (offsetKey) {
	      return offsetKey;
	    }
	    for (var ii = 0; ii < node.childNodes.length; ii++) {
	      var childOffsetKey = getSelectionOffsetKeyForNode(node.childNodes[ii]);
	      if (childOffsetKey) {
	        return childOffsetKey;
	      }
	    }
	  }
	  return null;
	}

	module.exports = getSelectionOffsetKeyForNode;

/***/ },
/* 47 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule getTextContentFromFiles
	 * 
	 */

	'use strict';

	var TEXT_CLIPPING_REGEX = /\.textClipping$/;

	var TEXT_TYPES = {
	  'text/plain': true,
	  'text/html': true,
	  'text/rtf': true
	};

	// Somewhat arbitrary upper bound on text size. Let's not lock up the browser.
	var TEXT_SIZE_UPPER_BOUND = 5000;

	/**
	 * Extract the text content from a file list.
	 */
	function getTextContentFromFiles(files, callback) {
	  var readCount = 0;
	  var results = [];
	  files.forEach(function ( /*blob*/file) {
	    readFile(file, function ( /*string*/text) {
	      readCount++;
	      text && results.push(text.slice(0, TEXT_SIZE_UPPER_BOUND));
	      if (readCount == files.length) {
	        callback(results.join('\r'));
	      }
	    });
	  });
	}

	/**
	 * todo isaac: Do work to turn html/rtf into a content fragment.
	 */
	function readFile(file, callback) {
	  if (!global.FileReader || file.type && !(file.type in TEXT_TYPES)) {
	    callback('');
	    return;
	  }

	  if (file.type === '') {
	    var contents = '';
	    // Special-case text clippings, which have an empty type but include
	    // `.textClipping` in the file name. `readAsText` results in an empty
	    // string for text clippings, so we force the file name to serve
	    // as the text value for the file.
	    if (TEXT_CLIPPING_REGEX.test(file.name)) {
	      contents = file.name.replace(TEXT_CLIPPING_REGEX, '');
	    }
	    callback(contents);
	    return;
	  }

	  var reader = new FileReader();
	  reader.onload = function () {
	    callback(reader.result);
	  };
	  reader.onerror = function () {
	    callback('');
	  };
	  reader.readAsText(file);
	}

	module.exports = getTextContentFromFiles;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule getUpdatedSelectionState
	 * 
	 */

	'use strict';

	var DraftOffsetKey = __webpack_require__(19);

	var nullthrows = __webpack_require__(5);

	function getUpdatedSelectionState(editorState, anchorKey, anchorOffset, focusKey, focusOffset) {
	  var selection = nullthrows(editorState.getSelection());
	  if (true) {
	    if (!anchorKey || !focusKey) {
	      /*eslint-disable no-console */
	      console.warn('Invalid selection state.', arguments, editorState.toJS());
	      /*eslint-enable no-console */
	      return selection;
	    }
	  }

	  var anchorPath = DraftOffsetKey.decode(anchorKey);
	  var anchorBlockKey = anchorPath.blockKey;
	  var anchorLeaf = editorState.getBlockTree(anchorBlockKey).getIn([anchorPath.decoratorKey, 'leaves', anchorPath.leafKey]);

	  var focusPath = DraftOffsetKey.decode(focusKey);
	  var focusBlockKey = focusPath.blockKey;
	  var focusLeaf = editorState.getBlockTree(focusBlockKey).getIn([focusPath.decoratorKey, 'leaves', focusPath.leafKey]);

	  var anchorLeafStart = anchorLeaf.get('start');
	  var focusLeafStart = focusLeaf.get('start');

	  var anchorBlockOffset = anchorLeaf ? anchorLeafStart + anchorOffset : null;
	  var focusBlockOffset = focusLeaf ? focusLeafStart + focusOffset : null;

	  var areEqual = selection.getAnchorKey() === anchorBlockKey && selection.getAnchorOffset() === anchorBlockOffset && selection.getFocusKey() === focusBlockKey && selection.getFocusOffset() === focusBlockOffset;

	  if (areEqual) {
	    return selection;
	  }

	  var isBackward = false;
	  if (anchorBlockKey === focusBlockKey) {
	    var anchorLeafEnd = anchorLeaf.get('end');
	    var focusLeafEnd = focusLeaf.get('end');
	    if (focusLeafStart === anchorLeafStart && focusLeafEnd === anchorLeafEnd) {
	      isBackward = focusOffset < anchorOffset;
	    } else {
	      isBackward = focusLeafStart < anchorLeafStart;
	    }
	  } else {
	    var startKey = editorState.getCurrentContent().getBlockMap().keySeq().skipUntil(function (v) {
	      return v === anchorBlockKey || v === focusBlockKey;
	    }).first();
	    isBackward = startKey === focusBlockKey;
	  }

	  return selection.merge({
	    anchorKey: anchorBlockKey,
	    anchorOffset: anchorBlockOffset,
	    focusKey: focusBlockKey,
	    focusOffset: focusBlockOffset,
	    isBackward: isBackward
	  });
	}

	module.exports = getUpdatedSelectionState;

/***/ },
/* 49 */
/***/ function(module, exports) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule insertIntoList
	 * 
	 */

	'use strict';

	/**
	 * Maintain persistence for target list when appending and prepending.
	 */
	function insertIntoList(targetList, toInsert, offset) {
	  if (offset === targetList.count()) {
	    toInsert.forEach(function (c) {
	      targetList = targetList.push(c);
	    });
	  } else if (offset === 0) {
	    toInsert.reverse().forEach(function (c) {
	      targetList = targetList.unshift(c);
	    });
	  } else {
	    var head = targetList.slice(0, offset);
	    var tail = targetList.slice(offset);
	    targetList = head.concat(toInsert, tail).toList();
	  }
	  return targetList;
	}

	module.exports = insertIntoList;

/***/ },
/* 50 */
/***/ function(module, exports) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule isSelectionAtLeafStart
	 * @typechecks
	 * 
	 */

	'use strict';

	function isSelectionAtLeafStart(editorState) {
	  var selection = editorState.getSelection();
	  var anchorKey = selection.getAnchorKey();
	  var blockTree = editorState.getBlockTree(anchorKey);
	  var offset = selection.getStartOffset();

	  var isAtStart = false;

	  blockTree.some(function (leafSet) {
	    if (offset === leafSet.get('start')) {
	      isAtStart = true;
	      return true;
	    }

	    if (offset < leafSet.get('end')) {
	      return leafSet.get('leaves').some(function (leaf) {
	        var leafStart = leaf.get('start');
	        if (offset === leafStart) {
	          isAtStart = true;
	          return true;
	        }

	        return false;
	      });
	    }

	    return false;
	  });

	  return isAtStart;
	}

	module.exports = isSelectionAtLeafStart;

/***/ },
/* 51 */
/***/ function(module, exports) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule moveSelectionForward
	 * 
	 */

	'use strict';

	/**
	 * Given a collapsed selection, move the focus `maxDistance` forward within
	 * the selected block. If the selection will go beyond the end of the block,
	 * move focus to the start of the next block, but no further.
	 *
	 * This function is not Unicode-aware, so surrogate pairs will be treated
	 * as having length 2.
	 */
	function moveSelectionForward(editorState, maxDistance) {
	  var selection = editorState.getSelection();
	  var key = selection.getStartKey();
	  var offset = selection.getStartOffset();
	  var content = editorState.getCurrentContent();

	  var focusKey = key;
	  var focusOffset;

	  var block = content.getBlockForKey(key);

	  if (maxDistance > block.getText().length - offset) {
	    focusKey = content.getKeyAfter(key);
	    focusOffset = 0;
	  } else {
	    focusOffset = offset + maxDistance;
	  }

	  return selection.merge({ focusKey: focusKey, focusOffset: focusOffset });
	}

	module.exports = moveSelectionForward;

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule removeEntitiesAtEdges
	 * 
	 */

	'use strict';

	var CharacterMetadata = __webpack_require__(6);
	var DraftEntity = __webpack_require__(9);

	var findRangesImmutable = __webpack_require__(20);
	var invariant = __webpack_require__(3);

	function removeEntitiesAtEdges(contentState, selectionState) {
	  var blockMap = contentState.getBlockMap();

	  var updatedBlocks = {};

	  var startKey = selectionState.getStartKey();
	  var startOffset = selectionState.getStartOffset();
	  var startBlock = blockMap.get(startKey);
	  var updatedStart = removeForBlock(startBlock, startOffset);

	  if (updatedStart !== startBlock) {
	    updatedBlocks[startKey] = updatedStart;
	  }

	  var endKey = selectionState.getEndKey();
	  var endOffset = selectionState.getEndOffset();
	  var endBlock = blockMap.get(endKey);
	  if (startKey === endKey) {
	    endBlock = updatedStart;
	  }

	  var updatedEnd = removeForBlock(endBlock, endOffset);

	  if (updatedEnd !== endBlock) {
	    updatedBlocks[endKey] = updatedEnd;
	  }

	  if (!Object.keys(updatedBlocks).length) {
	    return contentState.set('selectionAfter', selectionState);
	  }

	  return contentState.merge({
	    blockMap: blockMap.merge(updatedBlocks),
	    selectionAfter: selectionState
	  });
	}

	function getRemovalRange(characters, key, offset) {
	  var removalRange;
	  findRangesImmutable(characters, function (a, b) {
	    return a.getEntity() === b.getEntity();
	  }, function (element) {
	    return element.getEntity() === key;
	  }, function (start, end) {
	    if (start <= offset && end >= offset) {
	      removalRange = { start: start, end: end };
	    }
	  });
	  !(typeof removalRange === 'object') ?  true ? invariant(false, 'Removal range must exist within character list.') : invariant(false) : void 0;
	  return removalRange;
	}

	function removeForBlock(block, offset) {
	  var chars = block.getCharacterList();
	  var charBefore = offset > 0 ? chars.get(offset - 1) : undefined;
	  var charAfter = offset < chars.count() ? chars.get(offset) : undefined;
	  var entityBeforeCursor = charBefore ? charBefore.getEntity() : undefined;
	  var entityAfterCursor = charAfter ? charAfter.getEntity() : undefined;

	  if (entityAfterCursor && entityAfterCursor === entityBeforeCursor) {
	    var entity = DraftEntity.get(entityAfterCursor);
	    if (entity.getMutability() !== 'MUTABLE') {
	      var _getRemovalRange = getRemovalRange(chars, entityAfterCursor, offset);

	      var start = _getRemovalRange.start;
	      var end = _getRemovalRange.end;

	      var current;
	      while (start < end) {
	        current = chars.get(start);
	        chars = chars.set(start, CharacterMetadata.applyEntity(current, null));
	        start++;
	      }
	      return block.set('characterList', chars);
	    }
	  }

	  return block;
	}

	module.exports = removeEntitiesAtEdges;

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @typechecks
	 */

	var PhotosMimeType = __webpack_require__(119);

	var createArrayFromMixed = __webpack_require__(126);
	var emptyFunction = __webpack_require__(32);

	var CR_LF_REGEX = new RegExp('\r\n', 'g');
	var LF_ONLY = '\n';

	var RICH_TEXT_TYPES = {
	  'text/rtf': 1,
	  'text/html': 1
	};

	/**
	 * If DataTransferItem is a file then return the Blob of data.
	 *
	 * @param {object} item
	 * @return {?blob}
	 */
	function getFileFromDataTransfer(item) {
	  if (item.kind == 'file') {
	    return item.getAsFile();
	  }
	}

	var DataTransfer = function () {
	  /**
	   * @param {object} data
	   */

	  function DataTransfer(data) {
	    _classCallCheck(this, DataTransfer);

	    this.data = data;

	    // Types could be DOMStringList or array
	    this.types = data.types ? createArrayFromMixed(data.types) : [];
	  }

	  /**
	   * Is this likely to be a rich text data transfer?
	   *
	   * @return {boolean}
	   */


	  DataTransfer.prototype.isRichText = function isRichText() {
	    // If HTML is available, treat this data as rich text. This way, we avoid
	    // using a pasted image if it is packaged with HTML -- this may occur with
	    // pastes from MS Word, for example.  However this is only rich text if
	    // there's accompanying text.
	    if (this.getHTML() && this.getText()) {
	      return true;
	    }

	    // When an image is copied from a preview window, you end up with two
	    // DataTransferItems one of which is a file's metadata as text.  Skip those.
	    if (this.isImage()) {
	      return false;
	    }

	    return this.types.some(function (type) {
	      return RICH_TEXT_TYPES[type];
	    });
	  };

	  /**
	   * Get raw text.
	   *
	   * @return {?string}
	   */


	  DataTransfer.prototype.getText = function getText() {
	    var text;
	    if (this.data.getData) {
	      if (!this.types.length) {
	        text = this.data.getData('Text');
	      } else if (this.types.indexOf('text/plain') != -1) {
	        text = this.data.getData('text/plain');
	      }
	    }
	    return text ? text.replace(CR_LF_REGEX, LF_ONLY) : null;
	  };

	  /**
	   * Get HTML paste data
	   *
	   * @return {?string}
	   */


	  DataTransfer.prototype.getHTML = function getHTML() {
	    if (this.data.getData) {
	      if (!this.types.length) {
	        return this.data.getData('Text');
	      } else if (this.types.indexOf('text/html') != -1) {
	        return this.data.getData('text/html');
	      }
	    }
	  };

	  /**
	   * Is this a link data transfer?
	   *
	   * @return {boolean}
	   */


	  DataTransfer.prototype.isLink = function isLink() {
	    return this.types.some(function (type) {
	      return type.indexOf('Url') != -1 || type.indexOf('text/uri-list') != -1 || type.indexOf('text/x-moz-url');
	    });
	  };

	  /**
	   * Get a link url.
	   *
	   * @return {?string}
	   */


	  DataTransfer.prototype.getLink = function getLink() {
	    if (this.data.getData) {
	      if (this.types.indexOf('text/x-moz-url') != -1) {
	        var url = this.data.getData('text/x-moz-url').split('\n');
	        return url[0];
	      }
	      return this.types.indexOf('text/uri-list') != -1 ? this.data.getData('text/uri-list') : this.data.getData('url');
	    }

	    return null;
	  };

	  /**
	   * Is this an image data transfer?
	   *
	   * @return {boolean}
	   */


	  DataTransfer.prototype.isImage = function isImage() {
	    var isImage = this.types.some(function (type) {
	      // Firefox will have a type of application/x-moz-file for images during
	      // dragging
	      return type.indexOf('application/x-moz-file') != -1;
	    });

	    if (isImage) {
	      return true;
	    }

	    var items = this.getFiles();
	    for (var i = 0; i < items.length; i++) {
	      var type = items[i].type;
	      if (!PhotosMimeType.isImage(type)) {
	        return false;
	      }
	    }

	    return true;
	  };

	  DataTransfer.prototype.getCount = function getCount() {
	    if (this.data.hasOwnProperty('items')) {
	      return this.data.items.length;
	    } else if (this.data.hasOwnProperty('mozItemCount')) {
	      return this.data.mozItemCount;
	    } else if (this.data.files) {
	      return this.data.files.length;
	    }
	    return null;
	  };

	  /**
	   * Get files.
	   *
	   * @return {array}
	   */


	  DataTransfer.prototype.getFiles = function getFiles() {
	    if (this.data.items) {
	      // createArrayFromMixed doesn't properly handle DataTransferItemLists.
	      return Array.prototype.slice.call(this.data.items).map(getFileFromDataTransfer).filter(emptyFunction.thatReturnsArgument);
	    } else if (this.data.files) {
	      return Array.prototype.slice.call(this.data.files);
	    } else {
	      return [];
	    }
	  };

	  /**
	   * Are there any files to fetch?
	   *
	   * @return {boolean}
	   */


	  DataTransfer.prototype.hasFiles = function hasFiles() {
	    return this.getFiles().length > 0;
	  };

	  return DataTransfer;
	}();

	module.exports = DataTransfer;

/***/ },
/* 54 */
/***/ function(module, exports) {

	"use strict";

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 */

	/**
	 * @param {DOMElement} element
	 * @param {DOMDocument} doc
	 * @return {boolean}
	 */
	function _isViewportScrollElement(element, doc) {
	  return !!doc && (element === doc.documentElement || element === doc.body);
	}

	/**
	 * Scroll Module. This class contains 4 simple static functions
	 * to be used to access Element.scrollTop/scrollLeft properties.
	 * To solve the inconsistencies between browsers when either
	 * document.body or document.documentElement is supplied,
	 * below logic will be used to alleviate the issue:
	 *
	 * 1. If 'element' is either 'document.body' or 'document.documentElement,
	 *    get whichever element's 'scroll{Top,Left}' is larger.
	 * 2. If 'element' is either 'document.body' or 'document.documentElement',
	 *    set the 'scroll{Top,Left}' on both elements.
	 */

	var Scroll = {
	  /**
	   * @param {DOMElement} element
	   * @return {number}
	   */
	  getTop: function getTop(element) {
	    var doc = element.ownerDocument;
	    return _isViewportScrollElement(element, doc) ?
	    // In practice, they will either both have the same value,
	    // or one will be zero and the other will be the scroll position
	    // of the viewport. So we can use `X || Y` instead of `Math.max(X, Y)`
	    doc.body.scrollTop || doc.documentElement.scrollTop : element.scrollTop;
	  },

	  /**
	   * @param {DOMElement} element
	   * @param {number} newTop
	   */
	  setTop: function setTop(element, newTop) {
	    var doc = element.ownerDocument;
	    if (_isViewportScrollElement(element, doc)) {
	      doc.body.scrollTop = doc.documentElement.scrollTop = newTop;
	    } else {
	      element.scrollTop = newTop;
	    }
	  },

	  /**
	   * @param {DOMElement} element
	   * @return {number}
	   */
	  getLeft: function getLeft(element) {
	    var doc = element.ownerDocument;
	    return _isViewportScrollElement(element, doc) ? doc.body.scrollLeft || doc.documentElement.scrollLeft : element.scrollLeft;
	  },

	  /**
	   * @param {DOMElement} element
	   * @param {number} newLeft
	   */
	  setLeft: function setLeft(element, newLeft) {
	    var doc = element.ownerDocument;
	    if (_isViewportScrollElement(element, doc)) {
	      doc.body.scrollLeft = doc.documentElement.scrollLeft = newLeft;
	    } else {
	      element.scrollLeft = newLeft;
	    }
	  }
	};

	module.exports = Scroll;

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @typechecks
	 * 
	 */

	/**
	 * Basic (stateless) API for text direction detection
	 *
	 * Part of our implementation of Unicode Bidirectional Algorithm (UBA)
	 * Unicode Standard Annex #9 (UAX9)
	 * http://www.unicode.org/reports/tr9/
	 */

	'use strict';

	var UnicodeBidiDirection = __webpack_require__(31);

	var invariant = __webpack_require__(3);

	/**
	 * RegExp ranges of characters with a *Strong* Bidi_Class value.
	 *
	 * Data is based on DerivedBidiClass.txt in UCD version 7.0.0.
	 *
	 * NOTE: For performance reasons, we only support Unicode's
	 *       Basic Multilingual Plane (BMP) for now.
	 */
	var RANGE_BY_BIDI_TYPE = {

	  L: 'A-Za-zªµºÀ-ÖØ-öø-ƺƻ' + 'Ƽ-ƿǀ-ǃǄ-ʓʔʕ-ʯʰ-ʸ' + 'ʻ-ˁː-ˑˠ-ˤˮͰ-ͳͶ-ͷ' + 'ͺͻ-ͽͿΆΈ-ΊΌΎ-Ρ' + 'Σ-ϵϷ-ҁ҂Ҋ-ԯԱ-Ֆՙ' + '՚-՟ա-և։ःऄ-हऻऽ' + 'ा-ीॉ-ौॎ-ॏॐक़-ॡ।-॥' + '०-९॰ॱॲ-ঀং-ঃঅ-ঌ' + 'এ-ঐও-নপ-রলশ-হঽ' + 'া-ীে-ৈো-ৌৎৗড়-ঢ়' + 'য়-ৡ০-৯ৰ-ৱ৴-৹৺ਃ' + 'ਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼' + 'ਵ-ਸ਼ਸ-ਹਾ-ੀਖ਼-ੜਫ਼੦-੯' + 'ੲ-ੴઃઅ-ઍએ-ઑઓ-નપ-ર' + 'લ-ળવ-હઽા-ીૉો-ૌૐ' + 'ૠ-ૡ૦-૯૰ଂ-ଃଅ-ଌଏ-ଐ' + 'ଓ-ନପ-ରଲ-ଳଵ-ହଽାୀ' + 'େ-ୈୋ-ୌୗଡ଼-ଢ଼ୟ-ୡ୦-୯' + '୰ୱ୲-୷ஃஅ-ஊஎ-ஐஒ-க' + 'ங-சஜஞ-டண-தந-பம-ஹ' + 'ா-ிு-ூெ-ைொ-ௌௐௗ' + '௦-௯௰-௲ఁ-ఃఅ-ఌఎ-ఐ' + 'ఒ-నప-హఽు-ౄౘ-ౙౠ-ౡ' + '౦-౯౿ಂ-ಃಅ-ಌಎ-ಐಒ-ನ' + 'ಪ-ಳವ-ಹಽಾಿೀ-ೄೆ' + 'ೇ-ೈೊ-ೋೕ-ೖೞೠ-ೡ೦-೯' + 'ೱ-ೲം-ഃഅ-ഌഎ-ഐഒ-ഺഽ' + 'ാ-ീെ-ൈൊ-ൌൎൗൠ-ൡ' + '൦-൯൰-൵൹ൺ-ൿං-ඃඅ-ඖ' + 'ක-නඳ-රලව-ෆා-ෑෘ-ෟ' + '෦-෯ෲ-ෳ෴ก-ะา-ำเ-ๅ' + 'ๆ๏๐-๙๚-๛ກ-ຂຄງ-ຈ' + 'ຊຍດ-ທນ-ຟມ-ຣລວ' + 'ສ-ຫອ-ະາ-ຳຽເ-ໄໆ' + '໐-໙ໜ-ໟༀ༁-༃༄-༒༓༔' + '༕-༗༚-༟༠-༩༪-༳༴༶༸' + '༾-༿ཀ-ཇཉ-ཬཿ྅ྈ-ྌ' + '྾-࿅࿇-࿌࿎-࿏࿐-࿔࿕-࿘' + '࿙-࿚က-ဪါ-ာေးျ-ြဿ' + '၀-၉၊-၏ၐ-ၕၖ-ၗၚ-ၝၡ' + 'ၢ-ၤၥ-ၦၧ-ၭၮ-ၰၵ-ႁ' + 'ႃ-ႄႇ-ႌႎႏ႐-႙ႚ-ႜ' + '႞-႟Ⴀ-ჅჇჍა-ჺ჻ჼ' + 'ჽ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈ' + 'ኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅ' + 'ወ-ዖዘ-ጐጒ-ጕጘ-ፚ፠-፨' + '፩-፼ᎀ-ᎏᎠ-Ᏼᐁ-ᙬ᙭-᙮' + 'ᙯ-ᙿᚁ-ᚚᚠ-ᛪ᛫-᛭ᛮ-ᛰ' + 'ᛱ-ᛸᜀ-ᜌᜎ-ᜑᜠ-ᜱ᜵-᜶' + 'ᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳាើ-ៅ' + 'ះ-ៈ។-៖ៗ៘-៚ៜ០-៩' + '᠐-᠙ᠠ-ᡂᡃᡄ-ᡷᢀ-ᢨᢪ' + 'ᢰ-ᣵᤀ-ᤞᤣ-ᤦᤩ-ᤫᤰ-ᤱ' + 'ᤳ-ᤸ᥆-᥏ᥐ-ᥭᥰ-ᥴᦀ-ᦫ' + 'ᦰ-ᧀᧁ-ᧇᧈ-ᧉ᧐-᧙᧚ᨀ-ᨖ' + 'ᨙ-ᨚ᨞-᨟ᨠ-ᩔᩕᩗᩡᩣ-ᩤ' + 'ᩭ-ᩲ᪀-᪉᪐-᪙᪠-᪦ᪧ᪨-᪭' + 'ᬄᬅ-ᬳᬵᬻᬽ-ᭁᭃ-᭄ᭅ-ᭋ' + '᭐-᭙᭚-᭠᭡-᭪᭴-᭼ᮂᮃ-ᮠ' + 'ᮡᮦ-ᮧ᮪ᮮ-ᮯ᮰-᮹ᮺ-ᯥᯧ' + 'ᯪ-ᯬᯮ᯲-᯳᯼-᯿ᰀ-ᰣᰤ-ᰫ' + 'ᰴ-ᰵ᰻-᰿᱀-᱉ᱍ-ᱏ᱐-᱙' + 'ᱚ-ᱷᱸ-ᱽ᱾-᱿᳀-᳇᳓᳡' + 'ᳩ-ᳬᳮ-ᳱᳲ-ᳳᳵ-ᳶᴀ-ᴫ' + 'ᴬ-ᵪᵫ-ᵷᵸᵹ-ᶚᶛ-ᶿḀ-ἕ' + 'Ἐ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝ' + 'Ὗ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌ' + 'ῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ‎' + 'ⁱⁿₐ-ₜℂℇℊ-ℓℕℙ-ℝ' + 'ℤΩℨK-ℭℯ-ℴℵ-ℸℹ' + 'ℼ-ℿⅅ-ⅉⅎ⅏Ⅰ-ↂↃ-ↄ' + 'ↅ-ↈ⌶-⍺⎕⒜-ⓩ⚬⠀-⣿' + 'Ⰰ-Ⱞⰰ-ⱞⱠ-ⱻⱼ-ⱽⱾ-ⳤ' + 'Ⳬ-ⳮⳲ-ⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯ' + '⵰ⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾ' + 'ⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞ々〆〇' + '〡-〩〮-〯〱-〵〸-〺〻〼' + 'ぁ-ゖゝ-ゞゟァ-ヺー-ヾヿ' + 'ㄅ-ㄭㄱ-ㆎ㆐-㆑㆒-㆕㆖-㆟' + 'ㆠ-ㆺㇰ-ㇿ㈀-㈜㈠-㈩㈪-㉇' + '㉈-㉏㉠-㉻㉿㊀-㊉㊊-㊰㋀-㋋' + '㋐-㋾㌀-㍶㍻-㏝㏠-㏾㐀-䶵' + '一-鿌ꀀ-ꀔꀕꀖ-ꒌꓐ-ꓷꓸ-ꓽ' + '꓾-꓿ꔀ-ꘋꘌꘐ-ꘟ꘠-꘩ꘪ-ꘫ' + 'Ꙁ-ꙭꙮꚀ-ꚛꚜ-ꚝꚠ-ꛥꛦ-ꛯ' + '꛲-꛷Ꜣ-ꝯꝰꝱ-ꞇ꞉-꞊Ꞌ-ꞎ' + 'Ꞑ-ꞭꞰ-Ʇꟷꟸ-ꟹꟺꟻ-ꠁ' + 'ꠃ-ꠅꠇ-ꠊꠌ-ꠢꠣ-ꠤꠧ꠰-꠵' + '꠶-꠷ꡀ-ꡳꢀ-ꢁꢂ-ꢳꢴ-ꣃ' + '꣎-꣏꣐-꣙ꣲ-ꣷ꣸-꣺ꣻ꤀-꤉' + 'ꤊ-ꤥ꤮-꤯ꤰ-ꥆꥒ-꥓꥟ꥠ-ꥼ' + 'ꦃꦄ-ꦲꦴ-ꦵꦺ-ꦻꦽ-꧀꧁-꧍' + 'ꧏ꧐-꧙꧞-꧟ꧠ-ꧤꧦꧧ-ꧯ' + '꧰-꧹ꧺ-ꧾꨀ-ꨨꨯ-ꨰꨳ-ꨴ' + 'ꩀ-ꩂꩄ-ꩋꩍ꩐-꩙꩜-꩟ꩠ-ꩯ' + 'ꩰꩱ-ꩶ꩷-꩹ꩺꩻꩽꩾ-ꪯꪱ' + 'ꪵ-ꪶꪹ-ꪽꫀꫂꫛ-ꫜꫝ꫞-꫟' + 'ꫠ-ꫪꫫꫮ-ꫯ꫰-꫱ꫲꫳ-ꫴꫵ' + 'ꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮ' + 'ꬰ-ꭚ꭛ꭜ-ꭟꭤ-ꭥꯀ-ꯢꯣ-ꯤ' + 'ꯦ-ꯧꯩ-ꯪ꯫꯬꯰-꯹가-힣' + 'ힰ-ퟆퟋ-ퟻ-豈-舘並-龎' + 'ﬀ-ﬆﬓ-ﬗＡ-Ｚａ-ｚｦ-ｯｰ' + 'ｱ-ﾝﾞ-ﾟﾠ-ﾾￂ-ￇￊ-ￏ' + 'ￒ-ￗￚ-ￜ',

	  R: '֐־׀׃׆׈-׏א-ת׫-ׯ' + 'װ-ײ׳-״׵-׿߀-߉ߊ-ߪ' + 'ߴ-ߵߺ߻-߿ࠀ-ࠕࠚࠤࠨ' + '࠮-࠯࠰-࠾࠿ࡀ-ࡘ࡜-࡝࡞' + '࡟-࢟‏יִײַ-ﬨשׁ-זּ﬷טּ-לּ' + '﬽מּ﬿נּ-סּ﭂ףּ-פּ﭅צּ-ﭏ',

	  AL: '؈؋؍؛؜؝؞-؟ؠ-ؿـ' + 'ف-ي٭ٮ-ٯٱ-ۓ۔ەۥ-ۦ' + 'ۮ-ۯۺ-ۼ۽-۾ۿ܀-܍܎܏' + 'ܐܒ-ܯ݋-݌ݍ-ޥޱ޲-޿' + 'ࢠ-ࢲࢳ-ࣣﭐ-ﮱ﮲-﯁﯂-﯒' + 'ﯓ-ﴽ﵀-﵏ﵐ-ﶏ﶐-﶑ﶒ-ﷇ' + '﷈-﷏ﷰ-ﷻ﷼﷾-﷿ﹰ-ﹴ﹵' + 'ﹶ-ﻼ﻽-﻾'

	};

	var REGEX_STRONG = new RegExp('[' + RANGE_BY_BIDI_TYPE.L + RANGE_BY_BIDI_TYPE.R + RANGE_BY_BIDI_TYPE.AL + ']');

	var REGEX_RTL = new RegExp('[' + RANGE_BY_BIDI_TYPE.R + RANGE_BY_BIDI_TYPE.AL + ']');

	/**
	 * Returns the first strong character (has Bidi_Class value of L, R, or AL).
	 *
	 * @param str  A text block; e.g. paragraph, table cell, tag
	 * @return     A character with strong bidi direction, or null if not found
	 */
	function firstStrongChar(str) {
	  var match = REGEX_STRONG.exec(str);
	  return match == null ? null : match[0];
	}

	/**
	 * Returns the direction of a block of text, based on the direction of its
	 * first strong character (has Bidi_Class value of L, R, or AL).
	 *
	 * @param str  A text block; e.g. paragraph, table cell, tag
	 * @return     The resolved direction
	 */
	function firstStrongCharDir(str) {
	  var strongChar = firstStrongChar(str);
	  if (strongChar == null) {
	    return UnicodeBidiDirection.NEUTRAL;
	  }
	  return REGEX_RTL.exec(strongChar) ? UnicodeBidiDirection.RTL : UnicodeBidiDirection.LTR;
	}

	/**
	 * Returns the direction of a block of text, based on the direction of its
	 * first strong character (has Bidi_Class value of L, R, or AL), or a fallback
	 * direction, if no strong character is found.
	 *
	 * This function is supposed to be used in respect to Higher-Level Protocol
	 * rule HL1. (http://www.unicode.org/reports/tr9/#HL1)
	 *
	 * @param str       A text block; e.g. paragraph, table cell, tag
	 * @param fallback  Fallback direction, used if no strong direction detected
	 *                  for the block (default = NEUTRAL)
	 * @return          The resolved direction
	 */
	function resolveBlockDir(str, fallback) {
	  fallback = fallback || UnicodeBidiDirection.NEUTRAL;
	  if (!str.length) {
	    return fallback;
	  }
	  var blockDir = firstStrongCharDir(str);
	  return blockDir === UnicodeBidiDirection.NEUTRAL ? fallback : blockDir;
	}

	/**
	 * Returns the direction of a block of text, based on the direction of its
	 * first strong character (has Bidi_Class value of L, R, or AL), or a fallback
	 * direction, if no strong character is found.
	 *
	 * NOTE: This function is similar to resolveBlockDir(), but uses the global
	 * direction as the fallback, so it *always* returns a Strong direction,
	 * making it useful for integration in places that you need to make the final
	 * decision, like setting some CSS class.
	 *
	 * This function is supposed to be used in respect to Higher-Level Protocol
	 * rule HL1. (http://www.unicode.org/reports/tr9/#HL1)
	 *
	 * @param str             A text block; e.g. paragraph, table cell
	 * @param strongFallback  Fallback direction, used if no strong direction
	 *                        detected for the block (default = global direction)
	 * @return                The resolved Strong direction
	 */
	function getDirection(str, strongFallback) {
	  if (!strongFallback) {
	    strongFallback = UnicodeBidiDirection.getGlobalDir();
	  }
	  !UnicodeBidiDirection.isStrong(strongFallback) ?  true ? invariant(false, 'Fallback direction must be a strong direction') : invariant(false) : void 0;
	  return resolveBlockDir(str, strongFallback);
	}

	/**
	 * Returns true if getDirection(arguments...) returns LTR.
	 *
	 * @param str             A text block; e.g. paragraph, table cell
	 * @param strongFallback  Fallback direction, used if no strong direction
	 *                        detected for the block (default = global direction)
	 * @return                True if the resolved direction is LTR
	 */
	function isDirectionLTR(str, strongFallback) {
	  return getDirection(str, strongFallback) === UnicodeBidiDirection.LTR;
	}

	/**
	 * Returns true if getDirection(arguments...) returns RTL.
	 *
	 * @param str             A text block; e.g. paragraph, table cell
	 * @param strongFallback  Fallback direction, used if no strong direction
	 *                        detected for the block (default = global direction)
	 * @return                True if the resolved direction is RTL
	 */
	function isDirectionRTL(str, strongFallback) {
	  return getDirection(str, strongFallback) === UnicodeBidiDirection.RTL;
	}

	var UnicodeBidi = {
	  firstStrongChar: firstStrongChar,
	  firstStrongCharDir: firstStrongCharDir,
	  resolveBlockDir: resolveBlockDir,
	  getDirection: getDirection,
	  isDirectionLTR: isDirectionLTR,
	  isDirectionRTL: isDirectionRTL
	};

	module.exports = UnicodeBidi;

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */

	var isTextNode = __webpack_require__(135);

	/*eslint-disable no-bitwise */

	/**
	 * Checks if a given DOM node contains or is another DOM node.
	 */
	function containsNode(outerNode, innerNode) {
	  if (!outerNode || !innerNode) {
	    return false;
	  } else if (outerNode === innerNode) {
	    return true;
	  } else if (isTextNode(outerNode)) {
	    return false;
	  } else if (isTextNode(innerNode)) {
	    return containsNode(outerNode, innerNode.parentNode);
	  } else if ('contains' in outerNode) {
	    return outerNode.contains(innerNode);
	  } else if (outerNode.compareDocumentPosition) {
	    return !!(outerNode.compareDocumentPosition(innerNode) & 16);
	  } else {
	    return false;
	  }
	}

	module.exports = containsNode;

/***/ },
/* 57 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @typechecks
	 */

	/* eslint-disable fb-www/typeof-undefined */

	/**
	 * Same as document.activeElement but wraps in a try-catch block. In IE it is
	 * not safe to call document.activeElement if there is nothing focused.
	 *
	 * The activeElement will be null only if the document or document body is not
	 * yet defined.
	 */
	function getActiveElement() /*?DOMElement*/{
	  if (typeof document === 'undefined') {
	    return null;
	  }
	  try {
	    return document.activeElement || document.body;
	  } catch (e) {
	    return document.body;
	  }
	}

	module.exports = getActiveElement;

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule AtomicBlockUtils
	 * @typechecks
	 * 
	 */

	'use strict';

	var BlockMapBuilder = __webpack_require__(15);
	var CharacterMetadata = __webpack_require__(6);
	var ContentBlock = __webpack_require__(10);
	var DraftModifier = __webpack_require__(4);
	var EditorState = __webpack_require__(1);
	var Immutable = __webpack_require__(2);

	var generateRandomKey = __webpack_require__(7);

	var List = Immutable.List;
	var Repeat = Immutable.Repeat;


	var AtomicBlockUtils = {
	  insertAtomicBlock: function insertAtomicBlock(editorState, entityKey, character) {
	    var contentState = editorState.getCurrentContent();
	    var selectionState = editorState.getSelection();

	    var afterRemoval = DraftModifier.removeRange(contentState, selectionState, 'backward');

	    var targetSelection = afterRemoval.getSelectionAfter();
	    var afterSplit = DraftModifier.splitBlock(afterRemoval, targetSelection);
	    var insertionTarget = afterSplit.getSelectionAfter();

	    var asAtomicBlock = DraftModifier.setBlockType(afterSplit, insertionTarget, 'atomic');

	    var charData = CharacterMetadata.create({ entity: entityKey });

	    var fragmentArray = [new ContentBlock({
	      key: generateRandomKey(),
	      type: 'atomic',
	      text: character,
	      characterList: List(Repeat(charData, character.length))
	    }), new ContentBlock({
	      key: generateRandomKey(),
	      type: 'unstyled',
	      text: '',
	      characterList: List()
	    })];

	    var fragment = BlockMapBuilder.createFromArray(fragmentArray);

	    var withAtomicBlock = DraftModifier.replaceWithFragment(asAtomicBlock, insertionTarget, fragment);

	    var newContent = withAtomicBlock.merge({
	      selectionBefore: selectionState,
	      selectionAfter: withAtomicBlock.getSelectionAfter().set('hasFocus', true)
	    });

	    return EditorState.push(editorState, newContent, 'insert-fragment');
	  }
	};

	module.exports = AtomicBlockUtils;

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule CompositeDraftDecorator
	 * @typechecks
	 * 
	 */

	'use strict';

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Immutable = __webpack_require__(2);

	var List = Immutable.List;


	var DELIMITER = '.';

	/**
	 * A CompositeDraftDecorator traverses through a list of DraftDecorator
	 * instances to identify sections of a ContentBlock that should be rendered
	 * in a "decorated" manner. For example, hashtags, mentions, and links may
	 * be intended to stand out visually, be rendered as anchors, etc.
	 *
	 * The list of decorators supplied to the constructor will be used in the
	 * order they are provided. This allows the caller to specify a priority for
	 * string matching, in case of match collisions among decorators.
	 *
	 * For instance, I may have a link with a `#` in its text. Though this section
	 * of text may match our hashtag decorator, it should not be treated as a
	 * hashtag. I should therefore list my link DraftDecorator
	 * before my hashtag DraftDecorator when constructing this composite
	 * decorator instance.
	 *
	 * Thus, when a collision like this is encountered, the earlier match is
	 * preserved and the new match is discarded.
	 */

	var CompositeDraftDecorator = function () {
	  function CompositeDraftDecorator(decorators) {
	    _classCallCheck(this, CompositeDraftDecorator);

	    // Copy the decorator array, since we use this array order to determine
	    // precedence of decoration matching. If the array is mutated externally,
	    // we don't want to be affected here.
	    this._decorators = decorators.slice();
	  }

	  CompositeDraftDecorator.prototype.getDecorations = function getDecorations(block) {
	    var decorations = Array(block.getText().length).fill(null);

	    this._decorators.forEach(function ( /*object*/decorator, /*number*/ii) {
	      var counter = 0;
	      var strategy = decorator.strategy;
	      strategy(block, function ( /*number*/start, /*number*/end) {
	        // Find out if any of our matching range is already occupied
	        // by another decorator. If so, discard the match. Otherwise, store
	        // the component key for rendering.
	        if (canOccupySlice(decorations, start, end)) {
	          occupySlice(decorations, start, end, ii + DELIMITER + counter);
	          counter++;
	        }
	      });
	    });

	    return List(decorations);
	  };

	  CompositeDraftDecorator.prototype.getComponentForKey = function getComponentForKey(key) {
	    var componentKey = parseInt(key.split(DELIMITER)[0], 10);
	    return this._decorators[componentKey].component;
	  };

	  CompositeDraftDecorator.prototype.getPropsForKey = function getPropsForKey(key) {
	    var componentKey = parseInt(key.split(DELIMITER)[0], 10);
	    return this._decorators[componentKey].props;
	  };

	  return CompositeDraftDecorator;
	}();

	/**
	 * Determine whether we can occupy the specified slice of the decorations
	 * array.
	 */


	function canOccupySlice(decorations, start, end) {
	  for (var ii = start; ii < end; ii++) {
	    if (decorations[ii] != null) {
	      return false;
	    }
	  }
	  return true;
	}

	/**
	 * Splice the specified component into our decoration array at the desired
	 * range.
	 */
	function occupySlice(targetArr, start, end, componentKey) {
	  for (var ii = start; ii < end; ii++) {
	    targetArr[ii] = componentKey;
	  }
	}

	module.exports = CompositeDraftDecorator;

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule ContentStateInlineStyle
	 * @typechecks
	 * 
	 */

	'use strict';

	var CharacterMetadata = __webpack_require__(6);

	var _require = __webpack_require__(2);

	var Map = _require.Map;


	var ContentStateInlineStyle = {
	  add: function add(contentState, selectionState, inlineStyle) {
	    return modifyInlineStyle(contentState, selectionState, inlineStyle, true);
	  },

	  remove: function remove(contentState, selectionState, inlineStyle) {
	    return modifyInlineStyle(contentState, selectionState, inlineStyle, false);
	  }
	};

	function modifyInlineStyle(contentState, selectionState, inlineStyle, addOrRemove) {
	  var blockMap = contentState.getBlockMap();
	  var startKey = selectionState.getStartKey();
	  var startOffset = selectionState.getStartOffset();
	  var endKey = selectionState.getEndKey();
	  var endOffset = selectionState.getEndOffset();

	  var newBlocks = blockMap.skipUntil(function (_, k) {
	    return k === startKey;
	  }).takeUntil(function (_, k) {
	    return k === endKey;
	  }).concat(Map([[endKey, blockMap.get(endKey)]])).map(function (block, blockKey) {
	    var sliceStart;
	    var sliceEnd;

	    if (startKey === endKey) {
	      sliceStart = startOffset;
	      sliceEnd = endOffset;
	    } else {
	      sliceStart = blockKey === startKey ? startOffset : 0;
	      sliceEnd = blockKey === endKey ? endOffset : block.getLength();
	    }

	    var chars = block.getCharacterList();
	    var current;
	    while (sliceStart < sliceEnd) {
	      current = chars.get(sliceStart);
	      chars = chars.set(sliceStart, addOrRemove ? CharacterMetadata.applyStyle(current, inlineStyle) : CharacterMetadata.removeStyle(current, inlineStyle));
	      sliceStart++;
	    }

	    return block.set('characterList', chars);
	  });

	  return contentState.merge({
	    blockMap: blockMap.merge(newBlocks),
	    selectionBefore: selectionState,
	    selectionAfter: selectionState
	  });
	}

	module.exports = ContentStateInlineStyle;

/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule DraftEditor.react
	 * @typechecks
	 * 
	 */

	'use strict';

	var _assign = __webpack_require__(12);

	var _extends = _assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var DefaultDraftBlockRenderMap = __webpack_require__(23);
	var DefaultDraftInlineStyle = __webpack_require__(35);
	var DraftEditorCompositionHandler = __webpack_require__(62);
	var DraftEditorContents = __webpack_require__(63);
	var DraftEditorDragHandler = __webpack_require__(64);
	var DraftEditorEditHandler = __webpack_require__(65);
	var DraftEditorPlaceholder = __webpack_require__(67);
	var EditorState = __webpack_require__(1);
	var React = __webpack_require__(13);
	var ReactDOM = __webpack_require__(18);
	var Scroll = __webpack_require__(54);
	var Style = __webpack_require__(30);
	var UserAgent = __webpack_require__(8);

	var cx = __webpack_require__(17);
	var emptyFunction = __webpack_require__(32);
	var generateRandomKey = __webpack_require__(7);
	var getDefaultKeyBinding = __webpack_require__(41);
	var nullthrows = __webpack_require__(5);
	var getScrollPosition = __webpack_require__(33);

	var isIE = UserAgent.isBrowser('IE');

	// IE does not support the `input` event on contentEditable, so we can't
	// observe spellcheck behavior.
	var allowSpellCheck = !isIE;

	// Define a set of handler objects to correspond to each possible `mode`
	// of editor behavior.
	var handlerMap = {
	  'edit': DraftEditorEditHandler,
	  'composite': DraftEditorCompositionHandler,
	  'drag': DraftEditorDragHandler,
	  'cut': null,
	  'render': null
	};

	/**
	 * `DraftEditor` is the root editor component. It composes a `contentEditable`
	 * div, and provides a wide variety of useful function props for managing the
	 * state of the editor. See `DraftEditorProps` for details.
	 */
	var DraftEditor = function (_React$Component) {
	  _inherits(DraftEditor, _React$Component);

	  function DraftEditor(props) {
	    _classCallCheck(this, DraftEditor);

	    var _this = _possibleConstructorReturn(this, _React$Component.call(this, props));

	    _this._blockSelectEvents = false;
	    _this._clipboard = null;
	    _this._guardAgainstRender = false;
	    _this._handler = null;
	    _this._dragCount = 0;
	    _this._editorKey = generateRandomKey();
	    _this._placeholderAccessibilityID = 'placeholder-' + _this._editorKey;

	    _this._onBeforeInput = _this._buildHandler('onBeforeInput');
	    _this._onBlur = _this._buildHandler('onBlur');
	    _this._onCharacterData = _this._buildHandler('onCharacterData');
	    _this._onCompositionEnd = _this._buildHandler('onCompositionEnd');
	    _this._onCompositionStart = _this._buildHandler('onCompositionStart');
	    _this._onCopy = _this._buildHandler('onCopy');
	    _this._onCut = _this._buildHandler('onCut');
	    _this._onDragEnd = _this._buildHandler('onDragEnd');
	    _this._onDragOver = _this._buildHandler('onDragOver');
	    _this._onDragStart = _this._buildHandler('onDragStart');
	    _this._onDrop = _this._buildHandler('onDrop');
	    _this._onInput = _this._buildHandler('onInput');
	    _this._onFocus = _this._buildHandler('onFocus');
	    _this._onKeyDown = _this._buildHandler('onKeyDown');
	    _this._onKeyPress = _this._buildHandler('onKeyPress');
	    _this._onKeyUp = _this._buildHandler('onKeyUp');
	    _this._onMouseDown = _this._buildHandler('onMouseDown');
	    _this._onMouseUp = _this._buildHandler('onMouseUp');
	    _this._onPaste = _this._buildHandler('onPaste');
	    _this._onSelect = _this._buildHandler('onSelect');

	    // Manual binding for public and internal methods.
	    _this.focus = _this._focus.bind(_this);
	    _this.blur = _this._blur.bind(_this);
	    _this.setMode = _this._setMode.bind(_this);
	    _this.exitCurrentMode = _this._exitCurrentMode.bind(_this);
	    _this.restoreEditorDOM = _this._restoreEditorDOM.bind(_this);
	    _this.setRenderGuard = _this._setRenderGuard.bind(_this);
	    _this.removeRenderGuard = _this._removeRenderGuard.bind(_this);
	    _this.setClipboard = _this._setClipboard.bind(_this);
	    _this.getClipboard = _this._getClipboard.bind(_this);
	    _this.getEditorKey = function () {
	      return _this._editorKey;
	    };
	    _this.update = _this._update.bind(_this);
	    _this.onDragEnter = _this._onDragEnter.bind(_this);
	    _this.onDragLeave = _this._onDragLeave.bind(_this);

	    // See `_restoreEditorDOM()`.
	    _this.state = { containerKey: 0 };
	    return _this;
	  }

	  /**
	   * Build a method that will pass the event to the specified handler method.
	   * This allows us to look up the correct handler function for the current
	   * editor mode, if any has been specified.
	   */


	  /**
	   * Define proxies that can route events to the current handler.
	   */


	  DraftEditor.prototype._buildHandler = function _buildHandler(eventName) {
	    var _this2 = this;

	    return function (e) {
	      if (!_this2.props.readOnly) {
	        var method = _this2._handler && _this2._handler[eventName];
	        method && method.call(_this2, e);
	      }
	    };
	  };

	  DraftEditor.prototype._showPlaceholder = function _showPlaceholder() {
	    return !!this.props.placeholder && !this.props.editorState.isInCompositionMode() && !this.props.editorState.getCurrentContent().hasText();
	  };

	  DraftEditor.prototype._renderPlaceholder = function _renderPlaceholder() {
	    if (this._showPlaceholder()) {
	      return React.createElement(DraftEditorPlaceholder, {
	        text: nullthrows(this.props.placeholder),
	        editorState: this.props.editorState,
	        textAlignment: this.props.textAlignment,
	        accessibilityID: this._placeholderAccessibilityID
	      });
	    }
	    return null;
	  };

	  DraftEditor.prototype.render = function render() {
	    var _props = this.props;
	    var readOnly = _props.readOnly;
	    var textAlignment = _props.textAlignment;

	    var rootClass = cx({
	      'DraftEditor/root': true,
	      'DraftEditor/alignLeft': textAlignment === 'left',
	      'DraftEditor/alignRight': textAlignment === 'right',
	      'DraftEditor/alignCenter': textAlignment === 'center'
	    });

	    var contentStyle = {
	      outline: 'none',
	      whiteSpace: 'pre-wrap',
	      wordWrap: 'break-word'
	    };

	    return React.createElement(
	      'div',
	      { className: rootClass },
	      this._renderPlaceholder(),
	      React.createElement(
	        'div',
	        {
	          className: cx('DraftEditor/editorContainer'),
	          key: 'editor' + this.state.containerKey,
	          ref: 'editorContainer' },
	        React.createElement(
	          'div',
	          {
	            'aria-activedescendant': readOnly ? null : this.props.ariaActiveDescendantID,
	            'aria-autocomplete': readOnly ? null : this.props.ariaAutoComplete,
	            'aria-describedby': this._showPlaceholder() ? this._placeholderAccessibilityID : null,
	            'aria-expanded': readOnly ? null : this.props.ariaExpanded,
	            'aria-haspopup': readOnly ? null : this.props.ariaHasPopup,
	            'aria-label': this.props.ariaLabel,
	            'aria-owns': readOnly ? null : this.props.ariaOwneeID,
	            className: cx('public/DraftEditor/content'),
	            contentEditable: !readOnly,
	            'data-testid': this.props.webDriverTestID,
	            onBeforeInput: this._onBeforeInput,
	            onBlur: this._onBlur,
	            onCompositionEnd: this._onCompositionEnd,
	            onCompositionStart: this._onCompositionStart,
	            onCopy: this._onCopy,
	            onCut: this._onCut,
	            onDragEnd: this._onDragEnd,
	            onDragEnter: this.onDragEnter,
	            onDragLeave: this.onDragLeave,
	            onDragOver: this._onDragOver,
	            onDragStart: this._onDragStart,
	            onDrop: this._onDrop,
	            onFocus: this._onFocus,
	            onInput: this._onInput,
	            onKeyDown: this._onKeyDown,
	            onKeyPress: this._onKeyPress,
	            onKeyUp: this._onKeyUp,
	            onMouseUp: this._onMouseUp,
	            onPaste: this._onPaste,
	            onSelect: this._onSelect,
	            ref: 'editor',
	            role: readOnly ? null : this.props.role || 'textbox',
	            spellCheck: allowSpellCheck && this.props.spellCheck,
	            style: contentStyle,
	            suppressContentEditableWarning: true,
	            tabIndex: this.props.tabIndex },
	          React.createElement(DraftEditorContents, {
	            blockRenderMap: this.props.blockRenderMap,
	            blockRendererFn: this.props.blockRendererFn,
	            blockStyleFn: this.props.blockStyleFn,
	            customStyleMap: _extends({}, DefaultDraftInlineStyle, this.props.customStyleMap),
	            customStyleFn: this.props.customStyleFn,
	            editorKey: this._editorKey,
	            editorState: this.props.editorState
	          })
	        )
	      )
	    );
	  };

	  DraftEditor.prototype.componentDidMount = function componentDidMount() {
	    this.setMode('edit');

	    /**
	     * IE has a hardcoded "feature" that attempts to convert link text into
	     * anchors in contentEditable DOM. This breaks the editor's expectations of
	     * the DOM, and control is lost. Disable it to make IE behave.
	     * See: http://blogs.msdn.com/b/ieinternals/archive/2010/09/15/
	     * ie9-beta-minor-change-list.aspx
	     */
	    if (isIE) {
	      document.execCommand('AutoUrlDetect', false, false);
	    }
	  };

	  /**
	   * Prevent selection events from affecting the current editor state. This
	   * is mostly intended to defend against IE, which fires off `selectionchange`
	   * events regardless of whether the selection is set via the browser or
	   * programmatically. We only care about selection events that occur because
	   * of browser interaction, not re-renders and forced selections.
	   */


	  DraftEditor.prototype.componentWillUpdate = function componentWillUpdate() {
	    this._blockSelectEvents = true;
	  };

	  DraftEditor.prototype.componentDidUpdate = function componentDidUpdate() {
	    this._blockSelectEvents = false;
	  };

	  /**
	   * Used via `this.focus()`.
	   *
	   * Force focus back onto the editor node.
	   *
	   * Forcing focus causes the browser to scroll to the top of the editor, which
	   * may be undesirable when the editor is taller than the viewport. To solve
	   * this, either use a specified scroll position (in cases like `cut` behavior
	   * where it should be restored to a known position) or store the current
	   * scroll state and put it back in place after focus has been forced.
	   */


	  DraftEditor.prototype._focus = function _focus(scrollPosition) {
	    var editorState = this.props.editorState;

	    var alreadyHasFocus = editorState.getSelection().getHasFocus();
	    var editorNode = ReactDOM.findDOMNode(this.refs.editor);

	    var scrollParent = Style.getScrollParent(editorNode);

	    var _ref = scrollPosition || getScrollPosition(scrollParent);

	    var x = _ref.x;
	    var y = _ref.y;


	    editorNode.focus();
	    if (scrollParent === window) {
	      window.scrollTo(x, y);
	    } else {
	      Scroll.setTop(scrollParent, y);
	    }

	    // On Chrome and Safari, calling focus on contenteditable focuses the
	    // cursor at the first character. This is something you don't expect when
	    // you're clicking on an input element but not directly on a character.
	    // Put the cursor back where it was before the blur.
	    if (!alreadyHasFocus) {
	      this.update(EditorState.forceSelection(editorState, editorState.getSelection()));
	    }
	  };

	  DraftEditor.prototype._blur = function _blur() {
	    ReactDOM.findDOMNode(this.refs.editor).blur();
	  };

	  /**
	   * Used via `this.setMode(...)`.
	   *
	   * Set the behavior mode for the editor component. This switches the current
	   * handler module to ensure that DOM events are managed appropriately for
	   * the active mode.
	   */


	  DraftEditor.prototype._setMode = function _setMode(mode) {
	    this._handler = handlerMap[mode];
	  };

	  DraftEditor.prototype._exitCurrentMode = function _exitCurrentMode() {
	    this.setMode('edit');
	  };

	  /**
	   * Used via `this.restoreEditorDOM()`.
	   *
	   * Force a complete re-render of the editor based on the current EditorState.
	   * This is useful when we know we are going to lose control of the DOM
	   * state (cut command, IME) and we want to make sure that reconciliation
	   * occurs on a version of the DOM that is synchronized with our EditorState.
	   */


	  DraftEditor.prototype._restoreEditorDOM = function _restoreEditorDOM(scrollPosition) {
	    var _this3 = this;

	    this.setState({ containerKey: this.state.containerKey + 1 }, function () {
	      _this3._focus(scrollPosition);
	    });
	  };

	  /**
	   * Guard against rendering. Intended for use when we need to manually
	   * reset editor contents, to ensure that no outside influences lead to
	   * React reconciliation when we are in an uncertain state.
	   */


	  DraftEditor.prototype._setRenderGuard = function _setRenderGuard() {
	    this._guardAgainstRender = true;
	  };

	  DraftEditor.prototype._removeRenderGuard = function _removeRenderGuard() {
	    this._guardAgainstRender = false;
	  };

	  /**
	   * Used via `this.setClipboard(...)`.
	   *
	   * Set the clipboard state for a cut/copy event.
	   */


	  DraftEditor.prototype._setClipboard = function _setClipboard(clipboard) {
	    this._clipboard = clipboard;
	  };

	  /**
	   * Used via `this.getClipboard()`.
	   *
	   * Retrieve the clipboard state for a cut/copy event.
	   */


	  DraftEditor.prototype._getClipboard = function _getClipboard() {
	    return this._clipboard;
	  };

	  /**
	   * Used via `this.update(...)`.
	   *
	   * Propagate a new `EditorState` object to higher-level components. This is
	   * the method by which event handlers inform the `DraftEditor` component of
	   * state changes. A component that composes a `DraftEditor` **must** provide
	   * an `onChange` prop to receive state updates passed along from this
	   * function.
	   */


	  DraftEditor.prototype._update = function _update(editorState) {
	    this.props.onChange(editorState);
	  };

	  /**
	   * Used in conjunction with `_onDragLeave()`, by counting the number of times
	   * a dragged element enters and leaves the editor (or any of its children),
	   * to determine when the dragged element absolutely leaves the editor.
	   */


	  DraftEditor.prototype._onDragEnter = function _onDragEnter() {
	    this._dragCount++;
	  };

	  /**
	   * See `_onDragEnter()`.
	   */


	  DraftEditor.prototype._onDragLeave = function _onDragLeave() {
	    this._dragCount--;
	    if (this._dragCount === 0) {
	      this.exitCurrentMode();
	    }
	  };

	  return DraftEditor;
	}(React.Component);

	DraftEditor.defaultProps = {
	  blockRenderMap: DefaultDraftBlockRenderMap,
	  blockRendererFn: emptyFunction.thatReturnsNull,
	  blockStyleFn: emptyFunction.thatReturns(''),
	  keyBindingFn: getDefaultKeyBinding,
	  readOnly: false,
	  spellCheck: false,
	  stripPastedStyles: false
	};


	module.exports = DraftEditor;

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule DraftEditorCompositionHandler
	 * 
	 */

	'use strict';

	var DraftModifier = __webpack_require__(4);
	var EditorState = __webpack_require__(1);
	var Keys = __webpack_require__(29);

	var getEntityKeyForSelection = __webpack_require__(26);
	var isSelectionAtLeafStart = __webpack_require__(50);

	/**
	 * Millisecond delay to allow `compositionstart` to fire again upon
	 * `compositionend`.
	 *
	 * This is used for Korean input to ensure that typing can continue without
	 * the editor trying to render too quickly. More specifically, Safari 7.1+
	 * triggers `compositionstart` a little slower than Chrome/FF, which
	 * leads to composed characters being resolved and re-render occurring
	 * sooner than we want.
	 */
	var RESOLVE_DELAY = 20;

	/**
	 * A handful of variables used to track the current composition and its
	 * resolution status. These exist at the module level because it is not
	 * possible to have compositions occurring in multiple editors simultaneously,
	 * and it simplifies state management with respect to the DraftEditor component.
	 */
	var resolved = false;
	var stillComposing = false;
	var textInputData = '';

	var DraftEditorCompositionHandler = {
	  onBeforeInput: function onBeforeInput(e) {
	    textInputData = (textInputData || '') + e.data;
	  },

	  /**
	   * A `compositionstart` event has fired while we're still in composition
	   * mode. Continue the current composition session to prevent a re-render.
	   */
	  onCompositionStart: function onCompositionStart() {
	    stillComposing = true;
	  },

	  /**
	   * Attempt to end the current composition session.
	   *
	   * Defer handling because browser will still insert the chars into active
	   * element after `compositionend`. If a `compositionstart` event fires
	   * before `resolveComposition` executes, our composition session will
	   * continue.
	   *
	   * The `resolved` flag is useful because certain IME interfaces fire the
	   * `compositionend` event multiple times, thus queueing up multiple attempts
	   * at handling the composition. Since handling the same composition event
	   * twice could break the DOM, we only use the first event. Example: Arabic
	   * Google Input Tools on Windows 8.1 fires `compositionend` three times.
	   */
	  onCompositionEnd: function onCompositionEnd() {
	    var _this = this;

	    resolved = false;
	    stillComposing = false;
	    setTimeout(function () {
	      if (!resolved) {
	        DraftEditorCompositionHandler.resolveComposition.call(_this);
	      }
	    }, RESOLVE_DELAY);
	  },

	  /**
	   * In Safari, keydown events may fire when committing compositions. If
	   * the arrow keys are used to commit, prevent default so that the cursor
	   * doesn't move, otherwise it will jump back noticeably on re-render.
	   */
	  onKeyDown: function onKeyDown(e) {
	    if (e.which === Keys.RIGHT || e.which === Keys.LEFT) {
	      e.preventDefault();
	    }
	  },

	  /**
	   * Keypress events may fire when committing compositions. In Firefox,
	   * pressing RETURN commits the composition and inserts extra newline
	   * characters that we do not want. `preventDefault` allows the composition
	   * to be committed while preventing the extra characters.
	   */
	  onKeyPress: function onKeyPress(e) {
	    if (e.which === Keys.RETURN) {
	      e.preventDefault();
	    }
	  },

	  /**
	   * Attempt to insert composed characters into the document.
	   *
	   * If we are still in a composition session, do nothing. Otherwise, insert
	   * the characters into the document and terminate the composition session.
	   *
	   * If no characters were composed -- for instance, the user
	   * deleted all composed characters and committed nothing new --
	   * force a re-render. We also re-render when the composition occurs
	   * at the beginning of a leaf, to ensure that if the browser has
	   * created a new text node for the composition, we will discard it.
	   *
	   * Resetting innerHTML will move focus to the beginning of the editor,
	   * so we update to force it back to the correct place.
	   */
	  resolveComposition: function resolveComposition() {
	    if (stillComposing) {
	      return;
	    }

	    resolved = true;
	    var composedChars = textInputData;
	    textInputData = '';

	    var editorState = EditorState.set(this.props.editorState, {
	      inCompositionMode: false
	    });

	    var currentStyle = editorState.getCurrentInlineStyle();
	    var entityKey = getEntityKeyForSelection(editorState.getCurrentContent(), editorState.getSelection());

	    var mustReset = !composedChars || isSelectionAtLeafStart(editorState) || currentStyle.size > 0 || entityKey !== null;

	    if (mustReset) {
	      this.restoreEditorDOM();
	    }

	    this.exitCurrentMode();
	    this.removeRenderGuard();

	    if (composedChars) {
	      // If characters have been composed, re-rendering with the update
	      // is sufficient to reset the editor.
	      var contentState = DraftModifier.replaceText(editorState.getCurrentContent(), editorState.getSelection(), composedChars, currentStyle, entityKey);
	      this.update(EditorState.push(editorState, contentState, 'insert-characters'));
	      return;
	    }

	    if (mustReset) {
	      this.update(EditorState.set(editorState, {
	        nativelyRenderedContent: null,
	        forceSelection: true
	      }));
	    }
	  }
	};

	module.exports = DraftEditorCompositionHandler;

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule DraftEditorContents.react
	 * @typechecks
	 * 
	 */

	'use strict';

	var _assign = __webpack_require__(12);

	var _extends = _assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var DraftEditorBlock = __webpack_require__(36);
	var DraftOffsetKey = __webpack_require__(19);
	var EditorState = __webpack_require__(1);
	var React = __webpack_require__(13);

	var cx = __webpack_require__(17);
	var joinClasses = __webpack_require__(136);
	var nullthrows = __webpack_require__(5);

	/**
	 * `DraftEditorContents` is the container component for all block components
	 * rendered for a `DraftEditor`. It is optimized to aggressively avoid
	 * re-rendering blocks whenever possible.
	 *
	 * This component is separate from `DraftEditor` because certain props
	 * (for instance, ARIA props) must be allowed to update without affecting
	 * the contents of the editor.
	 */
	var DraftEditorContents = function (_React$Component) {
	  _inherits(DraftEditorContents, _React$Component);

	  function DraftEditorContents() {
	    _classCallCheck(this, DraftEditorContents);

	    return _possibleConstructorReturn(this, _React$Component.apply(this, arguments));
	  }

	  DraftEditorContents.prototype.shouldComponentUpdate = function shouldComponentUpdate(nextProps) {
	    var prevEditorState = this.props.editorState;
	    var nextEditorState = nextProps.editorState;

	    var prevDirectionMap = prevEditorState.getDirectionMap();
	    var nextDirectionMap = nextEditorState.getDirectionMap();

	    // Text direction has changed for one or more blocks. We must re-render.
	    if (prevDirectionMap !== nextDirectionMap) {
	      return true;
	    }

	    var didHaveFocus = prevEditorState.getSelection().getHasFocus();
	    var nowHasFocus = nextEditorState.getSelection().getHasFocus();

	    if (didHaveFocus !== nowHasFocus) {
	      return true;
	    }

	    var nextNativeContent = nextEditorState.getNativelyRenderedContent();

	    var wasComposing = prevEditorState.isInCompositionMode();
	    var nowComposing = nextEditorState.isInCompositionMode();

	    // If the state is unchanged or we're currently rendering a natively
	    // rendered state, there's nothing new to be done.
	    if (prevEditorState === nextEditorState || nextNativeContent !== null && nextEditorState.getCurrentContent() === nextNativeContent || wasComposing && nowComposing) {
	      return false;
	    }

	    var prevContent = prevEditorState.getCurrentContent();
	    var nextContent = nextEditorState.getCurrentContent();
	    var prevDecorator = prevEditorState.getDecorator();
	    var nextDecorator = nextEditorState.getDecorator();
	    return wasComposing !== nowComposing || prevContent !== nextContent || prevDecorator !== nextDecorator || nextEditorState.mustForceSelection();
	  };

	  DraftEditorContents.prototype.render = function render() {
	    var _props = this.props;
	    var blockRenderMap = _props.blockRenderMap;
	    var blockRendererFn = _props.blockRendererFn;
	    var customStyleMap = _props.customStyleMap;
	    var customStyleFn = _props.customStyleFn;
	    var editorState = _props.editorState;


	    var content = editorState.getCurrentContent();
	    var selection = editorState.getSelection();
	    var forceSelection = editorState.mustForceSelection();
	    var decorator = editorState.getDecorator();
	    var directionMap = nullthrows(editorState.getDirectionMap());

	    var blocksAsArray = content.getBlocksAsArray();
	    var blocks = [];
	    var currentWrapperElement = null;
	    var currentWrapperTemplate = null;
	    var currentDepth = null;
	    var currentWrappedBlocks = void 0;
	    var block = void 0,
	        key = void 0,
	        blockType = void 0,
	        child = void 0,
	        childProps = void 0,
	        wrapperTemplate = void 0;

	    for (var ii = 0; ii < blocksAsArray.length; ii++) {
	      block = blocksAsArray[ii];
	      key = block.getKey();
	      blockType = block.getType();

	      var customRenderer = blockRendererFn(block);
	      var CustomComponent = void 0,
	          customProps = void 0,
	          customEditable = void 0;
	      if (customRenderer) {
	        CustomComponent = customRenderer.component;
	        customProps = customRenderer.props;
	        customEditable = customRenderer.editable;
	      }

	      var direction = directionMap.get(key);
	      var offsetKey = DraftOffsetKey.encode(key, 0, 0);
	      var componentProps = {
	        block: block,
	        blockProps: customProps,
	        customStyleMap: customStyleMap,
	        customStyleFn: customStyleFn,
	        decorator: decorator,
	        direction: direction,
	        forceSelection: forceSelection,
	        key: key,
	        offsetKey: offsetKey,
	        selection: selection,
	        tree: editorState.getBlockTree(key)
	      };

	      var configForType = blockRenderMap.get(blockType);

	      wrapperTemplate = configForType.wrapper;

	      var useNewWrapper = wrapperTemplate !== currentWrapperTemplate;

	      var _Element = configForType.element || blockRenderMap.get('unstyled').element;

	      var depth = block.getDepth();
	      var className = this.props.blockStyleFn(block);

	      // List items are special snowflakes, since we handle nesting and
	      // counters manually.
	      if (_Element === 'li') {
	        var shouldResetCount = useNewWrapper || currentDepth === null || depth > currentDepth;
	        className = joinClasses(className, getListItemClasses(blockType, depth, shouldResetCount, direction));
	      }

	      var Component = CustomComponent || DraftEditorBlock;
	      childProps = {
	        className: className,
	        'data-block': true,
	        'data-editor': this.props.editorKey,
	        'data-offset-key': offsetKey,
	        key: key
	      };
	      if (customEditable !== undefined) {
	        childProps = _extends({}, childProps, {
	          contentEditable: customEditable,
	          suppressContentEditableWarning: true
	        });
	      }

	      child = React.createElement(_Element, childProps, React.createElement(Component, componentProps));

	      if (wrapperTemplate) {
	        if (useNewWrapper) {
	          currentWrappedBlocks = [];
	          currentWrapperElement = React.cloneElement(wrapperTemplate, {
	            key: key + '-wrap',
	            'data-offset-key': offsetKey
	          }, currentWrappedBlocks);
	          currentWrapperTemplate = wrapperTemplate;
	          blocks.push(currentWrapperElement);
	        }
	        currentDepth = block.getDepth();
	        nullthrows(currentWrappedBlocks).push(child);
	      } else {
	        currentWrappedBlocks = null;
	        currentWrapperElement = null;
	        currentWrapperTemplate = null;
	        currentDepth = null;
	        blocks.push(child);
	      }
	    }

	    return React.createElement(
	      'div',
	      { 'data-contents': 'true' },
	      blocks
	    );
	  };

	  return DraftEditorContents;
	}(React.Component);

	/**
	 * Provide default styling for list items. This way, lists will be styled with
	 * proper counters and indentation even if the caller does not specify
	 * their own styling at all. If more than five levels of nesting are needed,
	 * the necessary CSS classes can be provided via `blockStyleFn` configuration.
	 */


	function getListItemClasses(type, depth, shouldResetCount, direction) {
	  return cx({
	    'public/DraftStyleDefault/unorderedListItem': type === 'unordered-list-item',
	    'public/DraftStyleDefault/orderedListItem': type === 'ordered-list-item',
	    'public/DraftStyleDefault/reset': shouldResetCount,
	    'public/DraftStyleDefault/depth0': depth === 0,
	    'public/DraftStyleDefault/depth1': depth === 1,
	    'public/DraftStyleDefault/depth2': depth === 2,
	    'public/DraftStyleDefault/depth3': depth === 3,
	    'public/DraftStyleDefault/depth4': depth === 4,
	    'public/DraftStyleDefault/listLTR': direction === 'LTR',
	    'public/DraftStyleDefault/listRTL': direction === 'RTL'
	  });
	}

	module.exports = DraftEditorContents;

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule DraftEditorDragHandler
	 * @typechecks
	 * 
	 */

	'use strict';

	var DataTransfer = __webpack_require__(53);
	var DraftModifier = __webpack_require__(4);
	var EditorState = __webpack_require__(1);

	var findAncestorOffsetKey = __webpack_require__(25);
	var getTextContentFromFiles = __webpack_require__(47);
	var getUpdatedSelectionState = __webpack_require__(48);
	var nullthrows = __webpack_require__(5);

	/**
	 * Get a SelectionState for the supplied mouse event.
	 */
	function getSelectionForEvent(event, editorState) {
	  var node = null;
	  var offset = null;

	  if (document.caretRangeFromPoint) {
	    var dropRange = document.caretRangeFromPoint(event.x, event.y);
	    node = dropRange.startContainer;
	    offset = dropRange.startOffset;
	  } else if (event.rangeParent) {
	    node = event.rangeParent;
	    offset = event.rangeOffset;
	  } else {
	    return null;
	  }

	  node = nullthrows(node);
	  offset = nullthrows(offset);
	  var offsetKey = nullthrows(findAncestorOffsetKey(node));

	  return getUpdatedSelectionState(editorState, offsetKey, offset, offsetKey, offset);
	}

	var DraftEditorDragHandler = {
	  /**
	   * Drag originating from input terminated.
	   */
	  onDragEnd: function onDragEnd() {
	    this.exitCurrentMode();
	  },

	  /**
	   * Handle data being dropped.
	   */
	  onDrop: function onDrop(e) {
	    var _this = this;

	    var data = new DataTransfer(e.nativeEvent.dataTransfer);

	    var editorState = this.props.editorState;
	    var dropSelection = getSelectionForEvent(e.nativeEvent, editorState);

	    e.preventDefault();
	    this.exitCurrentMode();

	    if (dropSelection == null) {
	      return;
	    }

	    var files = data.getFiles();
	    if (files.length > 0) {
	      if (this.props.handleDroppedFiles && this.props.handleDroppedFiles(dropSelection, files)) {
	        return;
	      }

	      getTextContentFromFiles(files, function (fileText) {
	        fileText && _this.update(insertTextAtSelection(editorState, nullthrows(dropSelection), // flow wtf
	        fileText));
	      });
	      return;
	    }

	    var dragType = this._internalDrag ? 'internal' : 'external';
	    if (this.props.handleDrop && this.props.handleDrop(dropSelection, data, dragType)) {
	      return;
	    }

	    if (this._internalDrag) {
	      this.update(moveText(editorState, dropSelection));
	      return;
	    }

	    this.update(insertTextAtSelection(editorState, dropSelection, data.getText()));
	  }

	};

	function moveText(editorState, targetSelection) {
	  var newContentState = DraftModifier.moveText(editorState.getCurrentContent(), editorState.getSelection(), targetSelection);
	  return EditorState.push(editorState, newContentState, 'insert-fragment');
	}

	/**
	 * Insert text at a specified selection.
	 */
	function insertTextAtSelection(editorState, selection, text) {
	  var newContentState = DraftModifier.insertText(editorState.getCurrentContent(), selection, text, editorState.getCurrentInlineStyle());
	  return EditorState.push(editorState, newContentState, 'insert-fragment');
	}

	module.exports = DraftEditorDragHandler;

/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule DraftEditorEditHandler
	 * 
	 */

	'use strict';

	var onBeforeInput = __webpack_require__(82);
	var onBlur = __webpack_require__(83);
	var onCompositionStart = __webpack_require__(84);
	var onCopy = __webpack_require__(85);
	var onCut = __webpack_require__(86);
	var onDragOver = __webpack_require__(87);
	var onDragStart = __webpack_require__(88);
	var onFocus = __webpack_require__(89);
	var onInput = __webpack_require__(90);
	var onKeyDown = __webpack_require__(91);
	var onPaste = __webpack_require__(92);
	var onSelect = __webpack_require__(93);

	var DraftEditorEditHandler = {
	  onBeforeInput: onBeforeInput,
	  onBlur: onBlur,
	  onCompositionStart: onCompositionStart,
	  onCopy: onCopy,
	  onCut: onCut,
	  onDragOver: onDragOver,
	  onDragStart: onDragStart,
	  onFocus: onFocus,
	  onInput: onInput,
	  onKeyDown: onKeyDown,
	  onPaste: onPaste,
	  onSelect: onSelect
	};

	module.exports = DraftEditorEditHandler;

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule DraftEditorLeaf.react
	 * @typechecks
	 * 
	 */

	'use strict';

	var _assign = __webpack_require__(12);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var DraftEditorTextNode = __webpack_require__(68);
	var React = __webpack_require__(13);
	var ReactDOM = __webpack_require__(18);
	var SelectionState = __webpack_require__(14);

	var setDraftEditorSelection = __webpack_require__(116);

	/**
	 * All leaf nodes in the editor are spans with single text nodes. Leaf
	 * elements are styled based on the merging of an optional custom style map
	 * and a default style map.
	 *
	 * `DraftEditorLeaf` also provides a wrapper for calling into the imperative
	 * DOM Selection API. In this way, top-level components can declaratively
	 * maintain the selection state.
	 */
	var DraftEditorLeaf = function (_React$Component) {
	  _inherits(DraftEditorLeaf, _React$Component);

	  function DraftEditorLeaf() {
	    _classCallCheck(this, DraftEditorLeaf);

	    return _possibleConstructorReturn(this, _React$Component.apply(this, arguments));
	  }

	  /**
	   * By making individual leaf instances aware of their context within
	   * the text of the editor, we can set our selection range more
	   * easily than we could in the non-React world.
	   *
	   * Note that this depends on our maintaining tight control over the
	   * DOM structure of the TextEditor component. If leaves had multiple
	   * text nodes, this would be harder.
	   */
	  DraftEditorLeaf.prototype._setSelection = function _setSelection() {
	    var selection = this.props.selection;

	    // If selection state is irrelevant to the parent block, no-op.

	    if (selection == null || !selection.getHasFocus()) {
	      return;
	    }

	    var _props = this.props;
	    var blockKey = _props.blockKey;
	    var start = _props.start;
	    var text = _props.text;

	    var end = start + text.length;
	    if (!selection.hasEdgeWithin(blockKey, start, end)) {
	      return;
	    }

	    // Determine the appropriate target node for selection. If the child
	    // is not a text node, it is a <br /> spacer. In this case, use the
	    // <span> itself as the selection target.
	    var node = ReactDOM.findDOMNode(this);
	    var child = node.firstChild;
	    var targetNode = void 0;

	    if (child.nodeType === Node.TEXT_NODE) {
	      targetNode = child;
	    } else if (child.tagName === 'BR') {
	      targetNode = node;
	    } else {
	      targetNode = child.firstChild;
	    }

	    setDraftEditorSelection(selection, targetNode, blockKey, start, end);
	  };

	  DraftEditorLeaf.prototype.shouldComponentUpdate = function shouldComponentUpdate(nextProps) {
	    return ReactDOM.findDOMNode(this.refs.leaf).textContent !== nextProps.text || nextProps.styleSet !== this.props.styleSet || nextProps.forceSelection;
	  };

	  DraftEditorLeaf.prototype.componentDidUpdate = function componentDidUpdate() {
	    this._setSelection();
	  };

	  DraftEditorLeaf.prototype.componentDidMount = function componentDidMount() {
	    this._setSelection();
	  };

	  DraftEditorLeaf.prototype.render = function render() {
	    var text = this.props.text;

	    // If the leaf is at the end of its block and ends in a soft newline, append
	    // an extra line feed character. Browsers collapse trailing newline
	    // characters, which leaves the cursor in the wrong place after a
	    // shift+enter. The extra character repairs this.

	    if (text.endsWith('\n') && this.props.isLast) {
	      text += '\n';
	    }

	    var _props2 = this.props;
	    var customStyleMap = _props2.customStyleMap;
	    var customStyleFn = _props2.customStyleFn;
	    var offsetKey = _props2.offsetKey;
	    var styleSet = _props2.styleSet;

	    var styleObj = styleSet.reduce(function (map, styleName) {
	      var mergedStyles = {};
	      var style = customStyleMap[styleName];

	      if (style !== undefined && map.textDecoration !== style.textDecoration) {
	        // .trim() is necessary for IE9/10/11 and Edge
	        mergedStyles.textDecoration = [map.textDecoration, style.textDecoration].join(' ').trim();
	      }

	      return _assign(map, style, mergedStyles);
	    }, {});

	    if (customStyleFn) {
	      var newStyles = customStyleFn(styleSet);
	      styleObj = _assign(styleObj, newStyles);
	    }

	    return React.createElement(
	      'span',
	      {
	        'data-offset-key': offsetKey,
	        ref: 'leaf',
	        style: styleObj },
	      React.createElement(
	        DraftEditorTextNode,
	        null,
	        text
	      )
	    );
	  };

	  return DraftEditorLeaf;
	}(React.Component);

	module.exports = DraftEditorLeaf;

/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule DraftEditorPlaceholder.react
	 * @typechecks
	 * 
	 */

	'use strict';

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var React = __webpack_require__(13);

	var cx = __webpack_require__(17);

	/**
	 * This component is responsible for rendering placeholder text for the
	 * `DraftEditor` component.
	 *
	 * Override placeholder style via CSS.
	 */
	var DraftEditorPlaceholder = function (_React$Component) {
	  _inherits(DraftEditorPlaceholder, _React$Component);

	  function DraftEditorPlaceholder() {
	    _classCallCheck(this, DraftEditorPlaceholder);

	    return _possibleConstructorReturn(this, _React$Component.apply(this, arguments));
	  }

	  DraftEditorPlaceholder.prototype.shouldComponentUpdate = function shouldComponentUpdate(nextProps) {
	    return this.props.text !== nextProps.text || this.props.editorState.getSelection().getHasFocus() !== nextProps.editorState.getSelection().getHasFocus();
	  };

	  DraftEditorPlaceholder.prototype.render = function render() {
	    var hasFocus = this.props.editorState.getSelection().getHasFocus();

	    var className = cx({
	      'public/DraftEditorPlaceholder/root': true,
	      'public/DraftEditorPlaceholder/hasFocus': hasFocus
	    });

	    return React.createElement(
	      'div',
	      { className: className },
	      React.createElement(
	        'div',
	        {
	          className: cx('public/DraftEditorPlaceholder/inner'),
	          id: this.props.accessibilityID },
	        this.props.text
	      )
	    );
	  };

	  return DraftEditorPlaceholder;
	}(React.Component);

	module.exports = DraftEditorPlaceholder;

/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule DraftEditorTextNode.react
	 * @typechecks
	 * 
	 */

	'use strict';

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var React = __webpack_require__(13);
	var ReactDOM = __webpack_require__(18);
	var UserAgent = __webpack_require__(8);

	// In IE, spans with <br> tags render as two newlines. By rendering a span
	// with only a newline character, we can be sure to render a single line.
	var useNewlineChar = UserAgent.isBrowser('IE <= 11');

	/**
	 * Check whether the node should be considered a newline.
	 */
	function isNewline(node) {
	  return useNewlineChar ? node.textContent === '\n' : node.tagName === 'BR';
	}

	/**
	 * Placeholder elements for empty text content.
	 *
	 * What is this `data-text` attribute, anyway? It turns out that we need to
	 * put an attribute on the lowest-level text node in order to preserve correct
	 * spellcheck handling. If the <span> is naked, Chrome and Safari may do
	 * bizarre things to do the DOM -- split text nodes, create extra spans, etc.
	 * If the <span> has an attribute, this appears not to happen.
	 * See http://jsfiddle.net/9khdavod/ for the failure case, and
	 * http://jsfiddle.net/7pg143f7/ for the fixed case.
	 */
	var NEWLINE_A = useNewlineChar ? React.createElement(
	  'span',
	  { key: 'A', 'data-text': 'true' },
	  '\n'
	) : React.createElement('br', { key: 'A', 'data-text': 'true' });

	var NEWLINE_B = useNewlineChar ? React.createElement(
	  'span',
	  { key: 'B', 'data-text': 'true' },
	  '\n'
	) : React.createElement('br', { key: 'B', 'data-text': 'true' });

	/**
	 * The lowest-level component in a `DraftEditor`, the text node component
	 * replaces the default React text node implementation. This allows us to
	 * perform custom handling of newline behavior and avoid re-rendering text
	 * nodes with DOM state that already matches the expectations of our immutable
	 * editor state.
	 */
	var DraftEditorTextNode = function (_React$Component) {
	  _inherits(DraftEditorTextNode, _React$Component);

	  function DraftEditorTextNode(props) {
	    _classCallCheck(this, DraftEditorTextNode);

	    var _this = _possibleConstructorReturn(this, _React$Component.call(this, props));

	    _this._forceFlag = false;
	    return _this;
	  }

	  DraftEditorTextNode.prototype.shouldComponentUpdate = function shouldComponentUpdate(nextProps) {
	    var node = ReactDOM.findDOMNode(this);
	    var shouldBeNewline = nextProps.children === '';
	    if (shouldBeNewline) {
	      return !isNewline(node);
	    }
	    return node.textContent !== nextProps.children;
	  };

	  DraftEditorTextNode.prototype.componentWillUpdate = function componentWillUpdate() {
	    // By flipping this flag, we also keep flipping keys which forces
	    // React to remount this node every time it rerenders.
	    this._forceFlag = !this._forceFlag;
	  };

	  DraftEditorTextNode.prototype.render = function render() {
	    if (this.props.children === '') {
	      return this._forceFlag ? NEWLINE_A : NEWLINE_B;
	    }
	    return React.createElement(
	      'span',
	      { key: this._forceFlag ? 'A' : 'B', 'data-text': 'true' },
	      this.props.children
	    );
	  };

	  return DraftEditorTextNode;
	}(React.Component);

	module.exports = DraftEditorTextNode;

/***/ },
/* 69 */
/***/ function(module, exports) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule DraftEntitySegments
	 * @typechecks
	 * 
	 */

	'use strict';

	/**
	 * Identify the range to delete from a segmented entity.
	 *
	 * Rules:
	 *
	 *  Example: 'John F. Kennedy'
	 *
	 *   - Deletion from within any non-whitespace (i.e. ['John', 'F.', 'Kennedy'])
	 *     will return the range of that text.
	 *
	 *       'John F. Kennedy' -> 'John F.'
	 *                  ^
	 *
	 *   - Forward deletion of whitespace will remove the following section:
	 *
	 *       'John F. Kennedy' -> 'John Kennedy'
	 *            ^
	 *
	 *   - Backward deletion of whitespace will remove the previous section:
	 *
	 *       'John F. Kennedy' -> 'F. Kennedy'
	 *            ^
	 */
	var DraftEntitySegments = {
	  getRemovalRange: function getRemovalRange(selectionStart, selectionEnd, text, entityStart, direction) {
	    var segments = text.split(' ');
	    segments = segments.map(function ( /*string*/segment, /*number*/ii) {
	      if (direction === 'forward') {
	        if (ii > 0) {
	          return ' ' + segment;
	        }
	      } else if (ii < segments.length - 1) {
	        return segment + ' ';
	      }
	      return segment;
	    });

	    var segmentStart = entityStart;
	    var segmentEnd;
	    var segment;
	    var removalStart = null;
	    var removalEnd = null;

	    for (var jj = 0; jj < segments.length; jj++) {
	      segment = segments[jj];
	      segmentEnd = segmentStart + segment.length;

	      // Our selection overlaps this segment.
	      if (selectionStart < segmentEnd && segmentStart < selectionEnd) {
	        if (removalStart !== null) {
	          removalEnd = segmentEnd;
	        } else {
	          removalStart = segmentStart;
	          removalEnd = segmentEnd;
	        }
	      } else if (removalStart !== null) {
	        break;
	      }

	      segmentStart = segmentEnd;
	    }

	    var entityEnd = entityStart + text.length;
	    var atStart = removalStart === entityStart;
	    var atEnd = removalEnd === entityEnd;

	    if (!atStart && atEnd || atStart && !atEnd) {
	      if (direction === 'forward') {
	        if (removalEnd !== entityEnd) {
	          removalEnd++;
	        }
	      } else if (removalStart !== entityStart) {
	        removalStart--;
	      }
	    }

	    return {
	      start: removalStart,
	      end: removalEnd
	    };
	  }
	};

	module.exports = DraftEntitySegments;

/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule DraftPasteProcessor
	 * @typechecks
	 * 
	 */

	'use strict';

	var CharacterMetadata = __webpack_require__(6);
	var ContentBlock = __webpack_require__(10);
	var Immutable = __webpack_require__(2);

	var convertFromHTMLtoContentBlocks = __webpack_require__(40);
	var generateRandomKey = __webpack_require__(7);
	var getSafeBodyFromHTML = __webpack_require__(45);
	var sanitizeDraftText = __webpack_require__(28);

	var List = Immutable.List;
	var Repeat = Immutable.Repeat;


	var DraftPasteProcessor = {
	  processHTML: function processHTML(html, blockRenderMap) {
	    return convertFromHTMLtoContentBlocks(html, getSafeBodyFromHTML, blockRenderMap);
	  },
	  processText: function processText(textBlocks, character) {
	    return textBlocks.map(function (textLine) {
	      textLine = sanitizeDraftText(textLine);
	      return new ContentBlock({
	        key: generateRandomKey(),
	        type: 'unstyled',
	        text: textLine,
	        characterList: List(Repeat(character, textLine.length))
	      });
	    });
	  }
	};

	module.exports = DraftPasteProcessor;

/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule EditorBidiService
	 * @typechecks
	 * 
	 */

	'use strict';

	var Immutable = __webpack_require__(2);
	var UnicodeBidiService = __webpack_require__(122);

	var nullthrows = __webpack_require__(5);

	var OrderedMap = Immutable.OrderedMap;


	var bidiService;

	var EditorBidiService = {
	  getDirectionMap: function getDirectionMap(content, prevBidiMap) {
	    if (!bidiService) {
	      bidiService = new UnicodeBidiService();
	    } else {
	      bidiService.reset();
	    }

	    var blockMap = content.getBlockMap();
	    var nextBidi = blockMap.valueSeq().map(function (block) {
	      return nullthrows(bidiService).getDirection(block.getText());
	    });
	    var bidiMap = OrderedMap(blockMap.keySeq().zip(nextBidi));

	    if (prevBidiMap != null && Immutable.is(prevBidiMap, bidiMap)) {
	      return prevBidiMap;
	    }

	    return bidiMap;
	  }
	};

	module.exports = EditorBidiService;

/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule RichTextEditorUtil
	 * @typechecks
	 * 
	 */

	'use strict';

	var DraftEntity = __webpack_require__(9);
	var DraftModifier = __webpack_require__(4);
	var EditorState = __webpack_require__(1);
	var SelectionState = __webpack_require__(14);

	var adjustBlockDepthForContentState = __webpack_require__(74);
	var nullthrows = __webpack_require__(5);

	var RichTextEditorUtil = {
	  currentBlockContainsLink: function currentBlockContainsLink(editorState) {
	    var selection = editorState.getSelection();
	    return editorState.getCurrentContent().getBlockForKey(selection.getAnchorKey()).getCharacterList().slice(selection.getStartOffset(), selection.getEndOffset()).some(function (v) {
	      var entity = v.getEntity();
	      return !!entity && DraftEntity.get(entity).getType() === 'LINK';
	    });
	  },

	  getCurrentBlockType: function getCurrentBlockType(editorState) {
	    var selection = editorState.getSelection();
	    return editorState.getCurrentContent().getBlockForKey(selection.getStartKey()).getType();
	  },

	  getDataObjectForLinkURL: function getDataObjectForLinkURL(uri) {
	    return { url: uri.toString() };
	  },

	  handleKeyCommand: function handleKeyCommand(editorState, command) {
	    switch (command) {
	      case 'bold':
	        return RichTextEditorUtil.toggleInlineStyle(editorState, 'BOLD');
	      case 'italic':
	        return RichTextEditorUtil.toggleInlineStyle(editorState, 'ITALIC');
	      case 'underline':
	        return RichTextEditorUtil.toggleInlineStyle(editorState, 'UNDERLINE');
	      case 'code':
	        return RichTextEditorUtil.toggleCode(editorState);
	      case 'backspace':
	      case 'backspace-word':
	      case 'backspace-to-start-of-line':
	        return RichTextEditorUtil.onBackspace(editorState);
	      case 'delete':
	      case 'delete-word':
	      case 'delete-to-end-of-block':
	        return RichTextEditorUtil.onDelete(editorState);
	      default:
	        return null;
	    }
	  },

	  insertSoftNewline: function insertSoftNewline(editorState) {
	    var contentState = DraftModifier.insertText(editorState.getCurrentContent(), editorState.getSelection(), '\n', editorState.getCurrentInlineStyle(), null);

	    var newEditorState = EditorState.push(editorState, contentState, 'insert-characters');

	    return EditorState.forceSelection(newEditorState, contentState.getSelectionAfter());
	  },

	  /**
	   * For collapsed selections at the start of styled blocks, backspace should
	   * just remove the existing style.
	   */
	  onBackspace: function onBackspace(editorState) {
	    var selection = editorState.getSelection();
	    if (!selection.isCollapsed() || selection.getAnchorOffset() || selection.getFocusOffset()) {
	      return null;
	    }

	    // First, try to remove a preceding atomic block.
	    var content = editorState.getCurrentContent();
	    var startKey = selection.getStartKey();
	    var blockBefore = content.getBlockBefore(startKey);

	    if (blockBefore && blockBefore.getType() === 'atomic') {
	      var atomicBlockTarget = selection.merge({
	        anchorKey: blockBefore.getKey(),
	        anchorOffset: 0
	      });
	      var asCurrentStyle = DraftModifier.setBlockType(content, atomicBlockTarget, content.getBlockForKey(startKey).getType());
	      var withoutAtomicBlock = DraftModifier.removeRange(asCurrentStyle, atomicBlockTarget, 'backward');
	      if (withoutAtomicBlock !== content) {
	        return EditorState.push(editorState, withoutAtomicBlock, 'remove-range');
	      }
	    }

	    // If that doesn't succeed, try to remove the current block style.
	    var withoutBlockStyle = RichTextEditorUtil.tryToRemoveBlockStyle(editorState);

	    if (withoutBlockStyle) {
	      return EditorState.push(editorState, withoutBlockStyle, 'change-block-type');
	    }

	    return null;
	  },

	  onDelete: function onDelete(editorState) {
	    var selection = editorState.getSelection();
	    if (!selection.isCollapsed()) {
	      return null;
	    }

	    var content = editorState.getCurrentContent();
	    var startKey = selection.getStartKey();
	    var block = content.getBlockForKey(startKey);
	    var length = block.getLength();

	    // The cursor is somewhere within the text. Behave normally.
	    if (selection.getStartOffset() < length) {
	      return null;
	    }

	    var blockAfter = content.getBlockAfter(startKey);

	    if (!blockAfter || blockAfter.getType() !== 'atomic') {
	      return null;
	    }

	    var atomicBlockTarget = selection.merge({
	      focusKey: blockAfter.getKey(),
	      focusOffset: blockAfter.getLength()
	    });

	    var withoutAtomicBlock = DraftModifier.removeRange(content, atomicBlockTarget, 'forward');

	    if (withoutAtomicBlock !== content) {
	      return EditorState.push(editorState, withoutAtomicBlock, 'remove-range');
	    }

	    return null;
	  },

	  onTab: function onTab(event, editorState, maxDepth) {
	    var selection = editorState.getSelection();
	    var key = selection.getAnchorKey();
	    if (key !== selection.getFocusKey()) {
	      return editorState;
	    }

	    var content = editorState.getCurrentContent();
	    var block = content.getBlockForKey(key);
	    var type = block.getType();
	    if (type !== 'unordered-list-item' && type !== 'ordered-list-item') {
	      return editorState;
	    }

	    event.preventDefault();

	    // Only allow indenting one level beyond the block above, and only if
	    // the block above is a list item as well.
	    var blockAbove = content.getBlockBefore(key);
	    if (!blockAbove) {
	      return editorState;
	    }

	    var typeAbove = blockAbove.getType();
	    if (typeAbove !== 'unordered-list-item' && typeAbove !== 'ordered-list-item') {
	      return editorState;
	    }

	    var depth = block.getDepth();
	    if (!event.shiftKey && depth === maxDepth) {
	      return editorState;
	    }

	    maxDepth = Math.min(blockAbove.getDepth() + 1, maxDepth);

	    var withAdjustment = adjustBlockDepthForContentState(content, selection, event.shiftKey ? -1 : 1, maxDepth);

	    return EditorState.push(editorState, withAdjustment, 'adjust-depth');
	  },

	  toggleBlockType: function toggleBlockType(editorState, blockType) {
	    var selection = editorState.getSelection();
	    var startKey = selection.getStartKey();
	    var endKey = selection.getEndKey();
	    var content = editorState.getCurrentContent();
	    var target = selection;

	    // Triple-click can lead to a selection that includes offset 0 of the
	    // following block. The `SelectionState` for this case is accurate, but
	    // we should avoid toggling block type for the trailing block because it
	    // is a confusing interaction.
	    if (startKey !== endKey && selection.getEndOffset() === 0) {
	      var blockBefore = nullthrows(content.getBlockBefore(endKey));
	      endKey = blockBefore.getKey();
	      target = target.merge({
	        anchorKey: startKey,
	        anchorOffset: selection.getStartOffset(),
	        focusKey: endKey,
	        focusOffset: blockBefore.getLength(),
	        isBackward: false
	      });
	    }

	    var hasAtomicBlock = content.getBlockMap().skipWhile(function (_, k) {
	      return k !== startKey;
	    }).takeWhile(function (_, k) {
	      return k !== endKey;
	    }).some(function (v) {
	      return v.getType() === 'atomic';
	    });

	    if (hasAtomicBlock) {
	      return editorState;
	    }

	    var typeToSet = content.getBlockForKey(startKey).getType() === blockType ? 'unstyled' : blockType;

	    return EditorState.push(editorState, DraftModifier.setBlockType(content, target, typeToSet), 'change-block-type');
	  },

	  toggleCode: function toggleCode(editorState) {
	    var selection = editorState.getSelection();
	    var anchorKey = selection.getAnchorKey();
	    var focusKey = selection.getFocusKey();

	    if (selection.isCollapsed() || anchorKey !== focusKey) {
	      return RichTextEditorUtil.toggleBlockType(editorState, 'code-block');
	    }

	    return RichTextEditorUtil.toggleInlineStyle(editorState, 'CODE');
	  },

	  /**
	   * Toggle the specified inline style for the selection. If the
	   * user's selection is collapsed, apply or remove the style for the
	   * internal state. If it is not collapsed, apply the change directly
	   * to the document state.
	   */
	  toggleInlineStyle: function toggleInlineStyle(editorState, inlineStyle) {
	    var selection = editorState.getSelection();
	    var currentStyle = editorState.getCurrentInlineStyle();

	    // If the selection is collapsed, toggle the specified style on or off and
	    // set the result as the new inline style override. This will then be
	    // used as the inline style for the next character to be inserted.
	    if (selection.isCollapsed()) {
	      return EditorState.setInlineStyleOverride(editorState, currentStyle.has(inlineStyle) ? currentStyle.remove(inlineStyle) : currentStyle.add(inlineStyle));
	    }

	    // If characters are selected, immediately apply or remove the
	    // inline style on the document state itself.
	    var content = editorState.getCurrentContent();
	    var newContent;

	    // If the style is already present for the selection range, remove it.
	    // Otherwise, apply it.
	    if (currentStyle.has(inlineStyle)) {
	      newContent = DraftModifier.removeInlineStyle(content, selection, inlineStyle);
	    } else {
	      newContent = DraftModifier.applyInlineStyle(content, selection, inlineStyle);
	    }

	    return EditorState.push(editorState, newContent, 'change-inline-style');
	  },

	  toggleLink: function toggleLink(editorState, targetSelection, entityKey) {
	    var withoutLink = DraftModifier.applyEntity(editorState.getCurrentContent(), targetSelection, entityKey);

	    return EditorState.push(editorState, withoutLink, 'apply-entity');
	  },

	  /**
	   * When a collapsed cursor is at the start of an empty styled block, allow
	   * certain key commands (newline, backspace) to simply change the
	   * style of the block instead of the default behavior.
	   */
	  tryToRemoveBlockStyle: function tryToRemoveBlockStyle(editorState) {
	    var selection = editorState.getSelection();
	    var offset = selection.getAnchorOffset();
	    if (selection.isCollapsed() && offset === 0) {
	      var key = selection.getAnchorKey();
	      var content = editorState.getCurrentContent();
	      var block = content.getBlockForKey(key);
	      if (block.getLength() > 0) {
	        return null;
	      }

	      var type = block.getType();
	      var blockBefore = content.getBlockBefore(key);
	      if (type === 'code-block' && blockBefore && blockBefore.getType() === 'code-block') {
	        return null;
	      }

	      if (type !== 'unstyled') {
	        return DraftModifier.setBlockType(content, selection, 'unstyled');
	      }
	    }
	    return null;
	  }
	};

	module.exports = RichTextEditorUtil;

/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule SecondaryClipboard
	 * 
	 */

	'use strict';

	var DraftModifier = __webpack_require__(4);
	var EditorState = __webpack_require__(1);

	var getContentStateFragment = __webpack_require__(21);
	var nullthrows = __webpack_require__(5);

	var clipboard = null;

	/**
	 * Some systems offer a "secondary" clipboard to allow quick internal cut
	 * and paste behavior. For instance, Ctrl+K (cut) and Ctrl+Y (paste).
	 */
	var SecondaryClipboard = {
	  cut: function cut(editorState) {
	    var content = editorState.getCurrentContent();
	    var selection = editorState.getSelection();
	    var targetRange = null;

	    if (selection.isCollapsed()) {
	      var anchorKey = selection.getAnchorKey();
	      var blockEnd = content.getBlockForKey(anchorKey).getLength();

	      if (blockEnd === selection.getAnchorOffset()) {
	        return editorState;
	      }

	      targetRange = selection.set('focusOffset', blockEnd);
	    } else {
	      targetRange = selection;
	    }

	    targetRange = nullthrows(targetRange);
	    clipboard = getContentStateFragment(content, targetRange);

	    var afterRemoval = DraftModifier.removeRange(content, targetRange, 'forward');

	    if (afterRemoval === content) {
	      return editorState;
	    }

	    return EditorState.push(editorState, afterRemoval, 'remove-range');
	  },

	  paste: function paste(editorState) {
	    if (!clipboard) {
	      return editorState;
	    }

	    var newContent = DraftModifier.replaceWithFragment(editorState.getCurrentContent(), editorState.getSelection(), clipboard);

	    return EditorState.push(editorState, newContent, 'insert-fragment');
	  }
	};

	module.exports = SecondaryClipboard;

/***/ },
/* 74 */
/***/ function(module, exports) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule adjustBlockDepthForContentState
	 * @typechecks
	 * 
	 */

	'use strict';

	function adjustBlockDepthForContentState(contentState, selectionState, adjustment, maxDepth) {
	  var startKey = selectionState.getStartKey();
	  var endKey = selectionState.getEndKey();
	  var blockMap = contentState.getBlockMap();
	  var blocks = blockMap.toSeq().skipUntil(function (_, k) {
	    return k === startKey;
	  }).takeUntil(function (_, k) {
	    return k === endKey;
	  }).concat([[endKey, blockMap.get(endKey)]]).map(function (block) {
	    var depth = block.getDepth() + adjustment;
	    depth = Math.max(0, Math.min(depth, maxDepth));
	    return block.set('depth', depth);
	  });

	  blockMap = blockMap.merge(blocks);

	  return contentState.merge({
	    blockMap: blockMap,
	    selectionBefore: selectionState,
	    selectionAfter: selectionState
	  });
	}

	module.exports = adjustBlockDepthForContentState;

/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule applyEntityToContentBlock
	 * @typechecks
	 * 
	 */

	'use strict';

	var CharacterMetadata = __webpack_require__(6);

	function applyEntityToContentBlock(contentBlock, start, end, entityKey) {
	  var characterList = contentBlock.getCharacterList();
	  while (start < end) {
	    characterList = characterList.set(start, CharacterMetadata.applyEntity(characterList.get(start), entityKey));
	    start++;
	  }
	  return contentBlock.set('characterList', characterList);
	}

	module.exports = applyEntityToContentBlock;

/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule applyEntityToContentState
	 * @typechecks
	 * 
	 */

	'use strict';

	var Immutable = __webpack_require__(2);

	var applyEntityToContentBlock = __webpack_require__(75);

	function applyEntityToContentState(contentState, selectionState, entityKey) {
	  var blockMap = contentState.getBlockMap();
	  var startKey = selectionState.getStartKey();
	  var startOffset = selectionState.getStartOffset();
	  var endKey = selectionState.getEndKey();
	  var endOffset = selectionState.getEndOffset();

	  var newBlocks = blockMap.skipUntil(function (_, k) {
	    return k === startKey;
	  }).takeUntil(function (_, k) {
	    return k === endKey;
	  }).toOrderedMap().merge(Immutable.OrderedMap([[endKey, blockMap.get(endKey)]])).map(function (block, blockKey) {
	    var sliceStart = blockKey === startKey ? startOffset : 0;
	    var sliceEnd = blockKey === endKey ? endOffset : block.getLength();
	    return applyEntityToContentBlock(block, sliceStart, sliceEnd, entityKey);
	  });

	  return contentState.merge({
	    blockMap: blockMap.merge(newBlocks),
	    selectionBefore: selectionState,
	    selectionAfter: selectionState
	  });
	}

	module.exports = applyEntityToContentState;

/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule convertFromDraftStateToRaw
	 * 
	 */

	'use strict';

	var DraftEntity = __webpack_require__(9);
	var DraftStringKey = __webpack_require__(39);

	var encodeEntityRanges = __webpack_require__(94);
	var encodeInlineStyleRanges = __webpack_require__(95);

	function convertFromDraftStateToRaw(contentState) {
	  var entityStorageKey = 0;
	  var entityStorageMap = {};
	  var rawBlocks = [];

	  contentState.getBlockMap().forEach(function (block, blockKey) {
	    block.findEntityRanges(function (character) {
	      return character.getEntity() !== null;
	    }, function (start) {
	      // Stringify to maintain order of otherwise numeric keys.
	      var stringifiedEntityKey = DraftStringKey.stringify(block.getEntityAt(start));
	      if (!entityStorageMap.hasOwnProperty(stringifiedEntityKey)) {
	        entityStorageMap[stringifiedEntityKey] = '' + entityStorageKey++;
	      }
	    });

	    rawBlocks.push({
	      key: blockKey,
	      text: block.getText(),
	      type: block.getType(),
	      depth: canHaveDepth(block) ? block.getDepth() : 0,
	      inlineStyleRanges: encodeInlineStyleRanges(block),
	      entityRanges: encodeEntityRanges(block, entityStorageMap),
	      data: block.getData().toObject()
	    });
	  });

	  // Flip storage map so that our storage keys map to global
	  // DraftEntity keys.
	  var entityKeys = Object.keys(entityStorageMap);
	  var flippedStorageMap = {};
	  entityKeys.forEach(function (key, jj) {
	    var entity = DraftEntity.get(DraftStringKey.unstringify(key));
	    flippedStorageMap[jj] = {
	      type: entity.getType(),
	      mutability: entity.getMutability(),
	      data: entity.getData()
	    };
	  });

	  return {
	    entityMap: flippedStorageMap,
	    blocks: rawBlocks
	  };
	}

	function canHaveDepth(block) {
	  var type = block.getType();
	  return type === 'ordered-list-item' || type === 'unordered-list-item';
	}

	module.exports = convertFromDraftStateToRaw;

/***/ },
/* 78 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule convertFromRawToDraftState
	 * 
	 */

	'use strict';

	var _assign = __webpack_require__(12);

	var _extends = _assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var ContentBlock = __webpack_require__(10);
	var ContentState = __webpack_require__(22);
	var DraftEntity = __webpack_require__(9);
	var Immutable = __webpack_require__(2);

	var createCharacterList = __webpack_require__(79);
	var decodeEntityRanges = __webpack_require__(80);
	var decodeInlineStyleRanges = __webpack_require__(81);
	var generateRandomKey = __webpack_require__(7);

	var Map = Immutable.Map;


	function convertFromRawToDraftState(rawState) {
	  var blocks = rawState.blocks;
	  var entityMap = rawState.entityMap;


	  var fromStorageToLocal = {};
	  Object.keys(entityMap).forEach(function (storageKey) {
	    var encodedEntity = entityMap[storageKey];
	    var type = encodedEntity.type;
	    var mutability = encodedEntity.mutability;
	    var data = encodedEntity.data;

	    var newKey = DraftEntity.create(type, mutability, data || {});
	    fromStorageToLocal[storageKey] = newKey;
	  });

	  var contentBlocks = blocks.map(function (block) {
	    var key = block.key;
	    var type = block.type;
	    var text = block.text;
	    var depth = block.depth;
	    var inlineStyleRanges = block.inlineStyleRanges;
	    var entityRanges = block.entityRanges;
	    var data = block.data;

	    key = key || generateRandomKey();
	    depth = depth || 0;
	    inlineStyleRanges = inlineStyleRanges || [];
	    entityRanges = entityRanges || [];
	    data = Map(data);

	    var inlineStyles = decodeInlineStyleRanges(text, inlineStyleRanges);

	    // Translate entity range keys to the DraftEntity map.
	    var filteredEntityRanges = entityRanges.filter(function (range) {
	      return fromStorageToLocal.hasOwnProperty(range.key);
	    }).map(function (range) {
	      return _extends({}, range, { key: fromStorageToLocal[range.key] });
	    });

	    var entities = decodeEntityRanges(text, filteredEntityRanges);
	    var characterList = createCharacterList(inlineStyles, entities);

	    return new ContentBlock({ key: key, type: type, text: text, depth: depth, characterList: characterList, data: data });
	  });

	  return ContentState.createFromBlockArray(contentBlocks);
	}

	module.exports = convertFromRawToDraftState;

/***/ },
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule createCharacterList
	 * @typechecks
	 * 
	 */

	'use strict';

	var CharacterMetadata = __webpack_require__(6);
	var Immutable = __webpack_require__(2);

	var List = Immutable.List;


	function createCharacterList(inlineStyles, entities) {
	  var characterArray = inlineStyles.map(function (style, ii) {
	    var entity = entities[ii];
	    return CharacterMetadata.create({ style: style, entity: entity });
	  });
	  return List(characterArray);
	}

	module.exports = createCharacterList;

/***/ },
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule decodeEntityRanges
	 * @typechecks
	 * 
	 */

	'use strict';

	var UnicodeUtils = __webpack_require__(11);

	var substr = UnicodeUtils.substr;

	/**
	 * Convert to native JavaScript string lengths to determine ranges.
	 */

	function decodeEntityRanges(text, ranges) {
	  var entities = Array(text.length).fill(null);
	  if (ranges) {
	    ranges.forEach(function (range) {
	      // Using Unicode-enabled substrings converted to JavaScript lengths,
	      // fill the output array with entity keys.
	      var start = substr(text, 0, range.offset).length;
	      var end = start + substr(text, range.offset, range.length).length;
	      for (var ii = start; ii < end; ii++) {
	        entities[ii] = range.key;
	      }
	    });
	  }
	  return entities;
	}

	module.exports = decodeEntityRanges;

/***/ },
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule decodeInlineStyleRanges
	 * @typechecks
	 * 
	 */

	'use strict';

	var UnicodeUtils = __webpack_require__(11);

	var _require = __webpack_require__(2);

	var OrderedSet = _require.OrderedSet;
	var substr = UnicodeUtils.substr;


	var EMPTY_SET = OrderedSet();

	/**
	 * Convert to native JavaScript string lengths to determine ranges.
	 */
	function decodeInlineStyleRanges(text, ranges) {
	  var styles = Array(text.length).fill(EMPTY_SET);
	  if (ranges) {
	    ranges.forEach(function ( /*object*/range) {
	      var cursor = substr(text, 0, range.offset).length;
	      var end = cursor + substr(text, range.offset, range.length).length;
	      while (cursor < end) {
	        styles[cursor] = styles[cursor].add(range.style);
	        cursor++;
	      }
	    });
	  }
	  return styles;
	}

	module.exports = decodeInlineStyleRanges;

/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule editOnBeforeInput
	 * 
	 */

	'use strict';

	var BlockTree = __webpack_require__(34);
	var DraftModifier = __webpack_require__(4);
	var EditorState = __webpack_require__(1);
	var UserAgent = __webpack_require__(8);

	var getEntityKeyForSelection = __webpack_require__(26);
	var isSelectionAtLeafStart = __webpack_require__(50);
	var nullthrows = __webpack_require__(5);

	// When nothing is focused, Firefox regards two characters, `'` and `/`, as
	// commands that should open and focus the "quickfind" search bar. This should
	// *never* happen while a contenteditable is focused, but as of v28, it
	// sometimes does, even when the keypress event target is the contenteditable.
	// This breaks the input. Special case these characters to ensure that when
	// they are typed, we prevent default on the event to make sure not to
	// trigger quickfind.
	var FF_QUICKFIND_CHAR = '\'';
	var FF_QUICKFIND_LINK_CHAR = '\/';
	var isFirefox = UserAgent.isBrowser('Firefox');

	function mustPreventDefaultForCharacter(character) {
	  return isFirefox && (character == FF_QUICKFIND_CHAR || character == FF_QUICKFIND_LINK_CHAR);
	}

	/**
	 * Replace the current selection with the specified text string, with the
	 * inline style and entity key applied to the newly inserted text.
	 */
	function replaceText(editorState, text, inlineStyle, entityKey) {
	  var contentState = DraftModifier.replaceText(editorState.getCurrentContent(), editorState.getSelection(), text, inlineStyle, entityKey);
	  return EditorState.push(editorState, contentState, 'insert-characters');
	}

	/**
	 * When `onBeforeInput` executes, the browser is attempting to insert a
	 * character into the editor. Apply this character data to the document,
	 * allowing native insertion if possible.
	 *
	 * Native insertion is encouraged in order to limit re-rendering and to
	 * preserve spellcheck highlighting, which disappears or flashes if re-render
	 * occurs on the relevant text nodes.
	 */
	function editOnBeforeInput(e) {
	  var chars = e.data;

	  // In some cases (ex: IE ideographic space insertion) no character data
	  // is provided. There's nothing to do when this happens.
	  if (!chars) {
	    return;
	  }

	  // Allow the top-level component to handle the insertion manually. This is
	  // useful when triggering interesting behaviors for a character insertion,
	  // Simple examples: replacing a raw text ':)' with a smile emoji or image
	  // decorator, or setting a block to be a list item after typing '- ' at the
	  // start of the block.
	  if (this.props.handleBeforeInput && this.props.handleBeforeInput(chars)) {
	    e.preventDefault();
	    return;
	  }

	  // If selection is collapsed, conditionally allow native behavior. This
	  // reduces re-renders and preserves spellcheck highlighting. If the selection
	  // is not collapsed, we will re-render.
	  var editorState = this.props.editorState;
	  var selection = editorState.getSelection();

	  if (!selection.isCollapsed()) {
	    e.preventDefault();
	    this.update(replaceText(editorState, chars, editorState.getCurrentInlineStyle(), getEntityKeyForSelection(editorState.getCurrentContent(), editorState.getSelection())));
	    return;
	  }

	  var mayAllowNative = !isSelectionAtLeafStart(editorState);
	  var newEditorState = replaceText(editorState, chars, editorState.getCurrentInlineStyle(), getEntityKeyForSelection(editorState.getCurrentContent(), editorState.getSelection()));

	  if (!mayAllowNative) {
	    e.preventDefault();
	    this.update(newEditorState);
	    return;
	  }

	  var anchorKey = selection.getAnchorKey();
	  var anchorTree = editorState.getBlockTree(anchorKey);

	  // Check the old and new "fingerprints" of the current block to determine
	  // whether this insertion requires any addition or removal of text nodes,
	  // in which case we would prevent the native character insertion.
	  var originalFingerprint = BlockTree.getFingerprint(anchorTree);
	  var newFingerprint = BlockTree.getFingerprint(newEditorState.getBlockTree(anchorKey));

	  if (mustPreventDefaultForCharacter(chars) || originalFingerprint !== newFingerprint || nullthrows(newEditorState.getDirectionMap()).get(anchorKey) !== nullthrows(editorState.getDirectionMap()).get(anchorKey)) {
	    e.preventDefault();
	  } else {
	    // The native event is allowed to occur.
	    newEditorState = EditorState.set(newEditorState, {
	      nativelyRenderedContent: newEditorState.getCurrentContent()
	    });
	  }

	  this.update(newEditorState);
	}

	module.exports = editOnBeforeInput;

/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule editOnBlur
	 * 
	 */

	'use strict';

	var EditorState = __webpack_require__(1);
	var UserAgent = __webpack_require__(8);

	var getActiveElement = __webpack_require__(57);

	var isWebKit = UserAgent.isEngine('WebKit');

	function editOnBlur(e) {
	  // Webkit has a bug in which blurring a contenteditable by clicking on
	  // other active elements will trigger the `blur` event but will not remove
	  // the DOM selection from the contenteditable. We therefore force the
	  // issue to be certain, checking whether the active element is `body`
	  // to force it when blurring occurs within the window (as opposed to
	  // clicking to another tab or window).
	  if (isWebKit && getActiveElement() === document.body) {
	    global.getSelection().removeAllRanges();
	  }

	  var editorState = this.props.editorState;
	  var currentSelection = editorState.getSelection();
	  if (!currentSelection.getHasFocus()) {
	    return;
	  }

	  var selection = currentSelection.set('hasFocus', false);
	  this.props.onBlur && this.props.onBlur(e);
	  this.update(EditorState.acceptSelection(editorState, selection));
	}

	module.exports = editOnBlur;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 84 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule editOnCompositionStart
	 * 
	 */

	'use strict';

	var EditorState = __webpack_require__(1);

	/**
	 * The user has begun using an IME input system. Switching to `composite` mode
	 * allows handling composition input and disables other edit behavior.
	 */
	function editOnCompositionStart() {
	  this.setRenderGuard();
	  this.setMode('composite');
	  this.update(EditorState.set(this.props.editorState, { inCompositionMode: true }));
	}

	module.exports = editOnCompositionStart;

/***/ },
/* 85 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule editOnCopy
	 * 
	 */

	'use strict';

	var getFragmentFromSelection = __webpack_require__(43);

	/**
	 * If we have a selection, create a ContentState fragment and store
	 * it in our internal clipboard. Subsequent paste events will use this
	 * fragment if no external clipboard data is supplied.
	 */
	function editOnCopy(e) {
	  var editorState = this.props.editorState;
	  var selection = editorState.getSelection();

	  // No selection, so there's nothing to copy.
	  if (selection.isCollapsed()) {
	    e.preventDefault();
	    return;
	  }

	  this.setClipboard(getFragmentFromSelection(this.props.editorState));
	}

	module.exports = editOnCopy;

/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule editOnCut
	 * 
	 */

	'use strict';

	var DraftModifier = __webpack_require__(4);
	var EditorState = __webpack_require__(1);
	var Style = __webpack_require__(30);

	var getFragmentFromSelection = __webpack_require__(43);
	var getScrollPosition = __webpack_require__(33);

	/**
	 * On `cut` events, native behavior is allowed to occur so that the system
	 * clipboard is set properly. This means that we need to take steps to recover
	 * the editor DOM state after the `cut` has occurred in order to maintain
	 * control of the component.
	 *
	 * In addition, we can keep a copy of the removed fragment, including all
	 * styles and entities, for use as an internal paste.
	 */
	function editOnCut(e) {
	  var _this = this;

	  var editorState = this.props.editorState;
	  var selection = editorState.getSelection();

	  // No selection, so there's nothing to cut.
	  if (selection.isCollapsed()) {
	    e.preventDefault();
	    return;
	  }

	  // Track the current scroll position so that it can be forced back in place
	  // after the editor regains control of the DOM.
	  var scrollParent = Style.getScrollParent(e.target);

	  var _getScrollPosition = getScrollPosition(scrollParent);

	  var x = _getScrollPosition.x;
	  var y = _getScrollPosition.y;


	  var fragment = getFragmentFromSelection(editorState);
	  this.setClipboard(fragment);

	  // Set `cut` mode to disable all event handling temporarily.
	  this.setRenderGuard();
	  this.setMode('cut');

	  // Let native `cut` behavior occur, then recover control.
	  setTimeout(function () {
	    _this.restoreEditorDOM({ x: x, y: y });
	    _this.removeRenderGuard();
	    _this.exitCurrentMode();
	    _this.update(removeFragment(editorState));
	  }, 0);
	}

	function removeFragment(editorState) {
	  var newContent = DraftModifier.removeRange(editorState.getCurrentContent(), editorState.getSelection(), 'forward');
	  return EditorState.push(editorState, newContent, 'remove-range');
	}

	module.exports = editOnCut;

/***/ },
/* 87 */
/***/ function(module, exports) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule editOnDragOver
	 * 
	 */

	'use strict';

	/**
	 * Drag behavior has begun from outside the editor element.
	 */

	function editOnDragOver(e) {
	  this._internalDrag = false;
	  this.setMode('drag');
	  e.preventDefault();
	}

	module.exports = editOnDragOver;

/***/ },
/* 88 */
/***/ function(module, exports) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule editOnDragStart
	 * 
	 */

	'use strict';

	/**
	 * A `dragstart` event has begun within the text editor component.
	 */

	function editOnDragStart() {
	  this._internalDrag = true;
	  this.setMode('drag');
	}

	module.exports = editOnDragStart;

/***/ },
/* 89 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule editOnFocus
	 * 
	 */

	'use strict';

	var EditorState = __webpack_require__(1);

	function editOnFocus(e) {
	  var editorState = this.props.editorState;
	  var currentSelection = editorState.getSelection();
	  if (currentSelection.getHasFocus()) {
	    return;
	  }

	  var selection = currentSelection.set('hasFocus', true);
	  this.props.onFocus && this.props.onFocus(e);

	  // When the tab containing this text editor is hidden and the user does a
	  // find-in-page in a _different_ tab, Chrome on Mac likes to forget what the
	  // selection was right after sending this focus event and (if you let it)
	  // moves the cursor back to the beginning of the editor, so we force the
	  // selection here instead of simply accepting it in order to preserve the
	  // old cursor position. See https://crbug.com/540004.
	  this.update(EditorState.forceSelection(editorState, selection));
	}

	module.exports = editOnFocus;

/***/ },
/* 90 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule editOnInput
	 * 
	 */

	'use strict';

	var DraftModifier = __webpack_require__(4);
	var DraftOffsetKey = __webpack_require__(19);
	var EditorState = __webpack_require__(1);
	var Entity = __webpack_require__(9);
	var UserAgent = __webpack_require__(8);

	var findAncestorOffsetKey = __webpack_require__(25);
	var nullthrows = __webpack_require__(5);

	var isGecko = UserAgent.isEngine('Gecko');

	var DOUBLE_NEWLINE = '\n\n';

	/**
	 * This function is intended to handle spellcheck and autocorrect changes,
	 * which occur in the DOM natively without any opportunity to observe or
	 * interpret the changes before they occur.
	 *
	 * The `input` event fires in contentEditable elements reliably for non-IE
	 * browsers, immediately after changes occur to the editor DOM. Since our other
	 * handlers override or otherwise handle cover other varieties of text input,
	 * the DOM state should match the model in all controlled input cases. Thus,
	 * when an `input` change leads to a DOM/model mismatch, the change should be
	 * due to a spellcheck change, and we can incorporate it into our model.
	 */
	function editOnInput() {
	  var domSelection = global.getSelection();

	  var anchorNode = domSelection.anchorNode;
	  var isCollapsed = domSelection.isCollapsed;

	  if (anchorNode.nodeType !== Node.TEXT_NODE) {
	    return;
	  }

	  var domText = anchorNode.textContent;
	  var editorState = this.props.editorState;

	  var offsetKey = nullthrows(findAncestorOffsetKey(anchorNode));

	  var _DraftOffsetKey$decod = DraftOffsetKey.decode(offsetKey);

	  var blockKey = _DraftOffsetKey$decod.blockKey;
	  var decoratorKey = _DraftOffsetKey$decod.decoratorKey;
	  var leafKey = _DraftOffsetKey$decod.leafKey;

	  var _editorState$getBlock = editorState.getBlockTree(blockKey).getIn([decoratorKey, 'leaves', leafKey]);

	  var start = _editorState$getBlock.start;
	  var end = _editorState$getBlock.end;


	  var content = editorState.getCurrentContent();
	  var block = content.getBlockForKey(blockKey);
	  var modelText = block.getText().slice(start, end);

	  // Special-case soft newlines here. If the DOM text ends in a soft newline,
	  // we will have manually inserted an extra soft newline in DraftEditorLeaf.
	  // We want to remove this extra newline for the purpose of our comparison
	  // of DOM and model text.
	  if (domText.endsWith(DOUBLE_NEWLINE)) {
	    domText = domText.slice(0, -1);
	  }

	  // No change -- the DOM is up to date. Nothing to do here.
	  if (domText === modelText) {
	    return;
	  }

	  var selection = editorState.getSelection();

	  // We'll replace the entire leaf with the text content of the target.
	  var targetRange = selection.merge({
	    anchorOffset: start,
	    focusOffset: end,
	    isBackward: false
	  });

	  var entityKey = block.getEntityAt(start);
	  var entity = entityKey && Entity.get(entityKey);
	  var entityType = entity && entity.getMutability();
	  var preserveEntity = entityType === 'MUTABLE';

	  // Immutable or segmented entities cannot properly be handled by the
	  // default browser undo, so we have to use a different change type to
	  // force using our internal undo method instead of falling through to the
	  // native browser undo.
	  var changeType = preserveEntity ? 'spellcheck-change' : 'apply-entity';

	  var newContent = DraftModifier.replaceText(content, targetRange, domText, block.getInlineStyleAt(start), preserveEntity ? block.getEntityAt(start) : null);

	  var anchorOffset, focusOffset, startOffset, endOffset;

	  if (isGecko) {
	    // Firefox selection does not change while the context menu is open, so
	    // we preserve the anchor and focus values of the DOM selection.
	    anchorOffset = domSelection.anchorOffset;
	    focusOffset = domSelection.focusOffset;
	    startOffset = start + Math.min(anchorOffset, focusOffset);
	    endOffset = startOffset + Math.abs(anchorOffset - focusOffset);
	    anchorOffset = startOffset;
	    focusOffset = endOffset;
	  } else {
	    // Browsers other than Firefox may adjust DOM selection while the context
	    // menu is open, and Safari autocorrect is prone to providing an inaccurate
	    // DOM selection. Don't trust it. Instead, use our existing SelectionState
	    // and adjust it based on the number of characters changed during the
	    // mutation.
	    var charDelta = domText.length - modelText.length;
	    startOffset = selection.getStartOffset();
	    endOffset = selection.getEndOffset();

	    anchorOffset = isCollapsed ? endOffset + charDelta : startOffset;
	    focusOffset = endOffset + charDelta;
	  }

	  // Segmented entities are completely or partially removed when their
	  // text content changes. For this case we do not want any text to be selected
	  // after the change, so we are not merging the selection.
	  var contentWithAdjustedDOMSelection = newContent.merge({
	    selectionBefore: content.getSelectionAfter(),
	    selectionAfter: selection.merge({ anchorOffset: anchorOffset, focusOffset: focusOffset })
	  });

	  this.update(EditorState.push(editorState, contentWithAdjustedDOMSelection, changeType));
	}

	module.exports = editOnInput;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 91 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule editOnKeyDown
	 * 
	 */

	'use strict';

	var DraftModifier = __webpack_require__(4);
	var EditorState = __webpack_require__(1);
	var KeyBindingUtil = __webpack_require__(24);
	var Keys = __webpack_require__(29);
	var SecondaryClipboard = __webpack_require__(73);
	var UserAgent = __webpack_require__(8);

	var keyCommandBackspaceToStartOfLine = __webpack_require__(104);
	var keyCommandBackspaceWord = __webpack_require__(105);
	var keyCommandDeleteWord = __webpack_require__(106);
	var keyCommandInsertNewline = __webpack_require__(107);
	var keyCommandPlainBackspace = __webpack_require__(110);
	var keyCommandPlainDelete = __webpack_require__(111);
	var keyCommandMoveSelectionToEndOfBlock = __webpack_require__(108);
	var keyCommandMoveSelectionToStartOfBlock = __webpack_require__(109);
	var keyCommandTransposeCharacters = __webpack_require__(112);
	var keyCommandUndo = __webpack_require__(113);

	var isOptionKeyCommand = KeyBindingUtil.isOptionKeyCommand;

	var isChrome = UserAgent.isBrowser('Chrome');

	/**
	 * Map a `DraftEditorCommand` command value to a corresponding function.
	 */
	function onKeyCommand(command, editorState) {
	  switch (command) {
	    case 'redo':
	      return EditorState.redo(editorState);
	    case 'delete':
	      return keyCommandPlainDelete(editorState);
	    case 'delete-word':
	      return keyCommandDeleteWord(editorState);
	    case 'backspace':
	      return keyCommandPlainBackspace(editorState);
	    case 'backspace-word':
	      return keyCommandBackspaceWord(editorState);
	    case 'backspace-to-start-of-line':
	      return keyCommandBackspaceToStartOfLine(editorState);
	    case 'split-block':
	      return keyCommandInsertNewline(editorState);
	    case 'transpose-characters':
	      return keyCommandTransposeCharacters(editorState);
	    case 'move-selection-to-start-of-block':
	      return keyCommandMoveSelectionToStartOfBlock(editorState);
	    case 'move-selection-to-end-of-block':
	      return keyCommandMoveSelectionToEndOfBlock(editorState);
	    case 'secondary-cut':
	      return SecondaryClipboard.cut(editorState);
	    case 'secondary-paste':
	      return SecondaryClipboard.paste(editorState);
	    default:
	      return editorState;
	  }
	}

	/**
	 * Intercept keydown behavior to handle keys and commands manually, if desired.
	 *
	 * Keydown combinations may be mapped to `DraftCommand` values, which may
	 * correspond to command functions that modify the editor or its contents.
	 *
	 * See `getDefaultKeyBinding` for defaults. Alternatively, the top-level
	 * component may provide a custom mapping via the `keyBindingFn` prop.
	 */
	function editOnKeyDown(e) {
	  var keyCode = e.which;
	  var editorState = this.props.editorState;

	  switch (keyCode) {
	    case Keys.RETURN:
	      e.preventDefault();
	      // The top-level component may manually handle newline insertion. If
	      // no special handling is performed, fall through to command handling.
	      if (this.props.handleReturn && this.props.handleReturn(e)) {
	        return;
	      }
	      break;
	    case Keys.ESC:
	      e.preventDefault();
	      this.props.onEscape && this.props.onEscape(e);
	      return;
	    case Keys.TAB:
	      this.props.onTab && this.props.onTab(e);
	      return;
	    case Keys.UP:
	      this.props.onUpArrow && this.props.onUpArrow(e);
	      return;
	    case Keys.DOWN:
	      this.props.onDownArrow && this.props.onDownArrow(e);
	      return;
	    case Keys.SPACE:
	      // Handling for OSX where option + space scrolls.
	      if (isChrome && isOptionKeyCommand(e)) {
	        e.preventDefault();
	        // Insert a nbsp into the editor.
	        var contentState = DraftModifier.replaceText(editorState.getCurrentContent(), editorState.getSelection(), ' ');
	        this.update(EditorState.push(editorState, contentState, 'insert-characters'));
	        return;
	      }
	  }

	  var command = this.props.keyBindingFn(e);

	  // If no command is specified, allow keydown event to continue.
	  if (!command) {
	    return;
	  }

	  if (command === 'undo') {
	    // Since undo requires some special updating behavior to keep the editor
	    // in sync, handle it separately.
	    keyCommandUndo(e, editorState, this.update);
	    return;
	  }

	  // At this point, we know that we're handling a command of some kind, so
	  // we don't want to insert a character following the keydown.
	  e.preventDefault();

	  // Allow components higher up the tree to handle the command first.
	  if (this.props.handleKeyCommand && this.props.handleKeyCommand(command)) {
	    return;
	  }

	  var newState = onKeyCommand(command, editorState);
	  if (newState !== editorState) {
	    this.update(newState);
	  }
	}

	module.exports = editOnKeyDown;

/***/ },
/* 92 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule editOnPaste
	 * 
	 */

	'use strict';

	var BlockMapBuilder = __webpack_require__(15);
	var CharacterMetadata = __webpack_require__(6);
	var DataTransfer = __webpack_require__(53);
	var DraftModifier = __webpack_require__(4);
	var DraftPasteProcessor = __webpack_require__(70);
	var EditorState = __webpack_require__(1);

	var getEntityKeyForSelection = __webpack_require__(26);
	var getTextContentFromFiles = __webpack_require__(47);
	var splitTextIntoTextBlocks = __webpack_require__(118);

	/**
	 * Paste content.
	 */
	function editOnPaste(e) {
	  var _this = this;

	  e.preventDefault();
	  var data = new DataTransfer(e.clipboardData);

	  // Get files, unless this is likely to be a string the user wants inline.
	  if (!data.isRichText()) {
	    var files = data.getFiles();
	    var defaultFileText = data.getText();
	    if (files.length > 0) {
	      // Allow customized paste handling for images, etc. Otherwise, fall
	      // through to insert text contents into the editor.
	      if (this.props.handlePastedFiles && this.props.handlePastedFiles(files)) {
	        return;
	      }

	      getTextContentFromFiles(files, function ( /*string*/fileText) {
	        fileText = fileText || defaultFileText;
	        if (!fileText) {
	          return;
	        }

	        var editorState = _this.props.editorState;

	        var blocks = splitTextIntoTextBlocks(fileText);
	        var character = CharacterMetadata.create({
	          style: editorState.getCurrentInlineStyle(),
	          entity: getEntityKeyForSelection(editorState.getCurrentContent(), editorState.getSelection())
	        });

	        var text = DraftPasteProcessor.processText(blocks, character);
	        var fragment = BlockMapBuilder.createFromArray(text);

	        var withInsertedText = DraftModifier.replaceWithFragment(editorState.getCurrentContent(), editorState.getSelection(), fragment);

	        _this.update(EditorState.push(editorState, withInsertedText, 'insert-fragment'));
	      });

	      return;
	    }
	  }

	  var textBlocks = [];
	  var text = data.getText();
	  var html = data.getHTML();

	  if (this.props.handlePastedText && this.props.handlePastedText(text, html)) {
	    return;
	  }

	  if (text) {
	    textBlocks = splitTextIntoTextBlocks(text);
	  }

	  if (!this.props.stripPastedStyles) {
	    // If the text from the paste event is rich content that matches what we
	    // already have on the internal clipboard, assume that we should just use
	    // the clipboard fragment for the paste. This will allow us to preserve
	    // styling and entities, if any are present. Note that newlines are
	    // stripped during comparison -- this is because copy/paste within the
	    // editor in Firefox and IE will not include empty lines. The resulting
	    // paste will preserve the newlines correctly.
	    var internalClipboard = this.getClipboard();
	    if (data.isRichText() && internalClipboard) {
	      if (
	      // If the editorKey is present in the pasted HTML, it should be safe to
	      // assume this is an internal paste.
	      html.indexOf(this.getEditorKey()) !== -1 ||
	      // The copy may have been made within a single block, in which case the
	      // editor key won't be part of the paste. In this case, just check
	      // whether the pasted text matches the internal clipboard.
	      textBlocks.length === 1 && internalClipboard.size === 1 && internalClipboard.first().getText() === text) {
	        this.update(insertFragment(this.props.editorState, internalClipboard));
	        return;
	      }
	    } else if (internalClipboard && data.types.includes('com.apple.webarchive') && !data.types.includes('text/html') && areTextBlocksAndClipboardEqual(textBlocks, internalClipboard)) {
	      // Safari does not properly store text/html in some cases.
	      // Use the internalClipboard if present and equal to what is on
	      // the clipboard. See https://bugs.webkit.org/show_bug.cgi?id=19893.
	      this.update(insertFragment(this.props.editorState, internalClipboard));
	      return;
	    }

	    // If there is html paste data, try to parse that.
	    if (html) {
	      var htmlFragment = DraftPasteProcessor.processHTML(html, this.props.blockRenderMap);
	      if (htmlFragment) {
	        var htmlMap = BlockMapBuilder.createFromArray(htmlFragment);
	        this.update(insertFragment(this.props.editorState, htmlMap));
	        return;
	      }
	    }

	    // Otherwise, create a new fragment from our pasted text. Also
	    // empty the internal clipboard, since it's no longer valid.
	    this.setClipboard(null);
	  }

	  if (textBlocks) {
	    var editorState = this.props.editorState;

	    var character = CharacterMetadata.create({
	      style: editorState.getCurrentInlineStyle(),
	      entity: getEntityKeyForSelection(editorState.getCurrentContent(), editorState.getSelection())
	    });

	    var textFragment = DraftPasteProcessor.processText(textBlocks, character);

	    var textMap = BlockMapBuilder.createFromArray(textFragment);
	    this.update(insertFragment(this.props.editorState, textMap));
	  }
	}

	function insertFragment(editorState, fragment) {
	  var newContent = DraftModifier.replaceWithFragment(editorState.getCurrentContent(), editorState.getSelection(), fragment);
	  return EditorState.push(editorState, newContent, 'insert-fragment');
	}

	function areTextBlocksAndClipboardEqual(textBlocks, blockMap) {
	  return textBlocks.length === blockMap.size && blockMap.valueSeq().every(function (block, ii) {
	    return block.getText() === textBlocks[ii];
	  });
	}

	module.exports = editOnPaste;

/***/ },
/* 93 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule editOnSelect
	 * 
	 */

	'use strict';

	var EditorState = __webpack_require__(1);
	var ReactDOM = __webpack_require__(18);

	var getDraftEditorSelection = __webpack_require__(98);

	function editOnSelect() {
	  if (this._blockSelectEvents) {
	    return;
	  }

	  var editorState = this.props.editorState;
	  var documentSelection = getDraftEditorSelection(editorState, ReactDOM.findDOMNode(this.refs.editorContainer).firstChild);
	  var updatedSelectionState = documentSelection.selectionState;

	  if (updatedSelectionState !== editorState.getSelection()) {
	    if (documentSelection.needsRecovery) {
	      editorState = EditorState.forceSelection(editorState, updatedSelectionState);
	    } else {
	      editorState = EditorState.acceptSelection(editorState, updatedSelectionState);
	    }
	    this.update(editorState);
	  }
	}

	module.exports = editOnSelect;

/***/ },
/* 94 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule encodeEntityRanges
	 * @typechecks
	 * 
	 */

	'use strict';

	var DraftStringKey = __webpack_require__(39);
	var UnicodeUtils = __webpack_require__(11);

	var strlen = UnicodeUtils.strlen;

	/**
	 * Convert to UTF-8 character counts for storage.
	 */

	function encodeEntityRanges(block, storageMap) {
	  var encoded = [];
	  block.findEntityRanges(function (character) {
	    return !!character.getEntity();
	  }, function ( /*number*/start, /*number*/end) {
	    var text = block.getText();
	    var key = block.getEntityAt(start);
	    encoded.push({
	      offset: strlen(text.slice(0, start)),
	      length: strlen(text.slice(start, end)),
	      // Encode the key as a number for range storage.
	      key: Number(storageMap[DraftStringKey.stringify(key)])
	    });
	  });
	  return encoded;
	}

	module.exports = encodeEntityRanges;

/***/ },
/* 95 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule encodeInlineStyleRanges
	 * 
	 */

	'use strict';

	var UnicodeUtils = __webpack_require__(11);

	var findRangesImmutable = __webpack_require__(20);

	var areEqual = function areEqual(a, b) {
	  return a === b;
	};
	var isTruthy = function isTruthy(a) {
	  return !!a;
	};
	var EMPTY_ARRAY = [];

	/**
	 * Helper function for getting encoded styles for each inline style. Convert
	 * to UTF-8 character counts for storage.
	 */
	function getEncodedInlinesForType(block, styleList, styleToEncode) {
	  var ranges = [];

	  // Obtain an array with ranges for only the specified style.
	  var filteredInlines = styleList.map(function (style) {
	    return style.has(styleToEncode);
	  }).toList();

	  findRangesImmutable(filteredInlines, areEqual,
	  // We only want to keep ranges with nonzero style values.
	  isTruthy, function (start, end) {
	    var text = block.getText();
	    ranges.push({
	      offset: UnicodeUtils.strlen(text.slice(0, start)),
	      length: UnicodeUtils.strlen(text.slice(start, end)),
	      style: styleToEncode
	    });
	  });

	  return ranges;
	}

	/*
	 * Retrieve the encoded arrays of inline styles, with each individual style
	 * treated separately.
	 */
	function encodeInlineStyleRanges(block) {
	  var styleList = block.getCharacterList().map(function (c) {
	    return c.getStyle();
	  }).toList();
	  var ranges = styleList.flatten().toSet().map(function (style) {
	    return getEncodedInlinesForType(block, styleList, style);
	  });

	  return Array.prototype.concat.apply(EMPTY_ARRAY, ranges.toJS());
	}

	module.exports = encodeInlineStyleRanges;

/***/ },
/* 96 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule expandRangeToStartOfLine
	 * @typechecks
	 * 
	 */

	var UnicodeUtils = __webpack_require__(11);

	var getRangeClientRects = __webpack_require__(44);
	var invariant = __webpack_require__(3);

	/**
	 * Return the computed line height, in pixels, for the provided element.
	 */
	function getLineHeightPx(element) {
	  var computed = getComputedStyle(element);
	  var div = document.createElement('div');
	  div.style.fontFamily = computed.fontFamily;
	  div.style.fontSize = computed.fontSize;
	  div.style.fontStyle = computed.fontStyle;
	  div.style.fontWeight = computed.fontWeight;
	  div.style.lineHeight = computed.lineHeight;
	  div.style.position = 'absolute';
	  div.textContent = 'M';

	  // forced layout here
	  document.body.appendChild(div);
	  var rect = div.getBoundingClientRect();
	  document.body.removeChild(div);

	  return rect.height;
	}

	/**
	 * Return whether every ClientRect in the provided list lies on the same line.
	 *
	 * We assume that the rects on the same line all contain the baseline, so the
	 * lowest top line needs to be above the highest bottom line (i.e., if you were
	 * to project the rects onto the y-axis, their intersection would be nonempty).
	 *
	 * In addition, we require that no two boxes are lineHeight (or more) apart at
	 * either top or bottom, which helps protect against false positives for fonts
	 * with extremely large glyph heights (e.g., with a font size of 17px, Zapfino
	 * produces rects of height 58px!).
	 */
	function areRectsOnOneLine(rects, lineHeight) {
	  var minTop = Infinity;
	  var minBottom = Infinity;
	  var maxTop = -Infinity;
	  var maxBottom = -Infinity;

	  for (var ii = 0; ii < rects.length; ii++) {
	    var rect = rects[ii];
	    if (rect.width === 0 || rect.width === 1) {
	      // When a range starts or ends a soft wrap, many browsers (Chrome, IE,
	      // Safari) include an empty rect on the previous or next line. When the
	      // text lies in a container whose position is not integral (e.g., from
	      // margin: auto), Safari makes these empty rects have width 1 (instead of
	      // 0). Having one-pixel-wide characters seems unlikely (and most browsers
	      // report widths in subpixel precision anyway) so it's relatively safe to
	      // skip over them.
	      continue;
	    }
	    minTop = Math.min(minTop, rect.top);
	    minBottom = Math.min(minBottom, rect.bottom);
	    maxTop = Math.max(maxTop, rect.top);
	    maxBottom = Math.max(maxBottom, rect.bottom);
	  }

	  return maxTop <= minBottom && maxTop - minTop < lineHeight && maxBottom - minBottom < lineHeight;
	}

	/**
	 * Return the length of a node, as used by Range offsets.
	 */
	function getNodeLength(node) {
	  // http://www.w3.org/TR/dom/#concept-node-length
	  switch (node.nodeType) {
	    case Node.DOCUMENT_TYPE_NODE:
	      return 0;
	    case Node.TEXT_NODE:
	    case Node.PROCESSING_INSTRUCTION_NODE:
	    case Node.COMMENT_NODE:
	      return node.length;
	    default:
	      return node.childNodes.length;
	  }
	}

	/**
	 * Given a collapsed range, move the start position backwards as far as
	 * possible while the range still spans only a single line.
	 */
	function expandRangeToStartOfLine(range) {
	  !range.collapsed ?  true ? invariant(false, 'expandRangeToStartOfLine: Provided range is not collapsed.') : invariant(false) : void 0;
	  range = range.cloneRange();

	  var containingElement = range.startContainer;
	  if (containingElement.nodeType !== 1) {
	    containingElement = containingElement.parentNode;
	  }
	  var lineHeight = getLineHeightPx(containingElement);

	  // Imagine our text looks like:
	  //   <div><span>once upon a time, there was a <em>boy
	  //   who lived</em> </span><q><strong>under^ the
	  //   stairs</strong> in a small closet.</q></div>
	  // where the caret represents the cursor. First, we crawl up the tree until
	  // the range spans multiple lines (setting the start point to before
	  // "<strong>", then before "<div>"), then at each level we do a search to
	  // find the latest point which is still on a previous line. We'll find that
	  // the break point is inside the span, then inside the <em>, then in its text
	  // node child, the actual break point before "who".

	  var bestContainer = range.endContainer;
	  var bestOffset = range.endOffset;
	  range.setStart(range.startContainer, 0);

	  while (areRectsOnOneLine(getRangeClientRects(range), lineHeight)) {
	    bestContainer = range.startContainer;
	    bestOffset = range.startOffset;
	    !bestContainer.parentNode ?  true ? invariant(false, 'Found unexpected detached subtree when traversing.') : invariant(false) : void 0;
	    range.setStartBefore(bestContainer);
	    if (bestContainer.nodeType === 1 && getComputedStyle(bestContainer).display !== 'inline') {
	      // The start of the line is never in a different block-level container.
	      break;
	    }
	  }

	  // In the above example, range now spans from "<div>" to "under",
	  // bestContainer is <div>, and bestOffset is 1 (index of <q> inside <div>)].
	  // Picking out which child to recurse into here is a special case since we
	  // don't want to check past <q> -- once we find that the final range starts
	  // in <span>, we can look at all of its children (and all of their children)
	  // to find the break point.

	  // At all times, (bestContainer, bestOffset) is the latest single-line start
	  // point that we know of.
	  var currentContainer = bestContainer;
	  var maxIndexToConsider = bestOffset - 1;

	  do {
	    var nodeValue = currentContainer.nodeValue;

	    for (var ii = maxIndexToConsider; ii >= 0; ii--) {
	      if (nodeValue != null && ii > 0 && UnicodeUtils.isSurrogatePair(nodeValue, ii - 1)) {
	        // We're in the middle of a surrogate pair -- skip over so we never
	        // return a range with an endpoint in the middle of a code point.
	        continue;
	      }

	      range.setStart(currentContainer, ii);
	      if (areRectsOnOneLine(getRangeClientRects(range), lineHeight)) {
	        bestContainer = currentContainer;
	        bestOffset = ii;
	      } else {
	        break;
	      }
	    }

	    if (ii === -1 || currentContainer.childNodes.length === 0) {
	      // If ii === -1, then (bestContainer, bestOffset), which is equal to
	      // (currentContainer, 0), was a single-line start point but a start
	      // point before currentContainer wasn't, so the line break seems to
	      // have occurred immediately after currentContainer's start tag
	      //
	      // If currentContainer.childNodes.length === 0, we're already at a
	      // terminal node (e.g., text node) and should return our current best.
	      break;
	    }

	    currentContainer = currentContainer.childNodes[ii];
	    maxIndexToConsider = getNodeLength(currentContainer);
	  } while (true);

	  range.setStart(bestContainer, bestOffset);
	  return range;
	}

	module.exports = expandRangeToStartOfLine;

/***/ },
/* 97 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule getCharacterRemovalRange
	 * @typechecks
	 * 
	 */

	'use strict';

	var DraftEntity = __webpack_require__(9);
	var DraftEntitySegments = __webpack_require__(69);

	var getRangesForDraftEntity = __webpack_require__(100);
	var invariant = __webpack_require__(3);

	/**
	 * Given a SelectionState and a removal direction, determine the entire range
	 * that should be removed from a ContentState. This is based on any entities
	 * within the target, with their `mutability` values taken into account.
	 *
	 * For instance, if we are attempting to remove part of an "immutable" entity
	 * range, the entire entity must be removed. The returned `SelectionState`
	 * will be adjusted accordingly.
	 */
	function getCharacterRemovalRange(block, selectionState, direction) {
	  var start = selectionState.getStartOffset();
	  var end = selectionState.getEndOffset();
	  var entityKey = block.getEntityAt(start);
	  if (!entityKey) {
	    return selectionState;
	  }

	  var entity = DraftEntity.get(entityKey);
	  var mutability = entity.getMutability();

	  // `MUTABLE` entities can just have the specified range of text removed
	  // directly. No adjustments are needed.
	  if (mutability === 'MUTABLE') {
	    return selectionState;
	  }

	  // Find the entity range that overlaps with our removal range.
	  var entityRanges = getRangesForDraftEntity(block, entityKey).filter(function (range) {
	    return start < range.end && end > range.start;
	  });

	  !(entityRanges.length == 1) ?  true ? invariant(false, 'There should only be one entity range within this removal range.') : invariant(false) : void 0;

	  var entityRange = entityRanges[0];

	  // For `IMMUTABLE` entity types, we will remove the entire entity range.
	  if (mutability === 'IMMUTABLE') {
	    return selectionState.merge({
	      anchorOffset: entityRange.start,
	      focusOffset: entityRange.end,
	      isBackward: false
	    });
	  }

	  // For `SEGMENTED` entity types, determine the appropriate segment to
	  // remove.
	  var removalRange = DraftEntitySegments.getRemovalRange(start, end, block.getText().slice(entityRange.start, entityRange.end), entityRange.start, direction);

	  return selectionState.merge({
	    anchorOffset: removalRange.start,
	    focusOffset: removalRange.end,
	    isBackward: false
	  });
	}

	module.exports = getCharacterRemovalRange;

/***/ },
/* 98 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule getDraftEditorSelection
	 * @typechecks
	 * 
	 */

	'use strict';

	var getDraftEditorSelectionWithNodes = __webpack_require__(42);

	/**
	 * Convert the current selection range to an anchor/focus pair of offset keys
	 * and values that can be interpreted by components.
	 */
	function getDraftEditorSelection(editorState, root) {
	  var selection = global.getSelection();

	  // No active selection.
	  if (selection.rangeCount === 0) {
	    return {
	      selectionState: editorState.getSelection().set('hasFocus', false),
	      needsRecovery: false
	    };
	  }

	  return getDraftEditorSelectionWithNodes(editorState, root, selection.anchorNode, selection.anchorOffset, selection.focusNode, selection.focusOffset);
	}

	module.exports = getDraftEditorSelection;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 99 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule getRangeBoundingClientRect
	 * @typechecks
	 * 
	 */

	'use strict';

	var getRangeClientRects = __webpack_require__(44);

	/**
	 * Like range.getBoundingClientRect() but normalizes for browser bugs.
	 */
	function getRangeBoundingClientRect(range) {
	  // "Return a DOMRect object describing the smallest rectangle that includes
	  // the first rectangle in list and all of the remaining rectangles of which
	  // the height or width is not zero."
	  // http://www.w3.org/TR/cssom-view/#dom-range-getboundingclientrect
	  var rects = getRangeClientRects(range);
	  var top = 0;
	  var right = 0;
	  var bottom = 0;
	  var left = 0;

	  if (rects.length) {
	    var _rects$ = rects[0];
	    top = _rects$.top;
	    right = _rects$.right;
	    bottom = _rects$.bottom;
	    left = _rects$.left;

	    for (var ii = 1; ii < rects.length; ii++) {
	      var rect = rects[ii];
	      if (rect.height !== 0 || rect.width !== 0) {
	        top = Math.min(top, rect.top);
	        right = Math.max(right, rect.right);
	        bottom = Math.max(bottom, rect.bottom);
	        left = Math.min(left, rect.left);
	      }
	    }
	  }

	  return {
	    top: top,
	    right: right,
	    bottom: bottom,
	    left: left,
	    width: right - left,
	    height: bottom - top
	  };
	}

	module.exports = getRangeBoundingClientRect;

/***/ },
/* 100 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule getRangesForDraftEntity
	 * @typechecks
	 * 
	 */

	'use strict';

	var invariant = __webpack_require__(3);

	/**
	 * Obtain the start and end positions of the range that has the
	 * specified entity applied to it.
	 *
	 * Entity keys are applied only to contiguous stretches of text, so this
	 * method searches for the first instance of the entity key and returns
	 * the subsequent range.
	 */
	function getRangesForDraftEntity(block, key) {
	  var ranges = [];
	  block.findEntityRanges(function (c) {
	    return c.getEntity() === key;
	  }, function (start, end) {
	    ranges.push({ start: start, end: end });
	  });

	  !!!ranges.length ?  true ? invariant(false, 'Entity key not found in this range.') : invariant(false) : void 0;

	  return ranges;
	}

	module.exports = getRangesForDraftEntity;

/***/ },
/* 101 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule getVisibleSelectionRect
	 * @typechecks
	 * 
	 */

	'use strict';

	var getRangeBoundingClientRect = __webpack_require__(99);

	/**
	 * Return the bounding ClientRect for the visible DOM selection, if any.
	 * In cases where there are no selected ranges or the bounding rect is
	 * temporarily invalid, return null.
	 */
	function getVisibleSelectionRect(global) {
	  var selection = global.getSelection();
	  if (!selection.rangeCount) {
	    return null;
	  }

	  var range = selection.getRangeAt(0);
	  var boundingRect = getRangeBoundingClientRect(range);
	  var top = boundingRect.top;
	  var right = boundingRect.right;
	  var bottom = boundingRect.bottom;
	  var left = boundingRect.left;

	  // When a re-render leads to a node being removed, the DOM selection will
	  // temporarily be placed on an ancestor node, which leads to an invalid
	  // bounding rect. Discard this state.

	  if (top === 0 && right === 0 && bottom === 0 && left === 0) {
	    return null;
	  }

	  return boundingRect;
	}

	module.exports = getVisibleSelectionRect;

/***/ },
/* 102 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule insertFragmentIntoContentState
	 * @typechecks
	 * 
	 */

	'use strict';

	var BlockMapBuilder = __webpack_require__(15);

	var generateRandomKey = __webpack_require__(7);
	var insertIntoList = __webpack_require__(49);
	var invariant = __webpack_require__(3);

	function insertFragmentIntoContentState(contentState, selectionState, fragment) {
	  !selectionState.isCollapsed() ?  true ? invariant(false, '`insertFragment` should only be called with a collapsed selection state.') : invariant(false) : void 0;

	  var targetKey = selectionState.getStartKey();
	  var targetOffset = selectionState.getStartOffset();

	  var blockMap = contentState.getBlockMap();

	  var fragmentSize = fragment.size;
	  var finalKey;
	  var finalOffset;

	  if (fragmentSize === 1) {
	    var targetBlock = blockMap.get(targetKey);
	    var pastedBlock = fragment.first();
	    var text = targetBlock.getText();
	    var chars = targetBlock.getCharacterList();

	    var newBlock = targetBlock.merge({
	      text: text.slice(0, targetOffset) + pastedBlock.getText() + text.slice(targetOffset),
	      characterList: insertIntoList(chars, pastedBlock.getCharacterList(), targetOffset),
	      data: pastedBlock.getData()
	    });

	    blockMap = blockMap.set(targetKey, newBlock);

	    finalKey = targetKey;
	    finalOffset = targetOffset + pastedBlock.getText().length;

	    return contentState.merge({
	      blockMap: blockMap.set(targetKey, newBlock),
	      selectionBefore: selectionState,
	      selectionAfter: selectionState.merge({
	        anchorKey: finalKey,
	        anchorOffset: finalOffset,
	        focusKey: finalKey,
	        focusOffset: finalOffset,
	        isBackward: false
	      })
	    });
	  }

	  var newBlockArr = [];

	  contentState.getBlockMap().forEach(function (block, blockKey) {
	    if (blockKey !== targetKey) {
	      newBlockArr.push(block);
	      return;
	    }

	    var text = block.getText();
	    var chars = block.getCharacterList();

	    // Modify head portion of block.
	    var blockSize = text.length;
	    var headText = text.slice(0, targetOffset);
	    var headCharacters = chars.slice(0, targetOffset);
	    var appendToHead = fragment.first();

	    var modifiedHead = block.merge({
	      text: headText + appendToHead.getText(),
	      characterList: headCharacters.concat(appendToHead.getCharacterList()),
	      type: headText ? block.getType() : appendToHead.getType(),
	      data: appendToHead.getData()
	    });

	    newBlockArr.push(modifiedHead);

	    // Insert fragment blocks after the head and before the tail.
	    fragment.slice(1, fragmentSize - 1).forEach(function (fragmentBlock) {
	      newBlockArr.push(fragmentBlock.set('key', generateRandomKey()));
	    });

	    // Modify tail portion of block.
	    var tailText = text.slice(targetOffset, blockSize);
	    var tailCharacters = chars.slice(targetOffset, blockSize);
	    var prependToTail = fragment.last();
	    finalKey = generateRandomKey();

	    var modifiedTail = prependToTail.merge({
	      key: finalKey,
	      text: prependToTail.getText() + tailText,
	      characterList: prependToTail.getCharacterList().concat(tailCharacters),
	      data: prependToTail.getData()
	    });

	    newBlockArr.push(modifiedTail);
	  });

	  finalOffset = fragment.last().getLength();

	  return contentState.merge({
	    blockMap: BlockMapBuilder.createFromArray(newBlockArr),
	    selectionBefore: selectionState,
	    selectionAfter: selectionState.merge({
	      anchorKey: finalKey,
	      anchorOffset: finalOffset,
	      focusKey: finalKey,
	      focusOffset: finalOffset,
	      isBackward: false
	    })
	  });
	}

	module.exports = insertFragmentIntoContentState;

/***/ },
/* 103 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule insertTextIntoContentState
	 * @typechecks
	 * 
	 */

	'use strict';

	var Immutable = __webpack_require__(2);

	var insertIntoList = __webpack_require__(49);
	var invariant = __webpack_require__(3);

	var Repeat = Immutable.Repeat;


	function insertTextIntoContentState(contentState, selectionState, text, characterMetadata) {
	  !selectionState.isCollapsed() ?  true ? invariant(false, '`insertText` should only be called with a collapsed range.') : invariant(false) : void 0;

	  var len = text.length;
	  if (!len) {
	    return contentState;
	  }

	  var blockMap = contentState.getBlockMap();
	  var key = selectionState.getStartKey();
	  var offset = selectionState.getStartOffset();
	  var block = blockMap.get(key);
	  var blockText = block.getText();

	  var newBlock = block.merge({
	    text: blockText.slice(0, offset) + text + blockText.slice(offset, block.getLength()),
	    characterList: insertIntoList(block.getCharacterList(), Repeat(characterMetadata, len).toList(), offset)
	  });

	  var newOffset = offset + len;

	  return contentState.merge({
	    blockMap: blockMap.set(key, newBlock),
	    selectionAfter: selectionState.merge({
	      anchorOffset: newOffset,
	      focusOffset: newOffset
	    })
	  });
	}

	module.exports = insertTextIntoContentState;

/***/ },
/* 104 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule keyCommandBackspaceToStartOfLine
	 * 
	 */

	'use strict';

	var EditorState = __webpack_require__(1);

	var expandRangeToStartOfLine = __webpack_require__(96);
	var getDraftEditorSelectionWithNodes = __webpack_require__(42);
	var moveSelectionBackward = __webpack_require__(27);
	var removeTextWithStrategy = __webpack_require__(16);

	function keyCommandBackspaceToStartOfLine(editorState) {
	  var afterRemoval = removeTextWithStrategy(editorState, function (strategyState) {
	    var selection = strategyState.getSelection();
	    if (selection.isCollapsed() && selection.getAnchorOffset() === 0) {
	      return moveSelectionBackward(strategyState, 1);
	    }

	    var domSelection = global.getSelection();
	    var range = domSelection.getRangeAt(0);
	    range = expandRangeToStartOfLine(range);

	    return getDraftEditorSelectionWithNodes(strategyState, null, range.endContainer, range.endOffset, range.startContainer, range.startOffset).selectionState;
	  }, 'backward');

	  if (afterRemoval === editorState.getCurrentContent()) {
	    return editorState;
	  }

	  return EditorState.push(editorState, afterRemoval, 'remove-range');
	}

	module.exports = keyCommandBackspaceToStartOfLine;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 105 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule keyCommandBackspaceWord
	 * 
	 */

	'use strict';

	var DraftRemovableWord = __webpack_require__(38);
	var EditorState = __webpack_require__(1);

	var moveSelectionBackward = __webpack_require__(27);
	var removeTextWithStrategy = __webpack_require__(16);

	/**
	 * Delete the word that is left of the cursor, as well as any spaces or
	 * punctuation after the word.
	 */
	function keyCommandBackspaceWord(editorState) {
	  var afterRemoval = removeTextWithStrategy(editorState, function (strategyState) {
	    var selection = strategyState.getSelection();
	    var offset = selection.getStartOffset();
	    // If there are no words before the cursor, remove the preceding newline.
	    if (offset === 0) {
	      return moveSelectionBackward(strategyState, 1);
	    }
	    var key = selection.getStartKey();
	    var content = strategyState.getCurrentContent();
	    var text = content.getBlockForKey(key).getText().slice(0, offset);
	    var toRemove = DraftRemovableWord.getBackward(text);
	    return moveSelectionBackward(strategyState, toRemove.length || 1);
	  }, 'backward');

	  if (afterRemoval === editorState.getCurrentContent()) {
	    return editorState;
	  }

	  return EditorState.push(editorState, afterRemoval, 'remove-range');
	}

	module.exports = keyCommandBackspaceWord;

/***/ },
/* 106 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule keyCommandDeleteWord
	 * 
	 */

	'use strict';

	var DraftRemovableWord = __webpack_require__(38);
	var EditorState = __webpack_require__(1);

	var moveSelectionForward = __webpack_require__(51);
	var removeTextWithStrategy = __webpack_require__(16);

	/**
	 * Delete the word that is right of the cursor, as well as any spaces or
	 * punctuation before the word.
	 */
	function keyCommandDeleteWord(editorState) {
	  var afterRemoval = removeTextWithStrategy(editorState, function (strategyState) {
	    var selection = strategyState.getSelection();
	    var offset = selection.getStartOffset();
	    var key = selection.getStartKey();
	    var content = strategyState.getCurrentContent();
	    var text = content.getBlockForKey(key).getText().slice(offset);
	    var toRemove = DraftRemovableWord.getForward(text);

	    // If there are no words in front of the cursor, remove the newline.
	    return moveSelectionForward(strategyState, toRemove.length || 1);
	  }, 'forward');

	  if (afterRemoval === editorState.getCurrentContent()) {
	    return editorState;
	  }

	  return EditorState.push(editorState, afterRemoval, 'remove-range');
	}

	module.exports = keyCommandDeleteWord;

/***/ },
/* 107 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule keyCommandInsertNewline
	 * 
	 */

	'use strict';

	var DraftModifier = __webpack_require__(4);
	var EditorState = __webpack_require__(1);

	function keyCommandInsertNewline(editorState) {
	  var contentState = DraftModifier.splitBlock(editorState.getCurrentContent(), editorState.getSelection());
	  return EditorState.push(editorState, contentState, 'split-block');
	}

	module.exports = keyCommandInsertNewline;

/***/ },
/* 108 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule keyCommandMoveSelectionToEndOfBlock
	 * 
	 */

	'use strict';

	var EditorState = __webpack_require__(1);

	/**
	 * See comment for `moveSelectionToStartOfBlock`.
	 */
	function keyCommandMoveSelectionToEndOfBlock(editorState) {
	  var selection = editorState.getSelection();
	  var endKey = selection.getEndKey();
	  var content = editorState.getCurrentContent();
	  var textLength = content.getBlockForKey(endKey).getLength();
	  return EditorState.set(editorState, {
	    selection: selection.merge({
	      anchorKey: endKey,
	      anchorOffset: textLength,
	      focusKey: endKey,
	      focusOffset: textLength,
	      isBackward: false
	    }),
	    forceSelection: true
	  });
	}

	module.exports = keyCommandMoveSelectionToEndOfBlock;

/***/ },
/* 109 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule keyCommandMoveSelectionToStartOfBlock
	 * 
	 */

	'use strict';

	var EditorState = __webpack_require__(1);

	/**
	 * Collapse selection at the start of the first selected block. This is used
	 * for Firefox versions that attempt to navigate forward/backward instead of
	 * moving the cursor. Other browsers are able to move the cursor natively.
	 */
	function keyCommandMoveSelectionToStartOfBlock(editorState) {
	  var selection = editorState.getSelection();
	  var startKey = selection.getStartKey();
	  return EditorState.set(editorState, {
	    selection: selection.merge({
	      anchorKey: startKey,
	      anchorOffset: 0,
	      focusKey: startKey,
	      focusOffset: 0,
	      isBackward: false
	    }),
	    forceSelection: true
	  });
	}

	module.exports = keyCommandMoveSelectionToStartOfBlock;

/***/ },
/* 110 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule keyCommandPlainBackspace
	 * 
	 */

	'use strict';

	var EditorState = __webpack_require__(1);
	var UnicodeUtils = __webpack_require__(11);

	var moveSelectionBackward = __webpack_require__(27);
	var removeTextWithStrategy = __webpack_require__(16);

	/**
	 * Remove the selected range. If the cursor is collapsed, remove the preceding
	 * character. This operation is Unicode-aware, so removing a single character
	 * will remove a surrogate pair properly as well.
	 */
	function keyCommandPlainBackspace(editorState) {
	  var afterRemoval = removeTextWithStrategy(editorState, function (strategyState) {
	    var selection = strategyState.getSelection();
	    var content = strategyState.getCurrentContent();
	    var key = selection.getAnchorKey();
	    var offset = selection.getAnchorOffset();
	    var charBehind = content.getBlockForKey(key).getText()[offset - 1];
	    return moveSelectionBackward(strategyState, charBehind ? UnicodeUtils.getUTF16Length(charBehind, 0) : 1);
	  }, 'backward');

	  if (afterRemoval === editorState.getCurrentContent()) {
	    return editorState;
	  }

	  var selection = editorState.getSelection();
	  return EditorState.push(editorState, afterRemoval.set('selectionBefore', selection), selection.isCollapsed() ? 'backspace-character' : 'remove-range');
	}

	module.exports = keyCommandPlainBackspace;

/***/ },
/* 111 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule keyCommandPlainDelete
	 * 
	 */

	'use strict';

	var EditorState = __webpack_require__(1);
	var UnicodeUtils = __webpack_require__(11);

	var moveSelectionForward = __webpack_require__(51);
	var removeTextWithStrategy = __webpack_require__(16);

	/**
	 * Remove the selected range. If the cursor is collapsed, remove the following
	 * character. This operation is Unicode-aware, so removing a single character
	 * will remove a surrogate pair properly as well.
	 */
	function keyCommandPlainDelete(editorState) {
	  var afterRemoval = removeTextWithStrategy(editorState, function (strategyState) {
	    var selection = strategyState.getSelection();
	    var content = strategyState.getCurrentContent();
	    var key = selection.getAnchorKey();
	    var offset = selection.getAnchorOffset();
	    var charAhead = content.getBlockForKey(key).getText()[offset];
	    return moveSelectionForward(strategyState, charAhead ? UnicodeUtils.getUTF16Length(charAhead, 0) : 1);
	  }, 'forward');

	  if (afterRemoval === editorState.getCurrentContent()) {
	    return editorState;
	  }

	  var selection = editorState.getSelection();

	  return EditorState.push(editorState, afterRemoval.set('selectionBefore', selection), selection.isCollapsed() ? 'delete-character' : 'remove-range');
	}

	module.exports = keyCommandPlainDelete;

/***/ },
/* 112 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule keyCommandTransposeCharacters
	 * 
	 */

	'use strict';

	var DraftModifier = __webpack_require__(4);
	var EditorState = __webpack_require__(1);

	var getContentStateFragment = __webpack_require__(21);

	/**
	 * Transpose the characters on either side of a collapsed cursor, or
	 * if the cursor is at the end of the block, transpose the last two
	 * characters.
	 */
	function keyCommandTransposeCharacters(editorState) {
	  var selection = editorState.getSelection();
	  if (!selection.isCollapsed()) {
	    return editorState;
	  }

	  var offset = selection.getAnchorOffset();
	  if (offset === 0) {
	    return editorState;
	  }

	  var blockKey = selection.getAnchorKey();
	  var content = editorState.getCurrentContent();
	  var block = content.getBlockForKey(blockKey);
	  var length = block.getLength();

	  // Nothing to transpose if there aren't two characters.
	  if (length <= 1) {
	    return editorState;
	  }

	  var removalRange;
	  var finalSelection;

	  if (offset === length) {
	    // The cursor is at the end of the block. Swap the last two characters.
	    removalRange = selection.set('anchorOffset', offset - 1);
	    finalSelection = selection;
	  } else {
	    removalRange = selection.set('focusOffset', offset + 1);
	    finalSelection = removalRange.set('anchorOffset', offset + 1);
	  }

	  // Extract the character to move as a fragment. This preserves its
	  // styling and entity, if any.
	  var movedFragment = getContentStateFragment(content, removalRange);
	  var afterRemoval = DraftModifier.removeRange(content, removalRange, 'backward');

	  // After the removal, the insertion target is one character back.
	  var selectionAfter = afterRemoval.getSelectionAfter();
	  var targetOffset = selectionAfter.getAnchorOffset() - 1;
	  var targetRange = selectionAfter.merge({
	    anchorOffset: targetOffset,
	    focusOffset: targetOffset
	  });

	  var afterInsert = DraftModifier.replaceWithFragment(afterRemoval, targetRange, movedFragment);

	  var newEditorState = EditorState.push(editorState, afterInsert, 'insert-fragment');

	  return EditorState.acceptSelection(newEditorState, finalSelection);
	}

	module.exports = keyCommandTransposeCharacters;

/***/ },
/* 113 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule keyCommandUndo
	 * 
	 */

	'use strict';

	var EditorState = __webpack_require__(1);

	function keyCommandUndo(e, editorState, updateFn) {
	  var undoneState = EditorState.undo(editorState);

	  // If the last change to occur was a spellcheck change, allow the undo
	  // event to fall through to the browser. This allows the browser to record
	  // the unwanted change, which should soon lead it to learn not to suggest
	  // the correction again.
	  if (editorState.getLastChangeType() === 'spellcheck-change') {
	    var nativelyRenderedContent = undoneState.getCurrentContent();
	    updateFn(EditorState.set(undoneState, { nativelyRenderedContent: nativelyRenderedContent }));
	    return;
	  }

	  // Otheriwse, manage the undo behavior manually.
	  e.preventDefault();
	  if (!editorState.getNativelyRenderedContent()) {
	    updateFn(undoneState);
	    return;
	  }

	  // Trigger a re-render with the current content state to ensure that the
	  // component tree has up-to-date props for comparison.
	  updateFn(EditorState.set(editorState, { nativelyRenderedContent: null }));

	  // Wait to ensure that the re-render has occurred before performing
	  // the undo action.
	  setTimeout(function () {
	    updateFn(undoneState);
	  }, 0);
	}

	module.exports = keyCommandUndo;

/***/ },
/* 114 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule modifyBlockForContentState
	 * @typechecks
	 * 
	 */

	'use strict';

	var Immutable = __webpack_require__(2);

	var Map = Immutable.Map;


	function modifyBlockForContentState(contentState, selectionState, operation) {
	  var startKey = selectionState.getStartKey();
	  var endKey = selectionState.getEndKey();
	  var blockMap = contentState.getBlockMap();
	  var newBlocks = blockMap.toSeq().skipUntil(function (_, k) {
	    return k === startKey;
	  }).takeUntil(function (_, k) {
	    return k === endKey;
	  }).concat(Map([[endKey, blockMap.get(endKey)]])).map(operation);

	  return contentState.merge({
	    blockMap: blockMap.merge(newBlocks),
	    selectionBefore: selectionState,
	    selectionAfter: selectionState
	  });
	}

	module.exports = modifyBlockForContentState;

/***/ },
/* 115 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule removeRangeFromContentState
	 * 
	 */

	'use strict';

	var Immutable = __webpack_require__(2);

	function removeRangeFromContentState(contentState, selectionState) {
	  if (selectionState.isCollapsed()) {
	    return contentState;
	  }

	  var blockMap = contentState.getBlockMap();
	  var startKey = selectionState.getStartKey();
	  var startOffset = selectionState.getStartOffset();
	  var endKey = selectionState.getEndKey();
	  var endOffset = selectionState.getEndOffset();

	  var startBlock = blockMap.get(startKey);
	  var endBlock = blockMap.get(endKey);
	  var characterList;

	  if (startBlock === endBlock) {
	    characterList = removeFromList(startBlock.getCharacterList(), startOffset, endOffset);
	  } else {
	    characterList = startBlock.getCharacterList().slice(0, startOffset).concat(endBlock.getCharacterList().slice(endOffset));
	  }

	  var modifiedStart = startBlock.merge({
	    text: startBlock.getText().slice(0, startOffset) + endBlock.getText().slice(endOffset),
	    characterList: characterList
	  });

	  var newBlocks = blockMap.toSeq().skipUntil(function (_, k) {
	    return k === startKey;
	  }).takeUntil(function (_, k) {
	    return k === endKey;
	  }).concat(Immutable.Map([[endKey, null]])).map(function (_, k) {
	    return k === startKey ? modifiedStart : null;
	  });

	  blockMap = blockMap.merge(newBlocks).filter(function (block) {
	    return !!block;
	  });

	  return contentState.merge({
	    blockMap: blockMap,
	    selectionBefore: selectionState,
	    selectionAfter: selectionState.merge({
	      anchorKey: startKey,
	      anchorOffset: startOffset,
	      focusKey: startKey,
	      focusOffset: startOffset,
	      isBackward: false
	    })
	  });
	}

	/**
	 * Maintain persistence for target list when removing characters on the
	 * head and tail of the character list.
	 */
	function removeFromList(targetList, startOffset, endOffset) {
	  if (startOffset === 0) {
	    while (startOffset < endOffset) {
	      targetList = targetList.shift();
	      startOffset++;
	    }
	  } else if (endOffset === targetList.count()) {
	    while (endOffset > startOffset) {
	      targetList = targetList.pop();
	      endOffset--;
	    }
	  } else {
	    var head = targetList.slice(0, startOffset);
	    var tail = targetList.slice(endOffset);
	    targetList = head.concat(tail).toList();
	  }
	  return targetList;
	}

	module.exports = removeRangeFromContentState;

/***/ },
/* 116 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule setDraftEditorSelection
	 * @typechecks
	 * 
	 */

	'use strict';

	var containsNode = __webpack_require__(56);
	var getActiveElement = __webpack_require__(57);

	/**
	 * In modern non-IE browsers, we can support both forward and backward
	 * selections.
	 *
	 * Note: IE10+ supports the Selection object, but it does not support
	 * the `extend` method, which means that even in modern IE, it's not possible
	 * to programatically create a backward selection. Thus, for all IE
	 * versions, we use the old IE API to create our selections.
	 */
	function setDraftEditorSelection(selectionState, node, blockKey, nodeStart, nodeEnd) {
	  // It's possible that the editor has been removed from the DOM but
	  // our selection code doesn't know it yet. Forcing selection in
	  // this case may lead to errors, so just bail now.
	  if (!containsNode(document.documentElement, node)) {
	    return;
	  }

	  var selection = global.getSelection();
	  var anchorKey = selectionState.getAnchorKey();
	  var anchorOffset = selectionState.getAnchorOffset();
	  var focusKey = selectionState.getFocusKey();
	  var focusOffset = selectionState.getFocusOffset();
	  var isBackward = selectionState.getIsBackward();

	  // IE doesn't support backward selection. Swap key/offset pairs.
	  if (!selection.extend && isBackward) {
	    var tempKey = anchorKey;
	    var tempOffset = anchorOffset;
	    anchorKey = focusKey;
	    anchorOffset = focusOffset;
	    focusKey = tempKey;
	    focusOffset = tempOffset;
	    isBackward = false;
	  }

	  var hasAnchor = anchorKey === blockKey && nodeStart <= anchorOffset && nodeEnd >= anchorOffset;

	  var hasFocus = focusKey === blockKey && nodeStart <= focusOffset && nodeEnd >= focusOffset;

	  // If the selection is entirely bound within this node, set the selection
	  // and be done.
	  if (hasAnchor && hasFocus) {
	    selection.removeAllRanges();
	    addPointToSelection(selection, node, anchorOffset - nodeStart);
	    addFocusToSelection(selection, node, focusOffset - nodeStart);
	    return;
	  }

	  if (!isBackward) {
	    // If the anchor is within this node, set the range start.
	    if (hasAnchor) {
	      selection.removeAllRanges();
	      addPointToSelection(selection, node, anchorOffset - nodeStart);
	    }

	    // If the focus is within this node, we can assume that we have
	    // already set the appropriate start range on the selection, and
	    // can simply extend the selection.
	    if (hasFocus) {
	      addFocusToSelection(selection, node, focusOffset - nodeStart);
	    }
	  } else {
	    // If this node has the focus, set the selection range to be a
	    // collapsed range beginning here. Later, when we encounter the anchor,
	    // we'll use this information to extend the selection.
	    if (hasFocus) {
	      selection.removeAllRanges();
	      addPointToSelection(selection, node, focusOffset - nodeStart);
	    }

	    // If this node has the anchor, we may assume that the correct
	    // focus information is already stored on the selection object.
	    // We keep track of it, reset the selection range, and extend it
	    // back to the focus point.
	    if (hasAnchor) {
	      var storedFocusNode = selection.focusNode;
	      var storedFocusOffset = selection.focusOffset;

	      selection.removeAllRanges();
	      addPointToSelection(selection, node, anchorOffset - nodeStart);
	      addFocusToSelection(selection, storedFocusNode, storedFocusOffset);
	    }
	  }
	}

	/**
	 * Extend selection towards focus point.
	 */
	function addFocusToSelection(selection, node, offset) {
	  if (selection.extend && containsNode(getActiveElement(), node)) {
	    // If `extend` is called while another element has focus, an error is
	    // thrown. We therefore disable `extend` if the active element is somewhere
	    // other than the node we are selecting. This should only occur in Firefox,
	    // since it is the only browser to support multiple selections.
	    // See https://bugzilla.mozilla.org/show_bug.cgi?id=921444.
	    selection.extend(node, offset);
	  } else {
	    // IE doesn't support extend. This will mean no backward selection.
	    // Extract the existing selection range and add focus to it.
	    // Additionally, clone the selection range. IE11 throws an
	    // InvalidStateError when attempting to access selection properties
	    // after the range is detached.
	    var range = selection.getRangeAt(0);
	    range.setEnd(node, offset);
	    selection.addRange(range.cloneRange());
	  }
	}

	function addPointToSelection(selection, node, offset) {
	  var range = document.createRange();
	  range.setStart(node, offset);
	  selection.addRange(range);
	}

	module.exports = setDraftEditorSelection;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 117 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule splitBlockInContentState
	 * @typechecks
	 * 
	 */

	'use strict';

	var Immutable = __webpack_require__(2);

	var generateRandomKey = __webpack_require__(7);
	var invariant = __webpack_require__(3);

	var Map = Immutable.Map;


	function splitBlockInContentState(contentState, selectionState) {
	  !selectionState.isCollapsed() ?  true ? invariant(false, 'Selection range must be collapsed.') : invariant(false) : void 0;

	  var key = selectionState.getAnchorKey();
	  var offset = selectionState.getAnchorOffset();
	  var blockMap = contentState.getBlockMap();
	  var blockToSplit = blockMap.get(key);

	  var text = blockToSplit.getText();
	  var chars = blockToSplit.getCharacterList();

	  var blockAbove = blockToSplit.merge({
	    text: text.slice(0, offset),
	    characterList: chars.slice(0, offset)
	  });

	  var keyBelow = generateRandomKey();
	  var blockBelow = blockAbove.merge({
	    key: keyBelow,
	    text: text.slice(offset),
	    characterList: chars.slice(offset),
	    data: Map()
	  });

	  var blocksBefore = blockMap.toSeq().takeUntil(function (v) {
	    return v === blockToSplit;
	  });
	  var blocksAfter = blockMap.toSeq().skipUntil(function (v) {
	    return v === blockToSplit;
	  }).rest();
	  var newBlocks = blocksBefore.concat([[blockAbove.getKey(), blockAbove], [blockBelow.getKey(), blockBelow]], blocksAfter).toOrderedMap();

	  return contentState.merge({
	    blockMap: newBlocks,
	    selectionBefore: selectionState,
	    selectionAfter: selectionState.merge({
	      anchorKey: keyBelow,
	      anchorOffset: 0,
	      focusKey: keyBelow,
	      focusOffset: 0,
	      isBackward: false
	    })
	  });
	}

	module.exports = splitBlockInContentState;

/***/ },
/* 118 */
/***/ function(module, exports) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule splitTextIntoTextBlocks
	 * 
	 */

	'use strict';

	var NEWLINE_REGEX = /\r\n?|\n/g;

	function splitTextIntoTextBlocks(text) {
	  return text.split(NEWLINE_REGEX);
	}

	module.exports = splitTextIntoTextBlocks;

/***/ },
/* 119 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 */
	var PhotosMimeType = {
	  isImage: function isImage(mimeString) {
	    return getParts(mimeString)[0] === 'image';
	  },
	  isJpeg: function isJpeg(mimeString) {
	    var parts = getParts(mimeString);
	    return PhotosMimeType.isImage(mimeString) && (
	    // see http://fburl.com/10972194
	    parts[1] === 'jpeg' || parts[1] === 'pjpeg');
	  }
	};

	function getParts(mimeString) {
	  return mimeString.split('/');
	}

	module.exports = PhotosMimeType;

/***/ },
/* 120 */
/***/ function(module, exports) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @typechecks
	 * @stub
	 * 
	 */

	'use strict';

	// \u00a1-\u00b1\u00b4-\u00b8\u00ba\u00bb\u00bf
	//             is latin supplement punctuation except fractions and superscript
	//             numbers
	// \u2010-\u2027\u2030-\u205e
	//             is punctuation from the general punctuation block:
	//             weird quotes, commas, bullets, dashes, etc.
	// \u30fb\u3001\u3002\u3008-\u3011\u3014-\u301f
	//             is CJK punctuation
	// \uff1a-\uff1f\uff01-\uff0f\uff3b-\uff40\uff5b-\uff65
	//             is some full-width/half-width punctuation
	// \u2E2E\u061f\u066a-\u066c\u061b\u060c\u060d\uFD3e\uFD3F
	//             is some Arabic punctuation marks
	// \u1801\u0964\u104a\u104b
	//             is misc. other language punctuation marks

	var PUNCTUATION = '[.,+*?$|#{}()\'\\^\\-\\[\\]\\\\\\/!@%"~=<>_:;' + '・、。〈-】〔-〟：-？！-／' + '［-｀｛-･⸮؟٪-٬؛،؍' + '﴾﴿᠁।၊။‐-‧‰-⁞' + '¡-±´-¸º»¿]';

	module.exports = {
	  getPunctuation: function getPunctuation() {
	    return PUNCTUATION;
	  }
	};

/***/ },
/* 121 */
/***/ function(module, exports) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */

	'use strict';

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var URI = function () {
	  function URI(uri) {
	    _classCallCheck(this, URI);

	    this._uri = uri;
	  }

	  URI.prototype.toString = function toString() {
	    return this._uri;
	  };

	  return URI;
	}();

	module.exports = URI;

/***/ },
/* 122 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @typechecks
	 * 
	 */

	/**
	 * Stateful API for text direction detection
	 *
	 * This class can be used in applications where you need to detect the
	 * direction of a sequence of text blocks, where each direction shall be used
	 * as the fallback direction for the next one.
	 *
	 * NOTE: A default direction, if not provided, is set based on the global
	 *       direction, as defined by `UnicodeBidiDirection`.
	 *
	 * == Example ==
	 * ```
	 * var UnicodeBidiService = require('UnicodeBidiService');
	 *
	 * var bidiService = new UnicodeBidiService();
	 *
	 * ...
	 *
	 * bidiService.reset();
	 * for (var para in paragraphs) {
	 *   var dir = bidiService.getDirection(para);
	 *   ...
	 * }
	 * ```
	 *
	 * Part of our implementation of Unicode Bidirectional Algorithm (UBA)
	 * Unicode Standard Annex #9 (UAX9)
	 * http://www.unicode.org/reports/tr9/
	 */

	'use strict';

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var UnicodeBidi = __webpack_require__(55);
	var UnicodeBidiDirection = __webpack_require__(31);

	var invariant = __webpack_require__(3);

	var UnicodeBidiService = function () {

	  /**
	   * Stateful class for paragraph direction detection
	   *
	   * @param defaultDir  Default direction of the service
	   */

	  function UnicodeBidiService(defaultDir) {
	    _classCallCheck(this, UnicodeBidiService);

	    if (!defaultDir) {
	      defaultDir = UnicodeBidiDirection.getGlobalDir();
	    } else {
	      !UnicodeBidiDirection.isStrong(defaultDir) ?  true ? invariant(false, 'Default direction must be a strong direction (LTR or RTL)') : invariant(false) : void 0;
	    }
	    this._defaultDir = defaultDir;
	    this.reset();
	  }

	  /**
	   * Reset the internal state
	   *
	   * Instead of creating a new instance, you can just reset() your instance
	   * everytime you start a new loop.
	   */


	  UnicodeBidiService.prototype.reset = function reset() {
	    this._lastDir = this._defaultDir;
	  };

	  /**
	   * Returns the direction of a block of text, and remembers it as the
	   * fall-back direction for the next paragraph.
	   *
	   * @param str  A text block, e.g. paragraph, table cell, tag
	   * @return     The resolved direction
	   */


	  UnicodeBidiService.prototype.getDirection = function getDirection(str) {
	    this._lastDir = UnicodeBidi.getDirection(str, this._lastDir);
	    return this._lastDir;
	  };

	  return UnicodeBidiService;
	}();

	module.exports = UnicodeBidiService;

/***/ },
/* 123 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 */

	/**
	 * Usage note:
	 * This module makes a best effort to export the same data we would internally.
	 * At Facebook we use a server-generated module that does the parsing and
	 * exports the data for the client to use. We can't rely on a server-side
	 * implementation in open source so instead we make use of an open source
	 * library to do the heavy lifting and then make some adjustments as necessary.
	 * It's likely there will be some differences. Some we can smooth over.
	 * Others are going to be harder.
	 */

	'use strict';

	var UAParser = __webpack_require__(139);

	var UNKNOWN = 'Unknown';

	var PLATFORM_MAP = {
	  'Mac OS': 'Mac OS X'
	};

	/**
	 * Convert from UAParser platform name to what we expect.
	 */
	function convertPlatformName(name) {
	  return PLATFORM_MAP[name] || name;
	}

	/**
	 * Get the version number in parts. This is very naive. We actually get major
	 * version as a part of UAParser already, which is generally good enough, but
	 * let's get the minor just in case.
	 */
	function getBrowserVersion(version) {
	  if (!version) {
	    return {
	      major: '',
	      minor: ''
	    };
	  }
	  var parts = version.split('.');
	  return {
	    major: parts[0],
	    minor: parts[1]
	  };
	}

	/**
	 * Get the UA data fom UAParser and then convert it to the format we're
	 * expecting for our APIS.
	 */
	var parser = new UAParser();
	var results = parser.getResult();

	// Do some conversion first.
	var browserVersionData = getBrowserVersion(results.browser.version);
	var uaData = {
	  browserArchitecture: results.cpu.architecture || UNKNOWN,
	  browserFullVersion: results.browser.version || UNKNOWN,
	  browserMinorVersion: browserVersionData.minor || UNKNOWN,
	  browserName: results.browser.name || UNKNOWN,
	  browserVersion: results.browser.major || UNKNOWN,
	  deviceName: results.device.model || UNKNOWN,
	  engineName: results.engine.name || UNKNOWN,
	  engineVersion: results.engine.version || UNKNOWN,
	  platformArchitecture: results.cpu.architecture || UNKNOWN,
	  platformName: convertPlatformName(results.os.name) || UNKNOWN,
	  platformVersion: results.os.version || UNKNOWN,
	  platformFullVersion: results.os.version || UNKNOWN
	};

	module.exports = uaData;

/***/ },
/* 124 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 */

	'use strict';

	var invariant = __webpack_require__(3);

	var componentRegex = /\./;
	var orRegex = /\|\|/;
	var rangeRegex = /\s+\-\s+/;
	var modifierRegex = /^(<=|<|=|>=|~>|~|>|)?\s*(.+)/;
	var numericRegex = /^(\d*)(.*)/;

	/**
	 * Splits input `range` on "||" and returns true if any subrange matches
	 * `version`.
	 *
	 * @param {string} range
	 * @param {string} version
	 * @returns {boolean}
	 */
	function checkOrExpression(range, version) {
	  var expressions = range.split(orRegex);

	  if (expressions.length > 1) {
	    return expressions.some(function (range) {
	      return VersionRange.contains(range, version);
	    });
	  } else {
	    range = expressions[0].trim();
	    return checkRangeExpression(range, version);
	  }
	}

	/**
	 * Splits input `range` on " - " (the surrounding whitespace is required) and
	 * returns true if version falls between the two operands.
	 *
	 * @param {string} range
	 * @param {string} version
	 * @returns {boolean}
	 */
	function checkRangeExpression(range, version) {
	  var expressions = range.split(rangeRegex);

	  !(expressions.length > 0 && expressions.length <= 2) ?  true ? invariant(false, 'the "-" operator expects exactly 2 operands') : invariant(false) : void 0;

	  if (expressions.length === 1) {
	    return checkSimpleExpression(expressions[0], version);
	  } else {
	    var startVersion = expressions[0];
	    var endVersion = expressions[1];

	    !(isSimpleVersion(startVersion) && isSimpleVersion(endVersion)) ?  true ? invariant(false, 'operands to the "-" operator must be simple (no modifiers)') : invariant(false) : void 0;

	    return checkSimpleExpression('>=' + startVersion, version) && checkSimpleExpression('<=' + endVersion, version);
	  }
	}

	/**
	 * Checks if `range` matches `version`. `range` should be a "simple" range (ie.
	 * not a compound range using the " - " or "||" operators).
	 *
	 * @param {string} range
	 * @param {string} version
	 * @returns {boolean}
	 */
	function checkSimpleExpression(range, version) {
	  range = range.trim();
	  if (range === '') {
	    return true;
	  }

	  var versionComponents = version.split(componentRegex);

	  var _getModifierAndCompon = getModifierAndComponents(range);

	  var modifier = _getModifierAndCompon.modifier;
	  var rangeComponents = _getModifierAndCompon.rangeComponents;

	  switch (modifier) {
	    case '<':
	      return checkLessThan(versionComponents, rangeComponents);
	    case '<=':
	      return checkLessThanOrEqual(versionComponents, rangeComponents);
	    case '>=':
	      return checkGreaterThanOrEqual(versionComponents, rangeComponents);
	    case '>':
	      return checkGreaterThan(versionComponents, rangeComponents);
	    case '~':
	    case '~>':
	      return checkApproximateVersion(versionComponents, rangeComponents);
	    default:
	      return checkEqual(versionComponents, rangeComponents);
	  }
	}

	/**
	 * Checks whether `a` is less than `b`.
	 *
	 * @param {array<string>} a
	 * @param {array<string>} b
	 * @returns {boolean}
	 */
	function checkLessThan(a, b) {
	  return compareComponents(a, b) === -1;
	}

	/**
	 * Checks whether `a` is less than or equal to `b`.
	 *
	 * @param {array<string>} a
	 * @param {array<string>} b
	 * @returns {boolean}
	 */
	function checkLessThanOrEqual(a, b) {
	  var result = compareComponents(a, b);
	  return result === -1 || result === 0;
	}

	/**
	 * Checks whether `a` is equal to `b`.
	 *
	 * @param {array<string>} a
	 * @param {array<string>} b
	 * @returns {boolean}
	 */
	function checkEqual(a, b) {
	  return compareComponents(a, b) === 0;
	}

	/**
	 * Checks whether `a` is greater than or equal to `b`.
	 *
	 * @param {array<string>} a
	 * @param {array<string>} b
	 * @returns {boolean}
	 */
	function checkGreaterThanOrEqual(a, b) {
	  var result = compareComponents(a, b);
	  return result === 1 || result === 0;
	}

	/**
	 * Checks whether `a` is greater than `b`.
	 *
	 * @param {array<string>} a
	 * @param {array<string>} b
	 * @returns {boolean}
	 */
	function checkGreaterThan(a, b) {
	  return compareComponents(a, b) === 1;
	}

	/**
	 * Checks whether `a` is "reasonably close" to `b` (as described in
	 * https://www.npmjs.org/doc/misc/semver.html). For example, if `b` is "1.3.1"
	 * then "reasonably close" is defined as ">= 1.3.1 and < 1.4".
	 *
	 * @param {array<string>} a
	 * @param {array<string>} b
	 * @returns {boolean}
	 */
	function checkApproximateVersion(a, b) {
	  var lowerBound = b.slice();
	  var upperBound = b.slice();

	  if (upperBound.length > 1) {
	    upperBound.pop();
	  }
	  var lastIndex = upperBound.length - 1;
	  var numeric = parseInt(upperBound[lastIndex], 10);
	  if (isNumber(numeric)) {
	    upperBound[lastIndex] = numeric + 1 + '';
	  }

	  return checkGreaterThanOrEqual(a, lowerBound) && checkLessThan(a, upperBound);
	}

	/**
	 * Extracts the optional modifier (<, <=, =, >=, >, ~, ~>) and version
	 * components from `range`.
	 *
	 * For example, given `range` ">= 1.2.3" returns an object with a `modifier` of
	 * `">="` and `components` of `[1, 2, 3]`.
	 *
	 * @param {string} range
	 * @returns {object}
	 */
	function getModifierAndComponents(range) {
	  var rangeComponents = range.split(componentRegex);
	  var matches = rangeComponents[0].match(modifierRegex);
	  !matches ?  true ? invariant(false, 'expected regex to match but it did not') : invariant(false) : void 0;

	  return {
	    modifier: matches[1],
	    rangeComponents: [matches[2]].concat(rangeComponents.slice(1))
	  };
	}

	/**
	 * Determines if `number` is a number.
	 *
	 * @param {mixed} number
	 * @returns {boolean}
	 */
	function isNumber(number) {
	  return !isNaN(number) && isFinite(number);
	}

	/**
	 * Tests whether `range` is a "simple" version number without any modifiers
	 * (">", "~" etc).
	 *
	 * @param {string} range
	 * @returns {boolean}
	 */
	function isSimpleVersion(range) {
	  return !getModifierAndComponents(range).modifier;
	}

	/**
	 * Zero-pads array `array` until it is at least `length` long.
	 *
	 * @param {array} array
	 * @param {number} length
	 */
	function zeroPad(array, length) {
	  for (var i = array.length; i < length; i++) {
	    array[i] = '0';
	  }
	}

	/**
	 * Normalizes `a` and `b` in preparation for comparison by doing the following:
	 *
	 * - zero-pads `a` and `b`
	 * - marks any "x", "X" or "*" component in `b` as equivalent by zero-ing it out
	 *   in both `a` and `b`
	 * - marks any final "*" component in `b` as a greedy wildcard by zero-ing it
	 *   and all of its successors in `a`
	 *
	 * @param {array<string>} a
	 * @param {array<string>} b
	 * @returns {array<array<string>>}
	 */
	function normalizeVersions(a, b) {
	  a = a.slice();
	  b = b.slice();

	  zeroPad(a, b.length);

	  // mark "x" and "*" components as equal
	  for (var i = 0; i < b.length; i++) {
	    var matches = b[i].match(/^[x*]$/i);
	    if (matches) {
	      b[i] = a[i] = '0';

	      // final "*" greedily zeros all remaining components
	      if (matches[0] === '*' && i === b.length - 1) {
	        for (var j = i; j < a.length; j++) {
	          a[j] = '0';
	        }
	      }
	    }
	  }

	  zeroPad(b, a.length);

	  return [a, b];
	}

	/**
	 * Returns the numerical -- not the lexicographical -- ordering of `a` and `b`.
	 *
	 * For example, `10-alpha` is greater than `2-beta`.
	 *
	 * @param {string} a
	 * @param {string} b
	 * @returns {number} -1, 0 or 1 to indicate whether `a` is less than, equal to,
	 * or greater than `b`, respectively
	 */
	function compareNumeric(a, b) {
	  var aPrefix = a.match(numericRegex)[1];
	  var bPrefix = b.match(numericRegex)[1];
	  var aNumeric = parseInt(aPrefix, 10);
	  var bNumeric = parseInt(bPrefix, 10);

	  if (isNumber(aNumeric) && isNumber(bNumeric) && aNumeric !== bNumeric) {
	    return compare(aNumeric, bNumeric);
	  } else {
	    return compare(a, b);
	  }
	}

	/**
	 * Returns the ordering of `a` and `b`.
	 *
	 * @param {string|number} a
	 * @param {string|number} b
	 * @returns {number} -1, 0 or 1 to indicate whether `a` is less than, equal to,
	 * or greater than `b`, respectively
	 */
	function compare(a, b) {
	  !(typeof a === typeof b) ?  true ? invariant(false, '"a" and "b" must be of the same type') : invariant(false) : void 0;

	  if (a > b) {
	    return 1;
	  } else if (a < b) {
	    return -1;
	  } else {
	    return 0;
	  }
	}

	/**
	 * Compares arrays of version components.
	 *
	 * @param {array<string>} a
	 * @param {array<string>} b
	 * @returns {number} -1, 0 or 1 to indicate whether `a` is less than, equal to,
	 * or greater than `b`, respectively
	 */
	function compareComponents(a, b) {
	  var _normalizeVersions = normalizeVersions(a, b);

	  var aNormalized = _normalizeVersions[0];
	  var bNormalized = _normalizeVersions[1];


	  for (var i = 0; i < bNormalized.length; i++) {
	    var result = compareNumeric(aNormalized[i], bNormalized[i]);
	    if (result) {
	      return result;
	    }
	  }

	  return 0;
	}

	var VersionRange = {
	  /**
	   * Checks whether `version` satisfies the `range` specification.
	   *
	   * We support a subset of the expressions defined in
	   * https://www.npmjs.org/doc/misc/semver.html:
	   *
	   *    version   Must match version exactly
	   *    =version  Same as just version
	   *    >version  Must be greater than version
	   *    >=version Must be greater than or equal to version
	   *    <version  Must be less than version
	   *    <=version Must be less than or equal to version
	   *    ~version  Must be at least version, but less than the next significant
	   *              revision above version:
	   *              "~1.2.3" is equivalent to ">= 1.2.3 and < 1.3"
	   *    ~>version Equivalent to ~version
	   *    1.2.x     Must match "1.2.x", where "x" is a wildcard that matches
	   *              anything
	   *    1.2.*     Similar to "1.2.x", but "*" in the trailing position is a
	   *              "greedy" wildcard, so will match any number of additional
	   *              components:
	   *              "1.2.*" will match "1.2.1", "1.2.1.1", "1.2.1.1.1" etc
	   *    *         Any version
	   *    ""        (Empty string) Same as *
	   *    v1 - v2   Equivalent to ">= v1 and <= v2"
	   *    r1 || r2  Passes if either r1 or r2 are satisfied
	   *
	   * @param {string} range
	   * @param {string} version
	   * @returns {boolean}
	   */

	  contains: function contains(range, version) {
	    return checkOrExpression(range.trim(), version.trim());
	  }
	};

	module.exports = VersionRange;

/***/ },
/* 125 */
/***/ function(module, exports) {

	"use strict";

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @typechecks
	 */

	var _hyphenPattern = /-(.)/g;

	/**
	 * Camelcases a hyphenated string, for example:
	 *
	 *   > camelize('background-color')
	 *   < "backgroundColor"
	 *
	 * @param {string} string
	 * @return {string}
	 */
	function camelize(string) {
	  return string.replace(_hyphenPattern, function (_, character) {
	    return character.toUpperCase();
	  });
	}

	module.exports = camelize;

/***/ },
/* 126 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @typechecks
	 */

	var invariant = __webpack_require__(3);

	/**
	 * Convert array-like objects to arrays.
	 *
	 * This API assumes the caller knows the contents of the data type. For less
	 * well defined inputs use createArrayFromMixed.
	 *
	 * @param {object|function|filelist} obj
	 * @return {array}
	 */
	function toArray(obj) {
	  var length = obj.length;

	  // Some browsers builtin objects can report typeof 'function' (e.g. NodeList
	  // in old versions of Safari).
	  !(!Array.isArray(obj) && (typeof obj === 'object' || typeof obj === 'function')) ?  true ? invariant(false, 'toArray: Array-like object expected') : invariant(false) : void 0;

	  !(typeof length === 'number') ?  true ? invariant(false, 'toArray: Object needs a length property') : invariant(false) : void 0;

	  !(length === 0 || length - 1 in obj) ?  true ? invariant(false, 'toArray: Object should have keys for indices') : invariant(false) : void 0;

	  !(typeof obj.callee !== 'function') ?  true ? invariant(false, 'toArray: Object can\'t be `arguments`. Use rest params ' + '(function(...args) {}) or Array.from() instead.') : invariant(false) : void 0;

	  // Old IE doesn't give collections access to hasOwnProperty. Assume inputs
	  // without method will throw during the slice call and skip straight to the
	  // fallback.
	  if (obj.hasOwnProperty) {
	    try {
	      return Array.prototype.slice.call(obj);
	    } catch (e) {
	      // IE < 9 does not support Array#slice on collections objects
	    }
	  }

	  // Fall back to copying key by key. This assumes all keys have a value,
	  // so will not preserve sparsely populated inputs.
	  var ret = Array(length);
	  for (var ii = 0; ii < length; ii++) {
	    ret[ii] = obj[ii];
	  }
	  return ret;
	}

	/**
	 * Perform a heuristic test to determine if an object is "array-like".
	 *
	 *   A monk asked Joshu, a Zen master, "Has a dog Buddha nature?"
	 *   Joshu replied: "Mu."
	 *
	 * This function determines if its argument has "array nature": it returns
	 * true if the argument is an actual array, an `arguments' object, or an
	 * HTMLCollection (e.g. node.childNodes or node.getElementsByTagName()).
	 *
	 * It will return false for other array-like objects like Filelist.
	 *
	 * @param {*} obj
	 * @return {boolean}
	 */
	function hasArrayNature(obj) {
	  return(
	    // not null/false
	    !!obj && (
	    // arrays are objects, NodeLists are functions in Safari
	    typeof obj == 'object' || typeof obj == 'function') &&
	    // quacks like an array
	    'length' in obj &&
	    // not window
	    !('setInterval' in obj) &&
	    // no DOM node should be considered an array-like
	    // a 'select' element has 'length' and 'item' properties on IE8
	    typeof obj.nodeType != 'number' && (
	    // a real array
	    Array.isArray(obj) ||
	    // arguments
	    'callee' in obj ||
	    // HTMLCollection/NodeList
	    'item' in obj)
	  );
	}

	/**
	 * Ensure that the argument is an array by wrapping it in an array if it is not.
	 * Creates a copy of the argument if it is already an array.
	 *
	 * This is mostly useful idiomatically:
	 *
	 *   var createArrayFromMixed = require('createArrayFromMixed');
	 *
	 *   function takesOneOrMoreThings(things) {
	 *     things = createArrayFromMixed(things);
	 *     ...
	 *   }
	 *
	 * This allows you to treat `things' as an array, but accept scalars in the API.
	 *
	 * If you need to convert an array-like object, like `arguments`, into an array
	 * use toArray instead.
	 *
	 * @param {*} obj
	 * @return {array}
	 */
	function createArrayFromMixed(obj) {
	  if (!hasArrayNature(obj)) {
	    return [obj];
	  } else if (Array.isArray(obj)) {
	    return obj.slice();
	  } else {
	    return toArray(obj);
	  }
	}

	module.exports = createArrayFromMixed;

/***/ },
/* 127 */
/***/ function(module, exports) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @typechecks
	 */

	'use strict';

	var isWebkit = typeof navigator !== 'undefined' && navigator.userAgent.indexOf('AppleWebKit') > -1;

	/**
	 * Gets the element with the document scroll properties such as `scrollLeft` and
	 * `scrollHeight`. This may differ across different browsers.
	 *
	 * NOTE: The return value can be null if the DOM is not yet ready.
	 *
	 * @param {?DOMDocument} doc Defaults to current document.
	 * @return {?DOMElement}
	 */
	function getDocumentScrollElement(doc) {
	  doc = doc || document;
	  return !isWebkit && doc.compatMode === 'CSS1Compat' ? doc.documentElement : doc.body;
	}

	module.exports = getDocumentScrollElement;

/***/ },
/* 128 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @typechecks
	 */

	var getElementRect = __webpack_require__(129);

	/**
	 * Gets an element's position in pixels relative to the viewport. The returned
	 * object represents the position of the element's top left corner.
	 *
	 * @param {DOMElement} element
	 * @return {object}
	 */
	function getElementPosition(element) {
	  var rect = getElementRect(element);
	  return {
	    x: rect.left,
	    y: rect.top,
	    width: rect.right - rect.left,
	    height: rect.bottom - rect.top
	  };
	}

	module.exports = getElementPosition;

/***/ },
/* 129 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @typechecks
	 */

	var containsNode = __webpack_require__(56);

	/**
	 * Gets an element's bounding rect in pixels relative to the viewport.
	 *
	 * @param {DOMElement} elem
	 * @return {object}
	 */
	function getElementRect(elem) {
	  var docElem = document.documentElement;

	  // FF 2, Safari 3 and Opera 9.5- do not support getBoundingClientRect().
	  // IE9- will throw if the element is not in the document.
	  if (!('getBoundingClientRect' in elem) || !containsNode(docElem, elem)) {
	    return {
	      left: 0,
	      right: 0,
	      top: 0,
	      bottom: 0
	    };
	  }

	  // Subtracts clientTop/Left because IE8- added a 2px border to the
	  // <html> element (see http://fburl.com/1493213). IE 7 in
	  // Quicksmode does not report clientLeft/clientTop so there
	  // will be an unaccounted offset of 2px when in quirksmode
	  var rect = elem.getBoundingClientRect();

	  return {
	    left: Math.round(rect.left) - docElem.clientLeft,
	    right: Math.round(rect.right) - docElem.clientLeft,
	    top: Math.round(rect.top) - docElem.clientTop,
	    bottom: Math.round(rect.bottom) - docElem.clientTop
	  };
	}

	module.exports = getElementRect;

/***/ },
/* 130 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @typechecks
	 */

	var camelize = __webpack_require__(125);
	var hyphenate = __webpack_require__(133);

	function asString(value) /*?string*/{
	  return value == null ? value : String(value);
	}

	function getStyleProperty( /*DOMNode*/node, /*string*/name) /*?string*/{
	  var computedStyle = void 0;

	  // W3C Standard
	  if (window.getComputedStyle) {
	    // In certain cases such as within an iframe in FF3, this returns null.
	    computedStyle = window.getComputedStyle(node, null);
	    if (computedStyle) {
	      return asString(computedStyle.getPropertyValue(hyphenate(name)));
	    }
	  }
	  // Safari
	  if (document.defaultView && document.defaultView.getComputedStyle) {
	    computedStyle = document.defaultView.getComputedStyle(node, null);
	    // A Safari bug causes this to return null for `display: none` elements.
	    if (computedStyle) {
	      return asString(computedStyle.getPropertyValue(hyphenate(name)));
	    }
	    if (name === 'display') {
	      return 'none';
	    }
	  }
	  // Internet Explorer
	  if (node.currentStyle) {
	    if (name === 'float') {
	      return asString(node.currentStyle.cssFloat || node.currentStyle.styleFloat);
	    }
	    return asString(node.currentStyle[camelize(name)]);
	  }
	  return asString(node.style && node.style[camelize(name)]);
	}

	module.exports = getStyleProperty;

/***/ },
/* 131 */
/***/ function(module, exports) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @typechecks
	 */

	'use strict';

	/**
	 * Gets the scroll position of the supplied element or window.
	 *
	 * The return values are unbounded, unlike `getScrollPosition`. This means they
	 * may be negative or exceed the element boundaries (which is possible using
	 * inertial scrolling).
	 *
	 * @param {DOMWindow|DOMElement} scrollable
	 * @return {object} Map with `x` and `y` keys.
	 */

	function getUnboundedScrollPosition(scrollable) {
	  if (scrollable === window) {
	    return {
	      x: window.pageXOffset || document.documentElement.scrollLeft,
	      y: window.pageYOffset || document.documentElement.scrollTop
	    };
	  }
	  return {
	    x: scrollable.scrollLeft,
	    y: scrollable.scrollTop
	  };
	}

	module.exports = getUnboundedScrollPosition;

/***/ },
/* 132 */
/***/ function(module, exports) {

	"use strict";

	function getViewportWidth() {
	  var width = void 0;
	  if (document.documentElement) {
	    width = document.documentElement.clientWidth;
	  }

	  if (!width && document.body) {
	    width = document.body.clientWidth;
	  }

	  return width || 0;
	} /**
	   * Copyright (c) 2013-present, Facebook, Inc.
	   * All rights reserved.
	   *
	   * This source code is licensed under the BSD-style license found in the
	   * LICENSE file in the root directory of this source tree. An additional grant
	   * of patent rights can be found in the PATENTS file in the same directory.
	   *
	   * 
	   * @typechecks
	   */

	function getViewportHeight() {
	  var height = void 0;
	  if (document.documentElement) {
	    height = document.documentElement.clientHeight;
	  }

	  if (!height && document.body) {
	    height = document.body.clientHeight;
	  }

	  return height || 0;
	}

	/**
	 * Gets the viewport dimensions including any scrollbars.
	 */
	function getViewportDimensions() {
	  return {
	    width: window.innerWidth || getViewportWidth(),
	    height: window.innerHeight || getViewportHeight()
	  };
	}

	/**
	 * Gets the viewport dimensions excluding any scrollbars.
	 */
	getViewportDimensions.withoutScrollbars = function () {
	  return {
	    width: getViewportWidth(),
	    height: getViewportHeight()
	  };
	};

	module.exports = getViewportDimensions;

/***/ },
/* 133 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @typechecks
	 */

	var _uppercasePattern = /([A-Z])/g;

	/**
	 * Hyphenates a camelcased string, for example:
	 *
	 *   > hyphenate('backgroundColor')
	 *   < "background-color"
	 *
	 * For CSS style names, use `hyphenateStyleName` instead which works properly
	 * with all vendor prefixes, including `ms`.
	 *
	 * @param {string} string
	 * @return {string}
	 */
	function hyphenate(string) {
	  return string.replace(_uppercasePattern, '-$1').toLowerCase();
	}

	module.exports = hyphenate;

/***/ },
/* 134 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @typechecks
	 */

	/**
	 * @param {*} object The object to check.
	 * @return {boolean} Whether or not the object is a DOM node.
	 */
	function isNode(object) {
	  return !!(object && (typeof Node === 'function' ? object instanceof Node : typeof object === 'object' && typeof object.nodeType === 'number' && typeof object.nodeName === 'string'));
	}

	module.exports = isNode;

/***/ },
/* 135 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @typechecks
	 */

	var isNode = __webpack_require__(134);

	/**
	 * @param {*} object The object to check.
	 * @return {boolean} Whether or not the object is a DOM text node.
	 */
	function isTextNode(object) {
	  return isNode(object) && object.nodeType == 3;
	}

	module.exports = isTextNode;

/***/ },
/* 136 */
/***/ function(module, exports) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @typechecks static-only
	 */

	'use strict';

	/**
	 * Combines multiple className strings into one.
	 * http://jsperf.com/joinclasses-args-vs-array
	 *
	 * @param {...?string} className
	 * @return {string}
	 */

	function joinClasses(className /*, ... */) {
	  if (!className) {
	    className = '';
	  }
	  var nextClass = void 0;
	  var argLength = arguments.length;
	  if (argLength > 1) {
	    for (var ii = 1; ii < argLength; ii++) {
	      nextClass = arguments[ii];
	      if (nextClass) {
	        className = (className ? className + ' ' : '') + nextClass;
	      }
	    }
	  }
	  return className;
	}

	module.exports = joinClasses;

/***/ },
/* 137 */
/***/ function(module, exports) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 */

	'use strict';

	var hasOwnProperty = Object.prototype.hasOwnProperty;

	/**
	 * Executes the provided `callback` once for each enumerable own property in the
	 * object and constructs a new object from the results. The `callback` is
	 * invoked with three arguments:
	 *
	 *  - the property value
	 *  - the property name
	 *  - the object being traversed
	 *
	 * Properties that are added after the call to `mapObject` will not be visited
	 * by `callback`. If the values of existing properties are changed, the value
	 * passed to `callback` will be the value at the time `mapObject` visits them.
	 * Properties that are deleted before being visited are not visited.
	 *
	 * @grep function objectMap()
	 * @grep function objMap()
	 *
	 * @param {?object} object
	 * @param {function} callback
	 * @param {*} context
	 * @return {?object}
	 */
	function mapObject(object, callback, context) {
	  if (!object) {
	    return null;
	  }
	  var result = {};
	  for (var name in object) {
	    if (hasOwnProperty.call(object, name)) {
	      result[name] = callback.call(context, object[name], name, object);
	    }
	  }
	  return result;
	}

	module.exports = mapObject;

/***/ },
/* 138 */
/***/ function(module, exports) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 * @typechecks static-only
	 */

	'use strict';

	/**
	 * Memoizes the return value of a function that accepts one string argument.
	 */

	function memoizeStringOnly(callback) {
	  var cache = {};
	  return function (string) {
	    if (!cache.hasOwnProperty(string)) {
	      cache[string] = callback.call(this, string);
	    }
	    return cache[string];
	  };
	}

	module.exports = memoizeStringOnly;

/***/ },
/* 139 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * UAParser.js v0.7.10
	 * Lightweight JavaScript-based User-Agent string parser
	 * https://github.com/faisalman/ua-parser-js
	 *
	 * Copyright © 2012-2015 Faisal Salman <fyzlman@gmail.com>
	 * Dual licensed under GPLv2 & MIT
	 */

	(function (window, undefined) {

	    'use strict';

	    //////////////
	    // Constants
	    /////////////


	    var LIBVERSION  = '0.7.10',
	        EMPTY       = '',
	        UNKNOWN     = '?',
	        FUNC_TYPE   = 'function',
	        UNDEF_TYPE  = 'undefined',
	        OBJ_TYPE    = 'object',
	        STR_TYPE    = 'string',
	        MAJOR       = 'major', // deprecated
	        MODEL       = 'model',
	        NAME        = 'name',
	        TYPE        = 'type',
	        VENDOR      = 'vendor',
	        VERSION     = 'version',
	        ARCHITECTURE= 'architecture',
	        CONSOLE     = 'console',
	        MOBILE      = 'mobile',
	        TABLET      = 'tablet',
	        SMARTTV     = 'smarttv',
	        WEARABLE    = 'wearable',
	        EMBEDDED    = 'embedded';


	    ///////////
	    // Helper
	    //////////


	    var util = {
	        extend : function (regexes, extensions) {
	            for (var i in extensions) {
	                if ("browser cpu device engine os".indexOf(i) !== -1 && extensions[i].length % 2 === 0) {
	                    regexes[i] = extensions[i].concat(regexes[i]);
	                }
	            }
	            return regexes;
	        },
	        has : function (str1, str2) {
	          if (typeof str1 === "string") {
	            return str2.toLowerCase().indexOf(str1.toLowerCase()) !== -1;
	          } else {
	            return false;
	          }
	        },
	        lowerize : function (str) {
	            return str.toLowerCase();
	        },
	        major : function (version) {
	            return typeof(version) === STR_TYPE ? version.split(".")[0] : undefined;
	        }
	    };


	    ///////////////
	    // Map helper
	    //////////////


	    var mapper = {

	        rgx : function () {

	            var result, i = 0, j, k, p, q, matches, match, args = arguments;

	            // loop through all regexes maps
	            while (i < args.length && !matches) {

	                var regex = args[i],       // even sequence (0,2,4,..)
	                    props = args[i + 1];   // odd sequence (1,3,5,..)

	                // construct object barebones
	                if (typeof result === UNDEF_TYPE) {
	                    result = {};
	                    for (p in props) {
	                        if (props.hasOwnProperty(p)){
	                            q = props[p];
	                            if (typeof q === OBJ_TYPE) {
	                                result[q[0]] = undefined;
	                            } else {
	                                result[q] = undefined;
	                            }
	                        }
	                    }
	                }

	                // try matching uastring with regexes
	                j = k = 0;
	                while (j < regex.length && !matches) {
	                    matches = regex[j++].exec(this.getUA());
	                    if (!!matches) {
	                        for (p = 0; p < props.length; p++) {
	                            match = matches[++k];
	                            q = props[p];
	                            // check if given property is actually array
	                            if (typeof q === OBJ_TYPE && q.length > 0) {
	                                if (q.length == 2) {
	                                    if (typeof q[1] == FUNC_TYPE) {
	                                        // assign modified match
	                                        result[q[0]] = q[1].call(this, match);
	                                    } else {
	                                        // assign given value, ignore regex match
	                                        result[q[0]] = q[1];
	                                    }
	                                } else if (q.length == 3) {
	                                    // check whether function or regex
	                                    if (typeof q[1] === FUNC_TYPE && !(q[1].exec && q[1].test)) {
	                                        // call function (usually string mapper)
	                                        result[q[0]] = match ? q[1].call(this, match, q[2]) : undefined;
	                                    } else {
	                                        // sanitize match using given regex
	                                        result[q[0]] = match ? match.replace(q[1], q[2]) : undefined;
	                                    }
	                                } else if (q.length == 4) {
	                                        result[q[0]] = match ? q[3].call(this, match.replace(q[1], q[2])) : undefined;
	                                }
	                            } else {
	                                result[q] = match ? match : undefined;
	                            }
	                        }
	                    }
	                }
	                i += 2;
	            }
	            return result;
	        },

	        str : function (str, map) {

	            for (var i in map) {
	                // check if array
	                if (typeof map[i] === OBJ_TYPE && map[i].length > 0) {
	                    for (var j = 0; j < map[i].length; j++) {
	                        if (util.has(map[i][j], str)) {
	                            return (i === UNKNOWN) ? undefined : i;
	                        }
	                    }
	                } else if (util.has(map[i], str)) {
	                    return (i === UNKNOWN) ? undefined : i;
	                }
	            }
	            return str;
	        }
	    };


	    ///////////////
	    // String map
	    //////////////


	    var maps = {

	        browser : {
	            oldsafari : {
	                version : {
	                    '1.0'   : '/8',
	                    '1.2'   : '/1',
	                    '1.3'   : '/3',
	                    '2.0'   : '/412',
	                    '2.0.2' : '/416',
	                    '2.0.3' : '/417',
	                    '2.0.4' : '/419',
	                    '?'     : '/'
	                }
	            }
	        },

	        device : {
	            amazon : {
	                model : {
	                    'Fire Phone' : ['SD', 'KF']
	                }
	            },
	            sprint : {
	                model : {
	                    'Evo Shift 4G' : '7373KT'
	                },
	                vendor : {
	                    'HTC'       : 'APA',
	                    'Sprint'    : 'Sprint'
	                }
	            }
	        },

	        os : {
	            windows : {
	                version : {
	                    'ME'        : '4.90',
	                    'NT 3.11'   : 'NT3.51',
	                    'NT 4.0'    : 'NT4.0',
	                    '2000'      : 'NT 5.0',
	                    'XP'        : ['NT 5.1', 'NT 5.2'],
	                    'Vista'     : 'NT 6.0',
	                    '7'         : 'NT 6.1',
	                    '8'         : 'NT 6.2',
	                    '8.1'       : 'NT 6.3',
	                    '10'        : ['NT 6.4', 'NT 10.0'],
	                    'RT'        : 'ARM'
	                }
	            }
	        }
	    };


	    //////////////
	    // Regex map
	    /////////////


	    var regexes = {

	        browser : [[

	            // Presto based
	            /(opera\smini)\/([\w\.-]+)/i,                                       // Opera Mini
	            /(opera\s[mobiletab]+).+version\/([\w\.-]+)/i,                      // Opera Mobi/Tablet
	            /(opera).+version\/([\w\.]+)/i,                                     // Opera > 9.80
	            /(opera)[\/\s]+([\w\.]+)/i                                          // Opera < 9.80

	            ], [NAME, VERSION], [

	            /\s(opr)\/([\w\.]+)/i                                               // Opera Webkit
	            ], [[NAME, 'Opera'], VERSION], [

	            // Mixed
	            /(kindle)\/([\w\.]+)/i,                                             // Kindle
	            /(lunascape|maxthon|netfront|jasmine|blazer)[\/\s]?([\w\.]+)*/i,
	                                                                                // Lunascape/Maxthon/Netfront/Jasmine/Blazer

	            // Trident based
	            /(avant\s|iemobile|slim|baidu)(?:browser)?[\/\s]?([\w\.]*)/i,
	                                                                                // Avant/IEMobile/SlimBrowser/Baidu
	            /(?:ms|\()(ie)\s([\w\.]+)/i,                                        // Internet Explorer

	            // Webkit/KHTML based
	            /(rekonq)\/([\w\.]+)*/i,                                            // Rekonq
	            /(chromium|flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron|vivaldi|iridium|phantomjs)\/([\w\.-]+)/i
	                                                                                // Chromium/Flock/RockMelt/Midori/Epiphany/Silk/Skyfire/Bolt/Iron/Iridium/PhantomJS
	            ], [NAME, VERSION], [

	            /(trident).+rv[:\s]([\w\.]+).+like\sgecko/i                         // IE11
	            ], [[NAME, 'IE'], VERSION], [

	            /(edge)\/((\d+)?[\w\.]+)/i                                          // Microsoft Edge
	            ], [NAME, VERSION], [

	            /(yabrowser)\/([\w\.]+)/i                                           // Yandex
	            ], [[NAME, 'Yandex'], VERSION], [

	            /(comodo_dragon)\/([\w\.]+)/i                                       // Comodo Dragon
	            ], [[NAME, /_/g, ' '], VERSION], [

	            /(chrome|omniweb|arora|[tizenoka]{5}\s?browser)\/v?([\w\.]+)/i,
	                                                                                // Chrome/OmniWeb/Arora/Tizen/Nokia
	            /(qqbrowser)[\/\s]?([\w\.]+)/i
	                                                                                // QQBrowser
	            ], [NAME, VERSION], [

	            /(uc\s?browser)[\/\s]?([\w\.]+)/i,
	            /ucweb.+(ucbrowser)[\/\s]?([\w\.]+)/i,
	            /JUC.+(ucweb)[\/\s]?([\w\.]+)/i
	                                                                                // UCBrowser
	            ], [[NAME, 'UCBrowser'], VERSION], [

	            /(dolfin)\/([\w\.]+)/i                                              // Dolphin
	            ], [[NAME, 'Dolphin'], VERSION], [

	            /((?:android.+)crmo|crios)\/([\w\.]+)/i                             // Chrome for Android/iOS
	            ], [[NAME, 'Chrome'], VERSION], [

	            /XiaoMi\/MiuiBrowser\/([\w\.]+)/i                                   // MIUI Browser
	            ], [VERSION, [NAME, 'MIUI Browser']], [

	            /android.+version\/([\w\.]+)\s+(?:mobile\s?safari|safari)/i         // Android Browser
	            ], [VERSION, [NAME, 'Android Browser']], [

	            /FBAV\/([\w\.]+);/i                                                 // Facebook App for iOS
	            ], [VERSION, [NAME, 'Facebook']], [

	            /fxios\/([\w\.-]+)/i                                                // Firefox for iOS
	            ], [VERSION, [NAME, 'Firefox']], [

	            /version\/([\w\.]+).+?mobile\/\w+\s(safari)/i                       // Mobile Safari
	            ], [VERSION, [NAME, 'Mobile Safari']], [

	            /version\/([\w\.]+).+?(mobile\s?safari|safari)/i                    // Safari & Safari Mobile
	            ], [VERSION, NAME], [

	            /webkit.+?(mobile\s?safari|safari)(\/[\w\.]+)/i                     // Safari < 3.0
	            ], [NAME, [VERSION, mapper.str, maps.browser.oldsafari.version]], [

	            /(konqueror)\/([\w\.]+)/i,                                          // Konqueror
	            /(webkit|khtml)\/([\w\.]+)/i
	            ], [NAME, VERSION], [

	            // Gecko based
	            /(navigator|netscape)\/([\w\.-]+)/i                                 // Netscape
	            ], [[NAME, 'Netscape'], VERSION], [
	            /(swiftfox)/i,                                                      // Swiftfox
	            /(icedragon|iceweasel|camino|chimera|fennec|maemo\sbrowser|minimo|conkeror)[\/\s]?([\w\.\+]+)/i,
	                                                                                // IceDragon/Iceweasel/Camino/Chimera/Fennec/Maemo/Minimo/Conkeror
	            /(firefox|seamonkey|k-meleon|icecat|iceape|firebird|phoenix)\/([\w\.-]+)/i,
	                                                                                // Firefox/SeaMonkey/K-Meleon/IceCat/IceApe/Firebird/Phoenix
	            /(mozilla)\/([\w\.]+).+rv\:.+gecko\/\d+/i,                          // Mozilla

	            // Other
	            /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir)[\/\s]?([\w\.]+)/i,
	                                                                                // Polaris/Lynx/Dillo/iCab/Doris/Amaya/w3m/NetSurf/Sleipnir
	            /(links)\s\(([\w\.]+)/i,                                            // Links
	            /(gobrowser)\/?([\w\.]+)*/i,                                        // GoBrowser
	            /(ice\s?browser)\/v?([\w\._]+)/i,                                   // ICE Browser
	            /(mosaic)[\/\s]([\w\.]+)/i                                          // Mosaic
	            ], [NAME, VERSION]

	            /* /////////////////////
	            // Media players BEGIN
	            ////////////////////////

	            , [

	            /(apple(?:coremedia|))\/((\d+)[\w\._]+)/i,                          // Generic Apple CoreMedia
	            /(coremedia) v((\d+)[\w\._]+)/i
	            ], [NAME, VERSION], [

	            /(aqualung|lyssna|bsplayer)\/((\d+)?[\w\.-]+)/i                     // Aqualung/Lyssna/BSPlayer
	            ], [NAME, VERSION], [

	            /(ares|ossproxy)\s((\d+)[\w\.-]+)/i                                 // Ares/OSSProxy
	            ], [NAME, VERSION], [

	            /(audacious|audimusicstream|amarok|bass|core|dalvik|gnomemplayer|music on console|nsplayer|psp-internetradioplayer|videos)\/((\d+)[\w\.-]+)/i,
	                                                                                // Audacious/AudiMusicStream/Amarok/BASS/OpenCORE/Dalvik/GnomeMplayer/MoC
	                                                                                // NSPlayer/PSP-InternetRadioPlayer/Videos
	            /(clementine|music player daemon)\s((\d+)[\w\.-]+)/i,               // Clementine/MPD
	            /(lg player|nexplayer)\s((\d+)[\d\.]+)/i,
	            /player\/(nexplayer|lg player)\s((\d+)[\w\.-]+)/i                   // NexPlayer/LG Player
	            ], [NAME, VERSION], [
	            /(nexplayer)\s((\d+)[\w\.-]+)/i                                     // Nexplayer
	            ], [NAME, VERSION], [

	            /(flrp)\/((\d+)[\w\.-]+)/i                                          // Flip Player
	            ], [[NAME, 'Flip Player'], VERSION], [

	            /(fstream|nativehost|queryseekspider|ia-archiver|facebookexternalhit)/i
	                                                                                // FStream/NativeHost/QuerySeekSpider/IA Archiver/facebookexternalhit
	            ], [NAME], [

	            /(gstreamer) souphttpsrc (?:\([^\)]+\)){0,1} libsoup\/((\d+)[\w\.-]+)/i
	                                                                                // Gstreamer
	            ], [NAME, VERSION], [

	            /(htc streaming player)\s[\w_]+\s\/\s((\d+)[\d\.]+)/i,              // HTC Streaming Player
	            /(java|python-urllib|python-requests|wget|libcurl)\/((\d+)[\w\.-_]+)/i,
	                                                                                // Java/urllib/requests/wget/cURL
	            /(lavf)((\d+)[\d\.]+)/i                                             // Lavf (FFMPEG)
	            ], [NAME, VERSION], [

	            /(htc_one_s)\/((\d+)[\d\.]+)/i                                      // HTC One S
	            ], [[NAME, /_/g, ' '], VERSION], [

	            /(mplayer)(?:\s|\/)(?:(?:sherpya-){0,1}svn)(?:-|\s)(r\d+(?:-\d+[\w\.-]+){0,1})/i
	                                                                                // MPlayer SVN
	            ], [NAME, VERSION], [

	            /(mplayer)(?:\s|\/|[unkow-]+)((\d+)[\w\.-]+)/i                      // MPlayer
	            ], [NAME, VERSION], [

	            /(mplayer)/i,                                                       // MPlayer (no other info)
	            /(yourmuze)/i,                                                      // YourMuze
	            /(media player classic|nero showtime)/i                             // Media Player Classic/Nero ShowTime
	            ], [NAME], [

	            /(nero (?:home|scout))\/((\d+)[\w\.-]+)/i                           // Nero Home/Nero Scout
	            ], [NAME, VERSION], [

	            /(nokia\d+)\/((\d+)[\w\.-]+)/i                                      // Nokia
	            ], [NAME, VERSION], [

	            /\s(songbird)\/((\d+)[\w\.-]+)/i                                    // Songbird/Philips-Songbird
	            ], [NAME, VERSION], [

	            /(winamp)3 version ((\d+)[\w\.-]+)/i,                               // Winamp
	            /(winamp)\s((\d+)[\w\.-]+)/i,
	            /(winamp)mpeg\/((\d+)[\w\.-]+)/i
	            ], [NAME, VERSION], [

	            /(ocms-bot|tapinradio|tunein radio|unknown|winamp|inlight radio)/i  // OCMS-bot/tap in radio/tunein/unknown/winamp (no other info)
	                                                                                // inlight radio
	            ], [NAME], [

	            /(quicktime|rma|radioapp|radioclientapplication|soundtap|totem|stagefright|streamium)\/((\d+)[\w\.-]+)/i
	                                                                                // QuickTime/RealMedia/RadioApp/RadioClientApplication/
	                                                                                // SoundTap/Totem/Stagefright/Streamium
	            ], [NAME, VERSION], [

	            /(smp)((\d+)[\d\.]+)/i                                              // SMP
	            ], [NAME, VERSION], [

	            /(vlc) media player - version ((\d+)[\w\.]+)/i,                     // VLC Videolan
	            /(vlc)\/((\d+)[\w\.-]+)/i,
	            /(xbmc|gvfs|xine|xmms|irapp)\/((\d+)[\w\.-]+)/i,                    // XBMC/gvfs/Xine/XMMS/irapp
	            /(foobar2000)\/((\d+)[\d\.]+)/i,                                    // Foobar2000
	            /(itunes)\/((\d+)[\d\.]+)/i                                         // iTunes
	            ], [NAME, VERSION], [

	            /(wmplayer)\/((\d+)[\w\.-]+)/i,                                     // Windows Media Player
	            /(windows-media-player)\/((\d+)[\w\.-]+)/i
	            ], [[NAME, /-/g, ' '], VERSION], [

	            /windows\/((\d+)[\w\.-]+) upnp\/[\d\.]+ dlnadoc\/[\d\.]+ (home media server)/i
	                                                                                // Windows Media Server
	            ], [VERSION, [NAME, 'Windows']], [

	            /(com\.riseupradioalarm)\/((\d+)[\d\.]*)/i                          // RiseUP Radio Alarm
	            ], [NAME, VERSION], [

	            /(rad.io)\s((\d+)[\d\.]+)/i,                                        // Rad.io
	            /(radio.(?:de|at|fr))\s((\d+)[\d\.]+)/i
	            ], [[NAME, 'rad.io'], VERSION]

	            //////////////////////
	            // Media players END
	            ////////////////////*/

	        ],

	        cpu : [[

	            /(?:(amd|x(?:(?:86|64)[_-])?|wow|win)64)[;\)]/i                     // AMD64
	            ], [[ARCHITECTURE, 'amd64']], [

	            /(ia32(?=;))/i                                                      // IA32 (quicktime)
	            ], [[ARCHITECTURE, util.lowerize]], [

	            /((?:i[346]|x)86)[;\)]/i                                            // IA32
	            ], [[ARCHITECTURE, 'ia32']], [

	            // PocketPC mistakenly identified as PowerPC
	            /windows\s(ce|mobile);\sppc;/i
	            ], [[ARCHITECTURE, 'arm']], [

	            /((?:ppc|powerpc)(?:64)?)(?:\smac|;|\))/i                           // PowerPC
	            ], [[ARCHITECTURE, /ower/, '', util.lowerize]], [

	            /(sun4\w)[;\)]/i                                                    // SPARC
	            ], [[ARCHITECTURE, 'sparc']], [

	            /((?:avr32|ia64(?=;))|68k(?=\))|arm(?:64|(?=v\d+;))|(?=atmel\s)avr|(?:irix|mips|sparc)(?:64)?(?=;)|pa-risc)/i
	                                                                                // IA64, 68K, ARM/64, AVR/32, IRIX/64, MIPS/64, SPARC/64, PA-RISC
	            ], [[ARCHITECTURE, util.lowerize]]
	        ],

	        device : [[

	            /\((ipad|playbook);[\w\s\);-]+(rim|apple)/i                         // iPad/PlayBook
	            ], [MODEL, VENDOR, [TYPE, TABLET]], [

	            /applecoremedia\/[\w\.]+ \((ipad)/                                  // iPad
	            ], [MODEL, [VENDOR, 'Apple'], [TYPE, TABLET]], [

	            /(apple\s{0,1}tv)/i                                                 // Apple TV
	            ], [[MODEL, 'Apple TV'], [VENDOR, 'Apple']], [

	            /(archos)\s(gamepad2?)/i,                                           // Archos
	            /(hp).+(touchpad)/i,                                                // HP TouchPad
	            /(kindle)\/([\w\.]+)/i,                                             // Kindle
	            /\s(nook)[\w\s]+build\/(\w+)/i,                                     // Nook
	            /(dell)\s(strea[kpr\s\d]*[\dko])/i                                  // Dell Streak
	            ], [VENDOR, MODEL, [TYPE, TABLET]], [

	            /(kf[A-z]+)\sbuild\/[\w\.]+.*silk\//i                               // Kindle Fire HD
	            ], [MODEL, [VENDOR, 'Amazon'], [TYPE, TABLET]], [
	            /(sd|kf)[0349hijorstuw]+\sbuild\/[\w\.]+.*silk\//i                  // Fire Phone
	            ], [[MODEL, mapper.str, maps.device.amazon.model], [VENDOR, 'Amazon'], [TYPE, MOBILE]], [

	            /\((ip[honed|\s\w*]+);.+(apple)/i                                   // iPod/iPhone
	            ], [MODEL, VENDOR, [TYPE, MOBILE]], [
	            /\((ip[honed|\s\w*]+);/i                                            // iPod/iPhone
	            ], [MODEL, [VENDOR, 'Apple'], [TYPE, MOBILE]], [

	            /(blackberry)[\s-]?(\w+)/i,                                         // BlackBerry
	            /(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|huawei|meizu|motorola|polytron)[\s_-]?([\w-]+)*/i,
	                                                                                // BenQ/Palm/Sony-Ericsson/Acer/Asus/Dell/Huawei/Meizu/Motorola/Polytron
	            /(hp)\s([\w\s]+\w)/i,                                               // HP iPAQ
	            /(asus)-?(\w+)/i                                                    // Asus
	            ], [VENDOR, MODEL, [TYPE, MOBILE]], [
	            /\(bb10;\s(\w+)/i                                                   // BlackBerry 10
	            ], [MODEL, [VENDOR, 'BlackBerry'], [TYPE, MOBILE]], [
	                                                                                // Asus Tablets
	            /android.+(transfo[prime\s]{4,10}\s\w+|eeepc|slider\s\w+|nexus 7)/i
	            ], [MODEL, [VENDOR, 'Asus'], [TYPE, TABLET]], [

	            /(sony)\s(tablet\s[ps])\sbuild\//i,                                  // Sony
	            /(sony)?(?:sgp.+)\sbuild\//i
	            ], [[VENDOR, 'Sony'], [MODEL, 'Xperia Tablet'], [TYPE, TABLET]], [
	            /(?:sony)?(?:(?:(?:c|d)\d{4})|(?:so[-l].+))\sbuild\//i
	            ], [[VENDOR, 'Sony'], [MODEL, 'Xperia Phone'], [TYPE, MOBILE]], [

	            /\s(ouya)\s/i,                                                      // Ouya
	            /(nintendo)\s([wids3u]+)/i                                          // Nintendo
	            ], [VENDOR, MODEL, [TYPE, CONSOLE]], [

	            /android.+;\s(shield)\sbuild/i                                      // Nvidia
	            ], [MODEL, [VENDOR, 'Nvidia'], [TYPE, CONSOLE]], [

	            /(playstation\s[34portablevi]+)/i                                   // Playstation
	            ], [MODEL, [VENDOR, 'Sony'], [TYPE, CONSOLE]], [

	            /(sprint\s(\w+))/i                                                  // Sprint Phones
	            ], [[VENDOR, mapper.str, maps.device.sprint.vendor], [MODEL, mapper.str, maps.device.sprint.model], [TYPE, MOBILE]], [

	            /(lenovo)\s?(S(?:5000|6000)+(?:[-][\w+]))/i                         // Lenovo tablets
	            ], [VENDOR, MODEL, [TYPE, TABLET]], [

	            /(htc)[;_\s-]+([\w\s]+(?=\))|\w+)*/i,                               // HTC
	            /(zte)-(\w+)*/i,                                                    // ZTE
	            /(alcatel|geeksphone|huawei|lenovo|nexian|panasonic|(?=;\s)sony)[_\s-]?([\w-]+)*/i
	                                                                                // Alcatel/GeeksPhone/Huawei/Lenovo/Nexian/Panasonic/Sony
	            ], [VENDOR, [MODEL, /_/g, ' '], [TYPE, MOBILE]], [
	                
	            /(nexus\s9)/i                                                       // HTC Nexus 9
	            ], [MODEL, [VENDOR, 'HTC'], [TYPE, TABLET]], [

	            /[\s\(;](xbox(?:\sone)?)[\s\);]/i                                   // Microsoft Xbox
	            ], [MODEL, [VENDOR, 'Microsoft'], [TYPE, CONSOLE]], [
	            /(kin\.[onetw]{3})/i                                                // Microsoft Kin
	            ], [[MODEL, /\./g, ' '], [VENDOR, 'Microsoft'], [TYPE, MOBILE]], [

	                                                                                // Motorola
	            /\s(milestone|droid(?:[2-4x]|\s(?:bionic|x2|pro|razr))?(:?\s4g)?)[\w\s]+build\//i,
	            /mot[\s-]?(\w+)*/i,
	            /(XT\d{3,4}) build\//i,
	            /(nexus\s[6])/i
	            ], [MODEL, [VENDOR, 'Motorola'], [TYPE, MOBILE]], [
	            /android.+\s(mz60\d|xoom[\s2]{0,2})\sbuild\//i
	            ], [MODEL, [VENDOR, 'Motorola'], [TYPE, TABLET]], [

	            /android.+((sch-i[89]0\d|shw-m380s|gt-p\d{4}|gt-n8000|sgh-t8[56]9|nexus 10))/i,
	            /((SM-T\w+))/i
	            ], [[VENDOR, 'Samsung'], MODEL, [TYPE, TABLET]], [                  // Samsung
	            /((s[cgp]h-\w+|gt-\w+|galaxy\snexus|sm-n900))/i,
	            /(sam[sung]*)[\s-]*(\w+-?[\w-]*)*/i,
	            /sec-((sgh\w+))/i
	            ], [[VENDOR, 'Samsung'], MODEL, [TYPE, MOBILE]], [
	            /(samsung);smarttv/i
	            ], [VENDOR, MODEL, [TYPE, SMARTTV]], [

	            /\(dtv[\);].+(aquos)/i                                              // Sharp
	            ], [MODEL, [VENDOR, 'Sharp'], [TYPE, SMARTTV]], [
	            /sie-(\w+)*/i                                                       // Siemens
	            ], [MODEL, [VENDOR, 'Siemens'], [TYPE, MOBILE]], [

	            /(maemo|nokia).*(n900|lumia\s\d+)/i,                                // Nokia
	            /(nokia)[\s_-]?([\w-]+)*/i
	            ], [[VENDOR, 'Nokia'], MODEL, [TYPE, MOBILE]], [

	            /android\s3\.[\s\w;-]{10}(a\d{3})/i                                 // Acer
	            ], [MODEL, [VENDOR, 'Acer'], [TYPE, TABLET]], [

	            /android\s3\.[\s\w;-]{10}(lg?)-([06cv9]{3,4})/i                     // LG Tablet
	            ], [[VENDOR, 'LG'], MODEL, [TYPE, TABLET]], [
	            /(lg) netcast\.tv/i                                                 // LG SmartTV
	            ], [VENDOR, MODEL, [TYPE, SMARTTV]], [
	            /(nexus\s[45])/i,                                                   // LG
	            /lg[e;\s\/-]+(\w+)*/i
	            ], [MODEL, [VENDOR, 'LG'], [TYPE, MOBILE]], [

	            /android.+(ideatab[a-z0-9\-\s]+)/i                                  // Lenovo
	            ], [MODEL, [VENDOR, 'Lenovo'], [TYPE, TABLET]], [

	            /linux;.+((jolla));/i                                               // Jolla
	            ], [VENDOR, MODEL, [TYPE, MOBILE]], [

	            /((pebble))app\/[\d\.]+\s/i                                         // Pebble
	            ], [VENDOR, MODEL, [TYPE, WEARABLE]], [

	            /android.+;\s(glass)\s\d/i                                          // Google Glass
	            ], [MODEL, [VENDOR, 'Google'], [TYPE, WEARABLE]], [

	            /android.+(\w+)\s+build\/hm\1/i,                                        // Xiaomi Hongmi 'numeric' models
	            /android.+(hm[\s\-_]*note?[\s_]*(?:\d\w)?)\s+build/i,                   // Xiaomi Hongmi
	            /android.+(mi[\s\-_]*(?:one|one[\s_]plus)?[\s_]*(?:\d\w)?)\s+build/i    // Xiaomi Mi
	            ], [[MODEL, /_/g, ' '], [VENDOR, 'Xiaomi'], [TYPE, MOBILE]], [

	            /\s(tablet)[;\/\s]/i,                                               // Unidentifiable Tablet
	            /\s(mobile)[;\/\s]/i                                                // Unidentifiable Mobile
	            ], [[TYPE, util.lowerize], VENDOR, MODEL]

	            /*//////////////////////////
	            // TODO: move to string map
	            ////////////////////////////

	            /(C6603)/i                                                          // Sony Xperia Z C6603
	            ], [[MODEL, 'Xperia Z C6603'], [VENDOR, 'Sony'], [TYPE, MOBILE]], [
	            /(C6903)/i                                                          // Sony Xperia Z 1
	            ], [[MODEL, 'Xperia Z 1'], [VENDOR, 'Sony'], [TYPE, MOBILE]], [

	            /(SM-G900[F|H])/i                                                   // Samsung Galaxy S5
	            ], [[MODEL, 'Galaxy S5'], [VENDOR, 'Samsung'], [TYPE, MOBILE]], [
	            /(SM-G7102)/i                                                       // Samsung Galaxy Grand 2
	            ], [[MODEL, 'Galaxy Grand 2'], [VENDOR, 'Samsung'], [TYPE, MOBILE]], [
	            /(SM-G530H)/i                                                       // Samsung Galaxy Grand Prime
	            ], [[MODEL, 'Galaxy Grand Prime'], [VENDOR, 'Samsung'], [TYPE, MOBILE]], [
	            /(SM-G313HZ)/i                                                      // Samsung Galaxy V
	            ], [[MODEL, 'Galaxy V'], [VENDOR, 'Samsung'], [TYPE, MOBILE]], [
	            /(SM-T805)/i                                                        // Samsung Galaxy Tab S 10.5
	            ], [[MODEL, 'Galaxy Tab S 10.5'], [VENDOR, 'Samsung'], [TYPE, TABLET]], [
	            /(SM-G800F)/i                                                       // Samsung Galaxy S5 Mini
	            ], [[MODEL, 'Galaxy S5 Mini'], [VENDOR, 'Samsung'], [TYPE, MOBILE]], [
	            /(SM-T311)/i                                                        // Samsung Galaxy Tab 3 8.0
	            ], [[MODEL, 'Galaxy Tab 3 8.0'], [VENDOR, 'Samsung'], [TYPE, TABLET]], [

	            /(R1001)/i                                                          // Oppo R1001
	            ], [MODEL, [VENDOR, 'OPPO'], [TYPE, MOBILE]], [
	            /(X9006)/i                                                          // Oppo Find 7a
	            ], [[MODEL, 'Find 7a'], [VENDOR, 'Oppo'], [TYPE, MOBILE]], [
	            /(R2001)/i                                                          // Oppo YOYO R2001
	            ], [[MODEL, 'Yoyo R2001'], [VENDOR, 'Oppo'], [TYPE, MOBILE]], [
	            /(R815)/i                                                           // Oppo Clover R815
	            ], [[MODEL, 'Clover R815'], [VENDOR, 'Oppo'], [TYPE, MOBILE]], [
	             /(U707)/i                                                          // Oppo Find Way S
	            ], [[MODEL, 'Find Way S'], [VENDOR, 'Oppo'], [TYPE, MOBILE]], [

	            /(T3C)/i                                                            // Advan Vandroid T3C
	            ], [MODEL, [VENDOR, 'Advan'], [TYPE, TABLET]], [
	            /(ADVAN T1J\+)/i                                                    // Advan Vandroid T1J+
	            ], [[MODEL, 'Vandroid T1J+'], [VENDOR, 'Advan'], [TYPE, TABLET]], [
	            /(ADVAN S4A)/i                                                      // Advan Vandroid S4A
	            ], [[MODEL, 'Vandroid S4A'], [VENDOR, 'Advan'], [TYPE, MOBILE]], [

	            /(V972M)/i                                                          // ZTE V972M
	            ], [MODEL, [VENDOR, 'ZTE'], [TYPE, MOBILE]], [

	            /(i-mobile)\s(IQ\s[\d\.]+)/i                                        // i-mobile IQ
	            ], [VENDOR, MODEL, [TYPE, MOBILE]], [
	            /(IQ6.3)/i                                                          // i-mobile IQ IQ 6.3
	            ], [[MODEL, 'IQ 6.3'], [VENDOR, 'i-mobile'], [TYPE, MOBILE]], [
	            /(i-mobile)\s(i-style\s[\d\.]+)/i                                   // i-mobile i-STYLE
	            ], [VENDOR, MODEL, [TYPE, MOBILE]], [
	            /(i-STYLE2.1)/i                                                     // i-mobile i-STYLE 2.1
	            ], [[MODEL, 'i-STYLE 2.1'], [VENDOR, 'i-mobile'], [TYPE, MOBILE]], [
	            
	            /(mobiistar touch LAI 512)/i                                        // mobiistar touch LAI 512
	            ], [[MODEL, 'Touch LAI 512'], [VENDOR, 'mobiistar'], [TYPE, MOBILE]], [

	            /////////////
	            // END TODO
	            ///////////*/

	        ],

	        engine : [[

	            /windows.+\sedge\/([\w\.]+)/i                                       // EdgeHTML
	            ], [VERSION, [NAME, 'EdgeHTML']], [

	            /(presto)\/([\w\.]+)/i,                                             // Presto
	            /(webkit|trident|netfront|netsurf|amaya|lynx|w3m)\/([\w\.]+)/i,     // WebKit/Trident/NetFront/NetSurf/Amaya/Lynx/w3m
	            /(khtml|tasman|links)[\/\s]\(?([\w\.]+)/i,                          // KHTML/Tasman/Links
	            /(icab)[\/\s]([23]\.[\d\.]+)/i                                      // iCab
	            ], [NAME, VERSION], [

	            /rv\:([\w\.]+).*(gecko)/i                                           // Gecko
	            ], [VERSION, NAME]
	        ],

	        os : [[

	            // Windows based
	            /microsoft\s(windows)\s(vista|xp)/i                                 // Windows (iTunes)
	            ], [NAME, VERSION], [
	            /(windows)\snt\s6\.2;\s(arm)/i,                                     // Windows RT
	            /(windows\sphone(?:\sos)*|windows\smobile|windows)[\s\/]?([ntce\d\.\s]+\w)/i
	            ], [NAME, [VERSION, mapper.str, maps.os.windows.version]], [
	            /(win(?=3|9|n)|win\s9x\s)([nt\d\.]+)/i
	            ], [[NAME, 'Windows'], [VERSION, mapper.str, maps.os.windows.version]], [

	            // Mobile/Embedded OS
	            /\((bb)(10);/i                                                      // BlackBerry 10
	            ], [[NAME, 'BlackBerry'], VERSION], [
	            /(blackberry)\w*\/?([\w\.]+)*/i,                                    // Blackberry
	            /(tizen)[\/\s]([\w\.]+)/i,                                          // Tizen
	            /(android|webos|palm\sos|qnx|bada|rim\stablet\sos|meego|contiki)[\/\s-]?([\w\.]+)*/i,
	                                                                                // Android/WebOS/Palm/QNX/Bada/RIM/MeeGo/Contiki
	            /linux;.+(sailfish);/i                                              // Sailfish OS
	            ], [NAME, VERSION], [
	            /(symbian\s?os|symbos|s60(?=;))[\/\s-]?([\w\.]+)*/i                 // Symbian
	            ], [[NAME, 'Symbian'], VERSION], [
	            /\((series40);/i                                                    // Series 40
	            ], [NAME], [
	            /mozilla.+\(mobile;.+gecko.+firefox/i                               // Firefox OS
	            ], [[NAME, 'Firefox OS'], VERSION], [

	            // Console
	            /(nintendo|playstation)\s([wids34portablevu]+)/i,                   // Nintendo/Playstation

	            // GNU/Linux based
	            /(mint)[\/\s\(]?(\w+)*/i,                                           // Mint
	            /(mageia|vectorlinux)[;\s]/i,                                       // Mageia/VectorLinux
	            /(joli|[kxln]?ubuntu|debian|[open]*suse|gentoo|(?=\s)arch|slackware|fedora|mandriva|centos|pclinuxos|redhat|zenwalk|linpus)[\/\s-]?([\w\.-]+)*/i,
	                                                                                // Joli/Ubuntu/Debian/SUSE/Gentoo/Arch/Slackware
	                                                                                // Fedora/Mandriva/CentOS/PCLinuxOS/RedHat/Zenwalk/Linpus
	            /(hurd|linux)\s?([\w\.]+)*/i,                                       // Hurd/Linux
	            /(gnu)\s?([\w\.]+)*/i                                               // GNU
	            ], [NAME, VERSION], [

	            /(cros)\s[\w]+\s([\w\.]+\w)/i                                       // Chromium OS
	            ], [[NAME, 'Chromium OS'], VERSION],[

	            // Solaris
	            /(sunos)\s?([\w\.]+\d)*/i                                           // Solaris
	            ], [[NAME, 'Solaris'], VERSION], [

	            // BSD based
	            /\s([frentopc-]{0,4}bsd|dragonfly)\s?([\w\.]+)*/i                   // FreeBSD/NetBSD/OpenBSD/PC-BSD/DragonFly
	            ], [NAME, VERSION],[

	            /(ip[honead]+)(?:.*os\s([\w]+)*\slike\smac|;\sopera)/i              // iOS
	            ], [[NAME, 'iOS'], [VERSION, /_/g, '.']], [

	            /(mac\sos\sx)\s?([\w\s\.]+\w)*/i,
	            /(macintosh|mac(?=_powerpc)\s)/i                                    // Mac OS
	            ], [[NAME, 'Mac OS'], [VERSION, /_/g, '.']], [

	            // Other
	            /((?:open)?solaris)[\/\s-]?([\w\.]+)*/i,                            // Solaris
	            /(haiku)\s(\w+)/i,                                                  // Haiku
	            /(aix)\s((\d)(?=\.|\)|\s)[\w\.]*)*/i,                               // AIX
	            /(plan\s9|minix|beos|os\/2|amigaos|morphos|risc\sos|openvms)/i,
	                                                                                // Plan9/Minix/BeOS/OS2/AmigaOS/MorphOS/RISCOS/OpenVMS
	            /(unix)\s?([\w\.]+)*/i                                              // UNIX
	            ], [NAME, VERSION]
	        ]
	    };


	    /////////////////
	    // Constructor
	    ////////////////


	    var UAParser = function (uastring, extensions) {

	        if (!(this instanceof UAParser)) {
	            return new UAParser(uastring, extensions).getResult();
	        }

	        var ua = uastring || ((window && window.navigator && window.navigator.userAgent) ? window.navigator.userAgent : EMPTY);
	        var rgxmap = extensions ? util.extend(regexes, extensions) : regexes;

	        this.getBrowser = function () {
	            var browser = mapper.rgx.apply(this, rgxmap.browser);
	            browser.major = util.major(browser.version);
	            return browser;
	        };
	        this.getCPU = function () {
	            return mapper.rgx.apply(this, rgxmap.cpu);
	        };
	        this.getDevice = function () {
	            return mapper.rgx.apply(this, rgxmap.device);
	        };
	        this.getEngine = function () {
	            return mapper.rgx.apply(this, rgxmap.engine);
	        };
	        this.getOS = function () {
	            return mapper.rgx.apply(this, rgxmap.os);
	        };
	        this.getResult = function() {
	            return {
	                ua      : this.getUA(),
	                browser : this.getBrowser(),
	                engine  : this.getEngine(),
	                os      : this.getOS(),
	                device  : this.getDevice(),
	                cpu     : this.getCPU()
	            };
	        };
	        this.getUA = function () {
	            return ua;
	        };
	        this.setUA = function (uastring) {
	            ua = uastring;
	            return this;
	        };
	        this.setUA(ua);
	        return this;
	    };

	    UAParser.VERSION = LIBVERSION;
	    UAParser.BROWSER = {
	        NAME    : NAME,
	        MAJOR   : MAJOR, // deprecated
	        VERSION : VERSION
	    };
	    UAParser.CPU = {
	        ARCHITECTURE : ARCHITECTURE
	    };
	    UAParser.DEVICE = {
	        MODEL   : MODEL,
	        VENDOR  : VENDOR,
	        TYPE    : TYPE,
	        CONSOLE : CONSOLE,
	        MOBILE  : MOBILE,
	        SMARTTV : SMARTTV,
	        TABLET  : TABLET,
	        WEARABLE: WEARABLE,
	        EMBEDDED: EMBEDDED
	    };
	    UAParser.ENGINE = {
	        NAME    : NAME,
	        VERSION : VERSION
	    };
	    UAParser.OS = {
	        NAME    : NAME,
	        VERSION : VERSION
	    };


	    ///////////
	    // Export
	    //////////


	    // check js environment
	    if (typeof(exports) !== UNDEF_TYPE) {
	        // nodejs env
	        if (typeof module !== UNDEF_TYPE && module.exports) {
	            exports = module.exports = UAParser;
	        }
	        exports.UAParser = UAParser;
	    } else {
	        // requirejs env (optional)
	        if ("function" === FUNC_TYPE && __webpack_require__(140)) {
	            !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
	                return UAParser;
	            }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	        } else {
	            // browser env
	            window.UAParser = UAParser;
	        }
	    }

	    // jQuery/Zepto specific (optional)
	    // Note: 
	    //   In AMD env the global scope should be kept clean, but jQuery is an exception.
	    //   jQuery always exports to global scope, unless jQuery.noConflict(true) is used,
	    //   and we should catch that.
	    var $ = window.jQuery || window.Zepto;
	    if (typeof $ !== UNDEF_TYPE) {
	        var parser = new UAParser();
	        $.ua = parser.getResult();
	        $.ua.get = function() {
	            return parser.getUA();
	        };
	        $.ua.set = function (uastring) {
	            parser.setUA(uastring);
	            var result = parser.getResult();
	            for (var prop in result) {
	                $.ua[prop] = result[prop];
	            }
	        };
	    }

	})(typeof window === 'object' ? window : this);


/***/ },
/* 140 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(__webpack_amd_options__) {module.exports = __webpack_amd_options__;

	/* WEBPACK VAR INJECTION */}.call(exports, {}))

/***/ }
/******/ ]);