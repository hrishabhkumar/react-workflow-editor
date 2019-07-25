import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// eslint-disable-next-line react/prefer-stateless-function
export default class Overlay extends Component {
  static propTypes = {
      visible: PropTypes.bool,
      onDragOver: PropTypes.func,
      onDragLeave: PropTypes.func,
      onDrop: PropTypes.func,
  };

  render() {
      const style = {
          backgroundColor: '#f1f1f1',
          border: '1px solid #e1e1e1',
          padding: '4px',
          visibility: this.props.visible ? 'visible' : 'hidden',
      };
      return (
          <div
              style={style}
              onDragOver={this.props.onDragOver}
              onDragLeave={this.props.onDragLeave}
              onDrop={this.props.onDrop}
          >
              <FontAwesomeIcon icon="trash-alt" style={{ height: '48px', width: '48px' }} />
          </div>
      );
  }
}
