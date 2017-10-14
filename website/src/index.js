/**
 * Copyright 2004-present Facebook. All Rights Reserved.
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

var React = require('React');
var Site = require('Site');
var Prism = require('Prism');
var Marked = require('Marked');
var unindent = require('unindent');

var richExample = `
'use strict';

const {Editor, EditorState, RichUtils} = Draft;

class RichEditorExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {editorState: EditorState.createEmpty()};

    this.focus = () => this.refs.editor.focus();
    this.onChange = (editorState) => this.setState({editorState});

    this.handleKeyCommand = this._handleKeyCommand.bind(this);
    this.onTab = this._onTab.bind(this);
    this.toggleBlockType = this._toggleBlockType.bind(this);
    this.toggleInlineStyle = this._toggleInlineStyle.bind(this);
  }

  _handleKeyCommand(command, editorState) {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return true;
    }
    return false;
  }

  _onTab(e) {
    const maxDepth = 4;
    this.onChange(RichUtils.onTab(e, this.state.editorState, maxDepth));
  }

  _toggleBlockType(blockType) {
    this.onChange(
      RichUtils.toggleBlockType(
        this.state.editorState,
        blockType
      )
    );
  }

  _toggleInlineStyle(inlineStyle) {
    this.onChange(
      RichUtils.toggleInlineStyle(
        this.state.editorState,
        inlineStyle
      )
    );
  }

  render() {
    const {editorState} = this.state;

    // If the user changes block type before entering any text, we can
    // either style the placeholder or hide it. Let's just hide it now.
    let className = 'RichEditor-editor';
    var contentState = editorState.getCurrentContent();
    if (!contentState.hasText()) {
      if (contentState.getBlockMap().first().getType() !== 'unstyled') {
        className += ' RichEditor-hidePlaceholder';
      }
    }

    return (
      <div className="RichEditor-root">
        <BlockStyleControls
          editorState={editorState}
          onToggle={this.toggleBlockType}
        />
        <InlineStyleControls
          editorState={editorState}
          onToggle={this.toggleInlineStyle}
        />
        <div className={className} onClick={this.focus}>
          <Editor
            blockStyleFn={getBlockStyle}
            customStyleMap={styleMap}
            editorState={editorState}
            handleKeyCommand={this.handleKeyCommand}
            onChange={this.onChange}
            onTab={this.onTab}
            placeholder="Tell a story..."
            ref="editor"
            spellCheck={true}
          />
        </div>
      </div>
    );
  }
}

// Custom overrides for "code" style.
const styleMap = {
  CODE: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2,
  },
};

function getBlockStyle(block) {
  switch (block.getType()) {
    case 'blockquote': return 'RichEditor-blockquote';
    default: return null;
  }
}

class StyleButton extends React.Component {
  constructor() {
    super();
    this.onToggle = (e) => {
      e.preventDefault();
      this.props.onToggle(this.props.style);
    };
  }

  render() {
    let className = 'RichEditor-styleButton';
    if (this.props.active) {
      className += ' RichEditor-activeButton';
    }

    return (
      <span className={className} onMouseDown={this.onToggle}>
        {this.props.label}
      </span>
    );
  }
}

const BLOCK_TYPES = [
  {label: 'H1', style: 'header-one'},
  {label: 'H2', style: 'header-two'},
  {label: 'H3', style: 'header-three'},
  {label: 'H4', style: 'header-four'},
  {label: 'H5', style: 'header-five'},
  {label: 'H6', style: 'header-six'},
  {label: 'Blockquote', style: 'blockquote'},
  {label: 'UL', style: 'unordered-list-item'},
  {label: 'OL', style: 'ordered-list-item'},
  {label: 'Code Block', style: 'code-block'},
];

const BlockStyleControls = (props) => {
  const {editorState} = props;
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

  return (
    <div className="RichEditor-controls">
      {BLOCK_TYPES.map((type) =>
        <StyleButton
          key={type.label}
          active={type.style === blockType}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
        />
      )}
    </div>
  );
};

var INLINE_STYLES = [
  {label: 'Bold', style: 'BOLD'},
  {label: 'Italic', style: 'ITALIC'},
  {label: 'Underline', style: 'UNDERLINE'},
  {label: 'Monospace', style: 'CODE'},
];

const InlineStyleControls = (props) => {
  var currentStyle = props.editorState.getCurrentInlineStyle();
  return (
    <div className="RichEditor-controls">
      {INLINE_STYLES.map(type =>
        <StyleButton
          key={type.label}
          active={currentStyle.has(type.style)}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
        />
      )}
    </div>
  );
};

ReactDOM.render(
  <RichEditorExample />,
  document.getElementById('rich-example')
);
`;

var index = React.createClass({
  render: function() {
    return (
      <Site>
        <div className="hero">
          <div className="wrap">
            <div className="text"><strong>Draft.js</strong></div>
            <div className="minitext">
              Rich Text Editor Framework for React
            </div>
          </div>
        </div>

        <section className="content wrap">
          <section className="home-section home-getting-started">
            <p>
              Draft.js is a framework for building rich text editors in React,
              powered by an immutable model and abstracting over cross-browser
              differences.
            </p>

            <p>
              Draft.js makes it easy to build any type of rich text input,
              whether you're just looking to support a few inline text styles
              or building a complex text editor for composing long-form
              articles.
            </p>

            <p>
              In Draft.js, everything is customizable &ndash; we provide the
              building blocks so that you have full control over the user
              interface. Here's a simple example of a rich text editor built in
              Draft.js:
            </p>

            <div id="rich-example"></div>
          </section>

          <section className="home-bottom-section">
            <div className="buttons-unit">
              <a href="docs/overview.html#content" className="button">Learn more about Draft</a>
            </div>
          </section>
        </section>

        <script src="https://cdnjs.cloudflare.com/ajax/libs/react/15.0.1/react.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/react/15.0.1/react-dom.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/immutable/3.7.6/immutable.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-core/5.8.34/browser.js"></script>
        <script src="lib/Draft.js"></script>
        <style dangerouslySetInnerHTML={{__html: `
          @import "lib/Draft.css";
          @import "lib/RichEditor.css";
        `}} />
        <script type="text/babel" dangerouslySetInnerHTML={{__html: richExample}} />
      </Site>
    );
  },
});

module.exports = index;
