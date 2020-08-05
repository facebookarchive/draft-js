/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import {
  AtomicBlockUtils,
  Editor,
  EditorState,
  RichUtils,
  convertToRaw,
} from 'draft-js';

import './css/example.css';
import './css/draft.css';
import './css/rich-editor.css';

class MediaEditorExample extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editorState: EditorState.createEmpty(),
      showURLInput: false,
      url: '',
      urlType: '',
    };

    this.focus = () => this.refs.editor.focus();
    this.logState = () => {
      const content = this.state.editorState.getCurrentContent();
      console.log(convertToRaw(content));
    };
    this.onChange = editorState => this.setState({editorState});
    this.onURLChange = e => this.setState({urlValue: e.target.value});

    this.addAudio = this._addAudio.bind(this);
    this.addImage = this._addImage.bind(this);
    this.addVideo = this._addVideo.bind(this);
    this.confirmMedia = this._confirmMedia.bind(this);
    this.handleKeyCommand = this._handleKeyCommand.bind(this);
    this.onURLInputKeyDown = this._onURLInputKeyDown.bind(this);
  }

  _handleKeyCommand(command, editorState) {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return true;
    }
    return false;
  }

  _confirmMedia(e) {
    e.preventDefault();
    const {editorState, urlValue, urlType} = this.state;
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      urlType,
      'IMMUTABLE',
      {src: urlValue},
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(editorState, {
      currentContent: contentStateWithEntity,
    });

    this.setState(
      {
        // The third parameter here is a space string, not an empty string
        // If you set an empty string, you will get an error: Unknown DraftEntity key: null
        editorState: AtomicBlockUtils.insertAtomicBlock(
          newEditorState,
          entityKey,
          ' ',
        ),
        showURLInput: false,
        urlValue: '',
      },
      () => {
        setTimeout(() => this.focus(), 0);
      },
    );
  }

  _onURLInputKeyDown(e) {
    if (e.which === 13) {
      this._confirmMedia(e);
    }
  }

  _promptForMedia(type) {
    this.setState(
      {
        showURLInput: true,
        urlValue: '',
        urlType: type,
      },
      () => {
        setTimeout(() => this.refs.url.focus(), 0);
      },
    );
  }

  _addAudio() {
    this._promptForMedia('audio');
  }

  _addImage() {
    this._promptForMedia('image');
  }

  _addVideo() {
    this._promptForMedia('video');
  }

  render() {
    let urlInput;
    if (this.state.showURLInput) {
      urlInput = (
        <div style={styles.urlInputContainer}>
          <input
            onChange={this.onURLChange}
            ref="url"
            style={styles.urlInput}
            type="text"
            value={this.state.urlValue}
            onKeyDown={this.onURLInputKeyDown}
            placeholder="URL here"
          />
          <button
            style={{
              marginRight: 10,
              border: '1px solid #ddd',
              padding: '5px',
              borderRadius: '5px',
              color: '#999',
              backgroundColor: '#fff',
              cursor: 'pointer',
            }}
            onMouseDown={this.confirmMedia}>
            Confirm
          </button>
        </div>
      );
    }

    return (
      <div style={styles.root}>
        <div style={{borderBottom: '1px solid #ddd'}}>
          <div style={{marginBottom: 10, color: '#999'}}>
            Use the buttons to add audio, image, or video.
          </div>
          <div style={styles.buttons}>
            <button
              onMouseDown={this.addAudio}
              style={{
                marginRight: 10,
                border: '1px solid #ddd',
                padding: '5px',
                borderRadius: '5px',
                color: '#999',
                backgroundColor: '#fff',
                cursor: 'pointer',
              }}>
              Add Audio
            </button>
            <button
              onMouseDown={this.addImage}
              style={{
                marginRight: 10,
                border: '1px solid #ddd',
                padding: '5px',
                borderRadius: '5px',
                color: '#999',
                backgroundColor: '#fff',
                cursor: 'pointer',
              }}>
              Add Image
            </button>
            <button
              onMouseDown={this.addVideo}
              style={{
                marginRight: 10,
                border: '1px solid #ddd',
                padding: '5px',
                borderRadius: '5px',
                color: '#999',
                backgroundColor: '#fff',
                cursor: 'pointer',
              }}>
              Add Video
            </button>
          </div>
          {urlInput}
        </div>
        <div style={styles.editor} onClick={this.focus}>
          <Editor
            blockRendererFn={mediaBlockRenderer}
            editorState={this.state.editorState}
            handleKeyCommand={this.handleKeyCommand}
            onChange={this.onChange}
            placeholder="Enter some text..."
            ref="editor"
            width="auto"
          />
        </div>
      </div>
    );
  }
}

function mediaBlockRenderer(block) {
  if (block.getType() === 'atomic') {
    return {
      component: Media,
      editable: false,
    };
  }

  return null;
}

const Audio = props => {
  return <audio controls src={props.src} style={styles.media} />;
};

const Image = props => {
  return <img src={props.src} style={styles.media} />;
};

const Video = props => {
  return <video controls src={props.src} style={styles.media} />;
};

const Media = props => {
  const entity = props.contentState.getEntity(props.block.getEntityAt(0));
  const {src} = entity.getData();
  const type = entity.getType();

  let media;
  if (type === 'audio') {
    media = <Audio src={src} />;
  } else if (type === 'image') {
    media = <Image src={src} />;
  } else if (type === 'video') {
    media = <Video src={src} />;
  }

  return media;
};

const styles = {
  root: {
    fontFamily: "'Georgia', serif",
    padding: 15,
    border: '1px solid #ddd',
  },
  buttons: {
    marginBottom: 10,
  },
  urlInputContainer: {
    marginBottom: 10,
  },
  urlInput: {
    fontFamily: "'Georgia', serif",
    marginRight: 10,
    padding: 3,
    border: '1px solid #ddd',
    borderRadius: '5px',
  },
  editor: {
    cursor: 'text',
    minHeight: 80,
    padding: 10,
  },
  button: {
    marginTop: 10,
    textAlign: 'center',
  },
  media: {
    width: '100%',
    // Fix an issue with Firefox rendering video controls
    // with 'pre-wrap' white-space
    whiteSpace: 'initial',
  },
};

export default MediaEditorExample;
