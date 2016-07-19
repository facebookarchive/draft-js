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

    let mockPasteEvent, comp, editorNode;

    describe('if pasteUniqueEntities is false', function() {

      beforeEach(function() {
        globalEditorState = EditorState.createWithContent(
          convertFromRaw(rawContent)
        );
        comp = renderIntoDocument(
          <TestEditor editorState={globalEditorState} />
        );
        mockPasteEvent = {
          clipboardData: {
            types: ['text/html', 'text/plain'],
            getData: () => comp.refs.draftEditor.getEditorKey(),
          }
        };
        editorNode = ReactDOM.findDOMNode(comp.refs.draftEditor.refs.editor);
      });

      it('entities should not be cloned', function() {
        const selectedText = comp.forceSelection(3, 14);
        Simulate.copy(editorNode);
        comp.forceSelection(testText.length, testText.length);
        Simulate.paste(editorNode, mockPasteEvent);

        expect(changeSpy).toHaveBeenCalled();

        const blockMap = globalEditorState.getCurrentContent().getBlockMap();
        const firstBlock = blockMap.first();

        expect(blockMap.size).toBe(1);
        expect(firstBlock.text).toEqual(testText + selectedText);

        const firstEntityChar = firstBlock.get('characterList').get(13);
        const firstEntityKey = firstEntityChar.getEntity();
        const firstEntity = Entity.get(firstEntityKey);

        const pastedEntityChar = firstBlock.get('characterList').get(25);
        const pastedEntityKey = pastedEntityChar.getEntity();

        expect(firstEntityKey).toEqual(pastedEntityKey);

        const { entityMap } = convertToRaw(globalEditorState.getCurrentContent());
        expect(Object.keys(entityMap).length).toEqual(1);
      });

    });

    describe('if pasteUniqueEntities is true', function() {

      let comp, editorNode;

      beforeEach(function() {
        globalEditorState = EditorState.createWithContent(
          convertFromRaw(rawContent)
        );
        comp = renderIntoDocument(
          <TestEditor pasteUniqueEntities={true} editorState={globalEditorState} />
        );
        mockPasteEvent = {
          clipboardData: {
            types: ['text/html', 'text/plain'],
            getData: () => comp.refs.draftEditor.getEditorKey(),
          }
        };
        editorNode = ReactDOM.findDOMNode(comp.refs.draftEditor.refs.editor);
      });

      it('entities should be cloned', function() {
        const selectedText = comp.forceSelection(3, 14);
        Simulate.copy(editorNode);
        comp.forceSelection(testText.length, testText.length);
        Simulate.paste(editorNode, mockPasteEvent);

        expect(changeSpy).toHaveBeenCalled();

        const blockMap = globalEditorState.getCurrentContent().getBlockMap();
        const firstBlock = blockMap.first();

        expect(blockMap.size).toBe(1);
        expect(firstBlock.text).toEqual(testText + selectedText);

        const firstEntityChar = firstBlock.get('characterList').get(13);
        const firstEntityKey = firstEntityChar.getEntity();
        const firstEntity = Entity.get(firstEntityKey);

        const pastedEntityChar = firstBlock.get('characterList').get(25);
        const pastedEntityKey = pastedEntityChar.getEntity();
        const pastedEntity = Entity.get(pastedEntityKey);

        expect(firstEntity.getData()).toEqual(pastedEntity.getData());
        expect(pastedEntity.getData()).not.toBe(null);
      });

      it('entity references should be pasted in the right place', function() {
        comp.forceSelection(3, 14);
        Simulate.copy(editorNode);
        comp.forceSelection(testText.length, testText.length);
        Simulate.paste(editorNode, mockPasteEvent);

        expect(changeSpy).toHaveBeenCalled();

        const blockMap = globalEditorState.getCurrentContent().getBlockMap();
        const firstBlock = blockMap.first();

        expect(blockMap.size).toBe(1);
        expect(firstBlock.text).toEqual(testText + 'equation:  ');

        const firstEntityChar = firstBlock.get('characterList').get(13);
        const firstEntityKey = firstEntityChar.getEntity();
        const firstEntityNumber = parseInt(firstEntityKey, 10);
        const pastedEntityChar = firstBlock.get('characterList').get(25);
        const pastedEntityKey = pastedEntityChar.getEntity();
        const pastedEntityNumber = parseInt(pastedEntityKey, 10);

        expect(firstEntityKey).toBeTruthy();
        expect(pastedEntityKey).toBeTruthy();
        expect(pastedEntityNumber).toEqual(firstEntityNumber + 1);
      });

    });

  });

  describe('copying and pasting a selection containing an entity without the editorKey on it', function(){

    let mockPasteEvent, comp, editorNode
    const clipboardText = 'COPIED TEXT';

    beforeEach(function() {
      globalEditorState = EditorState.createWithContent(
        convertFromRaw(rawContent)
      );
      comp = renderIntoDocument(
        <TestEditor pasteUniqueEntities={true} editorState={globalEditorState} />
      );
      mockPasteEvent = {
        clipboardData: {
          types: ['text/html', 'text/plain'],
          getData: () => clipboardText,
        }
      };
      editorNode = ReactDOM.findDOMNode(comp.refs.draftEditor.refs.editor);
    });

    it('pasting plain text uses the text from the paste event', function() {
        comp.forceSelection(3, 14);
        Simulate.copy(editorNode);
        comp.forceSelection(testText.length, testText.length);
        Simulate.paste(editorNode, mockPasteEvent);

        expect(changeSpy).toHaveBeenCalled();

        const blockMap = globalEditorState.getCurrentContent().getBlockMap();
        const firstBlock = blockMap.first();

        expect(blockMap.size).toBe(1);
        expect(firstBlock.text).toEqual(testText + clipboardText);
    });

    // it('pasting plain HTML (non-internal paste) works as expected', function() {
    //   // TODO
    // });
  });


});
