/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * 
 * @emails oncall+draft_js
 */
'use strict';

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? Object(arguments[i]) : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var BlockTree = require("./BlockTree");

var ContentState = require("./ContentState");

var EditorBidiService = require("./EditorBidiService");

var SelectionState = require("./SelectionState");

var Immutable = require("immutable");

var OrderedSet = Immutable.OrderedSet,
    Record = Immutable.Record,
    Stack = Immutable.Stack,
    OrderedMap = Immutable.OrderedMap,
    List = Immutable.List; // When configuring an editor, the user can chose to provide or not provide
// basically all keys. `currentContent` varies, so this type doesn't include it.
// (See the types defined below.)

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

var EditorState = /*#__PURE__*/function () {
  // $FlowFixMe[value-as-type]
  EditorState.createEmpty = function createEmpty(decorator) {
    return this.createWithText('', decorator);
  };

  EditorState.createWithText = function createWithText(text, decorator) {
    return EditorState.createWithContent(ContentState.createFromText(text), decorator);
  };

  EditorState.createWithContent = function createWithContent(contentState, decorator) {
    if (contentState.getBlockMap().count() === 0) {
      return EditorState.createEmpty(decorator);
    }

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
    var currentContent = config.currentContent,
        decorator = config.decorator;

    var recordConfig = _objectSpread({}, config, {
      treeMap: generateNewTreeMap(currentContent, decorator),
      directionMap: EditorBidiService.getDirectionMap(currentContent)
    });

    return new EditorState(new EditorStateRecord(recordConfig));
  };

  EditorState.fromJS = function fromJS(config) {
    return new EditorState(new EditorStateRecord(_objectSpread({}, config, {
      directionMap: config.directionMap != null ? OrderedMap(config.directionMap) : config.directionMap,
      inlineStyleOverride: config.inlineStyleOverride != null ? OrderedSet(config.inlineStyleOverride) : config.inlineStyleOverride,
      nativelyRenderedContent: config.nativelyRenderedContent != null ? ContentState.fromJS(config.nativelyRenderedContent) : config.nativelyRenderedContent,
      redoStack: config.redoStack != null ? Stack(config.redoStack.map(function (v) {
        return ContentState.fromJS(v);
      })) : config.redoStack,
      selection: config.selection != null ? new SelectionState(config.selection) : config.selection,
      treeMap: config.treeMap != null ? OrderedMap(config.treeMap).map(function (v) {
        return List(v).map(function (v) {
          return BlockTree.fromJS(v);
        });
      }) : config.treeMap,
      undoStack: config.undoStack != null ? Stack(config.undoStack.map(function (v) {
        return ContentState.fromJS(v);
      })) : config.undoStack,
      currentContent: ContentState.fromJS(config.currentContent)
    })));
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
          newTreeMap = regenerateTreeForNewDecorator(newContent, newContent.getBlockMap(), treeMap, decorator, existingDecorator);
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
        state.set('treeMap', regenerateTreeForNewBlocks(editorState, newContent.getBlockMap(), newContent.getEntityMap(), decorator));
      }

      state.merge(put);
    });
    return new EditorState(map);
  };

  var _proto = EditorState.prototype;

  _proto.toJS = function toJS() {
    return this.getImmutable().toJS();
  };

  _proto.getAllowUndo = function getAllowUndo() {
    return this.getImmutable().get('allowUndo');
  };

  _proto.getCurrentContent = function getCurrentContent() {
    return this.getImmutable().get('currentContent');
  };

  _proto.getUndoStack = function getUndoStack() {
    return this.getImmutable().get('undoStack');
  };

  _proto.getRedoStack = function getRedoStack() {
    return this.getImmutable().get('redoStack');
  };

  _proto.getSelection = function getSelection() {
    return this.getImmutable().get('selection');
  };

  _proto.getDecorator = function getDecorator() {
    return this.getImmutable().get('decorator');
  };

  _proto.isInCompositionMode = function isInCompositionMode() {
    return this.getImmutable().get('inCompositionMode');
  };

  _proto.mustForceSelection = function mustForceSelection() {
    return this.getImmutable().get('forceSelection');
  };

  _proto.getNativelyRenderedContent = function getNativelyRenderedContent() {
    return this.getImmutable().get('nativelyRenderedContent');
  };

  _proto.getLastChangeType = function getLastChangeType() {
    return this.getImmutable().get('lastChangeType');
  }
  /**
   * While editing, the user may apply inline style commands with a collapsed
   * cursor, intending to type text that adopts the specified style. In this
   * case, we track the specified style as an "override" that takes precedence
   * over the inline style of the text adjacent to the cursor.
   *
   * If null, there is no override in place.
   */
  ;

  _proto.getInlineStyleOverride = function getInlineStyleOverride() {
    return this.getImmutable().get('inlineStyleOverride');
  };

  EditorState.setInlineStyleOverride = function setInlineStyleOverride(editorState, inlineStyleOverride) {
    return EditorState.set(editorState, {
      inlineStyleOverride: inlineStyleOverride
    });
  }
  /**
   * Get the appropriate inline style for the editor state. If an
   * override is in place, use it. Otherwise, the current style is
   * based on the location of the selection state.
   */
  ;

  _proto.getCurrentInlineStyle = function getCurrentInlineStyle() {
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

  _proto.getBlockTree = function getBlockTree(blockKey) {
    return this.getImmutable().getIn(['treeMap', blockKey]);
  };

  _proto.isSelectionAtStartOfContent = function isSelectionAtStartOfContent() {
    var firstKey = this.getCurrentContent().getBlockMap().first().getKey();
    return this.getSelection().hasEdgeWithin(firstKey, 0, 0);
  };

  _proto.isSelectionAtEndOfContent = function isSelectionAtEndOfContent() {
    var content = this.getCurrentContent();
    var blockMap = content.getBlockMap();
    var last = blockMap.last();
    var end = last.getLength();
    return this.getSelection().hasEdgeWithin(last.getKey(), end, end);
  };

  _proto.getDirectionMap = function getDirectionMap() {
    return this.getImmutable().get('directionMap');
  }
  /**
   * Incorporate native DOM selection changes into the EditorState. This
   * method can be used when we simply want to accept whatever the DOM
   * has given us to represent selection, and we do not need to re-render
   * the editor.
   *
   * To forcibly move the DOM selection, see `EditorState.forceSelection`.
   */
  ;

  EditorState.acceptSelection = function acceptSelection(editorState, selection) {
    return updateSelection(editorState, selection, false);
  }
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
  ;

  EditorState.forceSelection = function forceSelection(editorState, selection) {
    if (!selection.getHasFocus()) {
      selection = selection.set('hasFocus', true);
    }

    return updateSelection(editorState, selection, true);
  }
  /**
   * Move selection to the end of the editor without forcing focus.
   */
  ;

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
  }
  /**
   * Force focus to the end of the editor. This is useful in scenarios
   * where we want to programmatically focus the input and it makes sense
   * to allow the user to continue working seamlessly.
   */
  ;

  EditorState.moveFocusToEnd = function moveFocusToEnd(editorState) {
    var afterSelectionMove = EditorState.moveSelectionToEnd(editorState);
    return EditorState.forceSelection(afterSelectionMove, afterSelectionMove.getSelection());
  }
  /**
   * Push the current ContentState onto the undo stack if it should be
   * considered a boundary state, and set the provided ContentState as the
   * new current content.
   */
  ;

  EditorState.push = function push(editorState, contentState, changeType) {
    var forceSelection = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

    if (editorState.getCurrentContent() === contentState) {
      return editorState;
    }

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

    var inlineStyleOverride = editorState.getInlineStyleOverride(); // Don't discard inline style overrides for the following change types:

    var overrideChangeTypes = ['adjust-depth', 'change-block-type', 'split-block'];

    if (overrideChangeTypes.indexOf(changeType) === -1) {
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
  }
  /**
   * Make the top ContentState in the undo stack the new current content and
   * push the current content onto the redo stack.
   */
  ;

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
  }
  /**
   * Make the top ContentState in the redo stack the new current content and
   * push the current content onto the undo stack.
   */
  ;

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
  }
  /**
   * Not for public consumption.
   */
  // $FlowFixMe[value-as-type]
  ;

  function EditorState(immutable) {
    _defineProperty(this, "_immutable", void 0);

    this._immutable = immutable;
  }
  /**
   * Not for public consumption.
   */
  // $FlowFixMe[value-as-type]


  _proto.getImmutable = function getImmutable() {
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
    return BlockTree.generate(contentState, block, decorator);
  }).toOrderedMap();
}
/**
 * Regenerate tree map objects for all ContentBlocks that have changed
 * between the current editorState and newContent. Returns an OrderedMap
 * with only changed regenerated tree map objects.
 */


function regenerateTreeForNewBlocks(editorState, newBlockMap, newEntityMap, decorator) {
  var contentState = editorState.getCurrentContent().set('entityMap', newEntityMap);
  var prevBlockMap = contentState.getBlockMap();
  var prevTreeMap = editorState.getImmutable().get('treeMap');
  return prevTreeMap.merge(newBlockMap.toSeq().filter(function (block, key) {
    return block !== prevBlockMap.get(key);
  }).map(function (block) {
    return BlockTree.generate(contentState, block, decorator);
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


function regenerateTreeForNewDecorator(content, blockMap, previousTreeMap, decorator, existingDecorator) {
  return previousTreeMap.merge(blockMap.toSeq().filter(function (block) {
    return decorator.getDecorations(block, content) !== existingDecorator.getDecorations(block, content);
  }).map(function (block) {
    return BlockTree.generate(content, block, decorator);
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
  var startBlock = content.getBlockForKey(startKey); // If the cursor is not at the start of the block, look backward to
  // preserve the style of the preceding character.

  if (startOffset > 0) {
    return startBlock.getInlineStyleAt(startOffset - 1);
  } // The caret is at position zero in this block. If the block has any
  // text at all, use the style of the first character.


  if (startBlock.getLength()) {
    return startBlock.getInlineStyleAt(0);
  } // Otherwise, look upward in the document to find the closest character.


  return lookUpwardForInlineStyle(content, startKey);
}

function getInlineStyleForNonCollapsedSelection(content, selection) {
  var startKey = selection.getStartKey();
  var startOffset = selection.getStartOffset();
  var startBlock = content.getBlockForKey(startKey); // If there is a character just inside the selection, use its style.

  if (startOffset < startBlock.getLength()) {
    return startBlock.getInlineStyleAt(startOffset);
  } // Check if the selection at the end of a non-empty block. Use the last
  // style in the block.


  if (startOffset > 0) {
    return startBlock.getInlineStyleAt(startOffset - 1);
  } // Otherwise, look upward in the document to find the closest character.


  return lookUpwardForInlineStyle(content, startKey);
}

function lookUpwardForInlineStyle(content, fromKey) {
  var lastNonEmpty = content.getBlockMap().reverse().skipUntil(function (_, k) {
    return k === fromKey;
  }).skip(1).skipUntil(function (block, _) {
    return block.getLength();
  }).first();

  if (lastNonEmpty) {
    return lastNonEmpty.getInlineStyleAt(lastNonEmpty.getLength() - 1);
  }

  return OrderedSet();
}

module.exports = EditorState;