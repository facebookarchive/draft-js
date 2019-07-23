/**
 * Copyright (c) Facebook, Inc. and its affiliates. All rights reserved.
 *
 * This file provided by Facebook is for non-commercial testing and evaluation
 * purposes only. Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
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
import gkx from 'draft-js/lib/gkx';
import convertFromHTMLModern from 'draft-js/lib/convertFromHTMLToContentBlocks2';

import {
  ContentState,
  EditorState,
  convertFromHTML as convertFromHTMLClassic,
  convertToRaw,
  convertFromRaw,
} from 'draft-js';

const fromHTML = gkx('draft_refactored_html_importer')
  ? convertFromHTMLModern
  : convertFromHTMLClassic;

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

const baseHtmlContent = `<ol>
  <li>one</li>
  <li>
    <ul>
      <li>
        <h1>2a</h1>
      </li>
      <li>2b</li>
    </ul>
   </li>
   <li>three</li>
</ol>
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
    const parsedHtml = fromHTML(html);

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
    this.setState({
      mode,
      codeMirrorValue: BASE_CONTENT[mode],
    });
  };

  updateCodeMirror = codeMirrorValue => {
    this.setState({codeMirrorValue});
  };

  shouldExpandNode = (keyName, data, level) => {
    return ['blockMap', 'root'].some(
      defaultVisibleNode => keyName[0] === defaultVisibleNode,
    );
  };

  onExperimentChange = ({target: {value: experimentFlags}}) => {
    if (experimentFlags) {
      window.location.search = `gk_enable=${experimentFlags}`;
    }
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
                <select
                  className="nav-experiment-selector"
                  name="experiment"
                  onChange={this.onExperimentChange}>
                  <option value="">Try an experiment..</option>
                  <option value="draft_refactored_html_importer">
                    Modern HTML importer
                  </option>
                  <option value="draft_tree_data_support,draft_refactored_html_importer">
                    Tree data structure
                  </option>
                </select>
              </li>
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
                  onBeforeChange={(editor, data, codeMirrorValue) =>
                    this.updateCodeMirror(codeMirrorValue)
                  }
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
