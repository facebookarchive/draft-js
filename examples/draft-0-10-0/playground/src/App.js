/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @providesModule DraftJsPlaygroundContainer.react
 * @flow
 * @format
 */

import React, {Component} from 'react';
import './DraftJsPlaygroundContainer.css';
import {Controlled as CodeMirror} from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'draft-js/dist/Draft.css';
import './App.css';
import DraftJsRichEditorExample from './DraftJsRichEditorExample';
import JSONTree from 'react-json-tree';
import {convertToHTML} from 'draft-convert';
import PanelGroup from 'react-panelgroup';

import {
  ContentState,
  EditorState,
  convertFromHTML,
  convertToRaw,
  convertFromRaw,
} from 'draft-js';

const theme = {
  scheme: 'monokai',
  author: 'wimer hazenberg (http://www.monokai.nl)',
  base00: '#000000',
  base01: '#383830',
  base02: '#49483e',
  base03: '#75715e',
  base04: '#a59f85',
  base05: '#f8f8f2',
  base06: '#f5f4f1',
  base07: '#f9f8f5',
  base08: '#f92672',
  base09: '#fd971f',
  base0A: '#f4bf75',
  base0B: '#a6e22e',
  base0C: '#a1efe4',
  base0D: '#66d9ef',
  base0E: '#ae81ff',
  base0F: '#cc6633',
};

const baseRawContent = {
  blocks: [
    {
      key: 'A',
      text: 'Hello world',
      type: 'header-one',
    },
  ],
  entityMap: {},
};

const baseHtmlContent = `
<h1>heading inside blockquote</h1>
<p>paragraph inside blockquote</p>
`;

const BASE_CONTENT = {
  rawContent: JSON.stringify(baseRawContent, null, 2),
  html: baseHtmlContent,
};

class DraftJsPlaygroundContainer extends Component {
  constructor(props: Props) {
    super(props);
    this.state = {
      mode: 'rawContent',
      editorState: EditorState.createEmpty(),
      codeMirrorValue: BASE_CONTENT['rawContent'],
    };
  }

  componentDidMount() {
    this.setContent();
  }

  onChange = editorState => {
    this.setState({editorState});
  };

  _setContentBlock(content) {
    this.onChange(EditorState.createWithContent(content));
  }

  importEditorState = () => {
    const {editorState, mode} = this.state;
    if (mode === 'html') {
      this.setState({
        codeMirrorValue: convertToHTML(editorState.getCurrentContent()),
      });
    } else {
      this.setState({
        codeMirrorValue: JSON.stringify(
          convertToRaw(editorState.getCurrentContent()),
          null,
          2,
        ),
      });
    }
  };

  _setHTMLContent(html) {
    const parsedHtml = convertFromHTML(html);

    if (!parsedHtml) {
      return;
    }

    const {contentBlocks, entityMap} = parsedHtml;

    if (!contentBlocks) {
      return;
    }

    this._setContentBlock(
      ContentState.createFromBlockArray(contentBlocks, entityMap),
    );
  }

  _setRawContent(rawContent) {
    try {
      const parsedJson = JSON.parse(rawContent);
      this._setContentBlock(convertFromRaw(parsedJson));
    } catch (err) {
      alert('The json is invalid');
    }
  }

  setContent = () => {
    const {mode, codeMirrorValue} = this.state;

    if (mode === 'html') {
      this._setHTMLContent(codeMirrorValue);
    } else {
      this._setRawContent(codeMirrorValue);
    }
  };

  onSelectChange = ({target: {value: mode}}) => {
    this.setState({mode});
  };

  updateCodeMirror = (editor, data, codeMirrorValue) => {
    this.setState({codeMirrorValue});
  };

  shouldExpandNode = (keyName, data, level) => {
    return ['blockMap', 'root'].some(
      defaultVisibleNode => keyName[0] === defaultVisibleNode,
    );
  };

  render() {
    const {editorState, mode, codeMirrorValue} = this.state;

    return (
      <div className="container">
        <div className="nav-main">
          <div className="wrap">
            <a
              className="nav-home"
              target="_blank"
              rel="noopener noreferrer"
              href="https://draftjs.org/">
              Draft.js
            </a>
            <ul className="nav-site">
              <li>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://draftjs.org/docs/overview.html#content">
                  Docs
                </a>
              </li>
              <li>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://github.com/facebook/draft-js">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="playground-main">
          <PanelGroup borderColor="grey">
            <PanelGroup direction="column" borderColor="grey">
              <div className="DraftJsPlaygroundContainer-editor">
                <DraftJsRichEditorExample
                  className="DraftEditor-root"
                  editorState={editorState}
                  onChange={this.onChange}
                  placeholder="Editor content is empty..."
                />
              </div>
              <div className="DraftJsPlaygroundContainer-raw">
                <div className="DraftJsPlaygroundContainer-controls">
                  <section className="contentControls">
                    <select
                      title="Draft.js content type switch"
                      onChange={this.onSelectChange}
                      value={mode}>
                      <option value="rawContent">Raw</option>
                      <option value="html">HTML</option>
                    </select>
                  </section>
                  <section className="contentControls">
                    <button
                      title="Import content type from the editor"
                      onClick={this.importEditorState}>
                      Import
                    </button>
                    <button
                      title="Update the editor with content type"
                      onClick={this.setContent}>
                      Update
                    </button>
                  </section>
                </div>
                <CodeMirror
                  onBeforeChange={this.updateCodeMirror}
                  ref={input => {
                    this.markupinput = input;
                  }}
                  options={{
                    mode: 'application/ld+json',
                    matchBrackets: true,
                    lineNumbers: true,
                    lineWrapping: true,
                    autoCloseBrackets: true,
                  }}
                  value={codeMirrorValue}
                />
              </div>
            </PanelGroup>
            <div className="playground-raw-preview">
              <JSONTree
                shouldExpandNode={this.shouldExpandNode}
                theme={theme}
                data={editorState.getCurrentContent()}
              />
            </div>
          </PanelGroup>
        </div>
      </div>
    );
  }
}

export default DraftJsPlaygroundContainer;
