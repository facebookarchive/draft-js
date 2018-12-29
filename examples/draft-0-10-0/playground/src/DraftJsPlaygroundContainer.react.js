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

'use strict';

const React = require('React');
const {Component} = React;
const cx = require('cx');

const ContentState = require('ContentState');
const Editor = require('DraftEditor.react');
const EditorState = require('EditorState');
const SomeCodeMirror = require('SomeCodeMirror.react');
const SomeButton = require('SomeButton.react');
const SomeSelector = require('SomeSelector.react');
const SomeSelectorOption = require('SomeSelectorOption.react');
const convertFromRaw = require('convertFromRawToDraftState');
const gkx = require('gkx');

const convertFromHTML = gkx('draft_refactored_html_importer')
  ? require('convertFromHTMLToContentBlocks2')
  : require('convertFromHTMLToContentBlocks');

type Props = any;
type State = any;

const baseRawContent = {
  blocks: [
    {
      key: 'A',
      text: '',
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

class DraftJsPlaygroundContainer extends Component<Props, State> {
  markupinput: ?InternCodeMirror;

  constructor(props: Props) {
    super(props);
    this.state = {
      mode: 'rawContent',
      editorState: EditorState.createEmpty(),
    };
  }

  componentDidMount() {
    this.setContent();
  }

  onChange = (editorState: EditorState) => {
    this.setState({editorState});
  };

  _setContentBlock(content: ContentState) {
    this.onChange(EditorState.createWithContent(content));
  }

  _setHTMLContent(html: string) {
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
    this._setContentBlock(convertFromRaw(JSON.parse(rawContent)));
  }

  setContent = () => {
    const {mode} = this.state;
    const input = this.markupinput;

    if (!input) {
      return;
    }

    const content = input.state.value;

    if (!content) {
      return;
    }

    if (mode === 'html') {
      this._setHTMLContent(content);
    } else {
      this._setRawContent(content);
    }
  };

  onSelectChange = (value: string) => {
    this.setState({mode: value});
  };

  render(): React.Node {
    const {editorState, mode} = this.state;
    const lang = mode === 'html' ? mode : 'json';
    const content = BASE_CONTENT[mode];

    return (
      <div className={cx('DraftJsPlaygroundContainer/container')}>
        <div className={cx('DraftJsPlaygroundContainer/column')}>
          <div className={cx('DraftJsPlaygroundContainer/controls')}>
            <SomeSelector onChange={this.onSelectChange} value={mode}>
              <SomeSelectorOption value="rawContent">
                Raw Content
              </SomeSelectorOption>
              <SomeSelectorOption value="html">HTML</SomeSelectorOption>
            </SomeSelector>
            <SomeButton
              onClick={this.setContent}
              label="Update draft content"
              use="confirm"
            />
          </div>
          <SomeCodeMirror
            ref={input => {
              this.markupinput = input;
            }}
            lang={lang}
            value={content}
          />
        </div>
        <div className={cx('DraftJsPlaygroundContainer/column')}>
          <div className={cx('DraftJsPlaygroundContainer/editor')}>
            <Editor
              className={cx('DraftEditor/root')}
              editorState={editorState}
              onChange={this.onChange}
              placeholder="Editor content is empty..."
            />
          </div>
        </div>
        <div className={cx('DraftJsPlaygroundContainer/column')}>
          <SomeCodeMirror
            readOnly={true}
            lineNumbers={false}
            lang="json"
            value={JSON.stringify(editorState.getCurrentContent(), null, 2)}
          />
        </div>
      </div>
    );
  }
}

module.exports = DraftJsPlaygroundContainer;
