import React, { Component } from 'react'
import process from "immer";
import Designer from 'react-workflow-editor'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const template = {
  id: "default",
  nodes: {
    general: {
      icon: "mouse-pointer",
      children: [
        "open",
        "click",
        "data",
        "input",
        "verification",
        "dropdown",
        "mouse-enter",
        "stop-loop",
        "stop",
        "case",
      ]
    },
    special: {
      icon: "sitemap",
      children: [
        "loop",
        "switch",
      ]
    }
  },
  entities: {
    node: {
      open: {
        icon: <FontAwesomeIcon icon="hand-pointer" />,
        action: {
          command: "",
          data: {
            path: "some path"
          }
        },
        name: "URL",
        description: "${name} for ${action.data.path}"
      },
      click: {
        action: "mouse-click",
        name: "Mouse Click",
      },
      data: {
        icon: "mouse-pointer",
        action: "data",
        name: "Mouse Pointer",
      },
      input: {
        color: "blue-green",
        icon: "i-cursor",
          action: "input",
          name: "input",
      },
      verification: {
        color: "blue",
        icon: "check-double",
          action: "verification-code",
          name: "Verify",
      },
      dropdown: {
        icon: "caret-down",
        color: "ultramarine-blue",
          action: "dropdown",
          name: "Select"
      },
      loop: {
        id: "loop",
        type: "loop",
        color: "red",
        icon: "undo-alt",
        action: "loop",
        name: "Loop",
      },
      switch: {
        id: "switch",
        type: "switch",
        color: "violet",
        icon: "sitemap",
          action: {
            hek: "sdfdsf"
          },
          name: "Switch",
      },
      "mouse-enter": {
        id: "mouse-enter",
        type: "normal",
        color: "violet-red",
        icon: "caret-down",
        action: "mouse-enter",
        name: "Mouse Enter",
      },
      "stop-loop": {
        type: "stop-loop",
        color: "orange-red",
        icon: "stop",
        action: "stop-loop",
        name: "Stop loop",
      },
      stop: {
        type: "stop",
        color: "red",
        icon: "caret-down",
        action: "stop",
        name: "Stop",
      },
      case: {
        type: "case",
        color: "orange",
        icon: "caret-down",
        action: "case",
        name: "case",
        showInToolbar: "N",
        description: "Case description",
      },
    },
  },
};

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: { id: "root", children: [] },
      actions: [],
      theme: "theme-1",
    };
    this.onChange = this.onChange.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onChangeTheme = this.onChangeTheme.bind(this);
  }

  // fire when flow has been changed.
  onChange({ data, detail }) {
    const actions = process(this.state.actions, draft => {
      draft.splice(0, 0, {
        index: draft.length + 1,
        ...detail,
      });
    });
    this.setState({
      data,
      actions,
    });
    console.log(data);
  }
  // fire when node has been clicked.
  onClick(node) {
    const actions = process(this.state.actions, draft => {
      draft.splice(0, 0, {
        index: draft.length + 1,
        action: "click",
        nodes: [node],
      });
    });
    this.setState({
      actions,
    });
  }

  onChangeTheme(e) {
    this.setState({
      theme: e.target.value,
    });
  }
  render() {
    return (
      <div>
        <Designer
              template={template}
              data={this.state.data}
              theme={this.state.theme}
              onChange={this.onChange}
              onClick={this.onClick}
              iconWritingMode="horizontal-tb"
            />
      </div>
    );
  }
}
