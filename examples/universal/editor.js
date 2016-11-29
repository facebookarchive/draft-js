const Draft = require('draft-js');
const React = require('react');

class SimpleEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {editorState: Draft.EditorState.createWithContent(emptyContentState)};
    this.onChange = (editorState) => this.setState({editorState});
  }
  render() {
    const {Editor} = Draft;
    const {editorState} = this.state;
    return <Editor placeholder="heyyyyy" editorKey="foobaz" editorState={editorState} onChange={this.onChange} />;
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
