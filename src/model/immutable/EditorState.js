/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 * @emails oncall+draft_js
 */

'use strict';

import type {BlockMap} from 'BlockMap';
import type {DraftDecoratorType} from 'DraftDecoratorType';
import type {DraftInlineStyle} from 'DraftInlineStyle';
import type {EditorChangeType} from 'EditorChangeType';
import type {EntityMap} from 'EntityMap';
import type {List, OrderedMap} from 'immutable';

const BlockTree = require('BlockTree');
const ContentState = require('ContentState');
const EditorBidiService = require('EditorBidiService');
const SelectionState = require('SelectionState');

const Immutable = require('immutable');

const {OrderedSet, Record, Stack} = Immutable;

type EditorStateRecordType = {
  allowUndo: boolean,
  currentContent: ?ContentState,
  decorator: ?DraftDecoratorType,
  directionMap: ?OrderedMap<string, string>,
  forceSelection: boolean,
  inCompositionMode: boolean,
  inlineStyleOverride: ?DraftInlineStyle,
  lastChangeType: ?EditorChangeType,
  nativelyRenderedContent: ?ContentState,
  redoStack: Stack<ContentState>,
  selection: ?SelectionState,
  treeMap: ?OrderedMap<string, List<any>>,
  undoStack: Stack<ContentState>,
};

const defaultRecord: EditorStateRecordType = {
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
  undoStack: Stack(),
};

const EditorStateRecord = (Record(defaultRecord): any);

class EditorState {
  _immutable: EditorStateRecord;

  static createEmpty(decorator?: ?DraftDecoratorType): EditorState {
    return EditorState.createWithContent(
      ContentState.createFromText(''),
      decorator,
    );
  }

  static createWithContent(
    contentState: ContentState,
    decorator?: ?DraftDecoratorType,
  ): EditorState {
    const firstKey = contentState
      .getBlockMap()
      .first()
      .getKey();
    return EditorState.create({
      currentContent: contentState,
      undoStack: Stack(),
      redoStack: Stack(),
      decorator: decorator || null,
      selection: SelectionState.createEmpty(firstKey),
    });
  }

  static create(config: Object): EditorState {
    const {currentContent, decorator} = config;
    const recordConfig = {
      ...config,
      treeMap: generateNewTreeMap(currentContent, decorator),
      directionMap: EditorBidiService.getDirectionMap(currentContent),
    };
    return new EditorState(new EditorStateRecord(recordConfig));
  }

  static set(editorState: EditorState, put: Object): EditorState {
    const map = editorState.getImmutable().withMutations(state => {
      const existingDecorator = state.get('decorator');
      let decorator = existingDecorator;
      if (put.decorator === null) {
        decorator = null;
      } else if (put.decorator) {
        decorator = put.decorator;
      }

      const newContent = put.currentContent || editorState.getCurrentContent();

      if (decorator !== existingDecorator) {
        const treeMap: OrderedMap<any, any> = state.get('treeMap');
        let newTreeMap;
        if (decorator && existingDecorator) {
          newTreeMap = regenerateTreeForNewDecorator(
            newContent,
            newContent.getBlockMap(),
            treeMap,
            decorator,
            existingDecorator,
          );
        } else {
          newTreeMap = generateNewTreeMap(newContent, decorator);
        }

        state.merge({
          decorator,
          treeMap: newTreeMap,
          nativelyRenderedContent: null,
        });
        return;
      }

      const existingContent = editorState.getCurrentContent();
      if (newContent !== existingContent) {
        state.set(
          'treeMap',
          regenerateTreeForNewBlocks(
            editorState,
            newContent.getBlockMap(),
            newContent.getEntityMap(),
            decorator,
          ),
        );
      }

      state.merge(put);
    });

    return new EditorState(map);
  }

  toJS(): Object {
    return this.getImmutable().toJS();
  }

  getAllowUndo(): boolean {
    return this.getImmutable().get('allowUndo');
  }

  getCurrentContent(): ContentState {
    return this.getImmutable().get('currentContent');
  }

  getUndoStack(): Stack<ContentState> {
    return this.getImmutable().get('undoStack');
  }

  getRedoStack(): Stack<ContentState> {
    return this.getImmutable().get('redoStack');
  }

  getSelection(): SelectionState {
    return this.getImmutable().get('selection');
  }

  getDecorator(): ?DraftDecoratorType {
    return this.getImmutable().get('decorator');
  }

  isInCompositionMode(): boolean {
    return this.getImmutable().get('inCompositionMode');
  }

  mustForceSelection(): boolean {
    return this.getImmutable().get('forceSelection');
  }

  getNativelyRenderedContent(): ?ContentState {
    return this.getImmutable().get('nativelyRenderedContent');
  }

  getLastChangeType(): ?EditorChangeType {
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
  getInlineStyleOverride(): ?DraftInlineStyle {
    return this.getImmutable().get('inlineStyleOverride');
  }

  static setInlineStyleOverride(
    editorState: EditorState,
    inlineStyleOverride: DraftInlineStyle,
  ): EditorState {
    return EditorState.set(editorState, {inlineStyleOverride});
  }

  /**
   * Get the appropriate inline style for the editor state. If an
   * override is in place, use it. Otherwise, the current style is
   * based on the location of the selection state.
   */
  getCurrentInlineStyle(): DraftInlineStyle {
    const override = this.getInlineStyleOverride();
    if (override != null) {
      return override;
    }

    const content = this.getCurrentContent();
    const selection = this.getSelection();

    if (selection.isCollapsed()) {
      return getInlineStyleForCollapsedSelection(content, selection);
    }

    return getInlineStyleForNonCollapsedSelection(content, selection);
  }

  getBlockTree(blockKey: string): List<any> {
    return this.getImmutable().getIn(['treeMap', blockKey]);
  }

  isSelectionAtStartOfContent(): boolean {
    const firstKey = this.getCurrentContent()
      .getBlockMap()
      .first()
      .getKey();
    return this.getSelection().hasEdgeWithin(firstKey, 0, 0);
  }

  isSelectionAtEndOfContent(): boolean {
    const content = this.getCurrentContent();
    const blockMap = content.getBlockMap();
    const last = blockMap.last();
    const end = last.getLength();
    return this.getSelection().hasEdgeWithin(last.getKey(), end, end);
  }

  getDirectionMap(): ?OrderedMap<any, any> {
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
  static acceptSelection(
    editorState: EditorState,
    selection: SelectionState,
  ): EditorState {
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
  static forceSelection(
    editorState: EditorState,
    selection: SelectionState,
  ): EditorState {
    if (!selection.getHasFocus()) {
      selection = selection.set('hasFocus', true);
    }
    return updateSelection(editorState, selection, true);
  }

  /**
   * Move selection to the end of the editor without forcing focus.
   */
  static moveSelectionToEnd(editorState: EditorState): EditorState {
    const content = editorState.getCurrentContent();
    const lastBlock = content.getLastBlock();
    const lastKey = lastBlock.getKey();
    const length = lastBlock.getLength();

    return EditorState.acceptSelection(
      editorState,
      new SelectionState({
        anchorKey: lastKey,
        anchorOffset: length,
        focusKey: lastKey,
        focusOffset: length,
        isBackward: false,
      }),
    );
  }

  /**
   * Force focus to the end of the editor. This is useful in scenarios
   * where we want to programmatically focus the input and it makes sense
   * to allow the user to continue working seamlessly.
   */
  static moveFocusToEnd(editorState: EditorState): EditorState {
    const afterSelectionMove = EditorState.moveSelectionToEnd(editorState);
    return EditorState.forceSelection(
      afterSelectionMove,
      afterSelectionMove.getSelection(),
    );
  }

  /**
   * Push the current ContentState onto the undo stack if it should be
   * considered a boundary state, and set the provided ContentState as the
   * new current content.
   */
  static push(
    editorState: EditorState,
    contentState: ContentState,
    changeType: EditorChangeType,
    forceSelection: boolean = true,
  ): EditorState {
    if (editorState.getCurrentContent() === contentState) {
      return editorState;
    }

    const directionMap = EditorBidiService.getDirectionMap(
      contentState,
      editorState.getDirectionMap(),
    );

    if (!editorState.getAllowUndo()) {
      return EditorState.set(editorState, {
        currentContent: contentState,
        directionMap,
        lastChangeType: changeType,
        selection: contentState.getSelectionAfter(),
        forceSelection,
        inlineStyleOverride: null,
      });
    }

    const selection = editorState.getSelection();
    const currentContent = editorState.getCurrentContent();
    let undoStack = editorState.getUndoStack();
    let newContent = contentState;

    if (
      selection !== currentContent.getSelectionAfter() ||
      mustBecomeBoundary(editorState, changeType)
    ) {
      undoStack = undoStack.push(currentContent);
      newContent = newContent.set('selectionBefore', selection);
    } else if (
      changeType === 'insert-characters' ||
      changeType === 'backspace-character' ||
      changeType === 'delete-character'
    ) {
      // Preserve the previous selection.
      newContent = newContent.set(
        'selectionBefore',
        currentContent.getSelectionBefore(),
      );
    }

    let inlineStyleOverride = editorState.getInlineStyleOverride();

    // Don't discard inline style overrides for the following change types:
    const overrideChangeTypes = [
      'adjust-depth',
      'change-block-type',
      'split-block',
    ];

    if (overrideChangeTypes.indexOf(changeType) === -1) {
      inlineStyleOverride = null;
    }

    const editorStateChanges = {
      currentContent: newContent,
      directionMap,
      undoStack,
      redoStack: Stack(),
      lastChangeType: changeType,
      selection: contentState.getSelectionAfter(),
      forceSelection,
      inlineStyleOverride,
    };

    return EditorState.set(editorState, editorStateChanges);
  }

  /**
   * Make the top ContentState in the undo stack the new current content and
   * push the current content onto the redo stack.
   */
  static undo(editorState: EditorState): EditorState {
    if (!editorState.getAllowUndo()) {
      return editorState;
    }

    const undoStack = editorState.getUndoStack();
    const newCurrentContent = undoStack.peek();
    if (!newCurrentContent) {
      return editorState;
    }

    const currentContent = editorState.getCurrentContent();
    const directionMap = EditorBidiService.getDirectionMap(
      newCurrentContent,
      editorState.getDirectionMap(),
    );

    return EditorState.set(editorState, {
      currentContent: newCurrentContent,
      directionMap,
      undoStack: undoStack.shift(),
      redoStack: editorState.getRedoStack().push(currentContent),
      forceSelection: true,
      inlineStyleOverride: null,
      lastChangeType: 'undo',
      nativelyRenderedContent: null,
      selection: currentContent.getSelectionBefore(),
    });
  }

  /**
   * Make the top ContentState in the redo stack the new current content and
   * push the current content onto the undo stack.
   */
  static redo(editorState: EditorState): EditorState {
    if (!editorState.getAllowUndo()) {
      return editorState;
    }

    const redoStack = editorState.getRedoStack();
    const newCurrentContent = redoStack.peek();
    if (!newCurrentContent) {
      return editorState;
    }

    const currentContent = editorState.getCurrentContent();
    const directionMap = EditorBidiService.getDirectionMap(
      newCurrentContent,
      editorState.getDirectionMap(),
    );

    return EditorState.set(editorState, {
      currentContent: newCurrentContent,
      directionMap,
      undoStack: editorState.getUndoStack().push(currentContent),
      redoStack: redoStack.shift(),
      forceSelection: true,
      inlineStyleOverride: null,
      lastChangeType: 'redo',
      nativelyRenderedContent: null,
      selection: newCurrentContent.getSelectionAfter(),
    });
  }

  /**
   * Not for public consumption.
   */
  constructor(immutable: EditorStateRecord) {
    this._immutable = immutable;
  }

  /**
   * Not for public consumption.
   */
  getImmutable(): EditorStateRecord {
    return this._immutable;
  }
}

/**
 * Set the supplied SelectionState as the new current selection, and set
 * the `force` flag to trigger manual selection placement by the view.
 */
function updateSelection(
  editorState: EditorState,
  selection: SelectionState,
  forceSelection: boolean,
): EditorState {
  return EditorState.set(editorState, {
    selection,
    forceSelection,
    nativelyRenderedContent: null,
    inlineStyleOverride: null,
  });
}

/**
 * Regenerate the entire tree map for a given ContentState and decorator.
 * Returns an OrderedMap that maps all available ContentBlock objects.
 */
function generateNewTreeMap(
  contentState: ContentState,
  decorator?: ?DraftDecoratorType,
): OrderedMap<string, List<any>> {
  return contentState
    .getBlockMap()
    .map(block => BlockTree.generate(contentState, block, decorator))
    .toOrderedMap();
}

/**
 * Regenerate tree map objects for all ContentBlocks that have changed
 * between the current editorState and newContent. Returns an OrderedMap
 * with only changed regenerated tree map objects.
 */
function regenerateTreeForNewBlocks(
  editorState: EditorState,
  newBlockMap: BlockMap,
  newEntityMap: EntityMap,
  decorator?: ?DraftDecoratorType,
): OrderedMap<string, List<any>> {
  const contentState = editorState
    .getCurrentContent()
    .set('entityMap', newEntityMap);
  const prevBlockMap = contentState.getBlockMap();
  const prevTreeMap = editorState.getImmutable().get('treeMap');
  return prevTreeMap.merge(
    newBlockMap
      .toSeq()
      .filter((block, key) => block !== prevBlockMap.get(key))
      .map(block => BlockTree.generate(contentState, block, decorator)),
  );
}

/**
 * Generate tree map objects for a new decorator object, preserving any
 * decorations that are unchanged from the previous decorator.
 *
 * Note that in order for this to perform optimally, decoration Lists for
 * decorators should be preserved when possible to allow for direct immutable
 * List comparison.
 */
function regenerateTreeForNewDecorator(
  content: ContentState,
  blockMap: BlockMap,
  previousTreeMap: OrderedMap<string, List<any>>,
  decorator: DraftDecoratorType,
  existingDecorator: DraftDecoratorType,
): OrderedMap<string, List<any>> {
  return previousTreeMap.merge(
    blockMap
      .toSeq()
      .filter(block => {
        return (
          decorator.getDecorations(block, content) !==
          existingDecorator.getDecorations(block, content)
        );
      })
      .map(block => BlockTree.generate(content, block, decorator)),
  );
}

/**
 * Return whether a change should be considered a boundary state, given
 * the previous change type. Allows us to discard potential boundary states
 * during standard typing or deletion behavior.
 */
function mustBecomeBoundary(
  editorState: EditorState,
  changeType: EditorChangeType,
): boolean {
  const lastChangeType = editorState.getLastChangeType();
  return (
    changeType !== lastChangeType ||
    (changeType !== 'insert-characters' &&
      changeType !== 'backspace-character' &&
      changeType !== 'delete-character')
  );
}

function getInlineStyleForCollapsedSelection(
  content: ContentState,
  selection: SelectionState,
): DraftInlineStyle {
  const startKey = selection.getStartKey();
  const startOffset = selection.getStartOffset();
  const startBlock = content.getBlockForKey(startKey);

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

function getInlineStyleForNonCollapsedSelection(
  content: ContentState,
  selection: SelectionState,
): DraftInlineStyle {
  const startKey = selection.getStartKey();
  const startOffset = selection.getStartOffset();
  const startBlock = content.getBlockForKey(startKey);

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

function lookUpwardForInlineStyle(
  content: ContentState,
  fromKey: string,
): DraftInlineStyle {
  const lastNonEmpty = content
    .getBlockMap()
    .reverse()
    .skipUntil((_, k) => k === fromKey)
    .skip(1)
    .skipUntil((block, _) => block.getLength())
    .first();

  if (lastNonEmpty) {
    return lastNonEmpty.getInlineStyleAt(lastNonEmpty.getLength() - 1);
  }
  return OrderedSet();
}

module.exports = EditorState;
