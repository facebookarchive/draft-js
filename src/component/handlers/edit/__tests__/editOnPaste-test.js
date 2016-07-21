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

jest.disableAutomock();

import React from 'react';
import ReactDOM from 'react-dom';
import { renderIntoDocument, Simulate } from 'react-addons-test-utils';
import {
  Editor,
  EditorState,
  convertFromRaw,
  SelectionState,
  convertToRaw
} from 'Draft';
import Entity from 'DraftEntity';

describe('editOnPaste', function() {

  let globalEditorState;
  const changeSpy = jasmine.createSpy('changeSpy');

  const testText = 'An equation:  !';

  const rawContent = {
    blocks: [
      {
        text: testText,
        type: 'unstyled',
        entityRanges: [{offset: 13, length: 1, key: 'first'}],
      },
    ],

    entityMap: {
      first: {
        type: 'equation',
        mutability: 'IMMUTABLE',
        data: {
          text: 'x^2',
        },
      },
    },
  };

  class TestEditor extends React.Component {
    constructor(props) {
      super(props);
      this.state = { editorState: props.editorState };
    }

    onChange(editorState) {
      changeSpy();
      globalEditorState = editorState;
      this.setState({editorState});
    }

    forceSelection(anchorOffset, focusOffset, block=null) {
      const { editorState } = this.state;
      if (block === null) {
        block = editorState.getCurrentContent().getBlockMap().first();
      }
      const selection = new SelectionState({
        anchorKey: block.key,
        anchorOffset: anchorOffset,
        focusKey: block.key,
        focusOffset: focusOffset,
      });
      let newEditorState = EditorState.forceSelection(globalEditorState, selection);
      this.onChange(newEditorState);
      return block.getText().slice(anchorOffset, focusOffset)
    }

    render() {
      return (
        <Editor
          ref="draftEditor"
          onChange={this.onChange.bind(this)}
          editorState={this.state.editorState}
          pasteUniqueEntities={this.props.pasteUniqueEntities} />
      );
    }
  }

  describe('copying and pasting a selection containing an entity with the editorKey on it', function() {

    let selectedText, blockMap, firstBlock;

    describe('if pasteUniqueEntities is false', function() {

      beforeEach(function() {
        globalEditorState = EditorState.createWithContent(
          convertFromRaw(rawContent)
        );
        const comp = renderIntoDocument(
          <TestEditor editorState={globalEditorState} />
        );
        const mockPasteEvent = {
          clipboardData: {
            types: ['text/html', 'text/plain'],
            // Including the editorKey ensures that internal paste is detected
            getData: () => comp.refs.draftEditor.getEditorKey(),
          }
        };
        const editorNode = ReactDOM.findDOMNode(comp.refs.draftEditor.refs.editor);

        selectedText = comp.forceSelection(3, 14);
        Simulate.copy(editorNode);
        comp.forceSelection(testText.length, testText.length);
        Simulate.paste(editorNode, mockPasteEvent);

        blockMap = globalEditorState.getCurrentContent().getBlockMap();
        firstBlock = blockMap.first();
      });

      it('fires onChange', function() {
        expect(changeSpy).toHaveBeenCalled();
      });

      it('no new blocks are created', function() {
        expect(blockMap.size).toBe(1);
      });

      it('appends the text in the internal clipboard to the block', function() {
        expect(firstBlock.text).toEqual(testText + selectedText);
      });

      it('entities should not be cloned', function() {
        const firstEntityKey = firstBlock.get('characterList').get(13).getEntity();
        const pastedEntityKey = firstBlock.get('characterList').get(25).getEntity();

        expect(firstEntityKey).toEqual(pastedEntityKey);

        const { entityMap } = convertToRaw(globalEditorState.getCurrentContent());
        expect(Object.keys(entityMap).length).toEqual(1);
      });

    });

    describe('if pasteUniqueEntities is true', function() {

      let selectedText, blockMap, firstBlock;

      beforeEach(function() {
        globalEditorState = EditorState.createWithContent(
          convertFromRaw(rawContent)
        );
        const comp = renderIntoDocument(
          <TestEditor pasteUniqueEntities={true} editorState={globalEditorState} />
        );
        const mockPasteEvent = {
          clipboardData: {
            types: ['text/html', 'text/plain'],
            getData: () => comp.refs.draftEditor.getEditorKey(),
          }
        };
        const editorNode = ReactDOM.findDOMNode(comp.refs.draftEditor.refs.editor);

        selectedText = comp.forceSelection(3, 14);
        Simulate.copy(editorNode);
        comp.forceSelection(testText.length, testText.length);
        Simulate.paste(editorNode, mockPasteEvent);

        blockMap = globalEditorState.getCurrentContent().getBlockMap();
        firstBlock = blockMap.first();
      });

      it('fires onChange', function() {
        expect(changeSpy).toHaveBeenCalled();
      });

      it('no new blocks are created', function() {
        expect(blockMap.size).toBe(1);
      });

      it('appends the text in the internal clipboard to the block', function() {
        expect(firstBlock.text).toEqual(testText + selectedText);
      });

      it('entities in the selection should be cloned and referenced', function() {
        const firstEntityChar = firstBlock.get('characterList').get(13);
        const firstEntityKey = firstEntityChar.getEntity();
        const firstEntityNumber = parseInt(firstEntityKey, 10);
        const firstEntity = Entity.get(firstEntityKey);

        const pastedEntityChar = firstBlock.get('characterList').get(25);
        const pastedEntityKey = pastedEntityChar.getEntity();
        const pastedEntity = Entity.get(pastedEntityKey);
        const pastedEntityNumber = parseInt(pastedEntityKey, 10);

        expect(firstEntity.getData()).toEqual(pastedEntity.getData());
        expect(pastedEntity.getData()).not.toBe(null);

        expect(firstEntityKey).toBeTruthy();
        expect(pastedEntityKey).toBeTruthy();
        expect(pastedEntityNumber).toEqual(firstEntityNumber + 1);
      });

    });

  });

  describe('copying and pasting a selection containing an entity without the editorKey on it', function(){

    let blockMap, firstBlock;
    const clipboardText = 'COPIED TEXT';

    beforeEach(function() {
      globalEditorState = EditorState.createWithContent(
        convertFromRaw(rawContent)
      );
      const comp = renderIntoDocument(
        <TestEditor editorState={globalEditorState} />
      );
      const mockPasteEvent = {
        clipboardData: {
          types: ['text/html', 'text/plain'],
          getData: () => clipboardText,
        }
      };
      const editorNode = ReactDOM.findDOMNode(comp.refs.draftEditor.refs.editor);

      comp.forceSelection(3, 14);
      Simulate.copy(editorNode);
      comp.forceSelection(testText.length, testText.length);
      Simulate.paste(editorNode, mockPasteEvent);

      blockMap = globalEditorState.getCurrentContent().getBlockMap();
      firstBlock = blockMap.first();
    });

    it('fires onChange', function() {
      expect(changeSpy).toHaveBeenCalled();
    });

    it ('no new blocks are added', function() {
      expect(blockMap.size).toBe(1);
    })

    it('uses the text from the system clipboard', function() {
      expect(firstBlock.text).toEqual(testText + clipboardText);
    });

    it('no entities should be cloned', function() {
      const { entityMap } = convertToRaw(globalEditorState.getCurrentContent());
      expect(Object.keys(entityMap).length).toEqual(1);
    });

  });

});
