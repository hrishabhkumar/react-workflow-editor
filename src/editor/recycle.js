import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Recycle = ({
    onDragOver,
    visible,
    onDragLeave,
    onDrop,
}) => {
    const style = {
        backgroundColor: '#f1f1f1',
        border: '1px solid #e1e1e1',
        padding: '4px',
        visibility: visible ? 'visible' : 'hidden',
    };
    return (
        <div
            style={style}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            <FontAwesomeIcon icon="trash-alt" style={{ height: '48px', width: '48px' }} />
        </div>
    );
};

Recycle.propTypes = {
    visible: PropTypes.bool,
    onDragOver: PropTypes.func,
    onDragLeave: PropTypes.func,
    onDrop: PropTypes.func,
};

export default Recycle;
