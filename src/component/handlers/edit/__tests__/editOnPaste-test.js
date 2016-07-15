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
import { Editor, EditorState, convertFromRaw, BlockMapBuilder, ContentBlock, SelectionState } from 'Draft';
import editOnPaste from 'editOnPaste';
import draftEntityKeyPrefix from 'draftEntityKeyPrefix';

describe('editOnPaste', function() {

  let comp, editorState
  const changeSpy = jasmine.createSpy('changeSpy');

  const rawContent = {
    blocks: [
      {
        text: 'This is an immutable equation:  .',
        type: 'unstyled',
        entityRanges: [{offset: 31, length: 1, key: 'first'}],
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

  const mockPasteEvent = {
    clipboardData: {
      types: ['text/html', 'text/plain'],
      getData: () => draftEntityKeyPrefix + '1' ,
    }
  };

  class TestEditor extends React.Component {
    constructor(props){
      super(props)

      let editorState = EditorState.createWithContent(
        convertFromRaw(rawContent)
      )

      const firstBlock = editorState.getCurrentContent().getBlockMap().first()

      const selection = new SelectionState({
        anchorKey: firstBlock.key,
        anchorOffset: 21,
        focusKey: firstBlock.key,
        focusOffset: 33,
        hasFocus: true
      })

      editorState = EditorState.forceSelection(editorState, selection)

      this.state = { editorState }
    }

    onChange(editorState) {
      changeSpy()
      this.setState({editorState})
    }

    render() {
      return (
        <Editor
          ref='editor'
          onChange={this.onChange.bind(this)}
          editorState={this.state.editorState}
          pasteUniqueEntities={true} />
      )
    }
  }

  describe('when copying and pasting a selection containing an entity', function() {

    beforeEach(function() {
      comp = renderIntoDocument(<TestEditor/>);
      const editorNode = ReactDOM.findDOMNode(comp.refs.editor.refs.editor);
      Simulate.copy(editorNode);
      // console.log('\nINTERNAL CLIPBOARD:\n------\n', comp.refs.editor.getClipboard());
      Simulate.paste(editorNode, mockPasteEvent);
    });

    it('the entity should be cloned', function() {
      expect(changeSpy).toHaveBeenCalled();
    });

  })


});
