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
 */

'use strict';

const Draft = require('draft-js');
const React = require('react');

class SimpleEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editorState: Draft.EditorState.createWithContent(emptyContentState),
    };
    this.onChange = (editorState) => this.setState({editorState});
  }
  render() {
    const Editor = Draft.Editor;
    const editorState = this.state.editorState;
    return (
      <Editor
        placeholder="heyyyyy"
        editorKey="foobaz"
        editorState={editorState}
        onChange={this.onChange}
      />
    );
  }
}
module.exports = {
  SimpleEditor: SimpleEditor,
};

const emptyContentState = Draft.convertFromRaw({
  entityMap: {},
  blocks: [
    {
      text: '',
      key: 'foo',
      type: 'unstyled',
      entityRanges: [],
    },
  ],
});
