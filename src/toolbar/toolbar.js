import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ToolbarItems from './ToolbarItems';

const Toolbar = ({ template, width, iconWritingMode }) => {
    const {
        nodes,
        entities: { node: nodeEntity },
    } = template;
    const groups = Object.keys(nodes);

    return (
        <div
            className="flow-icon-toolbar react-workflow-toobar-container"
            style={{ writingMode: iconWritingMode }}
        >
            {
                groups.map((group) => {
                    const tools = nodes[group].filter(x => nodeEntity[x].props.showInToolbar === 'Y');
                    return (
                        <ToolbarItems
                            tools={tools}
                            nodeEntity={nodeEntity}
                            group={group}
                        />

                    );
                })
            }
        </div>
    );
};

Toolbar.propsType = {
    template: PropTypes.object,
};

export default Toolbar;
