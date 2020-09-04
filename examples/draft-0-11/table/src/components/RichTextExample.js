import React from 'react';
import {Editor, EditorState} from 'draft-js';
import {Map} from 'immutable';
import BlockComponent from './BlockComponent';
import ModalTable from './Table/ModalTable';
import createTable from './Table/modifiers/createTable';
import './RichTextEditor.css';
import './Table/Table.css';

function MyEditor() {
  const [editorState, setEditorState] = React.useState(
    EditorState.createEmpty(),
  );
  const [tableEdits, setTableEdits] = React.useState(Map());

  const editor = React.useRef(null);

  const blockRenderer = block => {
    if (block.getType() === 'atomic') {
      return {
        component: BlockComponent,
        editable: false,
        props: {
          onStartEdit: blockKey => {
            setTableEdits(tableEdits.set(blockKey, true));
          },
          onFinishEdit: blockKey => {
            setTableEdits(tableEdits.remove(blockKey));
          },
        },
      };
    }
    return null;
  };

  const handleChange = editorState => {
    setEditorState(editorState);
  };

  const insertTable = () => {
    setEditorState(createTable(editorState));
  };

  const focusEditor = () => {
    editor.current.focus();
  };

  React.useEffect(() => {
    focusEditor();
  }, []);

  // If the user changes block type before entering any text, we can
  // either style the placeholder or hide it. Let's just hide it now.
  let className = 'RichEditor-editor';
  const contentState = editorState.getCurrentContent();
  if (!contentState.hasText()) {
    if (
      contentState
        .getBlockMap()
        .first()
        .getType() !== 'unstyled'
    ) {
      className += ' RichEditor-hidePlaceholder';
    }
  }

  return (
    <div className="RichEditor-root">
      <ModalTable onClick={insertTable} buttonLabel="Table" />
      <div className={className} onClick={focusEditor}>
        <Editor
          blockRendererFn={blockRenderer}
          ref={editor}
          editorState={editorState}
          onChange={handleChange}
          placeholder="Double click table to edit it..."
          readOnly={tableEdits.count()}
        />
      </div>
    </div>
  );
}

export default MyEditor;
