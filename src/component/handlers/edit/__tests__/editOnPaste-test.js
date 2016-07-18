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
import { Editor, EditorState, convertFromRaw, SelectionState } from 'Draft';
import Entity from 'DraftEntity';
import draftEntityKeyPrefix from 'draftEntityKeyPrefix';

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

  describe('copying and pasting a selection containing an entity', function() {

    const mockPasteEvent = {
      clipboardData: {
        types: ['text/html', 'text/plain'],
        getData: () => draftEntityKeyPrefix + '1',
      }
    };

    // describe('if pasteUniqueEntities is false', function() {

    //   it('entities should not be cloned', function() {
    //     // TODO
    //   });

    // });

    describe('if pasteUniqueEntities is true', function() {

      let comp, editorNode;

      beforeEach(function() {
        globalEditorState = EditorState.createWithContent(
          convertFromRaw(rawContent)
        );
        comp = renderIntoDocument(
          <TestEditor
            pasteUniqueEntities={true}
            editorState={globalEditorState} />
        );
        editorNode = ReactDOM.findDOMNode(comp.refs.draftEditor.refs.editor);
      });

      it('entities should be cloned', function() {
        comp.forceSelection(3, 14);
        Simulate.copy(editorNode);
        Simulate.paste(editorNode, mockPasteEvent);

        expect(changeSpy).toHaveBeenCalled();
        expect(globalEditorState instanceof EditorState).toBe(true);

        const blockMap = globalEditorState.getCurrentContent().getBlockMap();
        const firstBlock = blockMap.first();

        expect(blockMap.size).toBe(1);
        expect(firstBlock.text).toEqual('An equation:  !');

        const originalEntity = Entity.get(draftEntityKeyPrefix+'1');
        const clonedEntity = Entity.get(draftEntityKeyPrefix+'2');
        expect(originalEntity.getData()).toEqual(clonedEntity.getData());
        expect(clonedEntity.getData()).not.toBe(null);
      });

      it('entity references should be pasted in the right place', function() {
        comp.forceSelection(3, 14);
        Simulate.copy(editorNode);
        comp.forceSelection(testText.length, testText.length);
        Simulate.paste(editorNode, mockPasteEvent);

        expect(changeSpy).toHaveBeenCalled();
        expect(globalEditorState instanceof EditorState).toBe(true);

        const blockMap = globalEditorState.getCurrentContent().getBlockMap();
        const firstBlock = blockMap.first();

        expect(blockMap.size).toBe(1);
        expect(firstBlock.text).toEqual('An equation:  !equation:  ');

        const firstEntityChar = firstBlock.get('characterList').get(13);
        const firstEntityKey = firstEntityChar.getEntity();
        const firstEntityNumber = parseInt(firstEntityKey[-1], 10);
        const pastedEntityChar = firstBlock.get('characterList').get(25);
        const pastedEntityKey = pastedEntityChar.getEntity();
        const pastedEntityNumber = parseInt(pastedEntityKey[-1], 10);

        expect(firstEntityKey).toBeTruthy();
        expect(pastedEntityKey).toBeTruthy();
        expect(pastedEntityNumber).toEqual(firstEntityNumber + 1);
        expect(pastedEntityKey.indexOf(draftEntityKeyPrefix)).toEqual(0);
      });

      // it('pasting plain text (non-internal paste) works as expected', function() {
      //   // TODO
      // });

      // it('pasting plain HTML (non-internal paste) works as expected', function() {
      //   // TODO
      // });


    });
  });
});
