import React from "react";
import firebase from "firebase";
import { ControlledEditor as MonacoEditor, monaco } from "@monaco-editor/react";
import { withRouter } from "react-router-dom";
import { newPage, getRemove, closer } from "../elements/functions";

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      p1: null,
      p2: null,
      code1: "#type code here"
    };
  }
  async componentDidMount() {
    await getRemove(this.props.collector);
    let parser = window.location.href.split("/")[window.location.href.split("/").length - 1].split(".");
    console.log(parser);
    this.setState({
      p1: parser[0],
      p2: parser[1]
    });
  }
  editorDidMount(editor, monaco) {
    console.log("editorDidMount", editor);
  }
  onChange(newValue, e) {
    console.log("onChange", newValue, e);
    return monaco.editor.colorize(newValue, "python")
  }
  render() {
    const { p1, p2, code1 } = this.state;
    const options = {
      selectOnLineNumbers: true
    };
    return (
      <div className="App">
        <span>YRCTVUYBIUNO</span>
        <MonacoEditor
          width="800"
          height="90vh"
          language="python"
          theme="vs-dark"
          value={code1}
          options={options}
          onChange={this.onChange}
          editorDidMount={this.editorDidMount}
        />
      </div>
    );
  }
}

export default withRouter(Game);
