import React, { Component } from 'react'
import process from "immer";
import Designer from 'react-workflow-editor'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const template = {
  id: "default",
  nodes: {
    general: [
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
    ],
    special: [
      "loop",
      "switch",
    ]
  },
  entities: {
    node: {
      open: {
        id: "open",
        flowType: "normal",
        color: "orange",
        icon: <FontAwesomeIcon icon="hand-pointer" />,
        props: {
          action: "open-page",
          name: "URL",
          type: "normal",
          showInToolbar: "Y",
        },
      },
      click: {
        id: "click",
        type: "normal",
        icon: "mouse-pointer",
        props: {
          action: "mouse-click",
          name: "Mouse Click",
          type: "normal",
          showInToolbar: "Y",
        },
      },
      data: {
        id: "data",
        type: "normal",
        icon: "mouse-pointer",
        props: {
          action: "data",
          name: "Mouse Pointer",
          type: "normal",
          showInToolbar: "Y",
        },
      },
      input: {
        id: "input",
        type: "normal",
        color: "blue-green",
        icon: "i-cursor",
        props: {
          action: "input",
          name: "input",
          type: "normal",
          showInToolbar: "Y",
        },
      },
      verification: {
        id: "verification",
        type: "normal",
        color: "blue",
        icon: "check-double",
        props: {
          action: "verification-code",
          name: "Verify",
          type: "normal",
          showInToolbar: "Y",
        },
      },
      dropdown: {
        id: "dropdown",
        type: "normal",
        icon: "caret-down",
        color: "ultramarine-blue",
        props: {
          action: "dropdown",
          name: "Select",
          type: "normal",
          showInToolbar: "Y",
        },
      },
      loop: {
        id: "loop",
        type: "loop",
        color: "red",
        icon: "undo-alt",
        props: {
          action: "loop",
          name: "Loop",
          type: "loop",
          showInToolbar: "Y",
        },
      },
      switch: {
        id: "switch",
        type: "switch",
        color: "violet",
        icon: "sitemap",
        props: {
          action: {
            hek: "sdfdsf"
          },
          name: "Switch",
          type: "switch",
          showInToolbar: "Y",
        },
      },
      "mouse-enter": {
        id: "mouse-enter",
        type: "normal",
        color: "violet-red",
        icon: "caret-down",
        props: {
          action: "mouse-enter",
          name: "Mouse Enter",
          type: "normal",
          showInToolbar: "Y",
        },
      },
      "stop-loop": {
        id: "stop-loop",
        type: "stop-loop",
        color: "orange-red",
        icon: "stop",
        props: {
          action: "stop-loop",
          name: "Stop loop",
          type: "stop-loop",
          showInToolbar: "Y",
        },
      },
      stop: {
        id: "stop",
        type: "stop",
        color: "red",
        icon: "caret-down",
        props: {
          action: "stop",
          name: "Stop",
          type: "stop",
          showInToolbar: "Y",
        },
      },
      case: {
        id: "case",
        type: "case",
        color: "orange",
        icon: "caret-down",
        props: {
          action: "case",
          name: "case",
          type: "case",
          showInToolbar: "N",
          description: "Case description",
        },
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
