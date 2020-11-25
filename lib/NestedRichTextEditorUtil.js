"use strict";

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * 
 * @emails oncall+draft_js
 *
 * This is unstable and not part of the public API and should not be used by
 * production systems. This file may be update/removed without notice.
 */
var ContentBlockNode = require("./ContentBlockNode");

var DraftModifier = require("./DraftModifier");

var DraftTreeOperations = require("./DraftTreeOperations");

var EditorState = require("./EditorState");

var RichTextEditorUtil = require("./RichTextEditorUtil");

var adjustBlockDepthForContentState = require("./adjustBlockDepthForContentState");

var generateRandomKey = require("./generateRandomKey");

var invariant = require("fbjs/lib/invariant"); // Eventually we could allow to control this list by either allowing user configuration
// and/or a schema in conjunction to DraftBlockRenderMap


var NESTING_DISABLED_TYPES = ['code-block', 'atomic'];
var NestedRichTextEditorUtil = {
  handleKeyCommand: function handleKeyCommand(editorState, command) {
    switch (command) {
      case 'bold':
        return NestedRichTextEditorUtil.toggleInlineStyle(editorState, 'BOLD');

      case 'italic':
        return NestedRichTextEditorUtil.toggleInlineStyle(editorState, 'ITALIC');

      case 'underline':
        return NestedRichTextEditorUtil.toggleInlineStyle(editorState, 'UNDERLINE');

      case 'code':
        return NestedRichTextEditorUtil.toggleCode(editorState);

      case 'backspace':
      case 'backspace-word':
      case 'backspace-to-start-of-line':
        return NestedRichTextEditorUtil.onBackspace(editorState);

      case 'delete':
      case 'delete-word':
      case 'delete-to-end-of-block':
        return NestedRichTextEditorUtil.onDelete(editorState);

      default:
        // they may have custom editor commands; ignore those
        return null;
    }
  },
  onDelete: function onDelete(editorState) {
    var selection = editorState.getSelection();

    if (!selection.isCollapsed()) {
      return null;
    }

    var content = editorState.getCurrentContent();
    var startKey = selection.getStartKey();
    var block = content.getBlockForKey(startKey);
    var length = block.getLength(); // The cursor is somewhere within the text. Behave normally.

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

  /**
   * Ensures that if on the beginning of unstyled block and first child of
   * a nested parent we add its text to the neareast previous leaf node
   */
  onBackspace: function onBackspace(editorState) {
    var selection = editorState.getSelection();
    var content = editorState.getCurrentContent();
    var currentBlock = content.getBlockForKey(selection.getStartKey());
    var previousBlockKey = currentBlock.getPrevSiblingKey();

    if (!selection.isCollapsed() || selection.getAnchorOffset() || selection.getFocusOffset() || currentBlock.getType() === 'unstyled' && previousBlockKey && content.getBlockForKey(previousBlockKey).getType() !== 'atomic') {
      return null;
    }

    var startKey = selection.getStartKey();
    var blockBefore = content.getBlockBefore(startKey); // we want to delete that block completely

    if (blockBefore && blockBefore.getType() === 'atomic') {
      var withoutAtomicBlock = DraftModifier.removeRange(content, selection.merge({
        focusKey: blockBefore.getKey(),
        focusOffset: blockBefore.getText().length,
        anchorKey: startKey,
        anchorOffset: content.getBlockForKey(startKey).getText().length,
        isBackward: false
      }), 'forward').merge({
        selectionAfter: selection
      });

      if (withoutAtomicBlock !== content) {
        return EditorState.push(editorState, withoutAtomicBlock, 'remove-range');
      }
    } // if we have a next sibling we should not allow the normal backspace
    // behaviour of moving this text into its parent
    // if (currentBlock.getPrevSiblingKey()) {
    //  return editorState;
    // }
    // If that doesn't succeed, try to remove the current block style.


    var withoutBlockStyle = NestedRichTextEditorUtil.tryToRemoveBlockStyle(editorState);

    if (withoutBlockStyle) {
      return EditorState.push(editorState, withoutBlockStyle, withoutBlockStyle.getBlockMap().get(currentBlock.getKey()).getType() === 'unstyled' ? 'change-block-type' : 'adjust-depth');
    }

    return null;
  },
  // Todo (T32099101)
  // onSplitNestedBlock() {},
  // Todo (T32099101)
  // onSplitParent() {},

  /**
   * Ensures that we can create nested blocks by changing the block type of
   * a ranged selection
   */
  toggleBlockType: function toggleBlockType(editorState, blockType) {
    var selection = editorState.getSelection();
    var content = editorState.getCurrentContent();
    var currentBlock = content.getBlockForKey(selection.getStartKey());
    var haveChildren = !currentBlock.getChildKeys().isEmpty();
    var isSelectionCollapsed = selection.isCollapsed();
    var isMultiBlockSelection = selection.getAnchorKey() !== selection.getFocusKey();
    var isUnsupportedNestingBlockType = NESTING_DISABLED_TYPES.includes(blockType);
    var isCurrentBlockOfUnsupportedNestingBlockType = NESTING_DISABLED_TYPES.includes(currentBlock.getType()); // we don't allow this operations to avoid corrupting the document data model
    // to make sure that non nested blockTypes wont inherit children

    if ((isMultiBlockSelection || haveChildren) && isUnsupportedNestingBlockType) {
      return editorState;
    } // we can treat this operations the same way as we would for flat data structures


    if (isCurrentBlockOfUnsupportedNestingBlockType || isSelectionCollapsed || isUnsupportedNestingBlockType || isMultiBlockSelection || currentBlock.getType() === blockType || !currentBlock.getChildKeys().isEmpty()) {
      return RichTextEditorUtil.toggleBlockType(editorState, blockType);
    } // TODO
    // if we have full range selection on the block:
    //   extract text and insert a block after it with the text as its content
    // else
    //   split the block into before range and after unstyled blocks
    //


    return editorState;
  },
  currentBlockContainsLink: function currentBlockContainsLink(editorState) {
    var selection = editorState.getSelection();
    var contentState = editorState.getCurrentContent();
    var entityMap = contentState.getEntityMap();
    return contentState.getBlockForKey(selection.getAnchorKey()).getCharacterList().slice(selection.getStartOffset(), selection.getEndOffset()).some(function (v) {
      var entity = v.getEntity();
      return !!entity && contentState.getEntity(entity).getType() === 'LINK';
    });
  },
  getCurrentBlockType: function getCurrentBlockType(editorState) {
    var selection = editorState.getSelection();
    return editorState.getCurrentContent().getBlockForKey(selection.getStartKey()).getType();
  },
  getDataObjectForLinkURL: function getDataObjectForLinkURL(uri) {
    return {
      url: uri.toString()
    };
  },
  insertSoftNewline: function insertSoftNewline(editorState) {
    var contentState = DraftModifier.insertText(editorState.getCurrentContent(), editorState.getSelection(), '\n', editorState.getCurrentInlineStyle(), null);
    var newEditorState = EditorState.push(editorState, contentState, 'insert-characters');
    return EditorState.forceSelection(newEditorState, contentState.getSelectionAfter());
  },
  onTab: function onTab(event, editorState) {
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

    event.preventDefault(); // implement nested tree behaviour for onTab

    var blockMap = editorState.getCurrentContent().getBlockMap();
    var prevSiblingKey = block.getPrevSiblingKey();
    var nextSiblingKey = block.getNextSiblingKey();

    if (!event.shiftKey) {
      // if there is no previous sibling, we do nothing
      if (prevSiblingKey == null) {
        return editorState;
      } // if previous sibling is a non-leaf move node as child of previous sibling


      var prevSibling = blockMap.get(prevSiblingKey);
      var nextSibling = nextSiblingKey != null ? blockMap.get(nextSiblingKey) : null;
      var prevSiblingNonLeaf = prevSibling != null && prevSibling.getChildKeys().count() > 0;
      var nextSiblingNonLeaf = nextSibling != null && nextSibling.getChildKeys().count() > 0;

      if (prevSiblingNonLeaf) {
        blockMap = DraftTreeOperations.updateAsSiblingsChild(blockMap, key, 'previous'); // if next sibling is also non-leaf, merge the previous & next siblings

        if (nextSiblingNonLeaf) {
          blockMap = DraftTreeOperations.mergeBlocks(blockMap, prevSiblingKey);
        } // else, if only next sibling is non-leaf move node as child of next sibling

      } else if (nextSiblingNonLeaf) {
        blockMap = DraftTreeOperations.updateAsSiblingsChild(blockMap, key, 'next'); // if none of the siblings are non-leaf, we need to create a new parent
      } else {
        blockMap = DraftTreeOperations.createNewParent(blockMap, key);
      } // on un-tab

    } else {
      // if the block isn't nested, do nothing
      if (block.getParentKey() == null) {
        return editorState;
      }

      blockMap = onUntab(blockMap, block);
    }

    content = editorState.getCurrentContent().merge({
      blockMap: blockMap
    });
    var withAdjustment = adjustBlockDepthForContentState(content, selection, event.shiftKey ? -1 : 1);
    return EditorState.push(editorState, withAdjustment, 'adjust-depth');
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
    var currentStyle = editorState.getCurrentInlineStyle(); // If the selection is collapsed, toggle the specified style on or off and
    // set the result as the new inline style override. This will then be
    // used as the inline style for the next character to be inserted.

    if (selection.isCollapsed()) {
      return EditorState.setInlineStyleOverride(editorState, currentStyle.has(inlineStyle) ? currentStyle.remove(inlineStyle) : currentStyle.add(inlineStyle));
    } // If characters are selected, immediately apply or remove the
    // inline style on the document state itself.


    var content = editorState.getCurrentContent();
    var newContent; // If the style is already present for the selection range, remove it.
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
   * When a collapsed cursor is at the start of a styled block, changes block
   * type to 'unstyled'. Returns null if selection does not meet that criteria.
   */
  tryToRemoveBlockStyle: function tryToRemoveBlockStyle(editorState) {
    var selection = editorState.getSelection();
    var offset = selection.getAnchorOffset();

    if (selection.isCollapsed() && offset === 0) {
      var key = selection.getAnchorKey();
      var content = editorState.getCurrentContent();
      var block = content.getBlockForKey(key);
      var type = block.getType();
      var blockBefore = content.getBlockBefore(key);

      if (type === 'code-block' && blockBefore && blockBefore.getType() === 'code-block' && blockBefore.getLength() !== 0) {
        return null;
      }

      var depth = block.getDepth();

      if (type !== 'unstyled') {
        if ((type === 'unordered-list-item' || type === 'ordered-list-item') && depth > 0) {
          var newBlockMap = onUntab(content.getBlockMap(), block);
          newBlockMap = newBlockMap.set(key, newBlockMap.get(key).merge({
            depth: depth - 1
          }));
          return content.merge({
            blockMap: newBlockMap
          });
        }

        return DraftModifier.setBlockType(content, selection, 'unstyled');
      }
    }

    return null;
  }
};

var onUntab = function onUntab(blockMap, block) {
  var key = block.getKey();
  var parentKey = block.getParentKey();
  var nextSiblingKey = block.getNextSiblingKey();

  if (parentKey == null) {
    return blockMap;
  }

  var parent = blockMap.get(parentKey);
  var existingChildren = parent.getChildKeys();
  var blockIndex = existingChildren.indexOf(key);

  if (blockIndex === 0 || blockIndex === existingChildren.count() - 1) {
    blockMap = DraftTreeOperations.moveChildUp(blockMap, key);
  } else {
    // split the block into [0, blockIndex] in parent & the rest in a new block
    var prevChildren = existingChildren.slice(0, blockIndex + 1);
    var nextChildren = existingChildren.slice(blockIndex + 1);
    blockMap = blockMap.set(parentKey, parent.merge({
      children: prevChildren
    }));
    var newBlock = new ContentBlockNode({
      key: generateRandomKey(),
      text: '',
      depth: parent.getDepth(),
      type: parent.getType(),
      children: nextChildren,
      parent: parent.getParentKey()
    }); // add new block just before its the original next sibling in the block map
    // TODO(T33894878): Remove the map reordering code & fix converter after launch

    !(nextSiblingKey != null) ? process.env.NODE_ENV !== "production" ? invariant(false, 'block must have a next sibling here') : invariant(false) : void 0;
    var blocks = blockMap.toSeq();
    blockMap = blocks.takeUntil(function (block) {
      return block.getKey() === nextSiblingKey;
    }).concat([[newBlock.getKey(), newBlock]], blocks.skipUntil(function (block) {
      return block.getKey() === nextSiblingKey;
    })).toOrderedMap(); // set the nextChildren's parent to the new block

    blockMap = blockMap.map(function (block) {
      return nextChildren.includes(block.getKey()) ? block.merge({
        parent: newBlock.getKey()
      }) : block;
    }); // update the next/previous pointers for the children at the split

    blockMap = blockMap.set(key, block.merge({
      nextSibling: null
    })).set(nextSiblingKey, blockMap.get(nextSiblingKey).merge({
      prevSibling: null
    }));
    var parentNextSiblingKey = parent.getNextSiblingKey();

    if (parentNextSiblingKey != null) {
      blockMap = DraftTreeOperations.updateSibling(blockMap, newBlock.getKey(), parentNextSiblingKey);
    }

    blockMap = DraftTreeOperations.updateSibling(blockMap, parentKey, newBlock.getKey());
    blockMap = DraftTreeOperations.moveChildUp(blockMap, key);
  } // on untab, we also want to unnest any sibling blocks that become two levels deep
  // ensure that block's old parent does not have a non-leaf as its first child.


  var childWasUntabbed = false;

  if (parentKey != null) {
    var _parent = blockMap.get(parentKey);

    while (_parent != null) {
      var children = _parent.getChildKeys();

      var firstChildKey = children.first();
      !(firstChildKey != null) ? process.env.NODE_ENV !== "production" ? invariant(false, 'parent must have at least one child') : invariant(false) : void 0;
      var firstChild = blockMap.get(firstChildKey);

      if (firstChild.getChildKeys().count() === 0) {
        break;
      } else {
        blockMap = DraftTreeOperations.moveChildUp(blockMap, firstChildKey);
        _parent = blockMap.get(parentKey);
        childWasUntabbed = true;
      }
    }
  } // now, we may be in a state with two non-leaf blocks of the same type
  // next to each other


  if (childWasUntabbed && parentKey != null) {
    var _parent2 = blockMap.get(parentKey);

    var prevSiblingKey = _parent2 != null // parent may have been deleted
    ? _parent2.getPrevSiblingKey() : null;

    if (prevSiblingKey != null && _parent2.getChildKeys().count() > 0) {
      var prevSibling = blockMap.get(prevSiblingKey);

      if (prevSibling != null && prevSibling.getChildKeys().count() > 0) {
        blockMap = DraftTreeOperations.mergeBlocks(blockMap, prevSiblingKey);
      }
    }
  }

  return blockMap;
};

module.exports = NestedRichTextEditorUtil;